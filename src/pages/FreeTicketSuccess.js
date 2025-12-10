import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Download } from "lucide-react";
import { getFreeTicketByOrderId } from "../api/freeTicket";

export default function FreeTicketSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      let orderId = searchParams.get("orderId");
      if (!orderId) orderId = localStorage.getItem("lastFreeTicketOrderId");

      if (!orderId) {
        setError("No Order ID found");
        setLoading(false);
        return;
      }

      try {
        const data = await getFreeTicketByOrderId(orderId);
        setTicket(data);
      } catch (err) {
        setError(err.message || "Ticket not found");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [searchParams]);

//   const downloadReceiptPDF = () => {
//     if (!receiptRef.current) return;

//     const generatePDF = () => {
//       const element = receiptRef.current;

//       // Hide elements with no-print class
//       const noPrintElements = element.querySelectorAll(".no-print");
//       noPrintElements.forEach(el => (el.style.display = "none"));

//       const opt = {
//         margin: 0.5,
//         filename: `ticket-${ticket?.orderId || "receipt"}.pdf`,
//         image: { type: "jpeg", quality: 0.98 },
//         html2canvas: { scale: 2, useCORS: true },
//         jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
//       };

//       window.html2pdf().set(opt).from(element).save().finally(() => {
//         // Restore hidden elements
//         noPrintElements.forEach(el => (el.style.display = ""));
//       });
//     };

//     // Load html2pdf.js dynamically if not loaded
//     if (!window.html2pdf) {
//       const script = document.createElement("script");
//       script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
//       script.onload = generatePDF;
//       script.onerror = () => alert("Failed to load PDF library");
//       document.head.appendChild(script);
//     } else {
//       generatePDF();
//     }
//   };
const downloadReceiptPDF = async () => {
  if (!receiptRef.current) return;

  const element = receiptRef.current;

  // Hide elements with no-print class
  const noPrintElements = element.querySelectorAll(".no-print");
  noPrintElements.forEach(el => (el.style.display = "none"));

  // Load html2canvas and jsPDF dynamically if needed
  if (!window.html2canvas || !window.jsPDF) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Render the element to canvas
  const canvas = await window.html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/jpeg", 1.0);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Calculate the scaling to fit the content into A4 page
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const width = imgWidth * ratio;
  const height = imgHeight * ratio;

  pdf.addImage(imgData, "JPEG", 0, 0, width, height);
  pdf.save(`ticket-${ticket?.orderId || "receipt"}.pdf`);

  // Restore hidden elements
  noPrintElements.forEach(el => (el.style.display = ""));
};


  if (loading) return <p className="text-center mt-10">Loading ticket...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div ref={receiptRef} className="bg-white rounded-3xl shadow-2xl border-t-4 border-green-500 p-10">
          <div className="text-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto" strokeWidth={2.5} />
            <h1 className="text-4xl font-extrabold text-green-700 mt-3">Your Free Ticket</h1>
            <p className="text-gray-700 mt-1">Successfully generated</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200">
            <div className="flex justify-between py-2">
              <span className="text-gray-700 font-medium">Order ID:</span>
              <span className="font-bold text-gray-900">{ticket.orderId}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700 font-medium">Name:</span>
              <span className="font-bold text-gray-900">{ticket.name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700 font-medium">Phone:</span>
              <span className="font-bold text-gray-900">{ticket.phone}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700 font-medium">Email:</span>
              <span className="font-bold text-gray-900">{ticket.email}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-8 no-print">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={downloadReceiptPDF}
              className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
