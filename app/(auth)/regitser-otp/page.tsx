"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";


const OtpVerification = ({ mobileNumber = "1234567890" }) => {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(59);
  const [timerActive, setTimerActive] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, seconds]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = () => {
    if (otp.every((digit) => digit !== "")) {
      const fullOtp = otp.join("");
      console.log("Verifying OTP:", fullOtp);
      alert(`OTP ${fullOtp} submitted for ${mobileNumber}`);
    } else {
      alert("Please enter the complete 4-digit OTP.");
    }
  };

  const handleResend = () => {
    if (!timerActive) {
      setSeconds(59);
      setTimerActive(true);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#053B90] flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md flex flex-col h-screen md:h-auto md:min-h-[600px]">
        
        <div className="flex-[0.6] flex flex-col items-center justify-center p-6 text-white animate-fade-in">
          <div className="w-24 h-24 mb-4 bg-white/10 rounded-3xl p-4 backdrop-blur-md">
             <img 
               src="/images/MyChitsLogo.png" 
               alt="MyChits Logo" 
               className="w-full h-full object-contain"
             />
          </div>
          <h1 className="text-3xl font-bold tracking-wider">MyChits</h1>
        </div>

        <div className="flex-1 bg-[#C7E3EF] rounded-t-[40px] md:rounded-[40px] px-8 pt-12 pb-8 flex flex-col items-center shadow-2xl">
          <h2 className="text-xl font-extrabold text-black mb-8 uppercase tracking-tight">
            Enter OTP
          </h2>

          <div className="flex justify-between w-full max-w-[280px] mb-10">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-16 bg-white border-2 border-blue-400 rounded-2xl text-center text-2xl font-bold text-[#053B90] outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-[#053B90] font-semibold text-lg mb-12">
            00:{seconds < 10 ? `0${seconds}` : seconds}
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-white hover:bg-slate-50 text-[#1A237E] font-black py-4 rounded-full shadow-lg transition-transform active:scale-95 mb-6 uppercase tracking-widest"
          >
            Verify
          </button>

          <button
            onClick={handleResend}
            disabled={timerActive}
            className={`text-sm transition-colors ${
              timerActive ? "text-slate-400 cursor-not-allowed" : "text-[#053B90] hover:underline"
            }`}
          >
            Didn't get it? <span className="font-bold">Send Again</span>
          </button>

          <div className="mt-auto pt-8">
            <p className="text-[#455A64] text-sm">
              Don't have an account?{" "}
              <button 
                onClick={() => router.push('/register')}
                className="text-black font-black hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OtpVerification;