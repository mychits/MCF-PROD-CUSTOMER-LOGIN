"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaWallet,
  FaChartLine,
  FaChevronRight,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";
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

// --- Constants ---
const Colors = {
  primaryBlue: "#053B90",
  warningText: "#F39C12",
  completedText: "#27AE60",
  removedText: "#E74C3C",
  accentColor: "#3498DB",
};

const Payments = () => {
  const router = useRouter();

  // Replace with real auth context
  const userId = "mock-user-id";

  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [individualGroupReports, setIndividualGroupReports] = useState<Record<string, GroupReport>>({});

  // --- Format Number (Indian Style) ---
  const formatNumberIndianStyle = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return "0";
    const safeNum = isNaN(parseFloat(num as string)) ? 0 : parseFloat(num as string);
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeNum);
  };

  // --- Fetch Tickets ---
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
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load groups");
      setCardsData([]);
    }
  }, [userId]);

  // --- Fetch Overview ---
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
        if (groupReport.enrollment?.group && groupReport.enrollment.tickets !== undefined) {
          const key = `${groupReport.enrollment.group._id || groupReport.enrollment.group}-${groupReport.enrollment.tickets}`;
          reportsMap[key] = {
            totalPaid: groupReport.payments?.totalPaidAmount || 0,
            totalProfit: groupReport.profit?.totalProfit || 0,
          };
        }
      });
      setIndividualGroupReports(reportsMap);
    } catch (error) {
      console.error("Error fetching overview:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load group summary");
      }
    }
  }, [userId]);

  // --- Load Data ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (userId) {
        await Promise.all([fetchTickets(), fetchAllOverview()]);
      } else {
        setCardsData([]);
        setTotalPaid(null);
        setTotalProfit(null);
      }
      setLoading(false);
    };
    loadData();
  }, [userId, fetchTickets, fetchAllOverview]);

  // --- Filter Cards ---
  const filteredCards = cardsData.filter((card) => card.group_id !== null);
  const activeCards = filteredCards.filter((c) => !c.deleted);

  // --- Handlers ---
  const handleCardPress = (groupId: string, ticket: number) => {
    router.push(`/enroll/group?groupId=${groupId}&ticket=${ticket}`);
  };

  const handleAuctionPress = () => {
    router.push("/auction");
  };

  // --- Calculate Paid Percentage ---
  const calculatePaidPercentage = (groupValue: number, paidAmount: number): number => {
    if (!groupValue || !paidAmount) return 0;
    return Math.min(100, Math.round((paidAmount / groupValue) * 100));
  };

  // --- Render Loading ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  const displayTotalProfit = totalPaid === 0 ? 0 : totalProfit;
  const paidDisplay = totalPaid !== null ? `₹ ${formatNumberIndianStyle(totalPaid)}` : "";
  const profitDisplay = totalProfit !== null ? `₹ ${formatNumberIndianStyle(displayTotalProfit)}` : "";

  return (
    <div className="min-h-screen bg-blue-900 text-white pb-24">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <header className="p-4 bg-blue-900 sticky top-0 z-40 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white">
          <FaArrowRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-xl font-bold">My Groups Payments</h1>
        <div className="w-8" />
      </header>

      <main className="p-4 bg-gray-100 min-h-screen">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-4 text-center">
            <FaWallet className="text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg">{paidDisplay || "Loading..."}</p>
            <p className="text-white text-xs">Total Investment</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4 text-center">
            <FaChartLine className="text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg">{profitDisplay || "Loading..."}</p>
            <p className="text-white text-xs">Total Profit</p>
          </div>
        </div>

        {/* Auction Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleAuctionPress}
            className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-3 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <span>View Auction</span>
            <FaChevronRight className="ml-2" />
          </button>
        </div>

        {/* Group Cards */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <p className="text-gray-800 text-lg">No groups found</p>
          </div>
        ) : activeCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <p className="text-gray-800 text-lg">No active groups found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCards.map((card, index) => {
              const groupIdFromCard = card.group_id._id;
              const groupReportKey = `${groupIdFromCard}-${card.tickets}`;
              const individualPaidAmount = card.isPendingApproval
                ? 0
                : individualGroupReports[groupReportKey]?.totalPaid || 0;
              const paidPercentage = calculatePaidPercentage(
                card.group_id.group_value,
                individualPaidAmount
              );

              let bgColor = "bg-white";
              let borderClass = "border";
              if (card.deleted) {
                bgColor = "bg-gray-100";
                borderClass = "border-gray-300";
              } else if (card.isPendingApproval) {
                bgColor = "bg-yellow-50";
                borderClass = "border-yellow-300";
              } else if (card.completed) {
                bgColor = "bg-green-50";
                borderClass = "border-green-300";
              } else {
                bgColor = "bg-blue-50";
                borderClass = "border-blue-300";
              }

              return (
                <div
                  key={index}
                  className={`${bgColor} rounded-xl p-4 shadow ${borderClass}`}
                >
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3">
                      {card.deleted ? (
                        <span className="text-red-500 font-bold">❌</span>
                      ) : card.isPendingApproval ? (
                        <span className="text-yellow-500 font-bold">⏳</span>
                      ) : card.completed ? (
                        <span className="text-green-500 font-bold">✅</span>
                      ) : (
                        <span className="text-blue-600 font-bold">₹</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        card.deleted ? "text-red-500" : 
                        card.isPendingApproval ? "text-yellow-600" : 
                        card.completed ? "text-green-600" : "text-gray-800"
                      }`}>
                        {card.group_id.group_name}
                      </h3>
                      <p className="text-sm text-gray-600">Ticket: {card.tickets}</p>
                      {card.deleted && (
                        <p className="text-xs text-red-500 mt-1">
                          Reason: {card.removal_reason || "Unknown"}
                        </p>
                      )}
                      {card.completed && <p className="text-xs text-green-600 mt-1">Completed</p>}
                      {card.isPendingApproval && <p className="text-xs text-yellow-600 mt-1">Approval Pending</p>}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-100 p-2 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {card.group_id.start_date
                          ? new Date(card.group_id.start_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="font-medium">
                        {card.group_id.end_date
                          ? new Date(card.group_id.end_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Paid</span>
                      <span className="font-bold">{paidPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${paidPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Value</p>
                      <p className="font-bold">
                        ₹ {formatNumberIndianStyle(card.group_id.group_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="font-bold text-blue-600">
                        ₹ {formatNumberIndianStyle(individualPaidAmount)}
                      </p>
                    </div>
                  </div>

                  {/* View Payments Button */}
                  {!card.isPendingApproval && (
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center"
                      onClick={() => handleCardPress(card.group_id._id, card.tickets)}
                    >
                      <span>View Payments & Details</span>
                      <FaChevronRight className="ml-2" />
                    </button>
                  )}
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