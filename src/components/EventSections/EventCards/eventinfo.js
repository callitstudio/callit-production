import { useMemo, useState } from "react";
import TicketBookingPopup from "../../TicketBookingPopup";

const EventInfo = ({ selectedDay = "DAY1", onProceedCheckout }) => {
  const priceTable = useMemo(
    () => ({
      DAY1: {
        VIP: 2500,
        GOLD: 1500,
        STANDARD: 1000,
        COUPLEPASS: 1800,
        GROUPOF4: 3500,
      },
      DAY2: {
        VIP: 5000,
        GOLD: 3500,
        STANDARD: 2500,
        COUPLEPASS: 4000,
        GROUPOF4: 7000,
      },
      DAY3: {
        VIP: 3000,
        GOLD: 2000,
        STANDARD: 1500,
        COUPLEPASS: 2500,
        GROUPOF4: 5000,
      },
      ALL_DAYS: { Singlepass: 4000 },
    }),
    []
  );

  const EarlyBirdPriceTable = useMemo(
    () => ({
      DAY2: {
        VIP: 4000,
        GOLD: 3000,
        STANDARD: 2000,
        COUPLEPASS: 3500,
        GROUPOF4: 5600,
      },
    }),
    []
  );
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const handleTicketSelect = (ticketType) => {
    const dayPrices = priceTable[selectedDay] || priceTable.DAY1;
    const price = dayPrices[ticketType] || 0;
    setSelectedTicket({ type: ticketType, price });
  };

  const handleEarlyBirdSelect = (ticketType) => {
    const earlyBirdPrices = EarlyBirdPriceTable[selectedDay] || {};
    const price = earlyBirdPrices[ticketType] || 0;
    setSelectedTicket({ type: ticketType, price, isEarlyBird: true });
  };

  const isVipEarlyBird = selectedDay === "DAY2";

  return (
    <>
      {/* Ticket Options Section */}
      <div className="mb-8">
        <div className="border-b-2 border-[#4a0404] inline-block mb-6">
          <h2 className="text-xl font-bold text-gray-900 pb-2">
            TICKET OPTIONS
          </h2>
        </div>

        {/* Ticket Cards Grid */}
        <div
          className={`grid gap-4 mb-6 pl-16 w-72  sm:w-full sm:pl-0 ${
            selectedDay === "ALL_DAYS"
              ? "grid-cols-1 place-items-center"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {selectedDay === "ALL_DAYS" ? (
            /* Single Pass Ticket for All Days */
            <button
              className={`${
                selectedTicket?.type === "Singlepass"
                  ? "bg-[#4a0404] text-white hover:bg-[#4a0404]"
                  : "bg-[#949494] text-white hover:bg-[#4a0404]"
              } relative rounded-lg p-4 text-center transition-colors h-56 md:h-60 flex flex-col items-center w-80`}
              onClick={() => handleTicketSelect("Singlepass")}
            >
              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                  SINGLE PASS
                </h3>
                <p className="text-xs md:text-sm opacity-90">AVAILABLE</p>
                <div className="text-xs md:text-sm opacity-90 space-y-1 text-center">
                  <p className="whitespace-nowrap">• ALL 3 DAYS ACCESS</p>
                  <p className="whitespace-nowrap">• BEST VALUE PACKAGE</p>
                </div>
              </div>
              <p className="mt-2 md:mt-3 font-bold text-sm md:text-base">
                PKR{" "}
                {Number(
                  priceTable[selectedDay]?.Singlepass || 0
                ).toLocaleString()}
              </p>

              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent ${
                  selectedTicket?.type === "Singlepass"
                    ? "border-t-[#4a0404]"
                    : "border-t-[#949494]"
                }`}
              />
            </button>
          ) : (
            /* Regular VIP, GOLD, STANDARD tickets for individual days */
            <>
              {/* VIP Ticket */}
              <button
                className={`${
                  selectedTicket?.type === "VIP"
                    ? "bg-[#4a0404] text-white hover:bg-[#4a0404]"
                    : "bg-[#949494] text-white hover:bg-[#4a0404]"
                } relative rounded-lg  p-4 text-center transition-colors h-56 md:h-60 flex flex-col items-center`}
                onClick={() => handleTicketSelect("VIP")}
              >
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                    VIP
                  </h3>
                  <p className="text-xs md:text-sm opacity-90">AVAILABLE</p>
                  <div className="text-xs md:text-sm opacity-90 space-y-1 text-center">
                    <p className="whitespace-nowrap">• FRONT ROW SEATS</p>
                    <p className="whitespace-nowrap">• PREMIUM SEATING</p>
                  </div>
                </div>
                <p className="mt-2 md:mt-3 font-bold text-sm md:text-base">
                  PKR{" "}
                  {(
                    priceTable[selectedDay]?.VIP || priceTable.DAY1.VIP
                  ).toLocaleString()}
                </p>
                {isVipEarlyBird && (
                  <button
                    className="mt-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm font-semibold rounded-md transition-colors shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEarlyBirdSelect("VIP");
                    }}
                  >
                    <div>Early Bird</div>
                    <div>
                      PKR{" "}
                      {(
                        EarlyBirdPriceTable[selectedDay]?.VIP ||
                        priceTable.DAY1.VIP
                      ).toLocaleString()}
                    </div>
                  </button>
                )}

                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent ${
                    selectedTicket?.type === "VIP"
                      ? "border-t-[#4a0404]"
                      : "border-t-[#949494]"
                  }`}
                />
              </button>

              {/* VIP Ticket */}
              <button
                className={`${
                  selectedTicket?.type === "GOLD"
                    ? "bg-[#4a0404] text-white hover:bg-[#4a0404]"
                    : "bg-[#949494] text-white hover:bg-[#4a0404]"
                } relative rounded-lg p-4 text-center transition-colors h-56 md:h-60 flex flex-col items-center`}
                onClick={() => handleTicketSelect("GOLD")}
              >
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                    GOLD
                  </h3>
                  <p className="text-xs md:text-sm opacity-90">AVAILABLE</p>
                  <div className="text-xs md:text-sm opacity-90 space-y-1 text-center">
                    <p className="whitespace-nowrap">• PRIORITY ACCESS</p>
                    <p className="whitespace-nowrap">• PREMIUM SEATING</p>
                  </div>
                </div>
                <p className="mt-2 md:mt-3 font-bold text-sm md:text-base">
                  PKR{" "}
                  {(
                    priceTable[selectedDay]?.GOLD || priceTable.DAY1.GOLD
                  ).toLocaleString()}
                </p>
                {isVipEarlyBird && (
                  <button
                    className="mt-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm font-semibold rounded-md transition-colors shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEarlyBirdSelect("GOLD");
                    }}
                  >
                    <div>Early Bird</div>
                    <div>
                      PKR{" "}
                      {(
                        EarlyBirdPriceTable[selectedDay]?.GOLD ||
                        priceTable.DAY1.GOLD
                      ).toLocaleString()}
                    </div>
                  </button>
                )}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent ${
                    selectedTicket?.type === "GOLD"
                      ? "border-t-[#4a0404]"
                      : "border-t-[#949494]"
                  }`}
                />
              </button>

              {/* Executive Ticket */}
              <button
                className={`${
                  selectedTicket?.type === "STANDARD"
                    ? "bg-[#4a0404] text-white hover:bg-[#4a0404]"
                    : "bg-[#949494] text-white hover:bg-[#4a0404]"
                } relative rounded-lg p-4 text-center transition-colors h-56 md:h-60 flex flex-col items-center`}
                onClick={() => handleTicketSelect("STANDARD")}
              >
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                    STANDARD
                  </h3>
                  <p className="text-xs md:text-sm opacity-90">AVAILABLE</p>
                  <div className="text-xs md:text-sm opacity-90 space-y-1 text-center">
                    <p className="whitespace-nowrap">• STANDARD AMENITIES</p>
                    <p className="whitespace-nowrap">• RESERVED SEATING</p>
                  </div>
                </div>
                <p className="mt-2 md:mt-3 font-bold text-sm md:text-base">
                  PKR{" "}
                  {(
                    priceTable[selectedDay]?.STANDARD ||
                    priceTable.DAY1.STANDARD
                  ).toLocaleString()}
                </p>
                {isVipEarlyBird && (
                  <button
                    className="mt-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm font-semibold rounded-md transition-colors shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEarlyBirdSelect("STANDARD");
                    }}
                  >
                    <div>Early Bird </div>
                    <div>
                      PKR{" "}
                      {(
                        EarlyBirdPriceTable[selectedDay]?.STANDARD ||
                        priceTable.DAY1.STANDARD
                      ).toLocaleString()}
                    </div>
                  </button>
                )}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent ${
                    selectedTicket?.type === "STANDARD"
                      ? "border-t-[#4a0404]"
                      : "border-t-[#949494]"
                  }`}
                />
              </button>

              <button
                className={`${
                  selectedTicket?.type === "COUPLEPASS"
                    ? "bg-[#4a0404] text-white hover:bg-[#4a0404]"
                    : "bg-[#949494] text-white hover:bg-[#4a0404]"
                } relative rounded-lg p-4 text-center transition-colors h-56 md:h-44 lg:h-48 xl:h-44 flex flex-col items-center overflow-y-hidden`}
                onClick={() => handleTicketSelect("COUPLEPASS")}
              >
                <div className="flex-1 flex flex-col justify-center  space-y-2 ">
                  <h3 className="font-extrabold text-base md:text-md xl:text-lg tracking-wide ">
                    COUPLE PASS
                  </h3>
                  <p className="text-xs md:text-sm opacity-90">AVAILABLE</p>
                </div>
                <p className="mt-2 md:mt-3 font-bold text-sm md:text-base">
                  PKR{" "}
                  {(
                    priceTable[selectedDay]?.COUPLEPASS ||
                    priceTable.DAY1.COUPLEPASS
                  ).toLocaleString()}
                </p>
                {isVipEarlyBird && (
                  <button
                    className="mt-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm font-semibold rounded-md transition-colors shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEarlyBirdSelect("COUPLEPASS");
                    }}
                  >
                    <div>Early Bird </div>
                    <div>
                      PKR{" "}
                      {(
                        EarlyBirdPriceTable[selectedDay]?.COUPLEPASS ||
                        priceTable.DAY1.COUPLEPASS
                      ).toLocaleString()}
                    </div>
                  </button>
                )}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent ${
                    selectedTicket?.type === "COUPLEPASS"
                      ? "border-t-[#4a0404]"
                      : "border-t-[#949494]"
                  }`}
                />
              </button>

              <button
                className={`${
                  selectedTicket?.type === "GROUPOF4"
                    ? "bg-[#4a0404] text-white hover:bg-[#4a0404]"
                    : "bg-[#949494] text-white hover:bg-[#4a0404]"
                } relative rounded-lg p-4 text-center transition-colors h-56 md:h-44 lg:h-48 xl:h-44  flex flex-col items-center`}
                onClick={() => handleTicketSelect("GROUPOF4")}
              >
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                    GROUP OF 4
                  </h3>
                  <p className="text-xs md:text-sm opacity-90">AVAILABLE</p>
                </div>
                <p className="mt-2 md:mt-3  font-bold text-sm md:text-base">
                  PKR{" "}
                  {(
                    priceTable[selectedDay]?.GROUPOF4 ||
                    priceTable.DAY1.GROUPOF4
                  ).toLocaleString()}
                </p>
                {/* {isVipEarlyBird && (
              <button
                className="mt-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm font-semibold rounded-md transition-colors shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEarlyBirdSelect("GROUPOF4");
                }}
              >
                <div>Early Bird </div>
                <div>
                  PKR{" "}
                  {(
                    EarlyBirdPriceTable[selectedDay]?.GROUPOF4 ||
                    priceTable.DAY1.GROUPOF4
                  ).toLocaleString()}
                </div>
              </button>
            )} */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent ${
                    selectedTicket?.type === "GROUPOF4"
                      ? "border-t-[#4a0404]"
                      : "border-t-[#949494]"
                  }`}
                />
              </button>
            </>
          )}
        </div>

        {/* Ticket Selection Dropdown */}
        {selectedTicket && (
          <div className="mt-6 bg-[#4a0404] text-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-medium text-lg">
                  {selectedTicket.type} Ticket{" "}
                  {selectedTicket.isEarlyBird ? "(Early Bird)" : ""}
                </span>
                <p className="text-gray-200 text-sm">
                  PKR {selectedTicket.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-lg font-bold"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="text-lg font-bold">{quantity}</span>
                <button
                  className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-lg font-bold"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <hr className="border-white/30 my-4" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-xl font-bold">
                Rs {(selectedTicket.price * quantity).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Proceed to Checkout Button - Outside the card */}
      {selectedTicket && (
        <div className="mb-8">
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            onClick={() => setShowBookingPopup(true)}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      )}

      <TicketBookingPopup
        isOpen={showBookingPopup}
        onClose={() => setShowBookingPopup(false)}
        eventData={{ name: "NAQSH-E-GOONJ", location: "Lahore", type: "Music" }}
      />

      {/* Tags Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <img src="/Vector.png" alt="Event Logo" className="w-5 h-5" />
            <div>
              <span className="font-semibold text-gray-900">Tags:</span>
              <p className="text-gray-700 text-sm">
                Brought To You By Humanity Alliance Organization Managed By Call
                It Studio December 5th - December 7th, 2025 Alhamra Cultural
                Complex | Gulberg III, Lahore
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/Vector.png" alt="Event Logo" className="w-5 h-5" />
            <div>
              <span className="font-semibold text-gray-900">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className=" text-gray-700 px-3 py-1 rounded-full text-sm">
                  Traditional Event
                </span>
                <span className=" text-gray-700 px-3 py-1 rounded-full text-sm">
                  Music Festival
                </span>
                {/* <span className=" text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Share
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </span> */}
                <TicketBookingPopup
                  isOpen={showBookingPopup}
                  onClose={() => setShowBookingPopup(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventInfo;
