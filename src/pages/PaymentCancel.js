import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import axios from "axios";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cancelDetails, setCancelDetails] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  useEffect(() => {
    const verifyPayment = async () => {
      let orderId = searchParams.get("orderId");
      const reason = searchParams.get("reason") || "Payment cancelled by PayFast gateway";
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://api.callit-studio.com";

      // If no orderId in URL, check localStorage (fallback)
      if (!orderId) {
        console.warn("[CANCEL PAGE] No orderId in URL, checking localStorage");
        orderId = localStorage.getItem("lastOrderId");
        if (orderId) {
          console.log(`[CANCEL PAGE] Found orderId in localStorage: ${orderId}`);
        }
      }

      if (!orderId) {
        console.error("[CANCEL PAGE] No Order ID found in URL or localStorage");
        setCancelDetails({
          orderId: "ORD-XXXXXX",
          reason: reason,
          timestamp: new Date().toLocaleString(),
        });
        setVerifying(false);
        return;
      }

      try {
        console.log(`[CANCEL PAGE] Fetching order details for Order: ${orderId}`);
        const response = await axios.get(`${backendUrl}/api/orders/${orderId}`);

        console.log(`[CANCEL PAGE] Order Status from backend: ${response.data?.paymentStatus}`);
        setCancelDetails({
          orderId: orderId,
          reason: reason,
          timestamp: new Date().toLocaleString(),
        });

        setPaymentStatus(response.data?.paymentStatus || "failed");
      } catch (error) {
        console.error("[CANCEL PAGE] Could not fetch order:", error.message);
        setCancelDetails({
          orderId: orderId || "ORD-XXXXXX",
          reason: reason,
          timestamp: new Date().toLocaleString(),
        });
        setPaymentStatus("failed");
      }

      setVerifying(false);
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-red-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-20 h-20 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-red-700 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 text-lg">
              Your payment transaction was not completed
            </p>
          </div>

          {/* Details Section */}
          {cancelDetails && (
            <div className="p-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Transaction Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold text-gray-900">
                      {cancelDetails.orderId}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="font-semibold text-gray-900">
                      {cancelDetails.reason}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-semibold text-gray-900">
                      {cancelDetails.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                <p className="text-yellow-900">
                  <strong>What happens next?</strong> Your payment was not
                  processed. No charges have been made to your account. You can
                  try booking your tickets again.
                </p>
              </div>

              {/* Status Message */}
              {verifying ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <p className="text-blue-700 text-center font-medium">
                    ⏳ Verifying order status with server...
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                  <p className="text-red-700 text-center font-medium">
                    Order Status: {paymentStatus}
                  </p>
                </div>
              )}

              {/* Common Reasons */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h3 className="text-blue-900 font-semibold mb-3">
                  Common reasons for cancellation:
                </h3>
                <ul className="text-blue-800 text-sm space-y-2">
                  <li>✓ User cancelled the payment</li>
                  <li>✓ Payment gateway timeout</li>
                  <li>✓ Invalid payment method</li>
                  <li>✓ Insufficient funds</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={() => navigate("/ticketinfo")}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support Info */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're experiencing issues with the payment process, please
            contact our support team:
          </p>
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-700">
              <strong>Email:</strong> support@callitevents.com
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +92-XXX-XXXXXXX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
