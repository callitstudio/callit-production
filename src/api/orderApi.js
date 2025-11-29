import axios from "axios";

// Backend URLs
const ORDERS_BASE_URL = "http://localhost:5000/api/orders/create";
const PAYFAST_REDIRECT_URL = "http://localhost:5000/api/payfast/redirect";

// PayFast Configuration
export const PAYFAST_CONFIG = {
  LIVE: {
    BASE_URL: "https://ipg.apps.net.pk",
    GET_TOKEN_ENDPOINT: "/Ecommerce/api/Transaction/GetAccessToken",
    POST_TRANSACTION_ENDPOINT: "/Ecommerce/api/Transaction/PostTransaction"
  },
  UAT: {
    BASE_URL: "https://ipguat.apps.net.pk",
    GET_TOKEN_ENDPOINT: "/Ecommerce/api/Transaction/GetAccessToken",
    POST_TRANSACTION_ENDPOINT: "/Ecommerce/api/Transaction/PostTransaction"
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(ORDERS_BASE_URL, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    throw error;
  }
};

// Step 1: Get access token from PayFast
export const getPayFastToken = async (orderId, amount) => {
  try {
    console.log("Requesting PayFast token with:", { orderId, amount });
    const response = await axios.post("http://localhost:5000/api/payfast/get-token", {
      orderId,
      amount
    });
    console.log("PayFast token response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting PayFast token:", error.response?.data || error.message);
    throw error;
  }
};

// Step 2: Initialize PayFast payment with token
export const initializePayFastPayment = async (orderId, token) => {
  try {
    const payload = {
      orderId,
      token,
      returnUrl: process.env.REACT_APP_PAYFAST_RETURN_URL || "http://localhost:3000/success",
      cancelUrl: process.env.REACT_APP_PAYFAST_CANCEL_URL || "http://localhost:3000/cancel",
      notifyUrl: process.env.REACT_APP_PAYFAST_NOTIFY_URL || "http://localhost:5000/api/payfast/callback"
    };

    console.log("Initializing PayFast payment with URLs:", {
      orderId,
      returnUrl: payload.returnUrl,
      cancelUrl: payload.cancelUrl,
      notifyUrl: payload.notifyUrl
    });

    const response = await axios.post(PAYFAST_REDIRECT_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error initializing PayFast payment:", error.response?.data || error.message);
    throw error;
  }
};

// Utility function to log PayFast form data for debugging
export const debugPayFastFormData = (formData) => {
  console.group("PayFast Form Data Debug");
  console.log("=== Form Fields ===");
  Object.keys(formData).forEach((key) => {
    console.log(`${key}: ${formData[key]} (type: ${typeof formData[key]}, length: ${String(formData[key]).length})`);
  });
  console.log("\n=== Expected Field Order (for signature validation) ===");
  const signatureFields = [
    "merchant_id",
    "merchant_key",
    "m_payment_id",
    "amount",
    "item_name",
    "item_description",
    "email_address",
    "notify_url",
    "return_url",
    "cancel_url",
    "name_first",
    "name_last",
  ];
  const orderedString = signatureFields
    .filter((field) => formData[field] !== undefined)
    .map((field) => `${field}=${formData[field]}`)
    .join("&");

  console.log("Ordered string (for signature):");
  console.log(orderedString);
  console.log("\nSignature received:", formData.signature);

  console.log("\n=== Actual Form Submission Payload ===");
  const payload = new URLSearchParams();
  Object.keys(formData).forEach((key) => {
    payload.append(key, String(formData[key]).trim());
  });
  console.log("URL Encoded Payload:");
  console.log(payload.toString());

  console.groupEnd();
};
