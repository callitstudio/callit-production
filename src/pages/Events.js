// import  { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import eventBg from "../assets/eventbg.png";

// const Events = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Hero Section with Background */}
//       <div
//         className="relative h-[400px] flex flex-col items-center justify-center"
//         style={{
//           backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${eventBg})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {/* Breadcrumb */}

//         {/* Hero Content */}
//         <div className="text-center text-white z-10 mt-8">
//           <h1 className="text-4xl sm:text-5xl font-bold mb-4">ALL EVENTS</h1>
//           <p className="text-white/90 max-w-2xl mx-auto px-4">
//             Discover amazing concerts and live performances. Book your tickets
//             early to reserve the best seats and exclusive packages.
//           </p>
//         </div>
//       </div>

//       {/* Events Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {/* Left Sidebar - Upcoming Events */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md p-8 relative overflow-hidden">
//               {/* Subtle texture overlay */}
//               <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-300 to-gray-400"></div>

//               {/* White card inside gray background */}
//               <div className="bg-white rounded-lg shadow-sm p-6 relative z-10">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800">
//                   Upcoming Event List
//                 </h3>
//                 <ul className="space-y-4">
//                   {[
//                     { id: "NAQSH-E-GOONJ", name: "GOONJ 2.0" },
//                     // { id: "14-august", name: "14 August" },
//                     // { id: "6-september", name: "6 September" },
//                     // { id: "eid-milad", name: "Eid Milad-Un-Nabi" },
//                     // { id: "mango-day", name: "Mango Day" },
//                   ].map((event) => (
//                     <li
//                       key={event.id}
//                       onClick={() => {
//                         if (event.id === "NAQSH-E-GOONJ") {
//                           navigate(`/events/${event.id}`);
//                         }
//                         // Other events don't navigate anywhere
//                       }}
//                       className={`flex justify-between items-center ${
//                         event.id === "NAQSH-E-GOONJ" ? "cursor-pointer" : ""
//                       } rounded px-3 py-2 transition-colors ${
//                         window.location.pathname === `/events/${event.id}`
//                           ? "bg-[#4a0404] text-white shadow-md"
//                           : event.id === "NAQSH-E-GOONJ"
//                           ? "hover:bg-gray-50 text-gray-800"
//                           : "text-gray-800"
//                       }`}
//                     >
//                       <span>{event.name}</span>
//                       <svg
//                         className={`w-4 h-4 ${
//                           window.location.pathname === `/events/${event.id}`
//                             ? "text-white"
//                             : "text-gray-600"
//                         }`}
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 5l7 7-7 7"
//                         />
//                       </svg>
//                     </li>
//                   ))}
//                 </ul>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 pt-4">
//                   Previous Events List
//                 </h3>
//                 <ul className="space-y-4">
//                   {[
//                     {
//                       id: "NAQSH-E-GOONJ",
//                       name: "NAQSH-E-GOONJ",
//                       type: "previous",
//                     },
//                     {
//                       id: "FASANA-E-ISHQ",
//                       name: "FASANA-E-ISHQ",
//                       type: "previous",
//                     },
//                   ].map((event) => (
//                     <li
//                       key={event.id}
//                       onClick={() => {
//                         if (
//                           event.id === "NAQSH-E-GOONJ" &&
//                           event.type === "previous"
//                         ) {
//                           navigate(`/previous-events/${event.id}`);
//                         } else if (
//                           event.id === "FASANA-E-ISHQ" &&
//                           event.type === "previous"
//                         ) {
//                           navigate(`/fasana-e-ishq`);
//                         }
//                         // Other events don't navigate anywhere
//                       }}
//                       className={`flex justify-between items-center ${
//                         event.id === "NAQSH-E-GOONJ" ||
//                         event.id === "FASANA-E-ISHQ"
//                           ? "cursor-pointer"
//                           : ""
//                       } rounded px-3 py-2 transition-colors ${
//                         window.location.pathname ===
//                           `/previous-events/${event.id}` ||
//                         (event.id === "FASANA-E-ISHQ" &&
//                           window.location.pathname === "/fasana-e-ishq")
//                           ? "bg-[#4a0404] text-white shadow-md"
//                           : event.id === "NAQSH-E-GOONJ" ||
//                             event.id === "FASANA-E-ISHQ"
//                           ? "hover:bg-gray-50 text-gray-800"
//                           : "text-gray-800"
//                       }`}
//                     >
//                       <span>{event.name}</span>
//                       <svg
//                         className={`w-4 h-4 ${
//                           window.location.pathname ===
//                           `/previous-events/${event.id}`
//                             ? "text-white"
//                             : "text-gray-600"
//                         }`}
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 5l7 7-7 7"
//                         />
//                       </svg>
//                     </li>
//                   ))}
//                 </ul>
//                 {/* <button className="mt-6 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors shadow-md">
//                   VIEW ALL EVENTS
//                 </button> */}
//               </div>
//             </div>

//             <div className=" flex justify-center  md:hidden">
//               <img
//                 src="/goonjimage1.png"
//                 alt="Event"
//                 className=" h-[500px] object-contain  "
//               />
//             </div>

