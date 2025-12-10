// src/api/freeTicket.js
import axios from "axios";

const API_URL = "https://free-ticket-git-main-anums-projects-9ba48ad6.vercel.app/api/free-ticket"; 


export const createFreeTicket = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, formData);
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error.response?.data || error;
  }
};



export const getFreeTicketByOrderId = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error.response?.data || error;
  }
};