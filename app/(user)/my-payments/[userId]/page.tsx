"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaWallet,
  FaChartLine,
  FaChevronRight,
  FaArrowLeft,
  FaGavel,
  FaCalendarAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from "react-icons/fa";
import url from "@/app/utils/urls/BaseUrl";
import { AxiosError } from "axios";

// --- Types ---
interface Group {
  _id: string;
  group_name: string;
  group_value: number;
  start_date: string;
  end_date: string;
}

interface Card {
  _id: string;
  group_id: Group;
  tickets: number;
  deleted?: boolean;
  completed?: boolean;
  isPendingApproval?: boolean;
  removal_reason?: string;
}

interface GroupReport {
  totalPaid: number;
  totalProfit: number;
}

interface Params {
  params: Promise<{ userId: string }>;
}

const Payments = ({ params }: Params) => {
  const router = useRouter();
  const paramsObject = use(params);
  const userId = paramsObject.userId;

  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [individualGroupReports, setIndividualGroupReports] = useState<
    Record<string, GroupReport>
  >({});

  const formatNumberIndianStyle = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return "0";
    const safeNum = isNaN(parseFloat(num as string)) ? 0 : parseFloat(num as string);
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeNum);
  };

  const fetchTickets = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setCardsData([]);
      return;
    }
    try {
      const response = await fetch(`${url}/enroll/mobile-enrolls/users/${userId}`);
      const responseData = await response.json();
      let allCards: Card[] = [];

      responseData.data?.forEach((groupBlock: any) => {
        if (groupBlock.mobileAppEnrolls?.length > 0) {
          const mobileCards = groupBlock.mobileAppEnrolls.map((card: any) => ({
            ...card,
            tickets: card.no_of_tickets,
            isPendingApproval: true,
          }));
          allCards.push(...mobileCards);
        }
        if (groupBlock.enrollments?.length > 0) {
          const approvedCards = groupBlock.enrollments.map((card: any) => ({
            ...card,
            isPendingApproval: false,
          }));
          allCards.push(...approvedCards);
        }
      });
      setCardsData(allCards);
    } catch (error) {
      toast.error("Failed to load groups");
    }
  }, [userId]);

  const fetchAllOverview = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${url}/enroll/get-user-tickets-report/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      setTotalPaid(data.reduce((sum: number, g: any) => sum + (g?.payments?.totalPaidAmount || 0), 0));
      setTotalProfit(data.reduce((sum: number, g: any) => sum + (g?.profit?.totalProfit || 0), 0));

      const reportsMap: Record<string, GroupReport> = {};
      data.forEach((groupReport: any) => {
        if (groupReport.enrollment?.group) {
          const key = `${groupReport.enrollment.group._id || groupReport.enrollment.group}-${groupReport.enrollment.tickets}`;
          reportsMap[key] = {
            totalPaid: groupReport.payments?.totalPaidAmount || 0,
            totalProfit: groupReport.profit?.totalProfit || 0,
          };
        }
      });
      setIndividualGroupReports(reportsMap);
    } catch (error) {
      console.error(error);
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchAllOverview()]);
      setLoading(false);
    };
    loadData();
  }, [userId, fetchTickets, fetchAllOverview]);

  const handleCardPress = (groupId: string, ticket: number) => {
    router.push(`/enroll/group?userId=${userId}&groupId=${groupId}&ticket=${ticket}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-900 border-solid"></div>
        <p className="mt-4 text-slate-500 font-medium">Syncing your accounts...</p>
      </div>
    );
  }

  const activeCards = cardsData.filter((card) => card.group_id !== null && !card.deleted);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <ToastContainer theme="colored" />

      {/* --- Sticky Navbar --- */}
      <header className="sticky top-0 z-50 bg-[#053B90] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">My Group Payments</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* --- Summary Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-4 bg-blue-50 rounded-2xl text-[#053B90]">
              <FaWallet size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Investment</p>
              <h2 className="text-2xl font-black text-slate-800">₹{formatNumberIndianStyle(totalPaid)}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-4 bg-green-50 rounded-2xl text-green-600">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Profit</p>
              <h2 className="text-2xl font-black text-slate-800">₹{formatNumberIndianStyle(totalProfit)}</h2>
            </div>
          </div>

          <button 
            onClick={() => router.push(`/auctions/${userId}`)}
            className="bg-[#053B90] hover:bg-[#0747A6] p-6 rounded-3xl shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4 text-white">
              <div className="p-4 bg-white/10 rounded-2xl">
                <FaGavel size={24} />
              </div>
              <div className="text-left">
                <p className="text-white/70 text-xs font-bold uppercase">Upcoming Bids</p>
                <h2 className="text-xl font-bold">View Auction</h2>
              </div>
            </div>
            <FaChevronRight className="text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- Group Grid --- */}
        <h3 className="text-slate-800 font-black text-xl mb-6 flex items-center">
          <span className="w-2 h-6 bg-[#FF9933] rounded-full mr-3"></span>
          Active Enrollments
        </h3>

        {activeCards.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <h4 className="text-slate-800 font-bold text-lg">No Active Groups</h4>
            <p className="text-slate-500">Your joined groups will appear here once approved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCards.map((card, idx) => {
              const key = `${card.group_id._id}-${card.tickets}`;
              const paid = individualGroupReports[key]?.totalPaid || 0;
              const progress = Math.min(100, Math.round((paid / card.group_id.group_value) * 100)) || 0;

              return (
                <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 rounded-2xl">
                        <FaTicketAlt className="text-[#053B90]" size={20} />
                      </div>
                      {card.completed ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center">
                          <FaCheckCircle className="mr-1" /> Completed
                        </span>
                      ) : card.isPendingApproval ? (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center">
                          <FaClock className="mr-1" /> Pending
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-[#053B90] px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-800 mb-1 truncate">{card.group_id.group_name}</h4>
                    <p className="text-slate-400 text-sm font-medium">Ticket Number: <span className="text-slate-700 font-bold">{card.tickets}</span></p>
                  </div>

                  {/* Progress Section */}
                  <div className="px-6 mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Repayment Progress</p>
                      <p className="text-sm font-black text-[#053B90]">{progress}%</p>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-900 transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-px bg-slate-100 mt-auto">
                    <div className="bg-white p-4">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Total Value</p>
                      <p className="text-sm font-bold text-slate-800">₹{formatNumberIndianStyle(card.group_id.group_value)}</p>
                    </div>
                    <div className="bg-white p-4 text-right">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">You Paid</p>
                      <p className="text-sm font-black text-green-600">₹{formatNumberIndianStyle(paid)}</p>
                    </div>
                    <div className="bg-white p-4 col-span-2 flex items-center justify-between border-t border-slate-50">
                      <div className="flex items-center text-slate-500 space-x-2">
                        <FaCalendarAlt size={12} />
                        <span className="text-[10px] font-bold">Ends {new Date(card.group_id.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      {!card.isPendingApproval && (
                        <button 
                          onClick={() => handleCardPress(card.group_id._id, card.tickets)}
                          className="text-[#053B90] text-xs font-black uppercase flex items-center hover:underline"
                        >
                          Details <FaChevronRight className="ml-1" size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Payments;