/**
 * High-Accuracy Geolocation Service with TTL Caching Layer
 * Provides high-precision GPS coordinate acquisition (enableHighAccuracy: true),
 * in-flight request deduplication, and short-TTL caching for coordinates,
 * reverse-geocoding, and map workshop data to minimize latency and eliminate redundant API calls.
 */

import { WorkshopGarage } from "../types";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationResult {
  coords: GeoCoordinates;
  timestamp: number;
  isCached: boolean;
  source: "high_accuracy_gps" | "fast_gps_cache" | "ip_fallback" | "memory_cache" | "storage_cache";
  address?: string;
  areaName?: string;
}

export interface ReverseGeocodeResult {
  areaName: string;
  address: string;
  cached?: boolean;
}

export interface GeolocationServiceOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  forceFresh?: boolean;
  ttlMs?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Default Configuration: Short TTL of 60 seconds for GPS coordinates, 5 minutes for reverse geocoding
const DEFAULT_GPS_TTL_MS = 60 * 1000; // 60 seconds
const DEFAULT_REVERSE_GEO_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_WORKSHOP_MAP_TTL_MS = 2 * 60 * 1000; // 2 minutes

class GeolocationService {
  private coordsCache: CacheEntry<GeoCoordinates> | null = null;
  private reverseGeoCache = new Map<string, CacheEntry<ReverseGeocodeResult>>();
  private nearbyWorkshopsCache = new Map<string, CacheEntry<WorkshopGarage[]>>();
  
  // In-flight request deduplication promises
  private activeLocationPromise: Promise<GeolocationResult> | null = null;
  private activeReverseGeoPromises = new Map<string, Promise<ReverseGeocodeResult>>();
  private activeNearbyWorkshopsPromises = new Map<string, Promise<WorkshopGarage[]>>();

  constructor() {
    this.hydrateFromStorage();
  }

