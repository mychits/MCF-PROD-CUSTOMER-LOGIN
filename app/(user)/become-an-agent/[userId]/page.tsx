"use client";

import React, { useState, useContext, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  IoChevronBack,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoMapOutline,
  IoCardOutline,
  IoBriefcaseOutline,
  IoBusinessOutline,
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import url from "@/app/utils/urls/BaseUrl";
interface Params {
  params: Promise<{ userId: string }>;
}
const BecomeAnAgent = ({ params }: Params) => {
  const router = useRouter();
  const userParams = use(params);
  const userId = userParams?.userId;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    idProofType: "",
    idProofNumber: "",
    bankAccountNumber: "",
    ifscCode: "",
    experience: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const {
      fullName,
      email,
      phoneNumber,
      address,
      idProofType,
      idProofNumber,
      bankAccountNumber,
      ifscCode,
    } = formData;
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !address ||
      !idProofType ||
      !idProofNumber ||
      !bankAccountNumber ||
      !ifscCode
    ) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submissionData = {
        userId: userId,
        ...formData,
        status: "pending",
        appliedAt: new Date().toISOString(),
      };

      const response = await axios.post(
        `${url}/become-agent/agents/become`,
        submissionData
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Application Submitted Successfully! 🎉");
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          address: "",
          idProofType: "",
          idProofNumber: "",
          bankAccountNumber: "",
          ifscCode: "",
          experience: "",
        });
        setTimeout(() => router.back(), 3000);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit application."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ToastContainer theme="colored" position="top-center" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#053B90] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 font-bold hover:bg-white/10 px-3 py-2 rounded-xl transition-all">
            <IoChevronBack size={24} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-black uppercase tracking-widest text-center flex-1">
            Become an Agent
          </h1>
          <div className="w-12 sm:w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gradient-to-r from-[#053B90] to-blue-700 p-8 sm:p-12 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <IoBriefcaseOutline size={40} />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Agent Application Form
            </h2>
            <p className="text-blue-100 font-medium opacity-90 max-w-md mx-auto">
              Join our network and start your journey towards professional
              growth.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-blue-600"></span> Personal
                  Information
                </h3>
              </div>

              <InputField
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(val: any) => handleInputChange("fullName", val)}
                icon={<IoPersonOutline />}
              />

              <InputField
                label="Email Address"
                placeholder="john@example.com"
                type="email"
                value={formData.email}
                onChange={(val: any) => handleInputChange("email", val)}
                icon={<IoMailOutline />}
              />

              <InputField
                label="Phone Number"
                placeholder="10-digit mobile number"
                type="tel"
                value={formData.phoneNumber}
                onChange={(val: any) => handleInputChange("phoneNumber", val)}
                icon={<IoCallOutline />}
              />

              <div className="md:col-span-2 relative">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">
                  Full Address
                </label>
                <div className="relative">
                  <IoMapOutline
                    className="absolute left-4 top-4 text-slate-400"
                    size={20}
                  />
                  <textarea
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-700 font-medium min-h-[100px]"
                    placeholder="Enter your complete residential address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-blue-600"></span> Identity &
                  Banking
                </h3>
              </div>

              <InputField
                label="ID Proof Type"
                placeholder="Aadhaar / PAN"
                value={formData.idProofType}
                onChange={(val: any) => handleInputChange("idProofType", val)}
                icon={<IoCardOutline />}
              />

              <InputField
                label="ID Proof Number"
                placeholder="Enter unique ID number"
                value={formData.idProofNumber}
                onChange={(val: any) => handleInputChange("idProofNumber", val)}
                icon={<IoCardOutline />}
              />

              <InputField
                label="Bank Account Number"
                placeholder="12 - 16 digit number"
                value={formData.bankAccountNumber}
                onChange={(val: any) =>
                  handleInputChange("bankAccountNumber", val)
                }
                icon={<IoBusinessOutline />}
              />

              <InputField
                label="IFSC Code"
                placeholder="ABCD0123456"
                value={formData.ifscCode}
                onChange={(val: any) => handleInputChange("ifscCode", val)}
                icon={<IoBusinessOutline />}
              />

              {/* Experience */}
              <div className="md:col-span-2 relative mt-4">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">
                  Relevant Experience
                </label>
                <div className="relative">
                  <IoBriefcaseOutline
                    className="absolute left-4 top-4 text-slate-400"
                    size={20}
                  />
                  <textarea
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-700 font-medium min-h-[100px]"
                    placeholder="Describe your previous experience in sales or finance (optional)"
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <button
                disabled={isLoading}
                type="submit"
                className="w-full sm:w-80 bg-[#053B90] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Submit Application"
                )}
              </button>
              <p className="mt-4 text-xs text-slate-400 font-medium italic">
                By submitting, you agree to our Terms of Professional Service.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

/**
 * Reusable Input Component for Web Form
 */
const InputField = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
}: any) => (
  <div className="relative group">
    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block tracking-tight">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600">
        {icon}
      </span>
      <input
        type={type}
        required
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-800 font-bold placeholder:font-normal placeholder:text-slate-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

export default BecomeAnAgent;
