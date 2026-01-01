"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  IoPersonOutline, 
  IoCallOutline, 
  IoLockClosedOutline, 
  IoEyeOutline, 
  IoEyeOffOutline,
  IoChevronBack,
  IoTicketOutline,
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoDiamondOutline
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
      toast.error("Please fill all required fields.");
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
        router.push(`/register-otp?phone=${payload.phone_number}&name=${encodeURIComponent(payload.full_name)}&pass=${encodeURIComponent(password)}&ref=${referralCode}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#053B90] flex items-center justify-center p-4 sm:p-8 relative overflow-x-hidden">
      <ToastContainer theme="colored" position="top-center" />
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE: Benefits (Order 2 on mobile, Order 1 on Desktop) */}
        <div className="text-white space-y-8 animate-fadeIn order-2 lg:order-1">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Start Your <span className="text-cyan-400">Savings Journey</span>
            </h2>
            <p className="text-blue-100 text-lg opacity-90 max-w-md">
              Join thousands of smart savers on India's most trusted digital chit platform.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <IoRocketOutline className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Easy Accessibility</h3>
                <p className="text-blue-100/70 text-sm">Real-time tracking of your chits via our companion mobile app.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <IoDiamondOutline className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Flexible Plans</h3>
                <p className="text-blue-100/70 text-sm">Chit plans ranging from 20k to 1 Crore designed for your budget.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <IoShieldCheckmarkOutline className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Most Trusted</h3>
                <p className="text-blue-100/70 text-sm">Registered and secure. Protecting your hard-earned money since 1998.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form (Order 1 on mobile) */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all">
            
            <div className="bg-gradient-to-br from-[#053B90] to-[#0747A6] py-8 px-6 text-center relative">
               <button 
                onClick={() => router.back()}
                className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors"
              >
                <IoChevronBack size={24} />
              </button>
              <div className="relative z-10">
                <img src="/images/MyChitsLogo.png" alt="Logo" className="w-16 h-16 mx-auto mb-2 bg-white p-2 rounded-xl shadow-lg" />
                <h1 className="text-white text-2xl font-bold">Create Account</h1>
                <p className="text-blue-100 text-xs opacity-80 mt-1 font-medium">Join us for smarter savings</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Rajath Shetty"
                      className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 outline-none focus:border-[#053B90] focus:bg-white transition-all font-semibold text-slate-700 text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <IoCallOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold pl-2"></span>
                    <input 
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 outline-none focus:border-[#053B90] focus:bg-white transition-all font-semibold text-slate-700 text-sm"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 pr-10 outline-none focus:border-[#053B90] focus:bg-white transition-all font-semibold text-slate-700 text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#053B90]">
                        {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 pr-10 outline-none focus:border-[#053B90] focus:bg-white transition-all font-semibold text-slate-700 text-sm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#053B90]">
                        {showConfirmPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referral Section */}
                <div className="pt-2">
                  {showReferralInput ? (
                    <div className="space-y-1 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#053B90]">Referral Code</label>
                        <button type="button" onClick={() => { setShowReferralInput(false); setReferralCode(""); }} className="text-[10px] font-bold text-rose-500 uppercase">Skip</button>
                      </div>
                      <div className="relative">
                        <IoTicketOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#053B90]" size={18} />
                        <input 
                          type="text"
                          placeholder="Optional Code"
                          className="w-full h-12 bg-blue-50 border-2 border-blue-100 rounded-xl pl-12 pr-4 outline-none focus:border-[#053B90] transition-all font-bold text-[#053B90] text-sm"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setShowReferralInput(true)}
                      className="text-xs font-bold text-[#053B90] hover:underline underline-offset-4"
                    >
                      Have a referral code?
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#053B90] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-[#0747A6] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </button>

                <p className="mt-6 text-center text-slate-500 text-sm font-medium">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-[#053B90] font-bold hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}