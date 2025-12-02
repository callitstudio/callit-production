import React, { useState } from "react";
import {
  createOrder,
  getPayFastToken,
  initializePayFastPayment,
  debugPayFastFormData,
} from "../../../api/orderApi.js"; // adjust path as needed
const EventTicketInfo = () => {
  const handleCheckout = async () => {
    try {
      // Validate required fields
      if (!accountInfo.name.trim()) {
        alert("Please enter your name");
        return;
      }
      if (!accountInfo.phone.trim()) {
        alert("Please enter your phone number");
        return;
      }

      // Collect all ticket holder names in order
      const allTickets = getAllTickets();
      const collectedNames = allTickets.map(
        (ticket) =>
          ticketHolderNames[`${ticket.day}-${ticket.type}-${ticket.index}`] ||
          ""
      );

      // Check if all names are filled
      if (collectedNames.some((name) => !name.trim())) {
        alert("Please fill in names for all ticket holders");
        return;
      }

      // Show loader before starting API calls
      setIsRedirecting(true);

      // Convert tickets object into an array suitable for backend
      const ticketsPurchased = [];
      let nameIndex = 0;

      Object.keys(tickets).forEach((dayKey) => {
        const dayTickets = tickets[dayKey];
        const eventDay = parseInt(dayKey.replace("day", "")); // day1 -> 1, day2 -> 2, etc.

        Object.keys(dayTickets).forEach((typeKey) => {
          const quantity = dayTickets[typeKey];
          if (quantity > 0) {
            // Collect names for this ticket type
            const ticketNames = [];
            for (let i = 0; i < quantity; i++) {
              ticketNames.push(collectedNames[nameIndex++]);
            }

            ticketsPurchased.push({
              eventDay,
              ticketType: typeKey, // e.g., vip, goldEarlyBird
              quantity,
              names: ticketNames,
              price: ticketPrices[dayKey]?.[typeKey] || 0, // take price from your ticketPrices mapping
            });
          }
        });
      });

      // Calculate totals
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const totalWithTax = calculateTotal();
      
      console.log(`[PAYMENT] Price Breakdown - Subtotal: PKR ${subtotal.toLocaleString()}, Tax (2.95%): PKR ${tax.toLocaleString()}, Total: PKR ${totalWithTax.toLocaleString()}`);

      // Prepare order data
      const orderData = {
        userName: accountInfo.name,
        userPhone: accountInfo.phone,
        totalAmount: totalWithTax, // Tax-included total
        ticketsPurchased,
      };

      // Step 1: Create order
      console.log(`[PAYMENT] Step 1: Creating order with totalAmount: PKR ${totalWithTax.toLocaleString()}`);
      const orderResponse = await createOrder(orderData);
      console.log(`[PAYMENT] Order created successfully - Order ID: ${orderResponse?.order?.orderId}`);

      if (!orderResponse?.order?.orderId) {
        console.error("[PAYMENT] ERROR: Order ID not received from backend");
        setIsRedirecting(false);
        alert("Something went wrong: Order ID not received.");
        return;
      }

      // Step 2: Get PayFast access token
      const orderId = orderResponse.order.orderId;
      
      // Save orderId to localStorage immediately after order creation
      localStorage.setItem("lastOrderId", orderId);
      console.log(`[PAYMENT] Step 1.5: Saved orderId to localStorage: ${orderId}`);
      
      const totalAmount = totalWithTax; // Use the same tax-included total
      console.log(`[PAYMENT] Step 2: Getting PayFast token for Order: ${orderId}, Amount: PKR ${totalAmount.toLocaleString()}`);

      const tokenResponse = await getPayFastToken(orderId, totalAmount);
      console.log(`[PAYMENT] Token received successfully for Order: ${orderId}`);

      if (!tokenResponse?.token) {
        console.error("Token not received from PayFast");
        setIsRedirecting(false);
        alert("Something went wrong: Could not get payment token.");
        return;
      }

      // Step 3: Initialize PayFast payment with token
      const token = tokenResponse.token;
      console.log(`[PAYMENT] Step 3: Initializing PayFast payment for Order: ${orderId}`);

      const paymentResponse = await initializePayFastPayment(orderId, token);
      console.log(`[PAYMENT] Payment initialized - ready to redirect to PayFast`);

      // Step 4: Submit form to PayFast checkout URL
      if (paymentResponse?.checkoutUrl && paymentResponse?.formData) {
        console.log("PayFast Checkout URL:", paymentResponse.checkoutUrl);
        console.log("PayFast Form Data:", paymentResponse.formData);

        // Debug: Log form data structure for signature validation
        debugPayFastFormData(paymentResponse.formData);

        // Validate required fields before submission (PayFast Pakistan fields)
        const requiredFields = [
          "MERCHANT_ID",
          "TOKEN", // ✅ we now expect TOKEN from backend
          "TXNAMT",
          "BASKET_ID",
          "MERCHANT_NAME",
        ];

        const missingFields = requiredFields.filter(
          (field) =>
            !paymentResponse.formData[field] ||
            paymentResponse.formData[field] === ""
        );

        if (missingFields.length > 0) {
          console.error("Missing required PayFast fields:", missingFields);
          setIsRedirecting(false);
          alert(
            `Error: Missing payment fields (${missingFields.join(
              ", "
            )}). Please contact support.`
          );
          return;
        }

        // IMPORTANT: Form submission is DISABLED for debugging
        // To enable auto-redirect to PayFast, uncomment the form.submit() line below

        console.log("[PAYMENT] Step 4: Form ready - submitting to PayFast gateway...");

        // Create a hidden form to submit to PayFast
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paymentResponse.checkoutUrl;
        form.enctype = "application/x-www-form-urlencoded";
        form.style.display = "none";
        form.target = "_self"; // Submit in same tab to redirect

        // Add all form data as hidden inputs
        Object.keys(paymentResponse.formData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(paymentResponse.formData[key]).trim();
          form.appendChild(input);
        });

        // OrderId already saved to localStorage after order creation
        // This is just a confirmation log
        console.log(`[PAYMENT] Step 5: Confirming orderId in localStorage: ${orderId}`);

        // Append form to body and submit
        document.body.appendChild(form);
        console.log(`[PAYMENT] Step 6: Submitting form to PayFast gateway...`);
        
        // Submit form - this will redirect to PayFast in the same tab
        // The loader will automatically disappear when the page redirects
        form.submit();
      } else {
        console.error(
          "Checkout URL or form data not returned from payment initialization"
        );
        console.error("Response:", paymentResponse);
        setIsRedirecting(false);
        alert(
          "Something went wrong: Payment checkout data not received. Please try again."
        );
      }
    } catch (error) {
      console.error("[PAYMENT] ERROR during checkout:", error);
      setIsRedirecting(false);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  const [tickets, setTickets] = useState({
    day1: { 
      vip: 0, 
      gold: 0, 
      standard: 0, 
      couple: 0, 
      groupFour: 0,
      grouptwoGeneral: 0,
      groupoffourGeneral: 0,
      groupofsixGeneral: 0,
    },
    day2: {
      vip: 0,
      gold: 0,
      standard: 0,
      couple: 0,
      groupFour: 0,
      groupoftwoGeneral: 0,
      groupoffourGeneral: 0,
    },
    day3: { 
      vip: 0, 
      gold: 0, 
      standard: 0, 
      couple: 0, 
      groupFour: 0,
      groupoftwoGeneral: 0,
      groupoffourGeneral: 0,
      groupofsixGeneral: 0,
    },
  });

  const [openDay, setOpenDay] = useState("day1");

  const [accountInfo, setAccountInfo] = useState({
    name: "",
    phone: "",
  });

  const [ticketHolderNames, setTicketHolderNames] = useState({});

  const [isRedirecting, setIsRedirecting] = useState(false);

  const ticketPrices = {
    day1: {
      vip: 2500,
      gold: 1500,
      standard: 0,
      couple: 0,
      groupFour: 0,
      grouptwoGeneral: 2,
      groupoffourGeneral: 1800,
      groupofsixGeneral: 2500,
    },
    day2: {
      vip: 4000,
      // vipEarlyBird: 4000,
      gold: 3000,
      // goldEarlyBird: 3000,
      standard: 0,
      // standardEarlyBird: 2000,
      couple: 0,
      // coupleEarlyBird: 3500,
      groupFour: 0,
      groupoftwoGeneral: 3000,
      groupoffourGeneral: 5000,
    },
    day3: {
      vip: 3000,
      gold: 2000,
      standard: 0,
      couple: 0,
      groupFour: 0,
      groupoftwoGeneral: 1800,
      groupoffourGeneral: 3500,
      groupofsixGeneral: 4500,
    },
  };

  const updateTicket = (day, type, operation) => {
    setTickets((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]:
          operation === "add"
            ? prev[day][type] + 1
            : Math.max(0, prev[day][type] - 1),
      },
    }));
  };

  const calculateSubtotal = () => {
    let total = 0;

    // Day 1
    total += tickets.day1.vip * (ticketPrices.day1.vip || 0);
    total += tickets.day1.gold * (ticketPrices.day1.gold || 0);
    total += tickets.day1.standard * (ticketPrices.day1.standard || 0);
    total += tickets.day1.couple * (ticketPrices.day1.couple || 0);
    total += tickets.day1.groupFour * (ticketPrices.day1.groupFour || 0);
    total += tickets.day1.grouptwoGeneral * (ticketPrices.day1.grouptwoGeneral || 0);
    total += tickets.day1.groupoffourGeneral * (ticketPrices.day1.groupoffourGeneral || 0);
    total += tickets.day1.groupofsixGeneral * (ticketPrices.day1.groupofsixGeneral || 0);

    // Day 2
    total += tickets.day2.vip * (ticketPrices.day2.vip || 0);
    total += tickets.day2.gold * (ticketPrices.day2.gold || 0);
    total += tickets.day2.standard * (ticketPrices.day2.standard || 0);
    total += tickets.day2.couple * (ticketPrices.day2.couple || 0);
    total += tickets.day2.groupFour * (ticketPrices.day2.groupFour || 0);
    total += tickets.day2.groupoftwoGeneral * (ticketPrices.day2.groupoftwoGeneral || 0);
    total += tickets.day2.groupoffourGeneral * (ticketPrices.day2.groupoffourGeneral || 0);

    // Day 3
    total += tickets.day3.vip * (ticketPrices.day3.vip || 0);
    total += tickets.day3.gold * (ticketPrices.day3.gold || 0);
    total += tickets.day3.standard * (ticketPrices.day3.standard || 0);
    total += tickets.day3.couple * (ticketPrices.day3.couple || 0);
    total += tickets.day3.groupFour * (ticketPrices.day3.groupFour || 0);
    total += tickets.day3.groupoftwoGeneral * (ticketPrices.day3.groupoftwoGeneral || 0);
    total += tickets.day3.groupoffourGeneral * (ticketPrices.day3.groupoffourGeneral || 0);
    total += tickets.day3.groupofsixGeneral * (ticketPrices.day3.groupofsixGeneral || 0);

    return total;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.0295; // 2.95% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  const getTotalTickets = () => {
    let count = 0;
    Object.keys(tickets).forEach((day) => {
      Object.values(tickets[day]).forEach((qty) => (count += qty));
    });
    return count;
  };

  const toggleDay = (day) => {
    setOpenDay(openDay === day ? "" : day);
  };

  const getAllTickets = () => {
    const allTickets = [];

    // Day 1
    if (tickets.day1.vip > 0) {
      for (let i = 0; i < tickets.day1.vip; i++) {
        allTickets.push({ day: "day1", type: "VIP", index: i });
      }
    }
    if (tickets.day1.gold > 0) {
      for (let i = 0; i < tickets.day1.gold; i++) {
        allTickets.push({ day: "day1", type: "Gold", index: i });
      }
    }
    if (tickets.day1.standard > 0) {
      for (let i = 0; i < tickets.day1.standard; i++) {
        allTickets.push({ day: "day1", type: "Standard", index: i });
      }
    }
    if (tickets.day1.couple > 0) {
      for (let i = 0; i < tickets.day1.couple; i++) {
        allTickets.push({ day: "day1", type: "Couple Pass", index: i });
      }
    }
    if (tickets.day1.groupFour > 0) {
      for (let i = 0; i < tickets.day1.groupFour; i++) {
        allTickets.push({ day: "day1", type: "Group of 4", index: i });
      }
    }
    if (tickets.day1.grouptwoGeneral > 0) {
      for (let i = 0; i < tickets.day1.grouptwoGeneral; i++) {
        allTickets.push({ day: "day1", type: "Group of 2 General", index: i });
      }
    }
    if (tickets.day1.groupoffourGeneral > 0) {
      for (let i = 0; i < tickets.day1.groupoffourGeneral; i++) {
        allTickets.push({ day: "day1", type: "Group of 4 General", index: i });
      }
    }
    if (tickets.day1.groupofsixGeneral > 0) {
      for (let i = 0; i < tickets.day1.groupofsixGeneral; i++) {
        allTickets.push({ day: "day1", type: "Group of 6 General", index: i });
      }
    }

    // Day 2
    if (tickets.day2.vip > 0) {
      for (let i = 0; i < tickets.day2.vip; i++) {
        allTickets.push({ day: "day2", type: "VIP", index: i });
      }
    }
    if (tickets.day2.gold > 0) {
      for (let i = 0; i < tickets.day2.gold; i++) {
        allTickets.push({ day: "day2", type: "Gold", index: i });
      }
    }
    if (tickets.day2.standard > 0) {
      for (let i = 0; i < tickets.day2.standard; i++) {
        allTickets.push({ day: "day2", type: "Standard", index: i });
      }
    }
    if (tickets.day2.couple > 0) {
      for (let i = 0; i < tickets.day2.couple; i++) {
        allTickets.push({ day: "day2", type: "Couple Pass", index: i });
      }
    }
    if (tickets.day2.groupFour > 0) {
      for (let i = 0; i < tickets.day2.groupFour; i++) {
        allTickets.push({ day: "day2", type: "Group of 4", index: i });
      }
    }
    if (tickets.day2.groupoftwoGeneral > 0) {
      for (let i = 0; i < tickets.day2.groupoftwoGeneral; i++) {
        allTickets.push({ day: "day2", type: "Group of 2 General", index: i });
      }
    }
    if (tickets.day2.groupoffourGeneral > 0) {
      for (let i = 0; i < tickets.day2.groupoffourGeneral; i++) {
        allTickets.push({ day: "day2", type: "Group of 4 General", index: i });
      }
    }

    // Day 3
    if (tickets.day3.vip > 0) {
      for (let i = 0; i < tickets.day3.vip; i++) {
        allTickets.push({ day: "day3", type: "VIP", index: i });
      }
    }
    if (tickets.day3.gold > 0) {
      for (let i = 0; i < tickets.day3.gold; i++) {
        allTickets.push({ day: "day3", type: "Gold", index: i });
      }
    }
    if (tickets.day3.standard > 0) {
      for (let i = 0; i < tickets.day3.standard; i++) {
        allTickets.push({ day: "day3", type: "Standard", index: i });
      }
    }
    if (tickets.day3.couple > 0) {
      for (let i = 0; i < tickets.day3.couple; i++) {
        allTickets.push({ day: "day3", type: "Couple Pass", index: i });
      }
    }
    if (tickets.day3.groupFour > 0) {
      for (let i = 0; i < tickets.day3.groupFour; i++) {
        allTickets.push({ day: "day3", type: "Group of 4", index: i });
      }
    }
    if (tickets.day3.groupoftwoGeneral > 0) {
      for (let i = 0; i < tickets.day3.groupoftwoGeneral; i++) {
        allTickets.push({ day: "day3", type: "Group of 2 General", index: i });
      }
    }
    if (tickets.day3.groupoffourGeneral > 0) {
      for (let i = 0; i < tickets.day3.groupoffourGeneral; i++) {
        allTickets.push({ day: "day3", type: "Group of 4 General", index: i });
      }
    }
    if (tickets.day3.groupofsixGeneral > 0) {
      for (let i = 0; i < tickets.day3.groupofsixGeneral; i++) {
        allTickets.push({ day: "day3", type: "Group of 6 General", index: i });
      }
    }

    return allTickets;
  };

  const getDayLabel = (dayKey) => {
    const dayMap = {
      day1: "5th Dec",
      day2: "6th Dec",
      day3: "7th Dec",
    };
    return dayMap[dayKey];
  };

  const formatPrice = (price) => {
    if (!price || price === 0) {
      return <span className="text-red-600 font-semibold">Sold Out</span>;
    }
    return `PKR ${price.toLocaleString()}`;
  };

  const isTicketSoldOut = (dayKey, ticketType) => {
    const price = ticketPrices[dayKey]?.[ticketType];
    return !price || price === 0;
  };

  const days = [
    { key: "day1", label: "Day 1", date: "12th Dec - 3pm - 12am" },
    { key: "day2", label: "Day 2", date: "13th Dec - 3pm - 12am" },
    { key: "day3", label: "Day 3", date: "14th Dec - 3pm - 12am" },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-[#5c1919]">
          Select Your Tickets
        </h1>

        {/* Days Accordion */}
        <div className="space-y-4 mb-10">
          {days.map((day) => (
            <div
              key={day.key}
              className="bg-white rounded-2xl shadow-xl border border-[#8b2e2e] overflow-hidden transition-all duration-300"
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(day.key)}
                className="w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#5c1919] to-[#7a2323] hover:from-[#6b1f1f] hover:to-[#8b2e2e] transition-all"
              >
                <span className="text-xl font-bold text-white">
                  {day.label}{" "}
                  <span className="text-base font-normal text-gray-200">
                    — {day.date}
                  </span>
                </span>
                <span
                  className={`text-2xl text-white transition-transform duration-300 ${
                    openDay === day.key ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {/* Ticket Options */}
              {openDay === day.key && (
                <div className="border-t border-gray-200 animate-fadeIn">
                  {day.key === "day1" ? (
                    // Day 1 Tickets
                    <>
                      {/* VIP */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            VIP
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.vip)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vip", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "vip")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.vip}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "vip", "add")}
                            disabled={isTicketSoldOut(day.key, "vip")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Gold
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.gold)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "gold", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "gold")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.gold}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "gold", "add")}
                            disabled={isTicketSoldOut(day.key, "gold")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Standard
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.standard)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "standard")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.standard}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "standard")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Couple Pass
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.couple)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "couple")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.couple}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "couple")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 4
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.groupFour)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupFour")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.groupFour}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupFour")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 2 General */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 2 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.grouptwoGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "grouptwoGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "grouptwoGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.grouptwoGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "grouptwoGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "grouptwoGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 General */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 4 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.groupoffourGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoffourGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoffourGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.groupoffourGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoffourGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoffourGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 6 General */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 6 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day1.groupofsixGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupofsixGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupofsixGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day1.groupofsixGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupofsixGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupofsixGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  ) : day.key === "day2" ? (
                    // Day 2 Tickets with Early Bird
                    <>
                      {/* VIP */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            VIP
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.vip)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vip", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "vip")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.vip}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "vip", "add")}
                            disabled={isTicketSoldOut(day.key, "vip")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Gold
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.gold)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "gold", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "gold")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.gold}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "gold", "add")}
                            disabled={isTicketSoldOut(day.key, "gold")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Standard
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.standard)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "standard")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.standard}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "standard")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Couple Pass
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.couple)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "couple")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.couple}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "couple")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 4
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.groupFour)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupFour")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.groupFour}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupFour")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 2 General */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 2 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.groupoftwoGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoftwoGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoftwoGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.groupoftwoGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoftwoGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoftwoGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 General */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 4 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day2.groupoffourGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoffourGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoffourGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day2.groupoffourGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoffourGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoffourGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Day 3 Tickets
                    <>
                      {/* VIP */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            VIP
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.vip)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vip", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "vip")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.vip}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "vip", "add")}
                            disabled={isTicketSoldOut(day.key, "vip")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Gold
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.gold)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "gold", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "gold")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.gold}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "gold", "add")}
                            disabled={isTicketSoldOut(day.key, "gold")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Standard
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.standard)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "standard")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.standard}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "standard")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Couple Pass
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.couple)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "couple")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.couple}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "couple")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 4
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.groupFour)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupFour")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.groupFour}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupFour")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 2 General */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 2 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.groupoftwoGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoftwoGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoftwoGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.groupoftwoGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoftwoGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoftwoGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 General */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 4 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.groupoffourGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoffourGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoffourGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.groupoffourGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupoffourGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupoffourGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 6 General */}
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Group of 6 General
                          </h3>
                          <p className="text-2xl font-bold text-[#5c1919] mt-1">
                            {formatPrice(ticketPrices.day3.groupofsixGeneral)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupofsixGeneral", "subtract")
                            }
                            disabled={isTicketSoldOut(day.key, "groupofsixGeneral")}
                            className="w-10 h-10 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8b2e2e]"
                          >
                            −
                          </button>
                          <span className="text-xl font-bold w-12 text-center">
                            {tickets.day3.groupofsixGeneral}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupofsixGeneral", "add")
                            }
                            disabled={isTicketSoldOut(day.key, "groupofsixGeneral")}
                            className="w-10 h-10 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5c1919]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        {getTotalTickets() > 0 && (
          <div className="bg-gradient-to-br from-[#5c1919] via-[#6b1f1f] to-[#4a1414] rounded-2xl p-8 mb-8 shadow-2xl border border-[#8b2e2e]">
            <h2 className="text-3xl font-bold text-white mb-6">
              Order Summary
            </h2>
            <div className="space-y-6">
              {days.map((day) => {
                const dayTickets = tickets[day.key];
                let hasDayTickets = false;

                if (day.key === "day1") {
                  hasDayTickets =
                    dayTickets.vip +
                      dayTickets.gold +
                      dayTickets.standard +
                      dayTickets.couple +
                      dayTickets.groupFour +
                      dayTickets.grouptwoGeneral +
                      dayTickets.groupoffourGeneral +
                      dayTickets.groupofsixGeneral >
                    0;
                } else if (day.key === "day2") {
                  hasDayTickets =
                    dayTickets.vip +
                      dayTickets.gold +
                      dayTickets.standard +
                      dayTickets.couple +
                      dayTickets.groupFour +
                      dayTickets.groupoftwoGeneral +
                      dayTickets.groupoffourGeneral >
                    0;
                } else {
                  hasDayTickets =
                    dayTickets.vip +
                      dayTickets.gold +
                      dayTickets.standard +
                      dayTickets.couple +
                      dayTickets.groupFour +
                      dayTickets.groupoftwoGeneral +
                      dayTickets.groupoffourGeneral +
                      dayTickets.groupofsixGeneral >
                    0;
                }

                return (
                  hasDayTickets && (
                    <div key={day.key}>
                      <h3 className="font-bold text-white text-xl mb-3">
                        {day.label}
                      </h3>

                      {day.key === "day1" ? (
                        <>
                          {dayTickets.vip > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>VIP × {dayTickets.vip}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.vip * ticketPrices.day1.vip
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.gold > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Gold × {dayTickets.gold}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.gold * ticketPrices.day1.gold
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.standard > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Standard × {dayTickets.standard}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.standard *
                                  ticketPrices.day1.standard
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.couple > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Couple Pass × {dayTickets.couple}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.couple * ticketPrices.day1.couple
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupFour > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 4 × {dayTickets.groupFour}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupFour *
                                  ticketPrices.day1.groupFour
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.grouptwoGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 2 General × {dayTickets.grouptwoGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.grouptwoGeneral *
                                  ticketPrices.day1.grouptwoGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupoffourGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 4 General × {dayTickets.groupoffourGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupoffourGeneral *
                                  ticketPrices.day1.groupoffourGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupofsixGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 6 General × {dayTickets.groupofsixGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupofsixGeneral *
                                  ticketPrices.day1.groupofsixGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </>
                      ) : day.key === "day2" ? (
                        <>
                          {dayTickets.vip > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>VIP × {dayTickets.vip}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.vip * ticketPrices.day2.vip
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.gold > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Gold × {dayTickets.gold}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.gold * ticketPrices.day2.gold
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.standard > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Standard × {dayTickets.standard}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.standard *
                                  ticketPrices.day2.standard
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.couple > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Couple Pass × {dayTickets.couple}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.couple * ticketPrices.day2.couple
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupFour > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 4 × {dayTickets.groupFour}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupFour *
                                  ticketPrices.day2.groupFour
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupoftwoGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 2 General × {dayTickets.groupoftwoGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupoftwoGeneral *
                                  ticketPrices.day2.groupoftwoGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupoffourGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 4 General × {dayTickets.groupoffourGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupoffourGeneral *
                                  ticketPrices.day2.groupoffourGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {dayTickets.vip > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>VIP × {dayTickets.vip}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.vip * ticketPrices.day3.vip
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.gold > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Gold × {dayTickets.gold}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.gold * ticketPrices.day3.gold
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.standard > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Standard × {dayTickets.standard}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.standard *
                                  ticketPrices.day3.standard
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.couple > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Couple Pass × {dayTickets.couple}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.couple * ticketPrices.day3.couple
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupFour > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 4 × {dayTickets.groupFour}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupFour *
                                  ticketPrices.day3.groupFour
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupoftwoGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 2 General × {dayTickets.groupoftwoGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupoftwoGeneral *
                                  ticketPrices.day3.groupoftwoGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupoffourGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 4 General × {dayTickets.groupoffourGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupoffourGeneral *
                                  ticketPrices.day3.groupoffourGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {dayTickets.groupofsixGeneral > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>Group of 6 General × {dayTickets.groupofsixGeneral}</span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.groupofsixGeneral *
                                  ticketPrices.day3.groupofsixGeneral
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-[#8b2e2e] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-200">
                  Subtotal
                </span>
                <span className="text-2xl font-semibold text-gray-200">
                  PKR {calculateSubtotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-200">
                  Tax (2.95%)
                </span>
                <span className="text-2xl font-semibold text-gray-200">
                  PKR {calculateTax().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#8b2e2e]">
                <span className="text-2xl font-bold text-white">
                  Total Amount
                </span>
                <span className="text-4xl font-bold text-white">
                  PKR {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        {getTotalTickets() > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-[#8b2e2e] p-8">
            <h2 className="text-3xl font-bold text-[#5c1919] mb-6">
              Account Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={accountInfo.name}
                  onChange={(e) =>
                    setAccountInfo({ ...accountInfo, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#5c1919] focus:outline-none text-lg"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={accountInfo.phone}
                  onChange={(e) =>
                    setAccountInfo({ ...accountInfo, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#5c1919] focus:outline-none text-lg"
                  placeholder="+92"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ticket Holder Names */}
        {getTotalTickets() > 0 && (
          <div className="mt-8 space-y-6">
            {getAllTickets().map((ticket, index) => (
              <div
                key={`${ticket.day}-${ticket.type}-${ticket.index}`}
                className="bg-white rounded-2xl shadow-xl border border-[#8b2e2e] p-6"
              >
                <h3 className="text-2xl font-bold text-[#5c1919] mb-4">
                  {getDayLabel(ticket.day)} - {ticket.type} - Person{" "}
                  {ticket.index + 1}
                </h3>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      ticketHolderNames[
                        `${ticket.day}-${ticket.type}-${ticket.index}`
                      ] || ""
                    }
                    onChange={(e) =>
                      setTicketHolderNames({
                        ...ticketHolderNames,
                        [`${ticket.day}-${ticket.type}-${ticket.index}`]:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#5c1919] focus:outline-none text-lg"
                    placeholder="Enter ticket holder name"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Final Submit Button */}
        {getTotalTickets() > 0 && (
          <button
            onClick={handleCheckout}
            disabled={!accountInfo.name.trim() || !accountInfo.phone.trim() || isRedirecting}
            className="w-full mt-8 py-5 rounded-full font-bold text-xl uppercase tracking-wider transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#5c1919] to-[#7a2323] hover:disabled:scale-100 hover:from-[#4a1414] hover:to-[#6b1f1f] text-white cursor-pointer"
          >
            Proceed to Payment (PKR {calculateTotal().toLocaleString()})
          </button>
        )}
      </div>

      {/* Redirecting Loader Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#5c1919] border-t-transparent"></div>
            </div>
            <h3 className="text-2xl font-bold text-[#5c1919] mb-2">
              Redirecting to PayFast
            </h3>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTicketInfo;
