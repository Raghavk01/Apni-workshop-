/**
 * Razorpay Standard Web Checkout Client Integration
 */

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id?: string;
  receipt?: string;
  error?: string;
}

export interface RazorpayPaymentSuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  payment_id?: string;
  error?: string;
}

export interface CheckoutOptions {
  amount: number; // in Rupees or Paise (will ensure paise)
  bookingId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  onSuccess: (data: { orderId: string; paymentId: string; signature: string }) => void;
  onError: (error: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically load Razorpay checkout.js script if not present
 */
export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Create order on backend and launch Razorpay Standard Checkout Modal
 */
export async function openRazorpayStandardCheckout(options: CheckoutOptions): Promise<void> {
  const {
    amount,
    bookingId,
    customerName = "Vikram Malhotra",
    customerEmail = "vikram.malhotra@example.com",
    customerPhone = "+919876543210",
    description = "Apni Workshop Service Booking",
    onSuccess,
    onError,
    onDismiss,
  } = options;

  try {
    // 1. Ensure Razorpay SDK is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !(window as any).Razorpay) {
      onError("Razorpay SDK could not be loaded. Please check your internet connection.");
      return;
    }

    // Convert amount to paise (min 100 paise = ₹1.00)
    const amountInPaise = amount < 100 ? Math.round(amount * 100) : Math.round(amount * 100);

    // 2. Call backend to create Razorpay order
    const orderRes = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: bookingId ? `rcpt_${bookingId}` : `rcpt_${Date.now()}`,
        notes: {
          bookingId: bookingId || "DIRECT_PAY",
          customerName,
          platform: "Apni Workshop Web App",
        },
      }),
    });

    const orderData: RazorpayOrderResponse = await orderRes.json();

    if (!orderRes.ok || !orderData.success || !orderData.order_id) {
      throw new Error(orderData.error || "Failed to initiate Razorpay order on server");
    }

    // Use key_id from server or fallback
    const keyId =
      orderData.key_id ||
      (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
      "rzp_test_Ta0pKvaq56Z2y4";

    // 3. Configure Razorpay Standard Checkout Options
    const razorpayOptions = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "Apni Workshop Mobility",
      description: description,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1_PYJX9VmBtpWvJhPhRSfK0jBMfeECFvRRAd61kK4yxvp1n4Wiw-ZQlSOwFDZNeQ8IDzdJw64r2__dPndGCgvtHBhG6qwJRv8S1NgxIbAAIK2gI6UBAnqfvcR8qvDcVJuWRQjEk65IL-ac-Qy58ivtjZXAKWDMrHsbWpXaeSWjhazEpJNDJg0pFrF-rHtst-3Ygs2p0Ydb7MwPx780FrRzBA5lmUeqFffQlbj3lLv3ddb2h5j90so",
      order_id: orderData.order_id,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        bookingId: bookingId || "N/A",
      },
      theme: {
        color: "#0d631b", // Apni Workshop Green
        backdrop_color: "rgba(12, 35, 64, 0.7)",
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) {
            onDismiss();
          }
        },
        escape: true,
        backdropclose: false,
      },
      handler: async function (response: RazorpayPaymentSuccessPayload) {
        try {
          // 4. Send payment details to backend to verify signature
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData: RazorpayVerifyResponse = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            onSuccess({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          } else {
            onError(verifyData.error || "Payment signature verification failed on server.");
          }
        } catch (verifyErr: any) {
          console.error("Payment verification error:", verifyErr);
          onError("Error connecting to server to verify payment signature.");
        }
      },
    };

    // 5. Instantiate and open Razorpay Modal
    const rzp = new (window as any).Razorpay(razorpayOptions);

    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay Payment Failed:", response.error);
      const errorReason =
        response.error?.description ||
        response.error?.reason ||
        "Payment was declined or cancelled.";
      onError(`Payment Failed: ${errorReason}`);
    });

    rzp.open();
  } catch (err: any) {
    console.error("Razorpay checkout initialization error:", err);
    onError(err.message || "Failed to open Razorpay checkout.");
  }
}
