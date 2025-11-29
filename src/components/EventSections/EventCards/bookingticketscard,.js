import { useState } from "react";
import TicketBookingPopup from "../../TicketBookingPopup";
import Days from "./Days/Days";

const BookingTicketsCard = ({ onDayCardClick, onTabChange }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState("DAY");
  // SCHEDULE tab is only reachable via Day card click

  // const handleTabClick = (tab) => {
  //   // Disable manual routing to SCHEDULE; must go via Day card
  //   if (tab === "SCHEDULE") return;
  //   setActiveTab(tab);
  //   onTabChange && onTabChange(tab);
  // };

  // const handleDaySelect = (day) => {
  //   onDayCardClick && onDayCardClick(day);
  //   // Auto-switch to SCHEDULE and inform parent
  //   setActiveTab("SCHEDULE");
  //   onTabChange && onTabChange("SCHEDULE");
  // };

  return (
    <>
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-wide">
          GOONJ 2.0
        </h1>

        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed text-sm md:text-base">
            {`In light of our commitment towards change and betterment,
just as last year’s successful initiative Goonj 1.0, the Humanity
Alliance Organization is pleased to announce, HAO’s Goonj
Fest’ 2025; Goonj 2.0. It is a 3 day nationwide fun filled festival
which aims to appreciate and highlight young talent and
provide youth with a platform to express themselves in various
forms. The Goonj Fest’ 2025 is set to start from 5 December,
2025 till 7 December 2025 with a plethora of entertaining
events spanning multiple categories. Furthermore, the
proceeds from this festival will go towards funding our many
projects and initiatives, so that HAO can continue its mission of
providing social welfare to those in need. So join us and play
your part in giving back to the community and making HAO’s
Goonj Fest’ 2025 festival even more memorable and exciting!
We can’t wait to see you there!`}
          </p>
        </div>

        {/* Navigation Tabs */}
        {/* <div className="mb-4">
          <div className="border-b border-gray-200 mb-3">
            <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === "DAY"
                    ? "border-[#4a0404] text-[#4a0404]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabClick("DAY")}
              >
                DAY
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === "SCHEDULE"
                    ? "border-[#4a0404] text-[#4a0404]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabClick("SCHEDULE")}
              >
                SCHEDULE
              </button>
            </nav>
          </div>
        </div> */}

                   {/* {activeTab === "DAY" && (
                      <div>
                        {/* Small Screen: All cards in single column */}
                        {/* <div className="sm:hidden grid grid-cols-1 gap-3 mb-4 ">
                          <div className="flex flex-col gap-3 items-center">
                          <button
                            className="bg-[#949494] w-56 text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors h-48 flex flex-col items-center"
                            onClick={() => handleDaySelect("DAY1")}
                          >
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                              <div className="font-extrabold text-base tracking-wide">
                                DAY 01
                              </div>
                              <div className="text-xs opacity-90">Starting Price</div>
                              <div className="font-bold text-sm">PKR 1,000</div>
                            </div>
                            <div className="mt-2 text-[10px] uppercase tracking-wider opacity-90">
                              See Plans
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                            />
                          </button>

                          <button
                            className="bg-[#949494] w-56 text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors h-48 flex flex-col items-center"
                            onClick={() => handleDaySelect("DAY2")}
                          >
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                              <div className="font-extrabold text-base tracking-wide">
                                DAY 02
                              </div>
                              <div className="text-xs opacity-90">Starting Price</div>
                              <div className="font-bold text-sm">PKR 2,000</div>
                            </div>
                            <div className="mt-2 text-[10px] uppercase tracking-wider opacity-90">
                              See Plans
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                            />
                          </button>

                          <button
                            className="bg-[#949494] w-56 text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors h-48 flex flex-col items-center"
                            onClick={() => handleDaySelect("DAY3")}
                          >
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                              <div className="font-extrabold text-base tracking-wide">
                                DAY 03
                              </div>
                              <div className="text-xs opacity-90">Starting Price</div>
                              <div className="font-bold text-sm">PKR 1,500</div>
                            </div>
                            <div className="mt-2 text-[10px] uppercase tracking-wider opacity-90">
                              See Plans
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                            />
                          </button>
                          

                          <button
                            className="bg-[#949494] w-56 text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors h-48 flex flex-col items-center"
                            onClick={() => handleDaySelect("ALL_DAYS")}
                          >
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                              <div className="font-extrabold text-base tracking-wide">
                                All Days
                              </div>
                              <div className="text-xs opacity-90">Starting Price</div>
                              <div className="font-bold text-sm">PKR 4,000</div>
                            </div>
                            <div className="mt-2 text-[10px] uppercase tracking-wider opacity-90">
                              See Plans
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                            />
                          </button>
                          </div>
                        </div> */}

                        {/* Large Screen: Day cards in row, All Days centered below */}
                        {/* <div className="hidden sm:block"> */}
                          {/* Three day cards in a row */}
                          {/* <div className="grid grid-cols-3 gap-3 mb-4">
                            <button
                              className="bg-[#949494] text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors md:h-42 flex flex-col items-center"
                              onClick={() => handleDaySelect("DAY1")}
                            >
                              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                                <div className="font-extrabold md:text-lg tracking-wide">
                                  DAY 01
                                </div>
                                <div className="md:text-sm opacity-90">Starting Price</div>
                                <div className="font-bold md:text-base">PKR 1,000</div>
                              </div>
                              <div className="md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
                                See Plans
                              </div>
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                              />
                            </button>

                            <button
                              className="bg-[#949494] text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors md:h-42 flex flex-col items-center"
                              onClick={() => handleDaySelect("DAY2")}
                            >
                              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                                <div className="font-extrabold md:text-lg tracking-wide">
                                  DAY 02
                                </div>
                                <div className="md:text-sm opacity-90">Starting Price</div>
                                <div className="font-bold md:text-base">PKR 2,000</div>
                              </div>
                              <div className="md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
                                See Plans
                              </div>
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                              />
                            </button>

                            <button
                              className="bg-[#949494] text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors md:h-42 flex flex-col items-center"
                              onClick={() => handleDaySelect("DAY3")}
                            >
                              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                                <div className="font-extrabold md:text-lg tracking-wide">
                                  DAY 03
                                </div>
                                <div className="md:text-sm opacity-90">Starting Price</div>
                                <div className="font-bold md:text-base">PKR 1,500</div>
                              </div>
                              <div className="md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
                                See Plans
                              </div>
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                              />
                            </button>
                          
                            
                          
                          </div> */}

                          {/* All Days Card - Centered */}
                          {/* <div className="flex justify-center">
                            <button
                              className="bg-[#949494]  text-white hover:bg-[#4a0404] relative rounded-lg p-4 text-center transition-colors md:h-42 flex flex-col items-center w-52"
                              onClick={() => handleDaySelect("ALL_DAYS")}
                        >
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                                <div className="font-extrabold md:text-lg tracking-wide">
                                  3 Days Pass
                                </div>
                                <div className="md:text-sm opacity-90">Single Person</div>
                                <div className="font-bold md:text-base">PKR 4,000</div>
                              </div>
                              <div className="md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
                                See Plans
                              </div>
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
                              />
                            </button>

                            
                          </div>
                        </div>
                      </div>
                    )} */}

                    <Days/>

        {/* {activeTab === "CONTACT" && ( */}
          <div className="mb-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4a0404] rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">info@goonjh.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4a0404] rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600">+92 300 1234567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4a0404] rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">Lahore, Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        {/* )} */}
      </div>

      <TicketBookingPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        eventData={{ name: "NAQSH-E-GOONJ", location: "Lahore", type: "Music" }}
      />
    </>
  );
};

export default BookingTicketsCard;
