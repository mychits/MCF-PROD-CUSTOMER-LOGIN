"use client";

import React, { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FaWallet,
  FaChartLine,

  FaChevronDown,
  FaChevronUp,
  FaArrowDown,
  FaHourglassHalf,
  FaCheckCircle,
  FaTrashAlt,
  FaArrowRight,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { FaPeopleGroup } from "react-icons/fa6";
import url from "@/app/utils/urls/BaseUrl";


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
  secondaryBlue: "#0C53B3",
  warningText: "#F39C12",
  completedText: "#27AE60",
  removedText: "#E74C3C",
  accentColor: "#3498DB",
};

const MyGroups = ({params}:{params:Promise<{userId:string}>}) => {
  const router = useRouter();
  const userIdData = use(params);

 
  const userId = userIdData.userId;

  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [individualGroupReports, setIndividualGroupReports] = useState<Record<string, GroupReport>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [highlightedCardIndex, setHighlightedCardIndex] = useState<number | null>(null);

  const scrollViewRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      const response = await axios.get(`${url}/enroll/mobile-enrolls/users/${userId}`);
      const responseData = response.data.data || [];
      let allCards: Card[] = [];

      responseData.forEach((groupBlock: any) => {
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
      const response = await axios.post(`${url}/enroll/get-user-tickets-report/${userId}`);
      const data = response.data;

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
      if(error instanceof AxiosError){
 console.error("Error fetching overview:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load group summary");
      }
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
  const activeCards = filteredCards.filter((c) => !c.deleted && !c.isPendingApproval);
  const cardsToRender = filteredCards.filter((c) => !c.deleted);

  // --- Handle Scroll to Card ---
  const handleScrollToCard = (index: number) => {
    const card = cardsToRender[index];
    if (card.isPendingApproval) return;

    const cardElement = cardRefs.current[`card-${index}`];
    if (cardElement && scrollViewRef.current) {
      const offsetTop = cardElement.offsetTop - 100;
      scrollViewRef.current.scrollTo({ top: offsetTop, behavior: "smooth" });
      setHighlightedCardIndex(index);
      setExpandedIndex(null);
      setTimeout(() => setHighlightedCardIndex(null), 3000);
    }
  };

  // --- Handle Card Navigation ---
  const handleCardPress = (groupId: string, ticket: number) => {
    router.push(`/enroll/group?groupId=${groupId}&ticket=${ticket}`);
  };

  // --- Toggle Accordion ---
  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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

  return (
    <div className="min-h-screen bg-blue-900 text-white pb-24">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <header className="p-4 bg-blue-900 sticky top-0 z-40 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white">
          <FaArrowRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-xl font-bold">My Groups</h1>
        <div className="w-8"></div>
      </header>

      <main className="p-4 bg-gray-100 min-h-screen">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-4 text-center">
            <FaWallet className="text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg">
              {totalPaid !== null ? `₹ ${formatNumberIndianStyle(totalPaid)}` : "Loading..."}
            </p>
            <p className="text-white text-xs">Total Investment</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4 text-center">
            <FaChartLine className="text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg">
              {totalProfit !== null ? `₹ ${formatNumberIndianStyle(totalProfit)}` : "Loading..."}
            </p>
            <p className="text-white text-xs">Total Profit</p>
          </div>
        </div>

        {/* Active Groups Card */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-600 rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-white text-3xl font-bold">{activeCards.length}</p>
            <p className="text-purple-200 text-sm">Active Groups</p>
          </div>
          <FaPeopleGroup className="text-white text-3xl" />
        </div>

        {/* Accordion List */}
        {cardsToRender.length > 0 && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow">
            <h2 className="font-bold text-blue-900 mb-4">All Enrollments</h2>
            {cardsToRender.map((card, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0">
                <button
                  className="w-full flex justify-between items-center py-3"
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-3">{index + 1}.</span>
                    <span className="font-medium text-gray-800">{card.group_id.group_name}</span>
                    {card.isPendingApproval && (
                      <FaHourglassHalf className="text-yellow-500 ml-2" />
                    )}
                  </div>
                  {expandedIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedIndex === index && (
                  <div className="pb-4 pl-8">
                    <div className="grid grid-cols-2 gap-2 mb-2">
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
                    <p className="text-sm">
                      <span className="text-gray-500">Ticket: </span>
                      {card.tickets}
                    </p>
                    {card.isPendingApproval && (
                      <p className="text-yellow-600 text-sm mt-1">Approval Pending</p>
                    )}
                    <button
                      className={`mt-2 px-3 py-1 rounded-full text-white text-sm ${
                        card.isPendingApproval ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={() => handleScrollToCard(index)}
                      disabled={card.isPendingApproval}
                    >
                      {card.isPendingApproval ? "Approval Pending" : "View Detailed Card"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Group Cards */}
        {cardsToRender.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No groups found</div>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-full font-medium"
              onClick={() => router.push("/enrollment")}
            >
              Enroll Now
            </button>
          </div>
        ) : (
          <div ref={scrollViewRef} className="space-y-4">
            {cardsToRender.map((card, index) => {
              const ticketKey = card.tickets;
              const groupIdFromCard = card.group_id._id;
              const groupReportKey = `${groupIdFromCard}-${ticketKey}`;

              const isDeleted = card.deleted;
              const isCompleted = card.completed;
              const isPending = card.isPendingApproval;

              const individualPaidAmount = isPending
                ? 0
                : individualGroupReports[groupReportKey]?.totalPaid || 0;
              const paidPercentage = calculatePaidPercentage(
                card.group_id.group_value,
                individualPaidAmount
              );

              let bgColor = "bg-white";
              let borderClass = "border";
              if (isDeleted) {
                bgColor = "bg-gray-100";
                borderClass = "border-gray-300";
              } else if (isPending) {
                bgColor = "bg-yellow-50";
                borderClass = "border-yellow-300";
              } else if (isCompleted) {
                bgColor = "bg-green-50";
                borderClass = "border-green-300";
              } else {
                bgColor = "bg-blue-50";
                borderClass = "border-blue-300";
              }

              return (
                <div
                  key={index}
                  ref={(el) => (cardRefs.current[`card-${index}`] = el)}
                  className={`${bgColor} rounded-xl p-4 shadow ${borderClass} ${
                    highlightedCardIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3">
                      {isDeleted ? (
                        <FaTrashAlt className="text-red-500" />
                      ) : isPending ? (
                        <FaHourglassHalf className="text-yellow-500" />
                      ) : isCompleted ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <span className="text-blue-600 font-bold">₹</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${isDeleted ? "text-red-500" : isPending ? "text-yellow-600" : isCompleted ? "text-green-600" : "text-gray-800"}`}>
                        {card.group_id.group_name}
                      </h3>
                      <p className="text-sm text-gray-600">Ticket: {ticketKey}</p>
                      {isDeleted && (
                        <p className="text-xs text-red-500 mt-1">
                          Removed: {card.removal_reason || "Unknown"}
                        </p>
                      )}
                      {isCompleted && <p className="text-xs text-green-600 mt-1">Completed</p>}
                      {isPending && <p className="text-xs text-yellow-600 mt-1">Approval Pending</p>}
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
                        className={`h-full ${
                          isPending ? "bg-gray-400" : "bg-blue-600"
                        }`}
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
                      <p
                        className={`font-bold ${
                          isPending ? "text-gray-400" : "text-blue-600"
                        }`}
                      >
                        ₹ {formatNumberIndianStyle(individualPaidAmount)}
                      </p>
                    </div>
                  </div>

                  {/* View Payments Button */}
                  {!isPending && (
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center"
                      onClick={() => handleCardPress(card.group_id._id, ticketKey)}
                    >
                      <span>View Payments & Details</span>
                      <IoIosArrowForward className="ml-2" />
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

export default MyGroups;