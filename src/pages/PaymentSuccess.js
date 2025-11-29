import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Download } from "lucide-react";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  useEffect(() => {
    const verifyPayment = async () => {
      let orderId = searchParams.get("orderId");
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://api.callit-studio.com";

      // If no orderId in URL, check localStorage (fallback)
      if (!orderId) {
        console.warn("[SUCCESS PAGE] No orderId in URL, checking localStorage");
        orderId = localStorage.getItem("lastOrderId");
        if (orderId) {
          console.log(`[SUCCESS PAGE] Found orderId in localStorage: ${orderId}`);
        }
      }

      if (!orderId) {
        console.error("[SUCCESS PAGE] No Order ID found in URL or localStorage");
        setOrderDetails({
          orderId: "ORD-XXXXXX",
          transactionId: "TXN-XXXXXX",
          amount: "0",
          timestamp: new Date().toLocaleString(),
        });
        setVerifying(false);
        return;
      }

      try {
        console.log(`[SUCCESS PAGE] Fetching order details for Order: ${orderId}`);
        const response = await axios.get(`${backendUrl}/api/orders/${orderId}`);
        const order = response.data;

        console.log(`[SUCCESS PAGE] Order fetched - Status: ${order?.paymentStatus}`);

        // Get transaction ID from payment record if available
        let transactionId = "TXN-XXXXXX";
        let amount = order?.totalAmount || "0";

        // Try to get transaction details from payment record
        try {
          const paymentResponse = await axios.get(`${backendUrl}/api/payfast/status/${orderId}`);
          if (paymentResponse.data?.payfastResponse?.TXNID) {
            transactionId = paymentResponse.data.payfastResponse.TXNID;
            console.log(`[SUCCESS PAGE] Transaction ID found: ${transactionId}`);
          }
        } catch (err) {
          console.warn("[SUCCESS PAGE] Could not fetch payment record:", err.message);
        }

        setOrderDetails({
          orderId: orderId,
          transactionId: transactionId,
          amount: amount,
          timestamp: new Date().toLocaleString(),
        });

        // Verify payment status
        if (order?.paymentStatus === "paid") {
          console.log(`[SUCCESS PAGE] Payment confirmed - Order Status: paid`);
          setPaymentStatus("confirmed");
        } else {
          console.warn(`[SUCCESS PAGE] Payment status: ${order?.paymentStatus}`);
          setPaymentStatus(order?.paymentStatus || "pending");
        }

        // Update order status to paid on success page
        try {
          console.log(`[SUCCESS PAGE] Updating payment status for Order: ${orderId}`);
          await axios.post(`${backendUrl}/api/payfast/update-status`, {
            orderId: orderId,
          });
          console.log(`[SUCCESS PAGE] Payment status updated successfully`);
        } catch (err) {
          console.warn("[SUCCESS PAGE] Could not update payment status:", err.message);
        }
      } catch (error) {
        console.error("[SUCCESS PAGE] Error fetching order:", error.message);
        setOrderDetails({
          orderId: orderId,
          transactionId: "TXN-XXXXXX",
          amount: "0",
          timestamp: new Date().toLocaleString(),
        });
        setPaymentStatus("error");
      }

      setVerifying(false);
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-green-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-green-700 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 text-lg">
              Your tickets have been booked successfully
            </p>
          </div>

          {/* Details Section */}
          {orderDetails && (
            <div className="p-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Order Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.orderId}
                    </span>
                  </div>
                  {/* <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.transactionId}
                    </span>
                  </div> */}
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600 text-lg">
                      PKR {orderDetails.amount}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <p className="text-blue-900">
                  <strong>Note:</strong> A confirmation email has been sent to
                  your registered email address. Please check your email for
                  ticket details and further instructions.
                </p>
              </div>

              {/* Status Message */}
              {verifying ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <p className="text-blue-700 text-center font-medium">
                    ⏳ Verifying payment status with server...
                  </p>
                </div>
              ) : paymentStatus === "confirmed" ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                  <p className="text-green-700 text-center font-medium">
                    ✓ Payment confirmed with server
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-white-200 rounded-lg p-4 mb-8">
                  {/* <p className="text-yellow-700 text-center font-medium">
                    ⚠ Payment status: {paymentStatus}
                  </p> */}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-2xl mb-2">🎫</div>
            <h3 className="font-semibold text-gray-800 mb-2">Your Tickets</h3>
            <p className="text-sm text-gray-600">
              Check your email for e-tickets
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="font-semibold text-gray-800 mb-2">Confirmation</h3>
            <p className="text-sm text-gray-600">
              Email confirmation received
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-semibold text-gray-800 mb-2">Ready to Go</h3>
            <p className="text-sm text-gray-600">
              Bring your tickets to the event
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
