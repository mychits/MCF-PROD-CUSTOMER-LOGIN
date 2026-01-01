"use client";

import React, { useState, useEffect, useCallback, useContext, useRef, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  IoChevronBack, 
  IoWalletOutline, 
  IoCheckmarkCircle, 
  IoAlertCircle, 
  IoCardOutline, 
  IoInformationCircleOutline,
  IoClose,
  IoArrowForward
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import url from "@/app/utils/urls/BaseUrl";

const formatNumberIndianStyle = (num: number | string) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "0";
  const parts = num.toString().split(".");
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? "." + parts[1] : "";
  const isNegative = integerPart.startsWith("-");
  if (isNegative) integerPart = integerPart.substring(1);

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    integerPart = formattedOtherNumbers + "," + lastThree;
  } else {
    integerPart = lastThree;
  }
  return (isNegative ? "-" : "") + integerPart + decimalPart;
};
interface Params
{
  params:Promise<{userId:string}>
}
const PayYourDues = ({params}:Params) => {
  const userParams = use(params);
  const router = useRouter();
  const userId = userParams?.userId;

  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupOverviews, setGroupOverviews] = useState<any>({});
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState<any>({
    groupId: null,
    ticket: null,
    amount: null,
    groupName: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 1. Fetch User Tickets
      const ticketsRes = await axios.post(`${url}/enroll/get-user-tickets/${userId}`);
      const fetchedCards = ticketsRes.data || [];
      
      // Filter out loan groups
      const filtered = fetchedCards.filter((card: any) => {
        const isLoanGroup = card.group_id?.group_name?.toLowerCase().includes("loan");
        return card.group_id !== null && !isLoanGroup;
      });
      setCardsData(filtered);

      // 2. Fetch individual overviews for balance calculation
      const overviewPromises = filtered.map(async (card: any) => {
        try {
          const res = await axios.get(
            `${url}/single-overview?user_id=${userId}&group_id=${card.group_id._id}&ticket=${card.tickets}`
          );
          return { key: `${card.group_id._id}_${card.tickets}`, data: res.data };
        } catch (e) { return null; }
      });

      const results = await Promise.all(overviewPromises);
      const overviews: any = {};
      results.forEach((r) => { if (r) overviews[r.key] = r.data; });
      setGroupOverviews(overviews);
    } catch (error) {
      toast.error("Failed to load outstanding dues");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Payment Initiation Logic ---
  const handlePayNow = (groupId: string, ticket: string, amount: number, groupName: string) => {
    setModalDetails({ groupId, ticket, amount, groupName });
    setPaymentAmount("");
    setModalVisible(true);
  };

  const initiatePayment = async () => {
    const amountToPay = parseFloat(paymentAmount || modalDetails.amount);

    if (amountToPay > 20000) {
      alert("Limit Reached: You can pay up to ₹20,000 at a time.");
      return;
    }
    if (isNaN(amountToPay) || amountToPay < 100) {
      alert("Invalid Amount: Minimum payment is ₹100.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(`${url}/paymentapi/app/add`, {
        user_id: userId,
        expiry: "3600",
        amount: `${amountToPay}`,
        purpose: "Due Payment",
        payment_group_tickets: [`chit-${modalDetails.groupId}|${modalDetails.ticket}`],
      });
      
      if (response.data?.link_url) {
        window.location.href = response.data.link_url;
      }
    } catch (error) {
      toast.error("Payment initiation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ToastContainer theme="colored" />

      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#053B90] font-bold hover:bg-blue-50 px-4 py-2 rounded-2xl transition-all group"
          >
            <IoChevronBack className="group-hover:-translate-x-1 transition-transform" size={20} />
            <span>Back</span>
          </button>
          
          <div className="text-center">
             <h1 className="text-slate-900 font-black tracking-tight text-lg uppercase leading-none">Payments</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block mt-1">Outstanding Amount Tracker</p>
          </div>
          
          <div className="w-10 sm:w-24 flex justify-end">
            <div className="w-10 h-10 bg-[#053B90] rounded-xl flex items-center justify-center text-white shadow-lg">
               <IoWalletOutline size={20} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-10 text-center sm:text-left">
           <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Pay Your Outstanding</h2>
           <p className="text-slate-500 font-medium">Stay on top of your group payments and track dividends.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>
        ) : cardsData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <img src="/images/Nogroup.png" className="w-40 mx-auto opacity-20 mb-4" alt="Empty" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">No outstanding groups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {cardsData.map((card: any) => {
              const overview = groupOverviews[`${card.group_id._id}_${card.tickets}`];
              if (!overview) return null;

              const totalToPay = overview?.totalInvestment || 0;
              const totalPaid = overview?.totalPaid || 0;
              const totalProfit = overview?.totalProfit || 0;
              const balance = totalPaid - totalToPay;
              const isExcess = balance >= 0;

              return (
                <div key={card._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
                  <div className="p-6 pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-blue-700 font-black text-lg truncate uppercase tracking-tight">{card.group_id?.group_name}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ticket: {card.tickets}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Payable Amount</span>
                        <span className="text-slate-900 font-black">₹{formatNumberIndianStyle(totalToPay)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Amount Paid</span>
                        <span className="text-emerald-600 font-black">₹{formatNumberIndianStyle(totalPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Total Profit</span>
                        <span className="text-indigo-600 font-black">₹{formatNumberIndianStyle(totalProfit)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-auto p-6 ${isExcess ? 'bg-emerald-50' : 'bg-rose-50'} transition-colors`}>
                    <div className="flex items-center gap-3 mb-4">
                      {isExcess ? (
                        <IoCheckmarkCircle className="text-emerald-500" size={24} />
                      ) : (
                        <IoAlertCircle className="text-rose-500" size={24} />
                      )}
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
                          {isExcess ? "Excess Balance" : "Pending Dues"}
                        </p>
                        <p className={`text-xl font-black ${isExcess ? 'text-emerald-700' : 'text-rose-700'}`}>
                          ₹{formatNumberIndianStyle(Math.abs(balance))}
                        </p>
                      </div>
                    </div>

                    {!isExcess && (
                      <button 
                        onClick={() => handlePayNow(card.group_id._id, card.tickets, Math.abs(balance), card.group_id?.group_name)}
                        className="w-full bg-[#053B90] text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-800 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                      >
                        <IoCardOutline size={18} />
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- PAYMENT MODAL --- */}
      {isModalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#053B90] animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                 <img src="/images/MyChitsLogo.png" alt="Logo" className="w-10 h-10 object-contain" />
                 <span className="text-2xl font-black text-slate-900 tracking-tight">MyChits</span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Complete Payment</h3>
                <p className="text-sm text-slate-500 font-medium">You can pay more than your outstanding amount to stay ahead.</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 mb-8 flex flex-col items-center border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding Amount</span>
                <span className="text-3xl font-black text-rose-600">₹{formatNumberIndianStyle(modalDetails.amount)}</span>
              </div>

              <div className="space-y-4 mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Pay</label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</div>
                   <input 
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#053B90] focus:bg-white rounded-2xl py-4 pl-10 pr-6 outline-none font-black text-xl transition-all"
                   />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={isProcessing}
                  onClick={initiatePayment}
                  className="w-full bg-[#053B90] text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Pay ₹{formatNumberIndianStyle(paymentAmount || modalDetails.amount)} Now</>
                  )}
                </button>
                <button 
                  onClick={() => setModalVisible(false)}
                  className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
                >
                  <IoClose size={18} /> Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default PayYourDues;