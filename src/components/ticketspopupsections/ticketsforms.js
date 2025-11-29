const TicketForm = ({
  quantity,
  timeLeft,
  selectedLanguage,
  setSelectedLanguage,
  handleQuantityChange,
  onConfirm,
  onClose,
}) => {
  const renderTicketHolderForms = () => {
    const forms = [];
    for (let i = 1; i <= quantity; i++) {
      const getOrdinal = (num) => {
        if (num === 1) return "1st";
        if (num === 2) return "2nd";
        if (num === 3) return "3rd";
        return `${num}th`;
      };

      forms.push(
        <div key={i} className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-4 text-lg">
            {getOrdinal(i)} Ticket Info
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name={`fullName_${i}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name={`address_${i}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event
              </label>
              <select
                name={`event_${i}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900"
              >
                <option value="">Select Event</option>
                <option value="naqsh-e-goonj">GOONJ 2.0</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name={`date_${i}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cnic
            </label>
            <input
              type="text"
              name={`cnic_${i}`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900"
            />
          </div>
        </div>
      );
    }
    return forms;
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Join Biggest Event
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span>Music</span>
              <span>|</span>
              <span>Lahore</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Wednesday, September 3 , 12:30 - 1:30pm IST
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-6">
          <div className="bg-gray-200 text-center py-2 px-4 rounded text-sm text-gray-700 mb-4">
            Don't miss out! Your order will expire in:
          </div>
          <div className="flex gap-3 justify-center">
            <div className="bg-[#4a0404] text-white px-6 py-4 rounded text-center flex-1 max-w-[100px]">
              <div className="text-3xl font-bold">{timeLeft.days}</div>
              <div className="text-xs mt-1">DAYS</div>
            </div>
            <div className="bg-[#4a0404] text-white px-6 py-4 rounded text-center flex-1 max-w-[100px]">
              <div className="text-3xl font-bold">{timeLeft.hours}</div>
              <div className="text-xs mt-1">HOURS</div>
            </div>
            <div className="bg-[#4a0404] text-white px-6 py-4 rounded text-center flex-1 max-w-[100px]">
              <div className="text-3xl font-bold">{timeLeft.minutes}</div>
              <div className="text-xs mt-1">MINS</div>
            </div>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="mb-6">
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-lg text-gray-800">
                Standard Ticket
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-8 h-8 bg-white border-2 border-gray-300 text-[#4a0404] rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold min-w-[30px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-8 h-8 bg-white border-2 border-gray-300 text-[#4a0404] rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-base font-medium text-gray-800">
                GOONJ 2.0
              </div>
              <div className="text-sm text-gray-500">
                Sales end on Sep 16,2025
              </div>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6 text-right">
          <span className="text-sm text-gray-600">Language: </span>
          <select
            className="text-sm border-none bg-transparent focus:outline-none text-gray-900"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="en-us">English (US)</option>
            <option value="en-uk">English (UK)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Tickets Holder Info</h3>
          {renderTicketHolderForms()}
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default TicketForm;
