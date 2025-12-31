"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack, IoAlertCircleOutline, IoHomeOutline } from "react-icons/io5";

const LoginNotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
     
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-50 rounded-[3rem] flex items-center justify-center text-[#053B90] animate-pulse">
              <IoAlertCircleOutline size={80} />
            </div>
        
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10 px-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#053B90] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95 group"
          >
            <IoArrowBack className="group-hover:-translate-x-1 transition-transform" size={20} />
            Go Back
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-600 border-2 border-slate-100 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-blue-200 hover:text-[#053B90] transition-all active:scale-95"
          >
            <IoHomeOutline size={20} />
            Home
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                MyChits Support Center
            </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginNotFound;