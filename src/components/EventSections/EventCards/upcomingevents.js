import { useNavigate } from "react-router-dom";

const UpcomingEvents = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md p-8 relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-300 to-gray-400"></div>

      {/* White card inside gray background */}
      <div className="bg-white rounded-lg shadow-sm p-6 relative z-10">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Upcoming Event List
        </h3>
        <ul className="space-y-4">
          {[
            { id: "NAQSH-E-GOONJ", name: "Lahore Chalay Ao" },
            // { id: "14-august", name: "14 August" },
            // { id: "6-september", name: "6 September" },
            // { id: "eid-milad", name: "Eid Milad-Un-Nabi" },
            // { id: "mango-day", name: "Mango Day" },
          ].map((event) => (
            <li
              key={event.id}
              onClick={() => {
                if (event.id === "NAQSH-E-GOONJ") {
                  navigate(`/events`);
                }
                // Other events don't navigate anywhere
              }}
              className={`flex justify-between items-center ${
                event.id === "NAQSH-E-GOONJ" ? "cursor-pointer" : ""
              } rounded px-3 py-2 transition-colors ${
                window.location.pathname === `/events`
                  ? "bg-[#4a0404] text-white shadow-md"
                  : event.id === "NAQSH-E-GOONJ"
                  ? "hover:bg-gray-50 text-gray-800"
                  : "text-gray-800"
              }`}
            >
              <span>{event.name}</span>
              <svg
                className={`w-4 h-4 ${
                  window.location.pathname === `/events/${event.id}`
                    ? "text-white"
                    : "text-gray-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 pt-4">
          Previous Events List
        </h3>
        <ul className="space-y-4">
          {[
            { id: "NAQSH-E-GOONJ", name: "NAQSH-E-GOONJ", type: "previous" },
            { id: "FASANA-E-ISHQ", name: "FASANA-E-ISHQ", type: "previous" },
          ].map((event) => (
            <li
              key={event.id}
              onClick={() => {
                if (event.id === "NAQSH-E-GOONJ" && event.type === "previous") {
                  navigate(`/previous-events/${event.id}`);
                } else if (
                  event.id === "FASANA-E-ISHQ" &&
                  event.type === "previous"
                ) {
                  navigate(`/fasana-e-ishq`);
                }
                // Other events don't navigate anywhere
              }}
              className={`flex justify-between items-center ${
                event.id === "NAQSH-E-GOONJ" || event.id === "FASANA-E-ISHQ"
                  ? "cursor-pointer"
                  : ""
              } rounded px-3 py-2 transition-colors ${
                window.location.pathname === `/previous-events/${event.id}` ||
                (event.id === "FASANA-E-ISHQ" &&
                  window.location.pathname === "/fasana-e-ishq")
                  ? "bg-[#4a0404] text-white shadow-md"
                  : event.id === "NAQSH-E-GOONJ" || event.id === "FASANA-E-ISHQ"
                  ? "hover:bg-gray-50 text-gray-800"
                  : "text-gray-800"
              }`}
            >
              <span>{event.name}</span>
              <svg
                className={`w-4 h-4 ${
                  window.location.pathname === `/previous-events/${event.id}`
                    ? "text-white"
                    : "text-gray-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
          ))}
        </ul>
        {/* <button className="mt-6 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors shadow-md">
          VIEW ALL EVENTS
        </button> */}
      </div>
    </div>
  );
};

export default UpcomingEvents;
