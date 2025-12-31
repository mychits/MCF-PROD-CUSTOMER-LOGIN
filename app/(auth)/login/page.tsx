"use client";
import React, { useState, useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import url from "@/app/utils/urls/BaseUrl";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
interface UserResponse{
    _id:string;
    approval_status:string | boolean
}
export default function Login() {
  const router = useRouter();
  const mobileNumber: string = "";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toastRef = useRef(null);

  useEffect(() => {
    if (mobileNumber) {
      const clean = mobileNumber.replace(/\D/g, "").slice(0, 10);
      setPhoneNumber(clean);
      setPassword("");
    }
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await axios.get<UserResponse>(`${url}/user/get-user-by-id/${userId}`);
      
      const approvalStatus = res.data.approval_status;

      console.log(`[Login] Fetched approval_status:`, approvalStatus);

      if (approvalStatus === "false") {
        router.replace(`/dashboard/${userId}`);
      } else {
        router.replace(`/home/${userId}`);
      }
    } catch (error) {
      console.error("User details fetch error:", error);
      toast.error("Profile check failed. Redirecting to Home.");
      router.replace("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      toast.error("Please enter phone and password");
      return;
    }

    if (cleanPhone.length !== 10 || isNaN(Number(cleanPhone))) {
      toast.error("Phone must be 10 digits");
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
        let msg = "Login failed. Please try again.";

        if (error.response?.data?.message) {
          msg = error.response.data.message;
        } else if (!error.response) {
          msg = "No internet or server unreachable.";
        }
        console.error("Login error:", error);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#053B90] via-[#0747A6] to-[#064D9E] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div ref={toastRef} className="opacity-0 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header Section with gradient */}
          <div className="bg-gradient-to-br from-[#053B90] to-[#0747A6] py-8 px-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-4 transform transition-transform hover:scale-105 duration-300">
              <img
                src="./images/MyChitsLogo.png"
                alt="MyChits Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg"
              />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-wide drop-shadow-lg">
              MyChits
            </h1>
            <p className="text-blue-100 text-sm mt-2 font-medium">Welcome Back!</p>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-blue-50/30">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 text-sm">
                Get access to your chits very easily
              </p>
            </div>

            <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
              {/* Phone Number Input */}
              <div className="group">
                <label className="block text-gray-800 font-semibold text-sm mb-2 ml-1 transition-colors group-focus-within:text-[#053B90]">
                  Phone number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="Enter your phone number"
                    maxLength={10}
                    disabled={loading}
                    className="w-full h-12 sm:h-14 pl-14 pr-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-[#053B90] focus:ring-4 focus:ring-[#053B90]/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-gray-800 font-semibold text-sm mb-2 ml-1 transition-colors group-focus-within:text-[#053B90]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full h-12 sm:h-14 px-4 pr-12 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-[#053B90] focus:ring-4 focus:ring-[#053B90]/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#053B90] text-lg transition-colors duration-200 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  disabled={loading}
                  className="text-[#053B90] text-sm font-semibold hover:text-[#042a6b] underline decoration-2 underline-offset-2 transition-colors disabled:opacity-60">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 sm:h-14 rounded-xl text-white font-bold text-base transition-all duration-300 transform relative overflow-hidden group ${
                  loading
                    ? "bg-[#053B90]/70 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#053B90] to-[#0747A6] hover:shadow-xl hover:shadow-[#053B90]/30 hover:-translate-y-0.5 active:translate-y-0"
                }`}>
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </span>
                {!loading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#042a6b] to-[#053B90] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    disabled={loading}
                    className="text-[#053B90] font-bold hover:text-[#042a6b] transition-colors disabled:opacity-60 underline decoration-2 underline-offset-2">
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Decorative bottom text */}
        <p className="text-center text-blue-100 text-xs mt-6 opacity-80">
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}