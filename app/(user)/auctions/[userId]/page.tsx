"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  IoChevronBack,
  IoHammer,
  IoRocketOutline,
  IoCalendarOutline,
  IoStatsChart,
  IoInformationCircleOutline,
  IoListOutline,
  IoTrophyOutline,
  IoCashOutline,
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import url from "@/app/utils/urls/BaseUrl";

// --- Logic Helpers (Preserved) ---
const formatNumberIndianStyle = (num: number | string) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "0";
  const parts = num.toString().split(".");
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? "." + parts[1] : "";
  const isNegative = integerPart.startsWith("-");
  if (isNegative) integerPart = integerPart.substring(1);

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  const formatted =
    otherNumbers !== ""
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return (isNegative ? "-" : "") + formatted + decimalPart;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculateCommencementDate = (auctionDateString: string) => {
  if (!auctionDateString) return "";
  const date = new Date(auctionDateString);
  date.setDate(date.getDate() - 10);
  return date.toISOString().split("T")[0];
};

// --- Sub-Component: Commencement Card ---
const CommencementRecordCard = ({ firstAuctionDate }: any) => {
  const commencementDate = calculateCommencementDate(firstAuctionDate);

  return (
    <div className="bg-white border-2 border-orange-200 rounded-3xl overflow-hidden shadow-sm mb-6 transition-all hover:shadow-md">
      <div className="bg-orange-500 text-white px-5 py-2.5 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em]">
        <IoRocketOutline size={16} />
        RECORD 1: COMMENCEMENT
      </div>
      <div className="grid grid-cols-2 bg-slate-50/50 border-b border-slate-100">
        <div className="p-5 flex flex-col items-center border-r border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">
            Commencement Date
          </span>
          <span className="text-sm font-black text-blue-900">
            {formatDate(commencementDate)}
          </span>
        </div>
        <div className="p-5 flex flex-col items-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">
            Next Auction Date
          </span>
          <span className="text-sm font-black text-blue-900">
            {formatDate(firstAuctionDate)}
          </span>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center bg-white px-6">
        <span className="text-xs font-bold text-slate-500 uppercase">
          Auction Type
        </span>
        <span className="text-xs font-black text-orange-600 uppercase">
          Commencement
        </span>
      </div>
    </div>
  );
};

