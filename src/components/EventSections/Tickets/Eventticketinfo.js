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
              price: ticketPrices[dayKey][typeKey], // take price from your ticketPrices mapping
            });
          }
        });
      });

      // Prepare order data
      const orderData = {
        userName: accountInfo.name,
        userPhone: accountInfo.phone,
        totalAmount: calculateTotal(),
        ticketsPurchased,
      };

      // Step 1: Create order
      console.log("[PAYMENT] Step 1: Creating order...");
      const orderResponse = await createOrder(orderData);
      console.log(`[PAYMENT] Order created successfully - Order ID: ${orderResponse.order.orderId}`);

      if (!orderResponse?.order?.orderId) {
        console.error("[PAYMENT] ERROR: Order ID not received from backend");
        alert("Something went wrong: Order ID not received.");
        return;
      }

      // Step 2: Get PayFast access token
      const orderId = orderResponse.order.orderId;
      const totalAmount = calculateTotal();
      console.log(`[PAYMENT] Step 2: Getting PayFast token for Order: ${orderId}, Amount: PKR ${totalAmount}`);

      const tokenResponse = await getPayFastToken(orderId, totalAmount);
      console.log(`[PAYMENT] Token received successfully for Order: ${orderId}`);

      if (!tokenResponse?.token) {
        console.error("Token not received from PayFast");
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
        form.target = "_blank"; // Ensure form submits in same tab

        // Add all form data as hidden inputs
        Object.keys(paymentResponse.formData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(paymentResponse.formData[key]).trim();
          form.appendChild(input);
        });

        // Save orderId to localStorage as fallback (in case backend doesn't include it in redirect URL)
        localStorage.setItem("lastOrderId", orderId);
        console.log(`[PAYMENT] Step 5: Saved orderId to localStorage: ${orderId}`);

        // Append form to body and submit
        document.body.appendChild(form);
        console.log(`[PAYMENT] Step 6: Submitting form to PayFast gateway...`);
        form.submit();
      } else {
        console.error(
          "Checkout URL or form data not returned from payment initialization"
        );
        console.error("Response:", paymentResponse);
        alert(
          "Something went wrong: Payment checkout data not received. Please try again."
        );
      }
    } catch (error) {
      console.error("[PAYMENT] ERROR during checkout:", error);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  const [tickets, setTickets] = useState({
    day1: { vip: 0, gold: 0, standard: 0, couple: 0, groupFour: 0 },
    day2: {
      vip: 0,
      vipEarlyBird: 0,
      gold: 0,
      goldEarlyBird: 0,
      standard: 0,
      standardEarlyBird: 0,
      couple: 0,
      coupleEarlyBird: 0,
      groupFour: 0,
    },
    day3: { vip: 0, gold: 0, standard: 0, couple: 0, groupFour: 0 },
  });

  const [openDay, setOpenDay] = useState("day1");

  const [accountInfo, setAccountInfo] = useState({
    name: "",
    phone: "",
  });

  const [ticketHolderNames, setTicketHolderNames] = useState({});

  const ticketPrices = {
    day1: {
      vip: 2500,
      gold: 1500,
      standard: 100,
      couple: 1800,
      groupFour: 3500,
    },
    day2: {
      vip: 5000,
      vipEarlyBird: 4000,
      gold: 3500,
      goldEarlyBird: 3000,
      standard: 2500,
      standardEarlyBird: 2000,
      couple: 4000,
      coupleEarlyBird: 3500,
      groupFour: 7000,
    },
    day3: {
      vip: 3000,
      gold: 2000,
      standard: 1500,
      couple: 2500,
      groupFour: 5000,
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

  const calculateTotal = () => {
    let total = 0;

    // Day 1
    total += tickets.day1.vip * ticketPrices.day1.vip;
    total += tickets.day1.gold * ticketPrices.day1.gold;
    total += tickets.day1.standard * ticketPrices.day1.standard;
    total += tickets.day1.couple * ticketPrices.day1.couple;
    total += tickets.day1.groupFour * ticketPrices.day1.groupFour;

    // Day 2
    total += tickets.day2.vip * ticketPrices.day2.vip;
    total += tickets.day2.vipEarlyBird * ticketPrices.day2.vipEarlyBird;
    total += tickets.day2.gold * ticketPrices.day2.gold;
    total += tickets.day2.goldEarlyBird * ticketPrices.day2.goldEarlyBird;
    total += tickets.day2.standard * ticketPrices.day2.standard;
    total +=
      tickets.day2.standardEarlyBird * ticketPrices.day2.standardEarlyBird;
    total += tickets.day2.couple * ticketPrices.day2.couple;
    total += tickets.day2.coupleEarlyBird * ticketPrices.day2.coupleEarlyBird;
    total += tickets.day2.groupFour * ticketPrices.day2.groupFour;

    // Day 3
    total += tickets.day3.vip * ticketPrices.day3.vip;
    total += tickets.day3.gold * ticketPrices.day3.gold;
    total += tickets.day3.standard * ticketPrices.day3.standard;
    total += tickets.day3.couple * ticketPrices.day3.couple;
    total += tickets.day3.groupFour * ticketPrices.day3.groupFour;

    return total;
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

    // Day 2
    if (tickets.day2.vip > 0) {
      for (let i = 0; i < tickets.day2.vip; i++) {
        allTickets.push({ day: "day2", type: "VIP", index: i });
      }
    }
    if (tickets.day2.vipEarlyBird > 0) {
      for (let i = 0; i < tickets.day2.vipEarlyBird; i++) {
        allTickets.push({ day: "day2", type: "VIP Early Bird", index: i });
      }
    }
    if (tickets.day2.gold > 0) {
      for (let i = 0; i < tickets.day2.gold; i++) {
        allTickets.push({ day: "day2", type: "Gold", index: i });
      }
    }
    if (tickets.day2.goldEarlyBird > 0) {
      for (let i = 0; i < tickets.day2.goldEarlyBird; i++) {
        allTickets.push({ day: "day2", type: "Gold Early Bird", index: i });
      }
    }
    if (tickets.day2.standard > 0) {
      for (let i = 0; i < tickets.day2.standard; i++) {
        allTickets.push({ day: "day2", type: "Standard", index: i });
      }
    }
    if (tickets.day2.standardEarlyBird > 0) {
      for (let i = 0; i < tickets.day2.standardEarlyBird; i++) {
        allTickets.push({ day: "day2", type: "Standard Early Bird", index: i });
      }
    }
    if (tickets.day2.couple > 0) {
      for (let i = 0; i < tickets.day2.couple; i++) {
        allTickets.push({ day: "day2", type: "Couple Pass", index: i });
      }
    }
    if (tickets.day2.coupleEarlyBird > 0) {
      for (let i = 0; i < tickets.day2.coupleEarlyBird; i++) {
        allTickets.push({
          day: "day2",
          type: "Couple Pass Early Bird",
          index: i,
        });
      }
    }
    if (tickets.day2.groupFour > 0) {
      for (let i = 0; i < tickets.day2.groupFour; i++) {
        allTickets.push({ day: "day2", type: "Group of 4", index: i });
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
        <div className="space-y-6 mb-10">
          {days.map((day) => (
            <div
              key={day.key}
              className="bg-white rounded-2xl shadow-xl border border-[#8b2e2e] overflow-hidden transition-all duration-300"
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(day.key)}
                className="w-full flex items-center justify-between p-6 text-left bg-gradient-to-r from-[#5c1919] to-[#7a2323] hover:from-[#6b1f1f] hover:to-[#8b2e2e] transition-all"
              >
                <span className="text-2xl font-bold text-white">
                  {day.label}{" "}
                  <span className="text-lg font-normal text-gray-200">
                    — {day.date}
                  </span>
                </span>
                <span
                  className={`text-3xl text-white transition-transform duration-300 ${
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
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            VIP
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day1.vip}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vip", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg transition"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day1.vip}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "vip", "add")}
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Gold
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day1.gold}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "gold", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day1.gold}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "gold", "add")}
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Standard
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day1.standard}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day1.standard}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Couple Pass
                          </h3>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day1.couple}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day1.couple}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Group of 4
                          </h3>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day1.groupFour}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day1.groupFour}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
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
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            VIP
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day2.vip.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vip", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg transition"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.vip}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "vip", "add")}
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* VIP Early Bird */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            VIP Early Bird
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-3xl font-bold text-[#5c1919]">
                              PKR{" "}
                              {ticketPrices.day2.vipEarlyBird.toLocaleString()}
                            </p>
                            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                              Early Bird
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vipEarlyBird", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.vipEarlyBird}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vipEarlyBird", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Gold
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day2.gold.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "gold", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.gold}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "gold", "add")}
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold Early Bird */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Gold Early Bird
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-3xl font-bold text-[#5c1919]">
                              PKR{" "}
                              {ticketPrices.day2.goldEarlyBird.toLocaleString()}
                            </p>
                            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                              Early Bird
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "goldEarlyBird", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.goldEarlyBird}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "goldEarlyBird", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Standard
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day2.standard.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.standard}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard Early Bird */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Standard Early Bird
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-3xl font-bold text-[#5c1919]">
                              PKR{" "}
                              {ticketPrices.day2.standardEarlyBird.toLocaleString()}
                            </p>
                            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                              Early Bird
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(
                                day.key,
                                "standardEarlyBird",
                                "subtract"
                              )
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.standardEarlyBird}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standardEarlyBird", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Couple Pass
                          </h3>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day2.couple.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.couple}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass Early Bird */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Couple Pass Early Bird
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-3xl font-bold text-[#5c1919]">
                              PKR{" "}
                              {ticketPrices.day2.coupleEarlyBird.toLocaleString()}
                            </p>
                            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                              Early Bird
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(
                                day.key,
                                "coupleEarlyBird",
                                "subtract"
                              )
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.coupleEarlyBird}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "coupleEarlyBird", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Group of 4
                          </h3>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day2.groupFour.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day2.groupFour}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
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
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            VIP
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Front Row Seats • Premium Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day3.vip.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "vip", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg transition"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day3.vip}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "vip", "add")}
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Gold */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Gold
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Priority Access • Premium Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day3.gold.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "gold", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day3.gold}
                          </span>
                          <button
                            onClick={() => updateTicket(day.key, "gold", "add")}
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Standard */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Standard
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Standard Amenities • Reserved Seating
                          </p>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day3.standard.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day3.standard}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "standard", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Couple Pass */}
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Couple Pass
                          </h3>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day3.couple.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day3.couple}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "couple", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Group of 4 */}
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Group of 4
                          </h3>
                          <p className="text-3xl font-bold text-[#5c1919] mt-2">
                            PKR {ticketPrices.day3.groupFour.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "subtract")
                            }
                            className="w-12 h-12 rounded-full bg-[#8b2e2e] hover:bg-[#6b1f1f] text-white text-3xl font-bold shadow-lg"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {tickets.day3.groupFour}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket(day.key, "groupFour", "add")
                            }
                            className="w-12 h-12 rounded-full bg-[#5c1919] hover:bg-[#4a1414] text-white text-3xl font-bold shadow-lg"
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
                      dayTickets.groupFour >
                    0;
                } else if (day.key === "day2") {
                  hasDayTickets =
                    dayTickets.vip +
                      dayTickets.vipEarlyBird +
                      dayTickets.gold +
                      dayTickets.goldEarlyBird +
                      dayTickets.standard +
                      dayTickets.standardEarlyBird +
                      dayTickets.couple +
                      dayTickets.coupleEarlyBird +
                      dayTickets.groupFour >
                    0;
                } else {
                  hasDayTickets =
                    dayTickets.vip +
                      dayTickets.gold +
                      dayTickets.standard +
                      dayTickets.couple +
                      dayTickets.groupFour >
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
                          {dayTickets.vipEarlyBird > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>
                                VIP Early Bird × {dayTickets.vipEarlyBird}
                              </span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.vipEarlyBird *
                                  ticketPrices.day2.vipEarlyBird
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
                          {dayTickets.goldEarlyBird > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>
                                Gold Early Bird × {dayTickets.goldEarlyBird}
                              </span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.goldEarlyBird *
                                  ticketPrices.day2.goldEarlyBird
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
                          {dayTickets.standardEarlyBird > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>
                                Standard Early Bird ×{" "}
                                {dayTickets.standardEarlyBird}
                              </span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.standardEarlyBird *
                                  ticketPrices.day2.standardEarlyBird
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
                          {dayTickets.coupleEarlyBird > 0 && (
                            <div className="flex justify-between text-lg pl-4 text-gray-200">
                              <span>
                                Couple Pass Early Bird ×{" "}
                                {dayTickets.coupleEarlyBird}
                              </span>
                              <span className="font-semibold">
                                PKR{" "}
                                {(
                                  dayTickets.coupleEarlyBird *
                                  ticketPrices.day2.coupleEarlyBird
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
                        </>
                      )}
                    </div>
                  )
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-[#8b2e2e] flex justify-between items-center">
              <span className="text-2xl font-bold text-white">
                Total Amount
              </span>
              <span className="text-4xl font-bold text-white">
                PKR {calculateTotal().toLocaleString()}
              </span>
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
            disabled={!accountInfo.name.trim() || !accountInfo.phone.trim()}
            className="w-full mt-8 py-5 rounded-full font-bold text-xl uppercase tracking-wider transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#5c1919] to-[#7a2323] hover:disabled:scale-100 hover:from-[#4a1414] hover:to-[#6b1f1f] text-white cursor-pointer"
          >
            Proceed to Payment (PKR {calculateTotal().toLocaleString()})
          </button>
        )}
      </div>
    </div>
  );
};

export default EventTicketInfo;
