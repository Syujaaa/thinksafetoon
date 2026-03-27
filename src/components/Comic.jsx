import React, { useState } from "react";
import FloodGame from "./FloodGame";
import FireGame from "./FireGame";
import Button from "./button";

const Comic = ({ onBack }) => {
  const [selectedComic, setSelectedComic] = useState(null);
  const [showFullscreenRequest, setShowFullscreenRequest] = useState(false);
  const [pendingComic, setPendingComic] = useState(null);
  const [score, setScore] = useState(0);

  // Disable developer tools
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Disable F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Check if fullscreen is active
  const isFullscreenActive = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  // Request fullscreen
  const requestFullscreen = async () => {
    const element = document.documentElement;
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen request failed:", error);
    }
  };

  const handleComicSelect = async (comicId) => {
    // Jika sudah fullscreen, langsung main
    if (isFullscreenActive()) {
      setSelectedComic(comicId);
      setShowFullscreenRequest(false);
      return;
    }

    // Jika belum fullscreen, request fullscreen
    setPendingComic(comicId);
    setShowFullscreenRequest(true);
    await requestFullscreen();

    // Tunggu sebentar untuk memastikan fullscreen sudah aktif
    setTimeout(() => {
      if (isFullscreenActive()) {
        setSelectedComic(comicId);
        setShowFullscreenRequest(false);
      }
    }, 500);
  };

  const handleFullscreenOk = () => {
    if (isFullscreenActive() && pendingComic) {
      setSelectedComic(pendingComic);
      setShowFullscreenRequest(false);
      setPendingComic(null);
    } else {
      alert(
        "Fullscreen diperlukan untuk bermain! Silakan aktifkan fullscreen terlebih dahulu.",
      );
    }
  };

  const handleScoreIncrement = (amount = 10) => {
    setScore((prev) => prev + amount);
  };

  const handleScoreDecrement = (amount = 10) => {
    setScore((prev) => Math.max(0, prev - amount));
  };

  const comics = [
    {
      id: "flood",
      title: "Banjir karena Sampah",
      description:
        "Pelajari bagaimana penumpukan sampah dapat menyebabkan banjir. Kumpulkan semua sampah untuk menyelamatkan kota!",
      emoji: "🌊🗑️",
    },
    {
      id: "fire",
      title: "Kesadaran Bahaya Kebakaran",
      description:
        "Kumpulkan minimal 3 benda berbahaya (puntung rokok, korek api, api unggun) dan hitung total bahayanya untuk menyelamatkan diri dari kebakaran!",
      emoji: "🔥⚠️",
    },
  ];

  const handleGameBack = () => {
    setSelectedComic(null);
    exitFullscreen();
  };

  if (selectedComic) {
    return (
      <div className="relative w-full h-screen">
        {selectedComic === "flood" && (
          <FloodGame
            onBack={handleGameBack}
            onScoreIncrement={handleScoreIncrement}
            onScoreDecrement={handleScoreDecrement}
            score={score}
          />
        )}
        {selectedComic === "fire" && (
          <FireGame
            onBack={handleGameBack}
            onScoreIncrement={handleScoreIncrement}
            onScoreDecrement={handleScoreDecrement}
            score={score}
          />
        )}
        <button
          onClick={() => {
            setSelectedComic(null);
            exitFullscreen();
          }}
          className="
            fixed top-5 right-5 md:top-6 md:right-6 z-50
            px-4 md:px-6 py-2 md:py-3
            font-black text-lg md:text-xl
            text-black bg-yellow-400
            border-3 border-black rounded-full
            cursor-pointer
            shadow-[4px_4px_0px_#000]
            hover:shadow-[6px_6px_0px_#000]
            active:shadow-[2px_2px_0px_#000]
            transition-all duration-200
            hover:-translate-x-0.5 hover:-translate-y-0.5
            active:translate-x-0 active:translate-y-0
          "
        >
          ←
        </button>
        <div
          className="
          fixed top-5 left-5 md:top-6 md:left-6 z-50
          px-4 md:px-6 py-2 md:py-3
          font-black text-lg md:text-xl
          text-white bg-gradient-to-r from-purple-600 to-purple-700
          border-3 border-black rounded-lg
          shadow-[4px_4px_0px_#000]
        "
        >
          Score: {score}
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        flex flex-col items-center justify-center
        bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100
        relative overflow-hidden
        px-4 sm:px-6
        py-8
      "
    >
      {/* Background decorative elements */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none
        bg-[radial-gradient(#000_2px,transparent_2px)]
        [background-size:24px_24px]
        animate-pulse-slow"
      ></div>

      <div className="absolute top-10 left-10 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-300 rounded-full mix-blend-multiply opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 sm:w-40 h-32 sm:h-40 bg-red-300 rounded-full mix-blend-multiply opacity-20 blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-20 sm:w-24 h-20 sm:h-24 bg-blue-300 rounded-full mix-blend-multiply opacity-15 blur-lg"></div>

      {/* Header */}
      <div className="relative z-10 mb-8 sm:mb-10 text-center w-full max-w-2xl">
        <div className="relative inline-block mb-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-black transform rotate-3 translate-x-2 translate-y-2 rounded-xl"></div>
            <div className="absolute -inset-1 bg-yellow-400 transform rotate-1 rounded-lg"></div>

            <h1
              className="
                relative
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                font-black
                uppercase tracking-tighter
                text-black
                px-4 sm:px-6 py-3 sm:py-4
                bg-white
                border-4 border-black
                transform -rotate-2
                z-10
              "
            >
              Pilih Komik
            </h1>
          </div>

          <div className="absolute -top-4 -right-4 w-10 sm:w-12 h-10 sm:h-12 bg-red-500 border-3 border-black rounded-full flex items-center justify-center z-20">
            <span className="text-white font-black text-lg">!</span>
          </div>
          <div className="absolute -bottom-4 -left-4 w-8 sm:w-10 h-8 sm:h-10 bg-blue-500 border-3 border-black rounded-full flex items-center justify-center z-20">
            <span className="text-white font-black text-sm">?</span>
          </div>
        </div>

        <div className="relative inline-block max-w-lg px-4">
          <div
            className="
            relative
            bg-white
            border-3 border-black
            rounded-xl
            px-4 sm:px-6 py-3 sm:py-4
            transform rotate-1
            shadow-[4px_4px_0px_#000]
          "
          >
            <div className="absolute -top-3 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-black"></div>
            <div className="absolute -top-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white"></div>

            <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium">
              Pilih komik interaktif untuk belajar mitigasi bencana
            </p>
          </div>
        </div>
      </div>

      {/* Comic Cards */}
      <div className="relative z-10 w-full max-w-3xl px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8">
          {comics.map((comic) => (
            <div
              key={comic.id}
              onClick={() => !comic.disabled && handleComicSelect(comic.id)}
              className={`
                group
                ${comic.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                transition-all duration-300
              `}
            >
              <div
                className={`
                  bg-white
                  border-4 border-black
                  rounded-2xl
                  p-5 sm:p-7 md:p-8
                  relative
                  shadow-[8px_8px_0px_rgba(0,0,0,0.2)]
                  ${!comic.disabled ? "group-hover:shadow-[12px_12px_0px_rgba(0,0,0,0.3)] group-hover:-translate-y-1" : ""}
                  transition-all duration-300
                `}
              >
                {/* Card background shine effect */}
                {!comic.disabled && (
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-100 to-transparent opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                )}

                <div className="relative z-10">
                  {/* Emoji */}
                  <div className="text-4xl sm:text-5xl md:text-6xl text-center mb-4 animate-bounce-slow">
                    {comic.emoji}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black text-center mb-3">
                    {comic.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-700 text-center mb-6 min-h-16 leading-relaxed">
                    {comic.description}
                  </p>

                  {/* Button */}
                  {!comic.disabled && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleComicSelect(comic.id)}
                        className="
                          px-6 sm:px-8 py-3 sm:py-4
                          bg-gradient-to-r from-blue-500 to-blue-600
                          hover:from-blue-600 hover:to-blue-700
                          text-white
                          font-black
                          text-base sm:text-lg
                          border-3 border-black
                          rounded-xl
                          cursor-pointer
                          shadow-[4px_4px_0px_#000]
                          transition-all duration-200
                          hover:shadow-[6px_6px_0px_#000]
                          hover:-translate-x-0.5 hover:-translate-y-0.5
                          active:shadow-[2px_2px_0px_#000]
                          active:translate-x-0 active:translate-y-0
                        "
                      >
                        ▶ MAINKAN
                      </button>
                    </div>
                  )}
                  {comic.disabled && (
                    <div className="flex justify-center">
                      <div
                        className="
                          px-6 sm:px-8 py-3 sm:py-4
                          bg-gray-400
                          text-gray-600
                          font-black
                          text-base sm:text-lg
                          border-3 border-black
                          rounded-xl
                          text-center
                        "
                      >
                        SEGERA HADIR
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button Section */}
      <div className="relative z-10 flex justify-center gap-4 mt-auto pt-6 sm:pt-8">
        <Button onClick={onBack}>← Kembali ke Menu</Button>
      </div>

      {/* Footer info */}
      <div className="relative z-10 mt-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-500 rounded-full border border-black"></div>
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-orange-500 rounded-full border border-black"></div>
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full border border-black"></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            ThinkSafeToon • Komik Interaktif untuk Berpikir Kritis
          </p>
        </div>
      </div>

      {/* Fullscreen Request Modal */}
      {showFullscreenRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-lg">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🖥️</div>
              <h2 className="text-2xl font-black text-black mb-2 uppercase">
                Fullscreen Diperlukan
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Untuk pengalaman bermain yang optimal, permainan ini memerlukan
                mode fullscreen.
                {isFullscreenActive()
                  ? " Anda sudah masuk fullscreen, klik tombol di bawah untuk melanjutkan!"
                  : " Silakan tekan tombol di bawah untuk mengaktifkan fullscreen."}
              </p>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleFullscreenOk}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg border-2 border-black cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
              >
                ✓ Lanjutkan
              </button>
              <button
                onClick={() => {
                  setShowFullscreenRequest(false);
                  setPendingComic(null);
                }}
                className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg border-2 border-black cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
              >
                ✕ Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.12; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Comic;
