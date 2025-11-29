import React from 'react';
import { Link } from 'react-router-dom';

const Days = () => {
  return (
    <div className="w-full px-4 py-6">
      {/* Day Cards - Mobile first approach */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div
          className="bg-[#949494] w-full sm:w-auto text-white relative rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center mx-auto sm:mx-0 max-w-[224px] sm:max-w-none"
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <div className="font-extrabold text-base md:text-lg tracking-wide">
              DAY 01
            </div>
            <div className="text-xs md:text-sm opacity-90">Starting Price</div>
            <div className="font-bold text-sm md:text-base">PKR 1,000</div>
          </div>
          <div className="mt-2 md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
            See Plans
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
          />
        </div>

        <div
          className="bg-[#949494] w-full sm:w-auto text-white relative rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center mx-auto sm:mx-0 max-w-[224px] sm:max-w-none"
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <div className="font-extrabold text-base md:text-lg tracking-wide">
              DAY 02
            </div>
            <div className="text-xs md:text-sm opacity-90">Starting Price</div>
            <div className="font-bold text-sm md:text-base">PKR 2,000</div>
          </div>
          <div className="mt-2 md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
            See Plans
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
          />
        </div>

        <div
          className="bg-[#949494] w-full sm:w-auto text-white relative rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center mx-auto sm:mx-0 max-w-[224px] sm:max-w-none"
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <div className="font-extrabold text-base md:text-lg tracking-wide">
              DAY 03
            </div>
            <div className="text-xs md:text-sm opacity-90">Starting Price</div>
            <div className="font-bold text-sm md:text-base">PKR 1,500</div>
          </div>
          <div className="mt-2 md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
            See Plans
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
          />
        </div>
      </div>

      {/* All Days Card - Always Centered */}
      <div className="flex justify-center mb-6">
        <div
          className="bg-[#949494] text-white relative rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center w-full max-w-[224px] sm:w-52"
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <div className="font-extrabold text-base md:text-lg tracking-wide">
              3 Days Pass
            </div>
            <div className="text-xs md:text-sm opacity-90">Single Person</div>
            <div className="font-bold text-sm md:text-base">PKR 4,000</div>
          </div>
          <div className="mt-2 md:mt-3 text-[10px] uppercase tracking-wider opacity-90">
            See Plans
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#949494]"
          />
        </div>
      </div>

      {/* Orange Purchase Button */}
      <div className="flex justify-center">
        <Link to="/Ticketinfo" className="w-full sm:w-auto">
        <button className="bg-[#FF6B35] hover:bg-[#E55A28] text-white font-bold py-4 px-8 rounded-lg uppercase tracking-wider text-sm transition-colors w-full  sm:min-w-[500px]">
          Purchase Ticket
        </button>
        </Link>
      </div>
    </div>
  );
};

export default Days;