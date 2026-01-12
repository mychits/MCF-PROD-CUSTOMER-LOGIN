"use client"
import React, { useState, useEffect, use } from "react";
import { 
  IoArrowBack, IoPeopleCircle, IoCheckmarkCircle,
   IoAdd, IoRemove 
} from "react-icons/io5";
import axios from "axios";
import BASEURL from "@/app/utils/urls/BaseUrl";
import { useRouter } from "next/navigation";


const formatDate = (dateString:any) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', month: 'short', year: 'numeric' 
      }).replace(/ /g, '-');
    }
  } catch (error) { console.error(error); }
  return "N/A";
};

const formatNumberIndianStyle = (num:any) => {
  if (num === null || num === undefined) return "0";
  const parts = num.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return formattedOtherNumbers + ',' + lastThree + decimalPart;
  }
  return lastThree + decimalPart;
};

// --- Sub-Components ---
const ChitDetailItem = ({ label, value, index, totalItems }:any) => {
  const isRightItem = index % 2 !== 0;
  const isLastRow = index >= totalItems - (totalItems % 2 === 0 ? 2 : 1);

  return (
    <div className={`
      flex flex-col p-4 w-1/2 border-slate-100
      ${!isRightItem ? 'border-r' : ''} 
      ${!isLastRow ? 'border-b' : ''}
    `}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm font-bold text-slate-700 truncate">{value}</span>
    </div>
  );
};

const ChitDetailsGrid = ({ data }:any) => {
  const chitValue = data.group_value ? `₹ ${formatNumberIndianStyle(data.group_value)}` : 'N/A';
  const monthlyInstallmentValue = data.monthly_installment ? `₹ ${formatNumberIndianStyle(data.monthly_installment)} /Month` : 'N/A';
  
  const details = [
    { label: "Monthly Installment", value: monthlyInstallmentValue },
    { label: "First Auction Date", value: formatDate(data.group_commencement_date) || 'Pending' }, 
    { label: "Duration", value: `${data.group_duration || 'N/A'} Months` },
    { label: "Group Name", value: data.group_name || 'N/A' },
    { label: "Group Members", value: data.group_members || 'N/A' },
    { label: "Start Date", value: formatDate(data.start_date) },
    { label: "End Date", value: formatDate(data.end_date) },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
      <div className="bg-[#053B90] p-6 text-center text-white">
        <p className="text-xs font-medium uppercase tracking-widest opacity-80 mb-1">Chit Value</p>
        <h2 className="text-3xl font-black">{chitValue}</h2>
      </div>
      <div className="flex flex-wrap bg-white">
        {details.map((item, index) => (
          <ChitDetailItem key={index} {...item} index={index} totalItems={details.length} />
        ))}
      </div>
    </div>
  );
};

interface SearchParams{
searchParams: Promise<{userId:string,groupId:string}>
}
const EnrollForm = ({ searchParams}:SearchParams) => {
    const {userId,groupId} =  use(searchParams);

const router = useRouter();

  const [cardsData, setCardsData] = useState<any>(null);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/group/${groupId}`);
        setCardsData(res.data.data[0]);
        const ticketsRes = await axios.post(`${BASEURL}/enroll/get-next-tickets/${groupId}`);
        setAvailableTickets(ticketsRes.data.availableTickets || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [groupId]);

  const handleEnroll = () => {
    if (!termsAccepted || ticketCount <= 0) return;
    setIsConfirmModalVisible(true);
  };

  const performEnrollment = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`/api/mobile-app-enroll/add-mobile-app-enroll`, {
        group_id: groupId,
        user_id: userId,
        no_of_tickets: ticketCount,
        chit_asking_month: 0,
      });
      alert("Enrollment Successful!");
      setIsConfirmModalVisible(false);
    } catch (err) { alert("Enrollment Failed"); }
    setIsSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#053B90]">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#053B90] p-4 flex items-center gap-4 text-white shadow-lg sticky top-0 z-10">
        <button onClick={()=>router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <IoArrowBack size={24} />
        </button>
        <h1 className="font-bold text-lg">Group Enrollment</h1>
      </header>

      <main className="max-w-xl mx-auto p-4 pb-24">
        <h2 className="text-center text-[#053B90] font-black text-xl mb-6">Enrollment Details</h2>

        {/* Chit Grid */}
        {cardsData && <ChitDetailsGrid data={cardsData} />}

        {/* Ticket Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
          <h3 className="text-center font-bold text-slate-800 mb-6">Select Tickets</h3>
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-500 font-semibold">Number of Tickets:</span>
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button 
                disabled={ticketCount <= 1}
                onClick={() => setTicketCount(prev => prev - 1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#053B90] disabled:opacity-30"
              >
                <IoRemove size={20} />
              </button>
              <span className="px-6 font-black text-xl text-[#053B90]">{ticketCount}</span>
              <button 
                disabled={ticketCount >= availableTickets.length}
                onClick={() => setTicketCount(prev => prev + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#053B90] disabled:opacity-30"
              >
                <IoAdd size={20} />
              </button>
            </div>
          </div>

          <div className="bg-[#17A2B8] p-4 rounded-xl flex justify-between items-center text-white shadow-md">
            <span className="font-bold">Total Selected Tickets</span>
            <span className="text-2xl font-black">{ticketCount}</span>
          </div>
        </div>

        {/* Terms and Button */}
        <div className="flex items-start gap-3 px-2 mb-8 cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
          <div className={`mt-1 rounded border-2 p-0.5 ${termsAccepted ? 'bg-[#053B90] border-[#053B90]' : 'bg-white border-slate-300'}`}>
            <IoCheckmarkCircle size={18} className={termsAccepted ? 'text-white' : 'text-transparent'} />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            I agree to the <span className="text-blue-600 font-bold underline">Terms & Conditions</span> and <span className="text-blue-600 font-bold underline">Privacy Policy</span>.
          </p>
        </div>

        <button 
          disabled={!termsAccepted || isSubmitting}
          onClick={handleEnroll}
          className="w-full bg-[#28A745] hover:bg-[#218838] text-white py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Enroll Now"}
        </button>
      </main>

      {/* Confirmation Modal */}
      {isConfirmModalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center border-2 border-[#053B90] animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-50 text-[#053B90] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#053B90]">
              <IoPeopleCircle size={60} />
            </div>
            <h3 className="text-xl font-black mb-4">Confirm Enrollment</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Dear {  'User'}, do you want to join <b>{cardsData?.group_name}</b>? <br/>
              Installment: <b>₹{formatNumberIndianStyle(cardsData?.group_install)}</b> <br/>
              Tickets: <b>{ticketCount}</b>
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsConfirmModalVisible(false)}
                className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={performEnrollment}
                className="flex-1 py-3 bg-[#053B90] rounded-xl font-bold text-white shadow-lg shadow-blue-900/20"
              >
                Agree & Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollForm;