"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  IoChevronBack,
  IoListOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import url from "@/app/utils/urls/BaseUrl";

const insuranceOptions = [
  { title: "Bike", image: "/images/bike.png", color: "#800080" },
  { title: "Car", image: "/images/car.png", color: "#357500" },
  { title: "Term", image: "/images/Termlife.png", color: "#053B90" },
  { title: "Health", image: "/images/health.png", color: "#004775" },
];
interface Params{
  params:Promise<{userId:string}>
}
const Insurance = ({ params }: Params) => {
  const router = useRouter();
  const { userId } = use(params);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

 
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEnquiry = async (optionType: string) => {
    const confirm = window.confirm(
      `Are you sure you want to enquire about ${optionType} insurance?`
    );
    if (!confirm) return;

    setLoading(true);
    try {
      const response = await axios.post(`${url}/insurance`, {
        customer_id: userId,
        insurance_type: [optionType.toLowerCase()],
      });

      if (response.data.message === "updated enquiry") {
        toast.success(
          `Success! Your interest in ${optionType} has been recorded.`
        );
      }
    } catch (error) {
      toast.error(`Failed to record your interest in ${optionType}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ToastContainer theme="colored" position="top-center" />

      <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#053B90] font-bold hover:bg-blue-50 px-4 py-2 rounded-2xl transition-all group">
            <IoChevronBack
              className="group-hover:-translate-x-1 transition-transform"
              size={20}
            />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-slate-900 font-black tracking-tight text-lg uppercase leading-none">
              Insurance
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block mt-1">
              Protective Coverage
            </p>
          </div>

          <div className="w-10 sm:w-24 flex justify-end">
            <div className="w-10 h-10 bg-[#053B90] rounded-xl flex items-center justify-center text-white shadow-lg">
              <IoShieldCheckmarkOutline size={20} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div
            className={`text-center sm:text-left transform transition-all duration-700 ${
              isMounted
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-2">
              Insurance
            </h2>
            <p className="text-slate-500 font-medium italic">
              Secure what you love
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 bg-blue-50 text-[#053B90] px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all shadow-sm active:scale-95">
            <IoListOutline size={20} />
            My Policies
          </button>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#053B90] border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-blue-900">Processing request...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {insuranceOptions.map((option, index) => (
            <div
              key={option.title}
              style={{ transitionDelay: `${index * 100}ms` }}
              className={`flex flex-col gap-3 transform transition-all duration-700 ${
                isMounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}>
              <div
                style={{ backgroundColor: option.color }}
                className="relative h-40 sm:h-52 rounded-[2rem] p-6 overflow-hidden shadow-lg group cursor-pointer"
                onClick={() => handleEnquiry(option.title)}>
                <h3 className="text-white font-black text-xl sm:text-2xl uppercase italic tracking-tighter relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                  {option.title}
                </h3>

                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />

                <img
                  src={option.image}
                  alt={option.title}
                  className="absolute bottom-4 right-4 w-[75%] h-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
                />
              </div>

              <button
                onClick={() => handleEnquiry(option.title)}
                className="w-full bg-white text-[#053B90] border-2 border-slate-100 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-sm hover:border-[#053B90] hover:bg-[#053B90] hover:text-white transition-all duration-300 active:scale-95">
                Enquire Now
              </button>
            </div>
          ))}
        </div>

        <div
          className={`mt-20 p-8 bg-white rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8 shadow-sm transition-all duration-1000 delay-500 ${
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
          <div className="w-20 h-20 bg-blue-50 text-[#053B90] rounded-3xl flex items-center justify-center flex-shrink-0">
            <IoInformationCircleOutline size={48} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
              Need a custom plan?
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Our advisors are ready to help you find the best coverage for your
              specific needs. Click any category above or contact your
              relationship manager for assistance.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "tel:+919483900777")}
            className="whitespace-nowrap px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95">
            Talk to Advisor
          </button>
        </div>
      </main>
    </div>
  );
};

export default Insurance;
