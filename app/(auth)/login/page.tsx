"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import url from "@/app/utils/urls/BaseUrl";
import { toast } from "react-toastify";

import { FaEye, FaEyeSlash, FaMobileAlt, FaPiggyBank, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

interface UserResponse {
  _id: string;
  approval_status: string | boolean;
}

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      toast.error("Please enter phone and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${url}/user/signin-user`, {
        phone_number: cleanPhone,
        password: cleanPass,
      });

      toast.success(res.data.message || "Login successful!");
      const userId = res.data.userId;
      await fetchUserDetails(userId);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await axios.get<UserResponse>(`${url}/user/get-user-by-id/${userId}`);
      const approvalStatus = res.data.approval_status;
      if (approvalStatus === "false" || approvalStatus === false) {
        router.replace(`/dashboard/${userId}`);
      } else {
        router.replace(`/home/${userId}`);
      }
    } catch (error) {
      router.replace("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#053B90] flex items-center justify-center p-4 sm:p-8 relative overflow-x-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE: Benefits Section (Hidden on small mobile, shown on Tablet/Desktop) */}
        <div className="text-white space-y-8 animate-fadeIn order-2 lg:order-1">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Why Choose <span className="text-cyan-400">MyChits?</span>
            </h2>
            <p className="text-blue-100 text-lg opacity-90 max-w-md">
              The smartest way to save and borrow, trusted by thousands since 1998.
            </p>
          </div>

          <div className="grid gap-6">
            {/* Benefit 1 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaMobileAlt className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Easy Accessibility</h3>
                <p className="text-blue-100/70 text-sm">Use our online presence and companion mobile app to keep track of your investments anytime.</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaPiggyBank className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">20k to 1 Crore Plans</h3>
                <p className="text-blue-100/70 text-sm">Subscriber-friendly plans designed for your financial goals. Wide range of choices for every budget.</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaShieldAlt className="text-2xl text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Most Trusted Since 1998</h3>
                <p className="text-blue-100/70 text-sm">Safest registered chit company. Your hard-earned money is protected by decades of excellence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all">
            <div className="bg-gradient-to-br from-[#053B90] to-[#0747A6] py-10 px-6 text-center relative">
              <div className="relative z-10">
                <img src="./images/MyChitsLogo.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg bg-white/10 p-2 rounded-2xl" />
                <h1 className="text-white text-3xl font-bold">MyChits</h1>
                <p className="text-blue-100 text-sm opacity-80 mt-1">Sign in to manage your chits</p>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full h-14 pl-14 pr-4 rounded-xl border-2 border-gray-100 focus:border-[#053B90] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      placeholder="00000 00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 px-4 pr-12 rounded-xl border-2 border-gray-100 focus:border-[#053B90] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#053B90]"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button type="button" onClick={() => router.push("/forgot-password")} className="text-sm font-bold text-[#053B90] hover:underline">
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#053B90] text-white font-bold rounded-xl hover:bg-[#0747A6] transition-all shadow-lg hover:shadow-blue-900/30 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Login"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => router.push("/register")} className="text-[#053B90] font-bold hover:underline">
                    Sign Up
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