"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  IoChevronBack,
  IoShieldCheckmarkOutline,
  IoRocketOutline,
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import url from "@/app/utils/urls/BaseUrl"; // Ensure this path matches your project

interface SearchParams {
  searchParams: Promise<{ [name: string]: string | string[] | undefined }>;
}

const OtpVerification = ({ searchParams }: SearchParams) => {
  const searchParamsResolved = use(searchParams);
  const { 
    phone: mobileNumber, 
    name: fullName, 
    pass: password, 
    referral: referralCode 
  } = searchParamsResolved;

  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(59);
  const [timerActive, setTimerActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null )[]>([]);

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
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  
  const fetchUserDetailsAndNavigate = async (userId: string) => {
    try {
      const response = await fetch(`${url}/user/get-user-by-id/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const approvalStatus = data.approval_status;

        toast.info("Checking approval status...");

        setTimeout(() => {
          if (approvalStatus === "false") {
            router.replace(`/dashboard/${userId}`);
          } else {
            // Default to Home/BottomTab equivalent in web
            router.replace(`/home/${userId}`);
          }
        }, 2000);
      } else {
        router.replace(`/home?userId=${userId}`);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      router.replace(`/home?userId=${userId}`);
    }
  };

  /**
   * Logic Step 1 & 2: Verify OTP and Signup
   */
  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${url}/user/verify-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: mobileNumber, otp: fullOtp }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        toast.success("OTP Verified!");

        // 2. Signup User
        const signupRes = await fetch(`${url}/user/signup-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            phone_number: mobileNumber,
            password: password,
            track_source: "web",
            ...(referralCode && { referral_code: referralCode }),
          }),
        });

        const signupData = await signupRes.json();

        if (signupRes.ok) {
          toast.success("Registration Successful!");
          const userId = signupData.user?._id;
          
          // Proceed to check status and redirect
          await fetchUserDetailsAndNavigate(userId);
        } else {
          toast.error(signupData.message || "Signup failed.");
          setLoading(false);
        }
      } else {
        toast.error(verifyData.message || "Invalid OTP.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timerActive) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${url}/user/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: mobileNumber, full_name: fullName }),
      });

      if (response.ok) {
        toast.success("New OTP sent!");
        setSeconds(59);
        setTimerActive(true);
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error("Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("Error resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#053B90] flex items-center justify-center p-4 sm:p-8 relative overflow-x-hidden">
      <ToastContainer theme="colored" />
      
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-white space-y-8 animate-fadeIn order-2 lg:order-1">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Secure Your <span className="text-cyan-400">Account</span>
            </h2>
            <p className="text-blue-100 text-lg opacity-90 max-w-md">
              Verification code sent to <span className="font-bold text-white">+91 {mobileNumber}</span>
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <IoShieldCheckmarkOutline className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Two-Factor Security</h3>
                <p className="text-blue-100/70 text-sm">Bank-grade protection for your savings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <IoRocketOutline className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Instant Access</h3>
                <p className="text-blue-100/70 text-sm">Get seamless access to chit auctions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* OTP Card */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all">
            <div className="bg-gradient-to-br from-[#053B90] to-[#0747A6] py-10 px-6 text-center relative">
              <button onClick={() => router.back()} className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors">
                <IoChevronBack size={24} />
              </button>
              <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-lg">
                <img src="/images/MyChitsLogo.png" alt="Logo" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-white text-2xl font-bold">Verification OTP</h1>
              <p className="text-blue-100 text-xs opacity-80 mt-1 uppercase tracking-widest">Step 2 of 2</p>
            </div>

            <div className="p-8 sm:p-10 flex flex-col items-center">
              <h2 className="text-slate-800 font-bold text-lg mb-2 text-center">Enter the 4-digit code</h2>
              <p className="text-slate-400 text-sm text-center mb-8">Verification code was sent to your phone</p>

              <div className="flex justify-between w-full max-w-[280px] mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {inputRefs.current[index] = el}}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-black text-[#053B90] outline-none focus:border-[#053B90] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 mb-10">
                <div className={`px-4 py-2 rounded-full font-bold text-sm ${timerActive ? "bg-blue-50 text-[#053B90]" : "bg-rose-50 text-rose-500"}`}>
                  00:{seconds < 10 ? `0${seconds}` : seconds}
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full h-14 bg-[#053B90] text-white font-bold rounded-xl uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-[#0747A6] transition-all active:scale-95 mb-6 disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? <span className="animate-pulse">Processing...</span> : "Verify & Proceed"}
              </button>

              <button
                onClick={handleResend}
                disabled={timerActive || loading}
                className={`text-sm font-bold flex items-center gap-2 transition-colors ${timerActive || loading ? "text-slate-300 cursor-not-allowed" : "text-[#053B90] hover:underline"}`}
              >
                Didn't get the code? <span>Send Again</span>
              </button>

              <div className="mt-10 pt-6 border-t border-slate-100 w-full text-center">
                <p className="text-slate-500 text-sm">
                  Wrong number?{" "}
                  <button onClick={() => router.push("/register")} className="text-[#053B90] font-bold hover:underline">Change here</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default OtpVerification;