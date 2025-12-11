import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FreeTicketForm from "../components/EventSections/Tickets/FreeTicketForm";

const FreeTicket = () => {
  const navigate = useNavigate();

  // Scroll To Top On Page Load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative h-[500px] flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url(/lahorevent.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for small screens only */}
        <div className="absolute inset-0 bg-black bg-opacity-50 md:bg-opacity-0"></div>

        {/* Back Arrow Button */}
        <button
          onClick={() => navigate("/")}
          aria-label="Go back"
          className="absolute top-3 left-3 bg-yellow-400 text-black p-2 rounded-md shadow-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-black/20 z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M15.75 19.5a.75.75 0 0 1-.53-.22l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.56 11.25l6.72 6.72a.75.75 0 0 1-.53 1.53z" />
          </svg>
        </button>
      </div>

      <FreeTicketForm />
    </div>
  );
};

export default FreeTicket;
