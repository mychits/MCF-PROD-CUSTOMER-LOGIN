"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  IoPersonOutline, 
  IoCallOutline, 
  IoLockClosedOutline, 
  IoEyeOutline, 
  IoEyeOffOutline,
  IoChevronBack,
  IoTicketOutline
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import url from "@/app/utils/urls/BaseUrl";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const validateInputs = () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.replace(/\s/g, "");
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedFullName || !trimmedPhoneNumber || !trimmedPassword || !trimmedConfirmPassword) {
      toast.error("Please fill all required fields (Name, Phone, Password).");
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    if (trimmedPhoneNumber.length !== 10 || isNaN(Number(trimmedPhoneNumber))) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }
    return true;
  };

  // --- API Call (Preserved) ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const payload = {
        phone_number: phoneNumber.replace(/\s/g, ""),
        full_name: fullName.trim(),
        ...(referralCode.trim() && { referral_code: referralCode.trim() }),
      };

      const response = await axios.post(`${url}/user/send-register-otp`, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "OTP sent successfully!");
        // Store data in sessionStorage or pass via state for verification page
        router.push(`/register-otp?phone=${payload.phone_number}&name=${encodeURIComponent(payload.full_name)}&pass=${encodeURIComponent(password)}&ref=${referralCode}`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-hidden">
      <ToastContainer theme="colored" position="top-center" />

      <div className="hidden lg:flex lg:w-1/2 bg-[#053B90] items-center justify-center relative p-12 overflow-hidden">
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] p-4 shadow-2xl mb-8 animate-bounce-slow">
            <img src="/images/MyChitsLogo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4">MyChits</h1>
          <p className="text-blue-100 text-xl font-medium max-w-md opacity-80 leading-relaxed">
            Join India's most trusted digital chit fund platform and start your smart savings journey today.
          </p>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-[#053B90] font-bold transition-all group"
        >
          <IoChevronBack className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Register</h2>
            <p className="text-slate-500 font-medium">Create your account to get started</p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#053B90] transition-all font-bold text-slate-700 shadow-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <div className="relative">
                <IoCallOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#053B90] transition-all font-bold text-slate-700 shadow-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Password */}
               <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-[#053B90] transition-all font-bold text-slate-700 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-[#053B90] transition-all font-bold text-slate-700 shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Section */}
            <div className="pt-2">
              {showReferralInput ? (
                <div className="space-y-1 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#053B90]">Referral Code</label>
                    <button type="button" onClick={() => { setShowReferralInput(false); setReferralCode(""); }} className="text-[10px] font-bold text-rose-500 uppercase">Skip</button>
                  </div>
                  <div className="relative">
                    <IoTicketOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#053B90]" size={20} />
                    <input 
                      type="text"
                      placeholder="Optional Referral Number"
                      className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#053B90] transition-all font-bold text-[#053B90]"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setShowReferralInput(true)}
                  className="text-sm font-bold text-[#053B90] hover:underline underline-offset-4 decoration-2"
                >
                  Have a referral code?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#053B90] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 mt-4"
            >
              {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Send OTP"}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 font-medium">
            Already have an account?{" "}
            <button 
              onClick={() => router.push("/login")}
              className="text-[#053B90] font-black hover:underline underline-offset-4"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </div>
  );
}