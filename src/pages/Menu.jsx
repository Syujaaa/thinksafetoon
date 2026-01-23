import Button from "../components/button";
import Kredit from "../components/kredit";
import { useState } from "react";

export default function Menu() {
  const [showKredit, setShowKredit] = useState(false);

  const handleKreditClick = () => {
    setShowKredit(true);
  };
  return (
    <div
      className="
      min-h-screen
      flex flex-col items-center justify-center
      bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100
      relative overflow-hidden
      px-4
      py-8
    "
    >
      {/* Background comic dots */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none
        bg-[radial-gradient(#000_2px,transparent_2px)]
        [background-size:24px_24px]
        animate-pulse-slow"
      ></div>

      {/* Comic-style burst accents */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply opacity-20 blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 rounded-full mix-blend-multiply opacity-15 blur-lg"></div>

      {/* Title section with comic-style elements */}
      <div className="relative z-10 mb-10 text-center">
        <div className="relative inline-block mb-6">
          {/* Main title with layered effects */}
          <div className="relative">
            {/* Shadow layer */}
            <div className="absolute -inset-2 bg-black transform rotate-3 translate-x-2 translate-y-2 rounded-xl"></div>
            {/* Yellow accent layer */}
            <div className="absolute -inset-1 bg-yellow-400 transform rotate-1 rounded-lg"></div>
            {/* Main title */}
            <h1
              className="
              relative
              text-4xl md:text-5xl lg:text-6xl
              font-black
              uppercase tracking-tighter
              text-black
              px-6 py-4
              bg-white
              border-4 border-black
              transform -rotate-2
              z-10
            "
            >
              ThinkSafeToon
            </h1>
          </div>

          {/* Comic exclamation elements */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 border-3 border-black rounded-full flex items-center justify-center z-20">
            <span className="text-white font-black text-lg">!</span>
          </div>
          <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-500 border-3 border-black rounded-full flex items-center justify-center z-20">
            <span className="text-white font-black text-sm">?</span>
          </div>
        </div>

        {/* Subtitle with comic bubble */}
        <div className="relative inline-block max-w-lg">
          <div
            className="
            relative
            bg-white
            border-3 border-black
            rounded-xl
            px-6 py-4
            transform rotate-1
            shadow-[4px_4px_0px_#000]
          "
          >
            <div className="absolute -top-3 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-black"></div>
            <div className="absolute -top-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white"></div>

            <p className="text-gray-700 font-medium text-lg">
              Komik Interaktif untuk{" "}
              <span className="font-black text-red-600">Berpikir Kritis</span> &
              <span className="font-black text-green-600">
                {" "}
                Sikap Konservasi
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main panel menu - Comic book style */}
      <div
        className="
        relative z-10
        w-full max-w-md
        bg-gradient-to-b from-white to-gray-50
        border-6 border-black
        shadow-[16px_16px_0px_#000]
        rounded-2xl
        p-6 md:p-8
        flex flex-col gap-8
        text-center
        transform rotate-0
        hover:shadow-[20px_20px_0px_#000]
        transition-all duration-300
      "
      >
        {/* Comic panel corners */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full border-4 border-white"></div>
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-black rounded-full border-4 border-white"></div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-black rounded-full border-4 border-white"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-black rounded-full border-4 border-white"></div>

        {/* Panel header with comic style */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 border-3 border-black rounded-full transform -rotate-1">
            <div className="w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-black font-black text-sm">★</span>
            </div>
            <span className="font-black text-xl text-black tracking-wider">
              PILIH MENU
            </span>
            <div className="w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-black font-black text-sm">★</span>
            </div>
          </div>
        </div>

        {/* Panel description */}
        <div className="px-4">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Jelajahi aplikasi komik interaktif berbasis mitigasi bencana yang
            dirancang untuk meningkatkan kemampuan berpikir kritis dan sikap
            konservasi
          </p>
        </div>

        {/* Buttons container - Centered with spacing */}
        <div className="flex flex-col gap-6 mt-4">
          {/* Button with comic-style label */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Komik Interaktif
              </div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <Button>Komik</Button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pembukaan Cerita
              </div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <Button>Bukpan</Button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tim Pengembang
              </div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <Button onClick={handleKreditClick}>Kredit</Button>
          </div>
        </div>

        {/* Panel footer with comic style */}
        <div className="mt-8 pt-6 border-t-3 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full border border-black"></div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              PKM RSH 2026 • FMIPA UNNES • ThinkSafeToon
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Challenge Based Learning • Mitigasi Bencana • Pendidikan
              Matematika
            </p>
          </div>
        </div>
      </div>

      {/* Action indicator */}
      <div className="relative z-10 mt-10 animate-bounce-slow">
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-black">
            🎯 Pilih dan klik untuk memulai!
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-black rounded-full animate-ping"></div>
            <div
              className="w-1 h-1 bg-black rounded-full animate-ping"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1 h-1 bg-black rounded-full animate-ping"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.12;
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
      <Kredit isOpen={showKredit} onClose={() => setShowKredit(false)} />
    </div>
  );
}
