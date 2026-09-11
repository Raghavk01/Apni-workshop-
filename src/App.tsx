/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { ScreenQuickDrawer } from "./components/ScreenQuickDrawer";
import { AmbulanceDispatchModal } from "./components/AmbulanceDispatchModal";
import { OBDDiagnosticModal } from "./components/OBDDiagnosticModal";
import { EChallanVerificationModal } from "./components/EChallanVerificationModal";
import { WhatsAppBusinessHubModal } from "./components/WhatsAppBusinessHubModal";
import { SMSGatewayModal } from "./components/SMSGatewayModal";
import { LiveBayStreamModal } from "./components/LiveBayStreamModal";
import { AIDiagnosticModal } from "./components/AIDiagnosticModal";
import { InspectionChecklistModal } from "./components/InspectionChecklistModal";
import { AddEstimateModal } from "./components/AddEstimateModal";
import { TaxInvoiceModal } from "./components/TaxInvoiceModal";
import { LiveAIChatDrawer } from "./components/LiveAIChatDrawer";
import { RazorpayUPIModal } from "./components/RazorpayUPIModal";
import { LiveInteractiveMapModal } from "./components/LiveInteractiveMapModal";
import { WhatsAppDispatchModal } from "./components/WhatsAppDispatchModal";
import { VahanRCVerificationModal } from "./components/VahanRCVerificationModal";
import { AuthModal } from "./components/AuthModal";
import { CustomerSupportModal } from "./components/CustomerSupportModal";
import { CustomerApprovalModal } from "./components/CustomerApprovalModal";
import { ServiceRemindersModal } from "./components/ServiceRemindersModal";
import { InventoryManagerModal } from "./components/InventoryManagerModal";
import { WorkshopAnalyticsModal } from "./components/WorkshopAnalyticsModal";
import { GeofenceNotificationModal } from "./components/GeofenceNotificationModal";
import { GeofenceFloatingAlertBanner } from "./components/GeofenceFloatingAlertBanner";
import { LocationPickerModal } from "./components/LocationPickerModal";

// Screens
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { CustomerHomeScreen } from "./screens/CustomerHomeScreen";
import { BookServicePackageScreen } from "./screens/BookServicePackageScreen";
import { GarageSelectionScreen } from "./screens/GarageSelectionScreen";
import { CartScreen } from "./screens/CartScreen";
import { ScheduleCheckoutScreen } from "./screens/ScheduleCheckoutScreen";
import { CustomerLiveTrackerJourneyScreen } from "./screens/CustomerLiveTrackerJourneyScreen";
import { WorkshopDashboardScreen } from "./screens/WorkshopDashboardScreen";
import { MechanicLiveBayLogScreen } from "./screens/MechanicLiveBayLogScreen";

const MainAppContent: React.FC = () => {
  const {
    currentScreen,
    toastMessage,
    isModalOpen,
    closeModal,
    openModal,
    estimates,
    showToast,
  } = useApp();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen />;
      case "customer_home":
        return <CustomerHomeScreen />;
      case "customer_book_package":
        return <BookServicePackageScreen />;
      case "customer_book_garages":
        return <GarageSelectionScreen />;
      case "customer_cart":
        return <CartScreen />;
      case "customer_book_schedule":
        return <ScheduleCheckoutScreen />;
      case "customer_tracker_journey":
        return <CustomerLiveTrackerJourneyScreen defaultTab="journey" />;
      case "customer_tracker_inspection":
        return <CustomerLiveTrackerJourneyScreen defaultTab="inspection" />;
      case "customer_tracker_ready":
        return <CustomerLiveTrackerJourneyScreen defaultTab="ready" />;
      case "workshop_dashboard":
        return <WorkshopDashboardScreen />;
      case "workshop_bay_log":
        return <MechanicLiveBayLogScreen />;
      default:
        return <CustomerHomeScreen />;
    }
  };

  const isWelcome = currentScreen === "welcome";

  return (
    <div className="min-h-screen bg-[#fbf9f1] text-[#1b1c17] flex flex-col antialiased selection:bg-[#91f78e]">
      {/* Header */}
      {!isWelcome && <Header />}

      {/* Spacer for fixed header */}
      {!isWelcome && <div className="h-16 pt-safe"></div>}

      {/* Active screen content */}
      <main className="flex-1 flex flex-col w-full">
        {renderActiveScreen()}
      </main>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed top-20 inset-x-4 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-[#1b1c17] text-white px-4 py-2.5 rounded-full text-[12px] font-semibold shadow-2xl flex items-center gap-2 border border-[#40493d] max-w-sm text-center">
            <span className="material-symbols-outlined text-[#91f78e] text-[18px]">info</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Geofence Trigger Alert Banner */}
      <GeofenceFloatingAlertBanner />

      {/* Interactive Modals */}
      <LocationPickerModal />
      <GeofenceNotificationModal />
      <AmbulanceDispatchModal />
      <OBDDiagnosticModal />
      <EChallanVerificationModal />
      <WhatsAppBusinessHubModal />
      <SMSGatewayModal />
      <LiveBayStreamModal />
      <ScreenQuickDrawer />
      <CustomerSupportModal />
      <AIDiagnosticModal />
      <InspectionChecklistModal />
      <AddEstimateModal />
      <TaxInvoiceModal />
      <LiveAIChatDrawer />
      <RazorpayUPIModal />
      <LiveInteractiveMapModal />
      <WhatsAppDispatchModal />
      <VahanRCVerificationModal />
      <AuthModal />
      <CustomerApprovalModal
        isOpen={!!isModalOpen?.customerApproval}
        onClose={() => closeModal("customerApproval")}
        estimates={estimates}
        onToggleEstimate={(id) => {
          showToast(`Toggled Estimate Item status`);
        }}
        onApproveAll={() => {
          showToast("All recommended work items approved!");
        }}
        onPayNow={() => {
          openModal("razorpay");
        }}
        showToast={showToast}
      />
      <ServiceRemindersModal
        isOpen={!!isModalOpen?.reminders}
        onClose={() => closeModal("reminders")}
        showToast={showToast}
      />
      <InventoryManagerModal
        isOpen={!!isModalOpen?.inventory}
        onClose={() => closeModal("inventory")}
        showToast={showToast}
      />
      <WorkshopAnalyticsModal
        isOpen={!!isModalOpen?.analytics}
        onClose={() => closeModal("analytics")}
        showToast={showToast}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
