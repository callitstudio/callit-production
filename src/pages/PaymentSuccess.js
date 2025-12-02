import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Download } from "lucide-react";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const receiptRef = useRef(null);

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
        console.warn("[SUCCESS PAGE] No Order ID found in URL or localStorage - Using demo data for design preview");
        // Set demo data for design testing
        setOrderDetails({
          orderId: "ORD-DEMO123",
          transactionId: "TXN-DEMO456",
          amount: 5000,
          timestamp: new Date().toLocaleString(),
        });
        setPaymentStatus("confirmed");
        setVerifying(false);
        return;
      }
debugger
      try {
        console.log(`[SUCCESS PAGE] Fetching order details for Order: ${orderId}`);
        const response = await axios.get(`${backendUrl}/api/orders/${orderId}`);
        const order = response.data;

        console.log(`[SUCCESS PAGE] Order fetched - Status: ${order?.paymentStatus}`);
        console.log(`[SUCCESS PAGE] Order data:`, order);

        // Get transaction ID from payment record if available
        let transactionId = "TXN-XXXXXX";
        // Get amount from order - ensure it's a number and properly formatted
        let amount = order?.totalAmount;
        if (amount !== undefined && amount !== null) {
          if (typeof amount === 'string') {
            amount = parseFloat(amount) || 0;
          } else if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
          }
        } else {
          amount = 0;
        }
        console.log(`[SUCCESS PAGE] Order totalAmount from backend: ${order?.totalAmount}, Parsed amount: ${amount}`);

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
        // This ensures the payment status is synchronized with PayFast
        try {
          console.log(`[SUCCESS PAGE] Updating payment status for Order: ${orderId}`);
          const updateResponse = await axios.post(`${backendUrl}/api/payfast/update-status`, {
            orderId: orderId,
          });
          console.log(`[SUCCESS PAGE] Payment status update response:`, updateResponse.data);
          
          // Re-fetch order to get updated status after update
          const updatedOrderResponse = await axios.get(`${backendUrl}/api/orders/${orderId}`);
          const updatedOrder = updatedOrderResponse.data;
          console.log(`[SUCCESS PAGE] Updated order data:`, updatedOrder);
          
          if (updatedOrder?.paymentStatus === "paid") {
            setPaymentStatus("confirmed");
            // Update amount if it changed
            if (updatedOrder?.totalAmount) {
              let updatedAmount = updatedOrder.totalAmount;
              if (typeof updatedAmount !== 'number') {
                updatedAmount = parseFloat(updatedAmount) || amount;
              }
              setOrderDetails(prev => ({
                ...prev,
                amount: updatedAmount
              }));
            }
            console.log(`[SUCCESS PAGE] Payment status updated to paid`);
          }
        } catch (err) {
          console.warn("[SUCCESS PAGE] Could not update payment status:", err.message);
        }
      } catch (error) {
        console.error("[SUCCESS PAGE] Error fetching order:", error.message);
        // If orderId exists but API fails, still show the page with available data
        setOrderDetails({
          orderId: orderId || "ORD-ERROR",
          transactionId: "TXN-XXXXXX",
          amount: 0,
          timestamp: new Date().toLocaleString(),
        });
        setPaymentStatus("error");
      }

      setVerifying(false);
    };

    verifyPayment();
  }, [searchParams]);

  const downloadReceiptPDF = async () => {
    if (!receiptRef.current) return;

    const generatePDF = () => {
      if (!receiptRef.current || !window.html2pdf) return;

      const element = receiptRef.current;
      
      // Hide elements with no-print class before generating PDF
      const noPrintElements = element.querySelectorAll('.no-print');
      noPrintElements.forEach(el => {
        el.style.display = 'none';
      });

      const opt = {
        margin: [0.6, 0.6, 0.6, 0.6],
        filename: `receipt-${orderDetails?.orderId || 'receipt'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'cm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      window.html2pdf().set(opt).from(element).save().then(() => {
        // Restore hidden elements after PDF generation
        noPrintElements.forEach(el => {
          el.style.display = '';
        });
      });
    };

    // Check if html2pdf is already loaded
    if (!window.html2pdf) {
      // Load html2pdf library dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        generatePDF();
      };
      script.onerror = () => {
        alert('Failed to load PDF library. Please try again.');
      };
      document.head.appendChild(script);
    } else {
      generatePDF();
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.6cm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            min-height: auto !important;
            height: auto !important;
          }
          .receipt-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            page-break-inside: avoid !important;
            page-break-after: auto !important;
            width: 100% !important;
            margin: 0 !important;
            max-height: calc(100vh - 1.2cm) !important;
            overflow: hidden !important;
          }
          .receipt-card .bg-gradient-to-r {
            padding: 1rem !important;
          }
          .receipt-card .p-8 {
            padding: 1rem !important;
          }
          .receipt-card h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.25rem !important;
            line-height: 1.2 !important;
          }
          .receipt-card .w-20 {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }
          .receipt-card .text-4xl {
            font-size: 1.25rem !important;
          }
          .receipt-card .text-lg {
            font-size: 0.875rem !important;
          }
          .receipt-card .text-xl {
            font-size: 1rem !important;
          }
          .receipt-card .space-y-4 > * {
            margin-top: 0.375rem !important;
            margin-bottom: 0.375rem !important;
          }
          .receipt-card .mb-6 {
            margin-bottom: 0.75rem !important;
          }
          .receipt-card .mb-8 {
            margin-bottom: 0.75rem !important;
          }
          .receipt-card .mb-4 {
            margin-bottom: 0.5rem !important;
          }
          .receipt-card .mb-2 {
            margin-bottom: 0.25rem !important;
          }
          .receipt-card .pt-4 {
            padding-top: 0.5rem !important;
          }
          .receipt-card .p-6 {
            padding: 0.75rem !important;
          }
          .receipt-card .rounded-lg {
            border-radius: 0.25rem !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4 print-container">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div ref={receiptRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-green-500 receipt-card">
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
                    <span className="text-gray-600">Amount Paid (Including Tax):</span>
                    <span className="font-semibold text-green-600 text-lg">
                      PKR {(() => {
                        const amt = typeof orderDetails.amount === 'number' 
                          ? orderDetails.amount 
                          : (parseFloat(orderDetails.amount) || 0);
                        return amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                      })()}
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

              {/* Status Message - Hidden in print */}
              <div className="no-print">
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
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 flex-col sm:flex-row no-print">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
                <button
                  onClick={downloadReceiptPDF}
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
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
    </>
  );
};

export default PaymentSuccess;