//             {/* Testimonial Card */}
//             <div className="bg-[#4a0404] rounded-lg p-6 text-white">
//               <div className="flex items-start mb-4">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-8 w-8 text-white/80"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
//                 </svg>
//               </div>
//               <p className="text-sm text-white/90 mb-6">
//               Excellent design and project management — the team delivered exactly what we needed with great attention to detail.
//               </p>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                     />
//                   </svg>
//                 </div>
//                 <span className="font-medium">Alex Handson</span>
//               </div>
//             </div>

//             {/* Have Any Query Card */}
//             <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md p-8 relative overflow-hidden">
//               {/* Subtle texture overlay */}
//               <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-300 to-gray-400"></div>

//               {/* White card inside gray background */}
//               <div className="bg-white rounded-lg shadow-sm relative z-10 overflow-hidden">
//                 <div className="absolute top-4 left-4 z-20">
//                   <h3 className="text-lg font-semibold text-white drop-shadow-lg">
//                     Have Any Query
//                   </h3>
//                 </div>

//                 <div className="relative h-100">
//                   {/* Support Image covering entire card */}
//                   <img
//                     src="/img1.png"
//                     alt="Support Representative"
//                     className="w-full h-full object-cover rounded-lg"
//                   />

//                   {/* Overlay Content */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 rounded-lg"></div>
//                   <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-center">
//                     <p className="text-sm font-medium mb-2">Have Questions?</p>
//                     <p className="text-sm opacity-90 mb-4">
//                       Nothing stops us from doing what we like
//                     </p>

//                     {/* Phone Number - Centered with White Background */}
//                     <div className="flex items-center justify-center gap-3 bg-white rounded-full px-6 py-3 mx-auto shadow-md min-w-fit whitespace-nowrap">
//                       <div className="w-6 h-6 bg-[#4a0404] rounded-full flex items-center justify-center flex-shrink-0">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-3 w-3 text-white"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                           />
//                         </svg>
//                       </div>
//                       <span className="text-sm font-medium text-gray-800">
//                         042-3682-7666
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Content - Event Cards */}
//           {/*
//           <div className="md:col-span-2 space-y-6">
//             <div className="relative rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
//               <div className="absolute top-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
//                 LIVE
//               </div>
//               <img
//                 src={eventImage}
//                 alt="Comedy Night"
//                 className="w-full h-[300px] object-cover"
//               />
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
//                 <h3 className="text-white text-xl font-semibold">
//                   Comedy Night - Late Night Fridays by The Jungle PK
//                 </h3>
//                 <p className="text-white/80 text-sm mt-2">8th Apr - 22th Apr</p>
//                 <p className="text-white/80 text-sm">Lahore</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {[
//                 {
//                   id: "book-club-1",
//                   name: "The Saturday Afternoon Book Club",
//                   date: "23rd Aug",
//                 },
//                 {
//                   id: "beach-party",
//                   name: "Summer Beach Party 2.0",
//                   date: "23rd Aug",
//                 },
//                 {
//                   id: "artsy-event",
//                   name: "Acne Free & Artsy",
//                   date: "23rd Aug",
//                 },
//                 {
//                   id: "soul-evening",
//                   name: "Desi Soul Evening at Aangan",
//                   date: "23rd Aug",
//                 },
//               ].map((event) => (
//                 <div
//                   key={event.id}
//                   className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
//                 >
//                   <img
//                     src={eventImage}
//                     alt={event.name}
//                     className="w-full h-40 object-cover"
//                   />
//                   <div className="p-4">
//                     <h4 className="font-semibold mb-2">{event.name}</h4>
//                     <p className="text-sm text-gray-600">{event.date}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="text-center">
//               <button className="bg-[#4a0404] text-white px-8 py-2 rounded-md hover:bg-opacity-90 transition-colors">
//                 Load More
//               </button>
//             </div>
//           </div>
//           */}

//           {/* Goonj Image */}
//           <div className="hidden md:flex md:justify-start col-span-2">
//             <img
//               src="/goonjimage1.png"
//               alt="GOONJ 2.0 Event"
//               className=" md:h-[700px] object-contain"
//             />
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Events;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import EventSection1 from "../components/EventSections/section1";
import EventSection2 from "../components/EventSections/section2";
import TicketBookingPopup from "../components/TicketBookingPopup";
import EventSection3 from "../components/EventSections/section3";

const EventDetail = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const eventData = {
    name: "NAQSH-E-GOONJ",
    location: "Lahore",
    type: "Music",
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background */}
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
        {/* Breadcrumb */}

        {/* Hero Content */}
        {/* <div className="text-center text-white z-10 mt-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            UPCOMING EVENTS
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto px-4">
            Discover amazing concerts and live performances. Book your tickets
            early to secure the best seats and exclusive packages.
          </p>
        </div> */}
      </div>

      {/* Event Detail Content will go here */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <EventSection1 />
          <EventSection2 />
          <EventSection3 />
        </div>
      </div>

      {/* Ticket Booking Popup */}
      <TicketBookingPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        eventData={eventData}
      />
    </div>
  );
};

export default EventDetail;
