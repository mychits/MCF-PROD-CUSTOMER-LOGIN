"use client";

import React, { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FaWallet,
  FaChartLine,
  FaHourglassHalf,
  FaCheckCircle,
  FaTrashAlt,
  FaArrowLeft,
  FaSearch,
  FaInfoCircle,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { FaPeopleGroup } from "react-icons/fa6";
import url from "@/app/utils/urls/BaseUrl";

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
const MyGroups = ({ params }: Params) => {
  const router = useRouter();
  const userIdData = use(params);
  const userId = userIdData.userId;

  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [individualGroupReports, setIndividualGroupReports] = useState<
    Record<string, GroupReport>
  >({});
  const [searchQuery, setSearchQuery] = useState("");

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const formatCurrency = (num: number | string | null | undefined) => {
    const value = typeof num === "string" ? parseFloat(num) : num ?? 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axios.get(
        `${url}/enroll/mobile-enrolls/users/${userId}`
      );
      const responseData = response.data.data || [];
      let allCards: Card[] = [];

      responseData.forEach((groupBlock: any) => {
        if (groupBlock.mobileAppEnrolls?.length > 0) {
          allCards.push(
            ...groupBlock.mobileAppEnrolls.map((c: any) => ({
              ...c,
              tickets: c.no_of_tickets,
              isPendingApproval: true,
            }))
          );
        }
        if (groupBlock.enrollments?.length > 0) {
          allCards.push(
            ...groupBlock.enrollments.map((c: any) => ({
              ...c,
              isPendingApproval: false,
            }))
          );
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
      const response = await axios.post(
        `${url}/enroll/get-user-tickets-report/${userId}`
      );
      const data = response.data;
      setTotalPaid(
        data.reduce(
          (sum: number, g: any) => sum + (g?.payments?.totalPaidAmount || 0),
          0
        )
      );
      setTotalProfit(
        data.reduce(
          (sum: number, g: any) => sum + (g?.profit?.totalProfit || 0),
          0
        )
      );

      const reportsMap: Record<string, GroupReport> = {};
      data.forEach((groupReport: any) => {
        const key = `${
          groupReport.enrollment.group._id || groupReport.enrollment.group
        }-${groupReport.enrollment.tickets}`;
        reportsMap[key] = {
          totalPaid: groupReport.payments?.totalPaidAmount || 0,
          totalProfit: groupReport.profit?.totalProfit || 0,
        };
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

  const filteredCards = cardsData.filter((card) =>
    card.group_id?.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScrollToCard = (index: number) => {
    cardRefs.current[`card-${index}`]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-r-transparent"></div>
          <p className="text-blue-900 font-semibold animate-pulse">
            Loading secure data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      <ToastContainer />

      {/* --- Professional Deep Blue Header --- */}
      <header className="bg-[#053B90] text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FaArrowLeft className="text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                My Investments
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-blue-200 uppercase font-bold tracking-widest">
                <span>Dashboard</span>
                <IoIosArrowForward size={10} />
                <span>Chit Groups</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/enroll")}
            className="bg-sky-400 hover:bg-sky-500 text-[#053B90] px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">
            + New Enrollment
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* --- Bluish Stats Row --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FaWallet />}
            label="Total Investment"
            value={formatCurrency(totalPaid)}
            variant="primary"
          />
          <StatCard
            icon={<FaChartLine />}
            label="Total Dividend / Profit"
            value={formatCurrency(totalProfit)}
            variant="soft"
          />
          <StatCard
            icon={<FaPeopleGroup />}
            label="Active Enrollments"
            value={cardsData
              .filter((c) => !c.deleted && !c.isPendingApproval)
              .length.toString()}
            variant="navy"
          />
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* --- Sidebar Search --- */}
          <section className="lg:col-span-1">
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm sticky top-24">
              <h2 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                <FaSearch size={14} /> Quick Find
              </h2>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Filter by group name..."
                  className="w-full pl-4 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-blue-300 text-blue-900 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScrollToCard(idx)}
                    className="w-full text-left p-3.5 rounded-xl hover:bg-blue-600 group transition-all border border-transparent hover:shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-blue-900 group-hover:text-white truncate">
                        {card.group_id.group_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-500 group-hover:text-blue-100 font-semibold">
                      TICKET ID: {card.tickets}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* --- Main Content Cards --- */}
          <section className="lg:col-span-2 space-y-6">
            {filteredCards.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-blue-200 rounded-3xl p-16 text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaInfoCircle className="text-blue-400" size={32} />
                </div>
                <p className="text-blue-900 font-bold mb-2">
                  No active groups match your criteria
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 text-sm font-bold hover:underline">
                  Reset Search Filters
                </button>
              </div>
            ) : (
              filteredCards.map((card, index) => {
                const report =
                  individualGroupReports[
                    `${card.group_id._id}-${card.tickets}`
                  ];
                const paidAmt = report?.totalPaid || 0;
                const progress = Math.min(
                  100,
                  Math.round((paidAmt / card.group_id.group_value) * 100)
                );

                return (
                  <div
                    key={index}
                    ref={(el) => (cardRefs.current[`card-${index}`] = el)}
                    className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                        <div className="flex items-center gap-5">
                          <StatusIcon card={card} />
                          <div>
                            <h3 className="text-xl font-extrabold text-[#053B90] tracking-tight">
                              {card.group_id.group_name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                                #{card.tickets}
                              </span>
                              <StatusBadge card={card} />
                            </div>
                          </div>
                        </div>

                        {!card.isPendingApproval && (
                          <button
                            onClick={() =>
                              router.push(
                                `/enroll/group?groupId=${card.group_id._id}&ticket=${card.tickets}`
                              )
                            }
                            className="w-full md:w-auto px-6 py-2.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                            MANAGE ACCOUNT <IoIosArrowForward />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
                        <InfoItem
                          label="Group Valuation"
                          value={formatCurrency(card.group_id.group_value)}
                        />
                        <InfoItem
                          label="Amount Invested"
                          value={formatCurrency(paidAmt)}
                          highlight
                        />
                        <InfoItem
                          label="Start Cycle"
                          value={new Date(
                            card.group_id.start_date
                          ).toLocaleDateString()}
                        />
                        <InfoItem
                          label="Maturity Date"
                          value={new Date(
                            card.group_id.end_date
                          ).toLocaleDateString()}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-blue-900 uppercase tracking-tighter">
                            Maturity Progress
                          </span>
                          <span className="text-lg font-black text-blue-600">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-3 w-full bg-blue-100/50 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                              card.isPendingApproval
                                ? "bg-blue-200"
                                : "bg-gradient-to-r from-blue-400 to-blue-700"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dbeafe;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

// --- Sub-Components (Bluish Variants) ---

const StatCard = ({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: "primary" | "sky" | "navy" | "soft";
}) => {
  const themes = {
    primary: "bg-[#053B90] text-white",
    sky: "bg-sky-500 text-white",
    navy: "bg-blue-800 text-white",
    soft: "bg-white text-blue-900 border border-blue-100",
  };

  return (
    <div
      className={`${themes[variant]} p-6 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-transform`}>
      <div
        className={`text-2xl mb-3 ${
          variant === "soft" ? "text-blue-600" : "text-blue-100/50"
        }`}>
        {icon}
      </div>
      <p
        className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
          variant === "soft" ? "text-blue-400" : "text-blue-200"
        }`}>
        {label}
      </p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-blue-400 uppercase mb-1">
      {label}
    </span>
    <span
      className={`text-sm font-bold truncate ${
        highlight ? "text-blue-700" : "text-blue-900"
      }`}>
      {value}
    </span>
  </div>
);

const StatusBadge = ({ card }: { card: Card }) => {
  const base =
    "text-[9px] px-2 py-0.5 rounded-full font-black uppercase border";
  if (card.deleted)
    return (
      <span className={`${base} bg-red-50 text-red-600 border-red-100`}>
        Terminated
      </span>
    );
  if (card.isPendingApproval)
    return (
      <span className={`${base} bg-blue-50 text-blue-400 border-blue-100`}>
        Verifying
      </span>
    );
  if (card.completed)
    return (
      <span className={`${base} bg-blue-900 text-white border-blue-900`}>
        Matured
      </span>
    );
  return (
    <span className={`${base} bg-sky-100 text-sky-700 border-sky-200`}>
      Active
    </span>
  );
};

const StatusIcon = ({ card }: { card: Card }) => {
  const base =
    "w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-50";
  if (card.deleted)
    return (
      <div className={`${base} bg-red-50 text-red-500`}>
        <FaTrashAlt />
      </div>
    );
  if (card.isPendingApproval)
    return (
      <div className={`${base} bg-blue-50 text-blue-400`}>
        <FaHourglassHalf />
      </div>
    );
  if (card.completed)
    return (
      <div className={`${base} bg-blue-900 text-white`}>
        <FaCheckCircle />
      </div>
    );
  return <div className={`${base} bg-white text-blue-600 font-black`}>₹</div>;
};

export default MyGroups;
