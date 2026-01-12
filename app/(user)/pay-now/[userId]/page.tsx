"use client";
import React, { useEffect, useState, use } from "react";
import { 
  IoArrowBack, IoSearchOutline, IoPeople, IoCash, 
  IoWallet, IoCloseCircle, IoCheckmarkDone, IoFolderOpenOutline,
  IoShieldCheckmark, IoWarningOutline
} from "react-icons/io5";
import axios from "axios";
import baseUrl from "@/app/utils/urls/BaseUrl";
import { useRouter } from "next/navigation";

interface Params {
  params: Promise<{ userId: string }>
}

export default function CustomerPaymentLink({ params }: Params) {
  const { userId } = use(params);
  const router = useRouter();

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const formatDate = (dateString: any) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("en-GB");
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const filtered = cards.filter((item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [searchQuery, cards]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        axios.post(`${baseUrl}/enroll/get-user-tickets/${userId}`),
        axios.get(`${baseUrl}/loans/get-borrower-by-user-id/${userId}`),
        axios.get(`${baseUrl}/pigme/get-pigme-customer-by-user-id/${userId}`),
      ]);

      let finalCards: any = [];
      const [chitRes, loanRes, pigmeRes] = results.map(r => r.status === 'fulfilled' ? r.value : null);

      (chitRes?.data || []).forEach((c: any) => {
        finalCards.push({
          type: "chit", title: c.group_id?.group_name,
          displayValue: Array.isArray(c.tickets) ? c.tickets[0] : c.tickets,
          label: "TICKET NO", group_id: c.group_id?._id, ticket_no: Array.isArray(c.tickets) ? c.tickets[0] : c.tickets,
          color: "text-sky-600", bg: "bg-sky-600", icon: IoPeople
        });
      });

      (Array.isArray(loanRes?.data) ? loanRes.data : []).forEach(l => finalCards.push({
        type: "loan", title: `Loan ID: ${l.loan_id}`,
        displayValue: `₹${l.loan_amount}`, label: "LOAN AMOUNT", loan_db_id: l._id, 
        color: "text-amber-600", bg: "bg-amber-600", icon: IoCash
      }));

      (Array.isArray(pigmeRes?.data) ? pigmeRes.data : []).forEach(p => finalCards.push({
        type: "pigmy", title: `Pigmy ID: ${p.pigme_id}`,
        displayValue: `₹${p.payable_amount}`, label: "COLLECTION", pigme_db_id: p._id, 
        color: "text-purple-600", bg: "bg-purple-600", icon: IoWallet, start_date: p.start_date || "N/A"
      }));

      setCards(finalCards);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const processFinalPayment = async () => {
    setLocalError(null);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setLocalError("Please enter a valid amount to proceed.");
      return;
    }

    setIsSending(true);
    let p_tickets = [];
    if (selectedItem.type === "chit") p_tickets = [`chit-${selectedItem.group_id}|${selectedItem.ticket_no}`];
    else if (selectedItem.type === "loan") p_tickets = [`loan-${selectedItem.loan_db_id}`];
    else p_tickets = [`pigme-${selectedItem.pigme_db_id}`];

    try {
      const response = await axios.post(`${baseUrl}/paymentapi/generate-payment-link`, {
        user_id: userId,
        amount: Number(amount),
        payment_group_tickets: p_tickets,
        admin_type: "68904ce8ef406d77cbc074f3",
        purpose: `${selectedItem.type.toUpperCase()} Payment: ${selectedItem.title}`,
      });

      if (response.status === 200 && response.data.linkUrl) {
        setPaymentModal(false);
        setSuccessModal(true);
        setTimeout(() => {
          window.location.href = response.data.linkUrl;
        }, 1200);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Payment Gateway is currently unavailable.";
      setLocalError(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Professional Header */}
      <header className="relative bg-gradient-to-br from-[#053B90] via-[#042d6e] to-[#053B90] pt-6 sm:pt-8 pb-32 sm:pb-36 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 sm:mb-10 transition-colors group"
          >
            <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Dashboard</span>
          </button>
          
          <div className="text-center text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">Secure Checkout</h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-medium">
              Choose an active account to make a secure payment via our protected gateway
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto -mt-20 sm:-mt-24 px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#053B90]/5 p-5 sm:p-8 lg:p-10 border border-slate-200">
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="relative group">
              <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#053B90] transition-colors z-10" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Group Name, or Type..."
                className="w-full bg-slate-50 py-4 sm:py-5 pl-14 pr-5 rounded-2xl outline-none focus:ring-2 ring-[#053B90]/20 focus:bg-white transition-all font-medium border border-slate-200 focus:border-[#053B90]/30 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center py-20 sm:py-24">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-slate-200 rounded-full"></div>
                <div className="w-14 h-14 border-4 border-[#053B90] border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="mt-6 text-slate-600 font-semibold text-sm sm:text-base">Loading your accounts...</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-20 sm:py-24">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <IoFolderOpenOutline size={40} className="text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">No Accounts Found</h3>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                {searchQuery ? "Try adjusting your search terms" : "No active accounts available"}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">{filteredCards.length}</span> {filteredCards.length === 1 ? 'account' : 'accounts'} available
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredCards.map((item, idx) => (
                  <AccountCard 
                    key={idx} 
                    item={item} 
                    onPay={() => { setSelectedItem(item); setPaymentModal(true); setLocalError(null); }} 
                    formatDate={formatDate} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`${selectedItem?.bg} p-6 sm:p-8 text-white relative`}>
              <button 
                onClick={() => { setPaymentModal(false); setAmount(""); setLocalError(null); }} 
                className="absolute right-4 top-4 hover:scale-110 transition-transform text-white/90 hover:text-white"
              >
                <IoCloseCircle size={28} />
              </button>
              
              <IoShieldCheckmark size={36} className="mb-3 opacity-80" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Confirm Payment</h2>
              <p className="text-white/90 font-medium text-sm">For: {selectedItem?.title}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {/* Error Message */}
              {localError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
                  <IoWarningOutline className="text-red-500 flex-shrink-0 mt-0.5" size={22} />
                  <p className="text-red-700 text-sm font-semibold leading-tight">{localError}</p>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-8">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
                  Enter Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-bold text-slate-800">₹</span>
                  <input 
                    type="number" 
                    value={amount} 
                    autoFocus
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-4xl sm:text-5xl font-bold pl-10 sm:pl-12 pr-4 outline-none border-b-2 border-slate-200 focus:border-[#053B90] transition-all pb-3 text-slate-800 bg-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={processFinalPayment}
                disabled={isSending || !amount}
                className={`w-full py-4 sm:py-5 rounded-2xl text-white font-bold text-base sm:text-lg shadow-xl flex items-center justify-center gap-3 transition-all hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${selectedItem?.bg} hover:brightness-110 active:scale-[0.98]`}
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <IoArrowBack className="rotate-180" size={20} />
                  </>
                )}
              </button>
              
              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600">
                <IoShieldCheckmark size={18} />
                <p className="text-xs font-bold uppercase tracking-wider">Secure & Encrypted</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Redirect Modal */}
      {successModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white animate-in fade-in duration-500 px-6">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <IoCheckmarkDone size={48} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 tracking-tight">Payment Verified!</h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base mb-8">Redirecting to secure payment gateway...</p>
            
            <div className="flex justify-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-[#053B90] rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-[#053B90] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2.5 h-2.5 bg-[#053B90] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Account Card Component
function AccountCard({ item, onPay, formatDate }: any) {
  const Icon = item.icon;
  
  return (
    <div className="group bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-[#053B90]/20 transition-all duration-300 flex flex-col justify-between relative overflow-hidden hover:-translate-y-1">
      {/* Decorative Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} opacity-[0.04] -mr-12 -mt-12 rounded-full`}></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
         
          <span className={`text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg ${item.bg} text-white shadow-sm`}>
            {item.type}
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-[#053B90] transition-colors truncate">
            {item.customer_name || 'Active Member'}
          </h3>
          <p className="text-sm font-semibold text-slate-500 truncate">{item.title}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 border-t border-slate-100 pt-5 gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              {item.type === 'pigmy' ? 'Start Date' : item.label}
            </p>
            <p className="text-base font-bold text-slate-700">
              {item.type === 'pigmy' ? formatDate(item.start_date) : item.displayValue}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Status</p>
            <div className="inline-flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-base font-bold text-emerald-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
     <button
  onClick={onPay}
  className="
    group
    w-full
    flex items-center justify-center gap-2
    rounded-xl
    bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600
    py-3.5 sm:py-4
    text-sm font-bold uppercase tracking-wide text-white
    shadow-lg shadow-emerald-500/30
    transition-all duration-200
    hover:shadow-xl hover:shadow-emerald-500/40 hover:brightness-110
    active:scale-[0.97]
    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2
  "
>
  <span>Make Payment</span>

  <svg
    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M9 5l7 7-7 7"
    />
  </svg>
</button>

    </div>
  );
}