  /**
   * Hydrate last known location from localStorage if still within valid TTL window
   */
  private hydrateFromStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("apni_cached_geolocation");
      if (stored) {
        const parsed = JSON.parse(stored) as CacheEntry<GeoCoordinates>;
        if (parsed && parsed.expiresAt > Date.now()) {
          this.coordsCache = parsed;
        }
      }
    } catch (err) {
      console.warn("[GeolocationService] Failed to load cached location from storage:", err);
    }
  }

  /**
   * Save coordinates to in-memory and local storage cache with expiration
   */
  private setCoordsCache(coords: GeoCoordinates, ttlMs: number = DEFAULT_GPS_TTL_MS): void {
    const now = Date.now();
    const entry: CacheEntry<GeoCoordinates> = {
      data: coords,
      timestamp: now,
      expiresAt: now + ttlMs,
    };
    this.coordsCache = entry;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("apni_cached_geolocation", JSON.stringify(entry));
      } catch {}
    }
  }

  /**
   * Compute normalized spatial grid key (~100m resolution) for reverse geocoding cache
   */
  private getSpatialKey(lat: number, lng: number, precision: number = 3): string {
    return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
  }

  /**
   * Compute workshop map grid key (~300m resolution) with radius
   */
  private getWorkshopMapKey(lat: number, lng: number, radiusMeters: number): string {
    return `${lat.toFixed(2)},${lng.toFixed(2)}_r${radiusMeters}`;
  }

  /**
   * Clear in-memory and storage coordinates, reverse geocode, and workshop caches
   */
  public clearCache(): void {
    this.coordsCache = null;
    this.activeLocationPromise = null;
    this.reverseGeoCache.clear();
    this.nearbyWorkshopsCache.clear();
    this.activeNearbyWorkshopsPromises.clear();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("apni_cached_geolocation");
      } catch {}
    }
  }

  /**
   * Check if current cached location is valid and not expired
   */
  public getCachedLocation(): GeolocationResult | null {
    if (this.coordsCache && this.coordsCache.expiresAt > Date.now()) {
      return {
        coords: this.coordsCache.data,
        timestamp: this.coordsCache.timestamp,
        isCached: true,
        source: "memory_cache",
      };
    }
    return null;
  }

  /**
   * High-accuracy position acquisition with progressive 2-stage hardware/network fallback,
   * short-TTL caching and in-flight request deduplication.
   * Stage 1: High-Accuracy GPS (enableHighAccuracy: true)
   * Stage 2: Standard Browser / Wi-Fi Geolocation (enableHighAccuracy: false)
   * Stage 3: Server IP Geolocation / Area Lookup
   */
  public async getCurrentPosition(options: GeolocationServiceOptions = {}): Promise<GeolocationResult> {
    const {
      enableHighAccuracy = true,
      timeout = 9000,
      maximumAge = 15000,
      forceFresh = false,
      ttlMs = DEFAULT_GPS_TTL_MS,
    } = options;

    if (forceFresh) {
      this.clearCache();
    } else {
      // 1. Return valid cached coordinates if forceFresh is false
      const cached = this.getCachedLocation();
      if (cached) {
        return cached;
      }
    }

    // 2. Return existing in-flight promise if a request is already running to prevent redundant GPS queries
    if (this.activeLocationPromise) {
      return this.activeLocationPromise;
    }

    // 3. Progressive 2-Stage Geolocation Acquisition
    this.activeLocationPromise = (async () => {
      try {
        if (typeof window === "undefined" || !("geolocation" in navigator)) {
          return await this.fallbackToIpLocation();
        }

        // Try Stage 1: High Accuracy GPS
        const highAccResult = await new Promise<GeolocationResult>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: GeoCoordinates = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              };
              this.setCoordsCache(coords, ttlMs);
              resolve({
                coords,
                timestamp: pos.timestamp || Date.now(),
                isCached: false,
                source: "high_accuracy_gps",
              });
            },
            (err) => reject(err),
            {
              enableHighAccuracy: enableHighAccuracy,
              timeout: timeout,
              maximumAge: forceFresh ? 0 : maximumAge,
            }
          );
        }).catch(async (stage1Err) => {
          console.warn("[GeolocationService] Stage 1 (High Accuracy) failed, attempting Stage 2 (Standard GPS/WiFi):", stage1Err.message);

          // If user explicitly denied permission (code 1), don't retry browser GPS
          if (stage1Err?.code === 1) {
            throw stage1Err;
          }

          // Try Stage 2: Standard Geolocation (fast, WiFi/tower aided)
          return await new Promise<GeolocationResult>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const coords: GeoCoordinates = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                  altitude: pos.coords.altitude,
                  heading: pos.coords.heading,
                  speed: pos.coords.speed,
                };
                this.setCoordsCache(coords, ttlMs);
                resolve({
                  coords,
                  timestamp: pos.timestamp || Date.now(),
                  isCached: false,
                  source: "fast_gps_cache",
                });
              },
              (err) => reject(err),
              {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 60000,
              }
            );
          });
        });

        return highAccResult;
      } catch (err) {
        console.warn("[GeolocationService] Browser GPS unavailable, checking cached storage or IP fallback:", err);
        // Fallback to IP Geolocation
        return await this.fallbackToIpLocation();
      } finally {
        this.activeLocationPromise = null;
      }
    })();

    return this.activeLocationPromise;
  }

  /**
   * Fallback to server IP location if GPS is unavailable or blocked
   */
  public async fallbackToIpLocation(): Promise<GeolocationResult> {
    try {
      const res = await fetch("/api/places/ip-location");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
          const coords: GeoCoordinates = {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 1000,
          };
          this.setCoordsCache(coords, DEFAULT_GPS_TTL_MS);
          return {
            coords,
            timestamp: Date.now(),
            isCached: false,
            source: "ip_fallback",
            areaName: data.areaName,
            address: data.address,
          };
        }
      }
    } catch (e) {
      console.warn("[GeolocationService] IP Location fallback failed:", e);
    }

    // Default Fallback: Central Delhi coordinates
    const defaultCoords: GeoCoordinates = {
      latitude: 28.5244,
      longitude: 77.1565,
      accuracy: 5000,
    };
    return {
      coords: defaultCoords,
      timestamp: Date.now(),
      isCached: false,
      source: "ip_fallback",
      areaName: "Vasant Kunj, South Delhi",
      address: "Sector B, Vasant Kunj, New Delhi 110070",
    };
  }

  /**
   * Reverse Geocode coordinates with short-TTL spatial caching and in-flight deduplication
   */
  public async reverseGeocode(
    latitude: number,
    longitude: number,
    forceFresh: boolean = false
  ): Promise<ReverseGeocodeResult> {
    const key = this.getSpatialKey(latitude, longitude);

    // 1. Check in-memory reverse geocoding cache
    if (!forceFresh) {
      const cached = this.reverseGeoCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return { ...cached.data, cached: true };
      }
    }

    // 2. In-flight request deduplication
    if (this.activeReverseGeoPromises.has(key)) {
      return this.activeReverseGeoPromises.get(key)!;
    }

    const promise = (async () => {
      try {
        const res = await fetch("/api/places/reverse-geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.areaName) {
            const result: ReverseGeocodeResult = {
              areaName: data.areaName,
              address: data.address || `${data.areaName}, India`,
            };
            this.reverseGeoCache.set(key, {
              data: result,
              timestamp: Date.now(),
              expiresAt: Date.now() + DEFAULT_REVERSE_GEO_TTL_MS,
            });
            return result;
          }
        }
      } catch (err) {
        console.warn("[GeolocationService] Reverse geocode network error:", err);
      } finally {
        this.activeReverseGeoPromises.delete(key);
      }

      // Default fallback
      const fallbackResult: ReverseGeocodeResult = {
        areaName: `Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`,
        address: `GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), India`,
      };
      return fallbackResult;
    })();

    this.activeReverseGeoPromises.set(key, promise);
    return promise;
  }

  /**
   * Fetch nearby workshops with short-TTL map caching and in-flight deduplication.
   * Prevents repeated network queries and third-party API rate limiting on rapid map panning/re-renders.
   */
  public async getNearbyWorkshops(
    latitude: number,
    longitude: number,
    radiusMeters: number = 8000,
    forceFresh: boolean = false,
    areaName?: string
  ): Promise<{ workshops: WorkshopGarage[]; isCached: boolean }> {
    const mapKey = this.getWorkshopMapKey(latitude, longitude, radiusMeters);

    // 1. Check map cache
    if (!forceFresh) {
      const cached = this.nearbyWorkshopsCache.get(mapKey);
      if (cached && cached.expiresAt > Date.now()) {
        return { workshops: cached.data, isCached: true };
      }
    }

    // 2. In-flight promise deduplication
    if (this.activeNearbyWorkshopsPromises.has(mapKey)) {
      const workshops = await this.activeNearbyWorkshopsPromises.get(mapKey)!;
      return { workshops, isCached: false };
    }

    const promise = (async () => {
      try {
        const res = await fetch("/api/places/nearby-workshops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude, radiusMeters, areaName }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.workshops) && data.workshops.length > 0) {
            this.nearbyWorkshopsCache.set(mapKey, {
              data: data.workshops,
              timestamp: Date.now(),
              expiresAt: Date.now() + DEFAULT_WORKSHOP_MAP_TTL_MS,
            });
            return data.workshops;
          }
        }
      } catch (err) {
        console.warn("[GeolocationService] Nearby workshops fetch error:", err);
      } finally {
        this.activeNearbyWorkshopsPromises.delete(mapKey);
      }
      return [];
    })();

    this.activeNearbyWorkshopsPromises.set(mapKey, promise);
    const workshops = await promise;
    return { workshops, isCached: false };
  }
}

export const geolocationService = new GeolocationService();
