import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import "./App.css";

// Pages
import Home from "./pages/Home";
import ServiceDetail from "./pages/ServiceDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import PreviousEventDetail from "./pages/PreviousEventDetail";
import FasanaEIshqDetail from "./pages/FasanaEIshqDetail";
import PrivacyPolicy from "./pages/Privacypolicy";
import TermsAndConditions from "./pages/Termsandconditions";
import Ticketinfo from "./pages/Ticketinfo";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

function App() {
  return (
    <Router>
      <div className="bg-darkBg min-h-screen overflow-x-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/previous-events/:id"
            element={<PreviousEventDetail />}
          />
          <Route path="/fasana-e-ishq" element={<FasanaEIshqDetail />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/ticketinfo" element={<Ticketinfo />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
