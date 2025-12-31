"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { IoChevronBack, IoPersonAddOutline, IoCallOutline, IoMailOutline, IoLocationOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import url from "@/app/utils/urls/BaseUrl";

const IntroduceNewCustomers = ({ params }: { params: { userId: string } }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", zipCode: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber) {
      toast.error("Name and Phone are required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${url}/user/add-user`, {
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        Zipcode: formData.zipCode,
        track_source: "web",
      });
      if (response.status === 201) {
        toast.success("Referral created successfully! 🎉");
        setTimeout(() => router.back(), 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ToastContainer theme="colored" />
      <header className="bg-[#053B90] text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <IoChevronBack size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight uppercase">New Referral</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IoPersonAddOutline size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Customer Referral</h2>
            <p className="text-slate-500 text-sm mt-2">Enter the information below to create a new lead.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: "Full Name", id: "fullName", icon: <IoPersonAddOutline />, type: "text", req: true },
                { label: "Phone Number", id: "phoneNumber", icon: <IoCallOutline />, type: "tel", req: true, max: 10 },
                { label: "Email Address", id: "email", icon: <IoMailOutline />, type: "email" },
                { label: "Zip Code", id: "zipCode", icon: <IoLocationOutline />, type: "text", max: 6 },
              ].map((field) => (
                <div key={field.id} className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1 block">
                    {field.label} {field.req && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{field.icon}</span>
                    <input
                      type={field.type}
                      maxLength={field.max}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder={`Enter ${field.label}`}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-[#053B90] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create Customer"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default IntroduceNewCustomers;