import { useState } from "react";
import TicketBookingPopup from "../TicketBookingPopup";

const EventSection3 = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <div className="lg:col-span-3 space-y-6">
        {/* Buy Event Ticket Button */}
        {/* <button
          onClick={() => setIsPopupOpen(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded-t-lg font-semibold text-sm transition-colors cursor-pointer"
        >
          BUY EVENT TICKET NOW
        </button> */}

        {/* Event Poster Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Poster Image */}
          <div className="relative flex justify-center">
            <img
              src="/banner.jpeg"
              alt="BAYAAN Event Poster"
              className="w-full h-76 sm:w-[500px] "
            />
          </div>

          {/* Event Details */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Start Date:</span>
              <span className="text-gray-900">12th December, 2025 </span>
            </div>
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-600">End Date:</span>
              <span className="text-gray-900">7th December, 2025 </span>
            </div> */}
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-600">Address:</span>
              <span className="text-gray-900">Alhamra Cultural Complex, Lahore</span>
            </div> */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Map:</span>
              <div className="flex gap-2">
                <a
                  href="https://www.google.com/maps/place/Al-Hamra+Cultural+Complex/@31.514243,74.3313959,17z/data=!4m6!3m5!1s0x39190593306477ef:0x1b20b84b13d563e6!8m2!3d31.5142598!4d74.3308749!16s%2Fg%2F11t9kl_58d?entry=ttu&g_ep=EgoyMDI1MTExMC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Map
                </a>
                <a
                  href="https://www.google.com/maps/place/Al-Hamra+Cultural+Complex/@31.514243,74.3313959,17z/data=!4m6!3m5!1s0x39190593306477ef:0x1b20b84b13d563e6!8m2!3d31.5142598!4d74.3308749!16s%2Fg%2F11t9kl_58d?entry=ttu&g_ep=EgoyMDI1MTExMC4wIKXMDSoASAFQAw%3D%3D&t=h"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Satellite
                </a>
              </div>
            </div>
          </div>

          {/* Location Display Section */}
          <div className="relative h-40 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 text-[#4a0404] mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Event Location
                </h3>
              </div>
              <p className="text-gray-700 font-medium">
                Alhamra Cultural Complex
              </p>
              <p className="text-gray-600 text-sm">
                Gulberg III, Lahore, Punjab, Pakistan
              </p>
              <a
                href="https://www.google.com/maps/place/Al-Hamra+Cultural+Complex/@31.514243,74.3313959,17z/data=!4m6!3m5!1s0x39190593306477ef:0x1b20b84b13d563e6!8m2!3d31.5142598!4d74.3308749!16s%2Fg%2F11t9kl_58d?entry=ttu&g_ep=EgoyMDI1MTExMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-block"
              >
                View on Google Maps
              </a>
            </div>
            <div className="absolute bottom-2 right-2">
              <button className="bg-white border border-gray-300 rounded p-1 shadow-sm">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Get Direction Button */}
          <div className="p-4 border-t border-gray-200">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Al-Hamra+Cultural+Complex,+31.5142598,74.3308749"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors inline-block text-center"
            >
              GET DIRECTION
            </a>
          </div>
          {/* Event Info Tags */}
          {/* <div className="p-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                Google Calendar
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                Ical Export
              </span>
            </div>
          </div> */}
        </div>
        {/* Sponsors Section */}
        {/* <div className="bg-gray-100 rounded-lg shadow-md p-4">
          <h3 className="font-bold text-gray-900 mb-4 text-center">SPONSORS</h3>
          <div className=" grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className=" rounded-lg h-16 flex items-center justify-center border border-gray-200"
              >
                <img
                  src={`${process.env.PUBLIC_URL}/Item.png`}
                  alt="Sponsor Logo"
                  className="w-full h-16 object-cover"
                />
              </div>
            ))}
          </div>
        </div> */}
      </div>
      {/* Ticket Booking Popup */}
      <TicketBookingPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        eventData={{ name: "NAQSH-E-GOONJ", location: "Lahore", type: "Music" }}
      />
    </>
  );
};

export default EventSection3;
