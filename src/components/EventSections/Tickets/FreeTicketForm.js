import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFreeTicket } from "../../../api/freeTicket";

export default function FreeTicketForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Validation function
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (form.phone && !/^\d{11}$/.test(form.phone))
      e.phone = "Enter valid phone (11 digits)";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "Enter valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setMessage(null);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await createFreeTicket(form);

      if (data.ticket?.orderId) {
        localStorage.setItem("lastFreeTicketOrderId", data.ticket.orderId);
      }

      navigate(`/free-ticket-success?orderId=${data.ticket?.orderId}`);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
      <h2
        className="text-xl font-semibold mb-4 text-center py-2 rounded-md text-white"
        style={{ backgroundColor: "#7a2323" }}
      >
        Free Ticket Form
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <label className="block mb-2">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-opacity-50 p-2 text-black ${
              errors.name ? "border-red-400" : ""
            }`}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </label>

        {/* Phone */}
        <label className="block mb-2">
          <span className="text-sm font-medium">Phone</span>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 03201234567"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-opacity-50 p-2 text-black ${
              errors.phone ? "border-red-400" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
          )}
        </label>

        {/* Email */}
        <label className="block mb-4">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-opacity-50 p-2 text-black ${
              errors.email ? "border-red-400" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: "#7a2323" }}
          className="w-full text-white font-medium py-2 rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Get Free Ticket"}
        </button>
      </form>
    </div>
  );
}
