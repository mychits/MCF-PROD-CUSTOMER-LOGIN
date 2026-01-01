"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { IoChevronBack, IoTrendingUpOutline, IoReceiptOutline, IoCallOutline, IoMailOutline } from "react-icons/io5";
import axios from "axios";
import url from "@/app/utils/urls/BaseUrl";
interface Params{
  params:Promise<{userId:string}>
}
const ReportList = ({ params }:Params) => {
  const router = useRouter();
  const { userId } = use(params);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(`${url}/pigme/get-pigme-customer-by-user-id/${userId}`);
        setAccounts(res.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAccounts();
  }, [userId]);

  const viewHistory = async (account: any) => {
    setLoading(true);
    setSelectedAccount(account);
    try {
      const [sumRes, payRes] = await Promise.all([
        axios.get(`${url}/payment/user/${userId}/pigme/${account._id}/summary`),
        axios.get(`${url}/payment/pigme/${account._id}/user/${userId}/total-docs/20/page/1`)
      ]);
      setSummary(Array.isArray(sumRes.data) ? sumRes.data[0] : sumRes.data);
      setPayments(payRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#053B90] text-white p-6 shadow-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => selectedAccount ? setSelectedAccount(null) : router.back()} className="flex items-center gap-2 font-bold hover:opacity-70">
            <IoChevronBack size={24} /> Back
          </button>
          <h1 className="text-xl font-black uppercase tracking-tight">Pigmy Reports</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>
        ) : !selectedAccount ? (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4">Your Accounts</h2>
            {accounts.length > 0 ? accounts.map((acc: any, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:shadow-xl">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">P</div>
                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Pigmy Account</h3>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-12">ID: {acc.pigme_id || "N/A"}</p>
                </div>
                <button onClick={() => viewHistory(acc)} className="bg-[#053B90] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 transition-all hover:bg-blue-800 active:scale-95">
                  View History
                </button>
              </div>
            )) : (
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-[2.5rem] p-10 text-white text-center">
                 <IoTrendingUpOutline size={64} className="mx-auto mb-6 opacity-30" />
                 <h2 className="text-2xl font-black mb-4">No Savings Found</h2>
                 <p className="opacity-80 text-sm leading-relaxed mb-10">Start your micro-savings journey today. Contact our executive to open your Pigmy account.</p>
                 <div className="flex flex-col gap-4">
                   <a href="tel:+919483900777" className="bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3"><IoCallOutline /> Request Account</a>
                   <a href="mailto:info.mychits@gmail.com" className="bg-white/10 text-white border border-white/20 py-4 rounded-2xl font-bold flex items-center justify-center gap-3"><IoMailOutline /> Email Us</a>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* DETAIL VIEW */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-xl shadow-blue-900/5 mb-10 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-900"><IoTrendingUpOutline size={120} /></div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Savings</p>
               <h2 className="text-5xl font-black text-blue-900 tracking-tighter">₹ {summary?.totalPaidAmount || "0.00"}</h2>
               <div className="h-px w-20 bg-slate-100 mx-auto my-6" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Account: {selectedAccount.pigme_id}</p>
            </div>

            <h3 className="font-black text-slate-800 uppercase tracking-widest mb-6 px-2">Deposit History</h3>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               {payments.length > 0 ? payments.map((p: any, i) => (
                 <div key={i} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><IoReceiptOutline /></div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Receipt: {p.receipt_no}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(p.pay_date).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-blue-700">₹ {p.amount}</p>
                    </div>
                 </div>
               )) : <p className="p-10 text-center text-slate-400 font-bold uppercase text-xs">No records found</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportList;