import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Music } from 'lucide-react';

export default function EventBanner() {
  const [isOpen, setIsOpen] = useState(false);  // START HIDDEN
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // ⭐ Show popup after 3 seconds
  useEffect(() => {
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 1000); // 3 seconds delay

    return () => clearTimeout(openTimer);
  }, []);

  // Countdown Timer
  useEffect(() => {
    const eventDate = new Date('2025-12-05T19:00:00');
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
      <div className="relative bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 rounded-2xl shadow-2xl  max-w-6xl h-[90vh] md:h-[85vh] overflow-hidden flex flex-col md:flex-row animate-slide-up border border-zinc-800">
        
        {/* Left Side - Event Image */}
        <div className="hidden md:block md:w-[300px] md:h-full relative overflow-hidden md:rounded-l-2xl flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-red-950">
            <img 
              src="/banner.jpeg" 
              alt="GOONJ 2.0"
              className="w-full h-full object-cover md:object-contain"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
        </div>

        {/* Right Side */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-stone-900 via-neutral-900 to-zinc-950">

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 md:top-4 md:right-4 bg-zinc-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-zinc-700 transition-all duration-300 hover:rotate-90 border border-zinc-700 z-10"
          >
            <X className="w-5 h-5 text-zinc-300" />
          </button>

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 md:px-5 py-2 rounded-full mb-4 md:mb-5 shadow-lg shadow-amber-900/50">
            <Music className="w-4 h-4" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wide">Upcoming Event</span>
          </div>

          {/* Event Title */}
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            GOONJ 2.0
          </h1>
          
          <p className="text-zinc-300 text-sm md:text-base mb-4 md:mb-5 leading-relaxed">
            A 3-day nationwide festival celebrating young talent and creativity
          </p>

          {/* Organizer Info */}
          <div className="bg-gradient-to-br from-zinc-800/60 to-neutral-800/60 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-4 md:mb-5 border border-zinc-700/50 shadow-lg">
            <p className="text-xs text-amber-500 mb-1 uppercase tracking-wide font-semibold">Brought to you by</p>
            <p className="font-bold text-zinc-100 text-base md:text-lg">Humanity Alliance Organization</p>
            <p className="text-xs md:text-sm text-zinc-400">Managed by <span className="text-amber-500">Call it Studio</span></p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-zinc-700/50 hover:border-amber-600/50 transition-all hover:shadow-amber-900/20">
              <Calendar className="w-4 md:w-5 h-4 md:h-5 text-amber-500 mb-2" />
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Date</p>
              <p className="font-bold text-zinc-100 text-sm md:text-base">05-07 Dec</p>
              <p className="text-xs md:text-sm text-zinc-400">2025</p>
            </div>
            
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-zinc-700/50 hover:border-amber-600/50 transition-all hover:shadow-amber-900/20">
              <Clock className="w-4 md:w-5 h-4 md:h-5 text-amber-500 mb-2" />
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Duration</p>
              <p className="font-bold text-zinc-100 text-sm md:text-base">3 Days</p>
              <p className="text-xs md:text-sm text-zinc-400">Festival</p>
            </div>
            
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-zinc-700/50 hover:border-amber-600/50 transition-all hover:shadow-amber-900/20">
              <MapPin className="w-4 md:w-5 h-4 md:h-5 text-amber-500 mb-2" />
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Location</p>
              <p className="font-bold text-zinc-100 text-sm md:text-base">Nationwide</p>
              <p className="text-xs md:text-sm text-zinc-400">Pakistan</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/40 to-amber-950/40 backdrop-blur-sm rounded-xl p-4 md:p-5 mb-4 md:mb-5 shadow-xl border border-amber-800/30">
            <p className="text-center text-amber-400 text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4 font-bold">
              Event Starts In
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-zinc-900 border border-amber-700/30 rounded-lg p-2 md:p-3 mb-2 shadow-lg">
                    <span className="text-2xl md:text-3xl font-black bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-amber-300 text-xs uppercase tracking-wide font-semibold">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <a href="/events">
            <button className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-bold py-3 md:py-4 rounded-xl hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 transition-all duration-300 shadow-xl shadow-amber-900/50 hover:shadow-2xl hover:shadow-amber-800/60 flex items-center justify-center gap-3 group border border-amber-500/30">
              <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg uppercase tracking-wide">Get Your Tickets Now</span>
            </button>
          </a>
            
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
