import { useState, useEffect } from "react";
import TicketForm from "./ticketspopupsections/ticketsforms";
import OrderSummary from "./ticketspopupsections/ordersummary";

const TicketBookingPopup = ({ isOpen, onClose, eventData }) => {
  const [quantity, setQuantity] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("en-us");

  const [timeLeft, setTimeLeft] = useState({
    days: 9,
    hours: 59,
    minutes: 26,
  });

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        else if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        else if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        return prev;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleConfirm = (e) => {
    e.preventDefault();
    const forms = document.querySelectorAll("input[name], select[name]");
    const data = {
      quantity,
      eventName: "GOONJ 2.0",
      eventDate: "December 5, 2025",
      ticketType: "Standard Ticket",
    };
    forms.forEach((input) => {
      if (input.name && input.value) data[input.name] = input.value;
    });
    setFormData(data);
    console.log("Complete Booking Data for Backend:", data);
    setShowSummary(true);
  };

  const handleBackToForm = () => setShowSummary(false);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) setQuantity(newQuantity);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {showSummary ? (
          <OrderSummary
            quantity={quantity}
            timeLeft={timeLeft}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            onBackToForm={handleBackToForm}
            onClose={onClose}
            formData={formData}
          />
        ) : (
          <TicketForm
            quantity={quantity}
            timeLeft={timeLeft}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            handleQuantityChange={handleQuantityChange}
            onConfirm={handleConfirm}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default TicketBookingPopup;
