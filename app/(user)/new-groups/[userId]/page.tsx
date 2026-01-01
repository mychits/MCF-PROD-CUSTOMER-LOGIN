"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  IoGrid, 
  IoSparkles, 
  IoHourglass, 
  IoAlertCircleOutline, 
  IoArrowForward, 
  IoRadioButtonOn, 
  IoRadioButtonOff,
  IoChevronBack,
  IoInformationCircleOutline,
  IoFilter,
  IoCalendarOutline,
  IoPeopleOutline
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import url from "@/app/utils/urls/BaseUrl";


const formatNumberIndianStyle = (num: number | string) => {
  if (num === null || num === undefined) return "0";
  const parts = num.toString().split('.');
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  let isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = formattedOtherNumbers + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }
  return (isNegative ? '-' : '') + integerPart + decimalPart;
};

const getVacantSeats = (card: any) => {
  const appDisplaySeats = parseInt(card.app_display_vacany_seat, 10);
  if (!isNaN(appDisplaySeats) && appDisplaySeats > 0) return appDisplaySeats;
  const totalMembers = parseInt(card.number_of_members, 10) || 0;
  const enrolledMembers = parseInt(card.enrolled_members, 10) || 0; 
  return Math.max(0, totalMembers - enrolledMembers);
};
interface Params{
  params:Promise<{userId:string}>
}
const Enrollment = ({ params }: Params) => {
  const userParams = use(params);
  const userId = userParams?.userId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || "NewGroups";

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardsData, setCardsData] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    let endpoint = `${url}/group/filter/${selectedGroup}`;

    try {
      const response = await axios.get(endpoint);
      let groupsData = response.data?.groups || [];
      if (selectedGroup === "VacantGroups") {
        groupsData = groupsData.filter((g: any) => getVacantSeats(g) > 0);
      }
      setCardsData(groupsData);
    } catch (err) {
      setError("Unable to connect to service. Please check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, [selectedGroup]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      <ToastContainer theme="colored" />

      {/* --- PREMIUM NAVIGATION --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold transition-all px-3 py-2 rounded-xl hover:bg-indigo-50"
          >
            <IoChevronBack className="transition-transform group-hover:-translate-x-1" size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-slate-900 font-black text-base sm:text-xl tracking-tight leading-none">
              Investment Plans
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">Select a group to start saving</p>
          </div>

          <div className="w-10 sm:w-20 flex justify-end">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
               <IoFilter size={16} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* --- MODERN TAB SWITCHER --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[
            { id: "NewGroups", label: "New", icon: <IoSparkles /> },
            { id: "OngoingGroups", label: "Ongoing", icon: <IoHourglass /> },
            { id: "VacantGroups", label: "Vacant", icon: <IoPeopleOutline /> },
            { id: "AllGroups", label: "All Plans", icon: <IoGrid /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGroup(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap border
                ${selectedGroup === tab.id 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-105" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTENT LOADING/ERROR STATES --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading secure data...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <IoAlertCircleOutline size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{error}</h3>
            <button onClick={fetchGroups} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-colors">Try Again</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {cardsData.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <img src="/images/Nogroup.png" alt="Empty" className="w-40 mx-auto mb-6 opacity-20 grayscale" />
                <h3 className="text-xl font-bold text-slate-400">No active groups in this category</h3>
              </div>
            ) : (
              cardsData.map((card) => {
                const isSelected = selectedCardId === card._id;
                const vacantSeats = getVacantSeats(card);

                return (
                  <div
                    key={card._id}
                    onClick={() => setSelectedCardId(card._id)}
                    className={`group relative rounded-[2rem] p-6 sm:p-8 transition-all duration-500 cursor-pointer flex flex-col h-full border
                      ${isSelected 
                        ? "bg-white border-indigo-500 shadow-2xl shadow-indigo-100 -translate-y-2" 
                        : "bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200"}
                    `}
                  >
                    {/* Status Floating Badge */}
                    <div className="flex justify-between items-center mb-6">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${vacantSeats > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${vacantSeats > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>
                        {vacantSeats} {vacantSeats === 1 ? 'Seat' : 'Seats'} Left
                      </div>
                      <div className="transition-transform group-hover:scale-110">
                        {isSelected ? <IoRadioButtonOn className="text-indigo-600 text-2xl" /> : <IoRadioButtonOff className="text-slate-200 text-2xl" />}
                      </div>
                    </div>

                    {/* Value Section */}
                    <div className="mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">Total Value</span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        <span className="text-indigo-600 mr-1">₹</span>
                        {formatNumberIndianStyle(card.group_value)}
                      </h2>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <IoCalendarOutline size={16} />
                         </div>
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Starts On</p>
                            <p className="text-xs font-bold text-slate-700">{new Date(card.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <IoPeopleOutline size={16} />
                         </div>
                         <div className="flex-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Scheme Name</p>
                            <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{card.group_name}</p>
                         </div>
                      </div>
                    </div>

                    {/* Premium Installment Box */}
                    {card.monthly_installment && (
                      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-8 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
                        <span className="text-[10px] font-bold text-indigo-900/60 uppercase">Monthly</span>
                        <span className="text-sm font-black text-indigo-700">₹{formatNumberIndianStyle(card.monthly_installment)}</span>
                      </div>
                    )}

                    {/* Action Footer */}
                    <div className="mt-auto flex flex-col gap-3">
                      <button
                        disabled={vacantSeats === 0}
                        onClick={(e) => { e.stopPropagation(); router.push(`/enroll-form?groupId=${card._id}&userId=${userId}`); }}
                        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95
                          ${vacantSeats > 0 
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"}`}
                      >
                        {vacantSeats === 0 ? "Plan Full" : "Join This Group"}
                        {vacantSeats > 0 && <IoArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />}
                      </button>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/enroll-form?groupId=${card._id}&userId=${userId}`); }}
                        className="w-full py-3 text-slate-500 font-bold text-xs hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <IoInformationCircleOutline size={16} />
                        View Full Schedule
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Enrollment;