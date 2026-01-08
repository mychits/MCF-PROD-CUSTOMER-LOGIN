"use client";
import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  FaWallet, 
  FaChartLine, 
  FaUsers, 
  FaArrowRight, 
  FaSearch, 
  FaSync,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import url from "@/app/utils/urls/BaseUrl";

interface Params {
  params: Promise<{ userId: string }>;
}

export default function MyPassbook({ params }: Params) {
  const router = useRouter();
  const ParamsObject = use(params);
  const userId = ParamsObject?.userId;

  const [chitGroups, setChitGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [totals, setTotals] = useState({ paid: 0, profit: 0 });

  const fetchPassbookData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setDataError(null);

    try {
      const response = await axios.post(`${url}/enroll/get-user-tickets-report/${userId}`);
      const data: any = Array.isArray(response.data) ? response.data : [];

      const totalPaid = data.reduce((sum: number, g: any) => sum + (Number(g?.payments?.totalPaidAmount) || 0), 0);
      const totalProfit = data.reduce((sum: number, g: any) => sum + (Number(g?.profit?.totalProfit) || 0), 0);

      setTotals({ paid: totalPaid, profit: totalProfit });
      setChitGroups(data);
    } catch (error) {
      setDataError("Join a group to track your payments here!" as any);
      toast.error("Could not load passbook details.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPassbookData();
  }, [fetchPassbookData]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#053B90]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-[#FF9933] rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#053B90] relative overflow-hidden selection:bg-[#FF9933]">
      <ToastContainer theme="colored" />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-400 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
        {/* Main Glass Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-5 md:p-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4 text-[#053B90]">
              <RiMoneyRupeeCircleFill  size={32} className="animate-bounce-slow" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#053B90] mb-3 tracking-tight">
              Your Financial Snapshot
            </h1>
            <p className="text-gray-500 font-medium text-lg max-w-lg mx-auto leading-relaxed">
              A quick look at your investments & returns.
            </p>
          </div>

          {dataError && (
            <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-3xl text-center group">
              <p className="text-red-600 font-bold text-lg mb-4">{dataError}</p>
              <button 
                onClick={fetchPassbookData}
                className="inline-flex items-center bg-red-100 px-6 py-2 rounded-full text-red-700 font-bold hover:bg-red-200 transition-all active:scale-95"
              >
                <FaSync className="mr-2 group-hover:rotate-180 transition-transform duration-500" /> Retry
              </button>
            </div>
          )}

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {[
              { label: "Total Investment", val: totals.paid, icon: <FaWallet />, color: "from-[#053B90] to-[#0a56cc]", shadow: "shadow-blue-900/20" },
              { label: "Total Profit", val: totals.profit, icon: <FaChartLine />, color: "from-[#1B5E20] to-[#2E7D32]", shadow: "shadow-green-900/20" },
              { label: "Enrolled Groups", val: chitGroups.length, icon: <FaUsers />, color: "from-[#4A148C] to-[#6A1B9A]", shadow: "shadow-purple-900/20" }
            ].map((card, i) => (
              <div 
                key={i}
                className={`relative overflow-hidden group bg-gradient-to-br ${card.color} p-8 rounded-[2rem] flex flex-col justify-between h-48 transform hover:-translate-y-2 transition-all duration-300 shadow-2xl ${card.shadow}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500 text-white">
                  {React.cloneElement(card.icon as React.ReactElement, )}
                </div>
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 backdrop-blur-sm">
                  {card.icon}
                </div>
                <div>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-3xl font-black text-white">
                    {typeof card.val === "number" ? `₹${card.val.toLocaleString("en-IN")}` : card.val}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Section List Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-[#FF9933] rounded-full"></div>
              <h2 className="text-2xl font-black text-[#053B90] tracking-tight">Your Chit Groups</h2>
            </div>
            {chitGroups.length > 0 && (
              <button 
                onClick={() => router.push(`/my-groups/${userId}`)}
                className="group flex items-center gap-2 text-sm font-bold text-white bg-[#053B90] px-6 py-3 rounded-2xl hover:bg-[#0a56cc] transition-all shadow-lg active:scale-95"
              >
                View All <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Content / Empty State */}
          {chitGroups.length === 0 ? (
            <div className="py-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl scale-150 opacity-50"></div>
               
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-3xl font-black text-gray-800 mb-3">No Groups Enrolled Yet!</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  It looks like you haven't joined any groups. Explore available chits and start your journey today!
                </p>
                <button 
                  onClick={() => router.push("/discover")}
                  className="bg-gradient-to-r from-[#053B90] to-[#0a56cc] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-blue-500/30 transition-all flex items-center mx-auto group active:scale-95"
                >
                  <FaSearch className="mr-3 group-hover:rotate-12 transition-transform" /> Discover Groups
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chitGroups.slice(0, 4).map((group: any, index: number) => (
                <div 
                  key={index} 
                  className="group p-6 bg-white border border-gray-100 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/dashboard/${userId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#053B90] font-black text-lg group-hover:bg-[#053B90] group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-black text-gray-800 text-lg leading-tight group-hover:text-[#053B90] transition-colors">
                        {group.groupName || `Ticket #${group.payments?.ticket}`}
                      </p>
                      <p className="text-sm text-gray-400 font-bold mt-1">
                        Paid: <span className="text-[#053B90]">₹{Number(group?.payments?.totalPaidAmount).toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right bg-green-50 px-4 py-2 rounded-2xl group-hover:bg-green-100 transition-colors">
                    <p className="text-green-700 font-black text-lg">
                      ₹{Number(group?.profit?.totalProfit).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] uppercase text-green-600/70 font-black tracking-widest">Total Profit</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #053B90;
        }
        ::-webkit-scrollbar-thumb {
          background: #FF9933;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}