// --- Sub-Component: Group Card ---
const GroupCard = ({ card, onSelect }: any) => {
  const { group_id, _id, tickets } = card;
  const isFree = group_id?.auction_type?.toLowerCase() === "free";

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="bg-[#053B90] p-5 flex justify-between items-center">
        <h3 className="text-white font-bold text-base truncate pr-2">
          {group_id?.group_name}
        </h3>
        {group_id?.auction_type && (
          <span
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
              isFree ? "bg-orange-500 text-white" : "bg-blue-800 text-blue-100"
            }`}>
            {group_id.auction_type}
          </span>
        )}
      </div>
      <div className="p-8 text-center bg-gradient-to-b from-white to-slate-50/30">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Group Value
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          <span className="text-blue-600 text-xl mr-1">₹</span>
          {formatNumberIndianStyle(group_id?.group_value)}
        </h2>
      </div>
      <div className="grid grid-cols-2 mt-auto border-t border-slate-100">
        <button
          onClick={() =>
            onSelect(_id, group_id?._id, tickets, group_id?.group_name)
          }
          className="p-4 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors border-r border-slate-100">
          <IoListOutline className="text-blue-700" size={18} />
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tighter">
            View Auctions
          </span>
        </button>
        <button
          onClick={() =>
            onSelect(_id, group_id?._id, tickets, group_id?.group_name)
          }
          className="p-4 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
          <IoStatsChart className="text-blue-700" size={18} />
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tighter">
            Details
          </span>
        </button>
      </div>
    </div>
  );
};

const Auctions = ({ params }: { params: Promise<{ userId: string }> }) => {
  const userParams = use(params);
  const userId = userParams?.userId;

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [userTickets, setUserTickets] = useState([]);
  const [isShowingRecords, setIsShowingRecords] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [commencementData, setCommencementData] = useState<any>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.post(`${url}/enroll/get-user-tickets/${userId}`);
      setUserTickets(res.data || []);
    } catch (e) {
      toast.error("Failed to load your groups");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleViewRecords = async (
    enrollId: string,
    groupId: string,
    tickets: any,
    groupName: string
  ) => {
    setIsShowingRecords(true);
    setLoadingRecords(true);
    try {
      const res = await axios.get(`${url}/auction/group/${groupId}`);
      const data = res.data || [];
      setRecords(data.slice().reverse());
      if (data.length > 0) {
        setCommencementData({
          group_name: groupName,
          commencement_date: data[0].auction_date,
        });
      }
    } catch (e) {
      toast.error("No auction records found.");
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <ToastContainer theme="colored" />

      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() =>
              isShowingRecords ? setIsShowingRecords(false) : router.back()
            }
            className="flex items-center gap-2 text-[#053B90] font-bold hover:bg-blue-50 px-3 py-2 rounded-xl transition-all">
            <IoChevronBack size={20} />
            <span className="hidden sm:inline">
              {isShowingRecords ? "Back to Groups" : "Back"}
            </span>
          </button>

          <div className="text-center">
            <h1 className="text-slate-900 font-black tracking-tight text-lg sm:text-xl uppercase">
              Auctions
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] hidden sm:block">
              Chit Record Management
            </p>
          </div>

          <div className="w-10 sm:w-24 flex justify-end">
            <div className="w-10 h-10 bg-[#053B90] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <IoHammer size={18} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {!isShowingRecords ? (
          <section className="animate-in fade-in duration-500">
            <div className="mb-10 sm:text-left text-center">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3">
                Your Groups
              </h2>
              <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                Explore all your auction activities, past and present, right
                here.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userTickets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <img
                  src="/images/Nogroup.png"
                  className="w-32 mx-auto opacity-20 mb-4 grayscale"
                  alt="No groups"
                />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  No groups found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {userTickets.map(
                  (card: any) =>
                    card.group_id && (
                      <GroupCard
                        key={card._id}
                        card={card}
                        onSelect={handleViewRecords}
                      />
                    )
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-3xl font-black text-slate-900">
                Auction History
              </h2>
              <div className="h-px flex-1 bg-slate-200 ml-6 hidden sm:block"></div>
            </div>

            {loadingRecords ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {records.map((record, index) => {
                  const recordNumber = records.length - index + 1;
                  return (
                    <div
                      key={record._id}
                      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:border-blue-200">
                      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center gap-2 font-black text-[10px] tracking-[0.2em]">
                        <IoHammer size={14} className="text-blue-400" /> RECORD{" "}
                        {recordNumber}
                      </div>

                      <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100">
                        <div className="p-5 flex flex-col items-center border-r border-slate-100">
                          <IoCalendarOutline
                            className="text-blue-600 mb-1"
                            size={18}
                          />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            Auction Date
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {formatDate(record.auction_date)}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col items-center">
                          <IoCalendarOutline
                            className="text-blue-600 mb-1"
                            size={18}
                          />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            Next Date
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {formatDate(record.next_date)}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                            Auction Type
                          </p>
                          <p
                            className={`text-xs font-black ${
                              record.auction_type?.toLowerCase() === "free"
                                ? "text-orange-600"
                                : "text-slate-700"
                            }`}>
                            {record.auction_type || "Normal"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">
                            Bid Percentage
                          </p>
                          <p className="text-xs font-black text-slate-700">
                            {record.bid_percentage || "0"}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-slate-100">
                        <div className="p-5 flex items-center gap-4 px-8">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <IoTrophyOutline size={20} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase block">
                              Winning Ticket
                            </span>
                            <span className="text-lg font-black text-slate-900">
                              {record.ticket || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 bg-[#053B90] flex items-center gap-4 px-8">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-400">
                            <IoCashOutline size={20} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-blue-200 uppercase block">
                              Bid Amount
                            </span>
                            <span className="text-xl font-black text-white">
                              ₹{formatNumberIndianStyle(record.bid_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {commencementData && (
                  <CommencementRecordCard
                    firstAuctionDate={commencementData.commencement_date}
                    groupName={commencementData.group_name}
                  />
                )}

                {records.length === 0 && !loadingRecords && (
                  <div className="bg-blue-50/50 rounded-3xl p-8 text-center flex flex-col items-center gap-3 border border-blue-100">
                    <IoInformationCircleOutline
                      size={32}
                      className="text-blue-500"
                    />
                    <p className="text-blue-900 font-semibold text-sm max-w-xs mx-auto">
                      This group's auctions have not started yet. Commencement
                      details are shown below.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <style jsx global>{`
        .animate-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Auctions;
