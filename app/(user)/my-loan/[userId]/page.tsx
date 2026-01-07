"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft, FaWallet, FaChevronLeft, FaChevronRight,
  FaPlusCircle, FaBusinessTime, FaReceipt
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import url from "@/app/utils/urls/BaseUrl";

// --- Helper Functions ---
const formatDateDDMMYYYY = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatNumberIndianStyle = (num: number | string | null | undefined): string => {
  const safeNum = parseFloat(num?.toString() || "0") || 0;
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(safeNum);
};

interface Params { params: Promise<{ userId: string }>; }

const MyLoan = ({ params }: Params) => {
  const router = useRouter();
  const paramsObject = use(params);
  const userId = paramsObject.userId;

  // States
  const [isLoading, setIsLoading] = useState(false); // Initial Load
  const [isDataLoading, setIsDataLoading] = useState(false); // Pagination/Loan Detail Load
  const [loans, setLoans] = useState<any[]>([]);
  const [paymentsSummary, setPaymentsSummary] = useState<any>(null);
  const [totalPayments, setTotalPayments] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loanId, setLoanId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Fetch Loans on Mount
  useEffect(() => {
    if (!userId) return;
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${url}/loans/get-borrower-by-user-id/${userId}`);
        setLoans(response.data || []);
      } catch (err) { toast.error("Could not load loans."); }
      finally { setIsLoading(false); }
    };
    fetchLoans();
  }, [userId]);

  // Fetch Detailed Data (Pagination & Summary)
  useEffect(() => {
    if (!userId || !loanId) return;
    const fetchData = async () => {
      setIsDataLoading(true); // Triggers the loader for pagination
      try {
        const [sumRes, payRes, totalRes] = await Promise.all([
          axios.get(`${url}/payment/user/${userId}/loan/${loanId}/summary`),
          axios.get(`${url}/payment/loan/${loanId}/user/${userId}/total-docs/7/page/${currentPage}`),
          axios.get(`${url}/payment/loan/totalPages/user/${userId}/loan/${loanId}/total-docs/7`)
        ]);
        setPaymentsSummary(Array.isArray(sumRes.data) ? sumRes.data[0] : sumRes.data);
        setTotalPayments(payRes.data);
        setTotalPages(totalRes.data.totalPages || 0);
      } catch (err) { toast.error("Error updating history."); }
      finally { setIsDataLoading(false); }
    };
    fetchData();
  }, [userId, loanId, currentPage]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 font-sans">
      <ToastContainer position="top-center" />

      {/* Nav */}
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => loanId ? setLoanId(null) : router.back()} className="p-2 hover:bg-blue-800 rounded-full">
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">My Loans</h1>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loanId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-bold flex items-center mb-6">
                  <FaWallet className="mr-2 text-blue-900" /> Loan Summary
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase">Original Amount</p>
                    <p className="text-lg font-bold text-blue-900">₹ {formatNumberIndianStyle(loans.find(l => l._id === loanId)?.loan_amount)}</p>
                  </div>
                  <div className="p-4 bg-blue-900 rounded-xl text-white shadow-md">
                    <p className="text-xs font-bold opacity-70 uppercase">Remaining Balance</p>
                    <p className="text-2xl font-bold">₹ {formatNumberIndianStyle((loans.find(l => l._id === loanId)?.loan_amount || 0) - (paymentsSummary?.totalPaidAmount || 0))}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History with Pagination Loader */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden relative min-h-[500px]">
                
                {/* Loader Overlay for Pagination */}
                {isDataLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-900 mb-2"></div>
                    <p className="text-sm font-semibold text-blue-900">Updating History...</p>
                  </div>
                )}

                <div className="p-6 border-b flex justify-between items-center bg-white">
                  <h2 className="text-lg font-bold">Payment History</h2>
                  
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4">Receipt</th>
                        <th className="px-6 py-4">Payment Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {totalPayments.map((pay) => (
                        <tr key={pay._id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-blue-900">#{pay.receipt_no}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDateDDMMYYYY(pay.pay_date)}</td>
                          <td className="px-6 py-4 text-right font-bold text-cyan-600">₹ {formatNumberIndianStyle(pay.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
                  <button 
                    disabled={currentPage === 1 || isDataLoading}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 border rounded-lg bg-white disabled:opacity-30 hover:bg-gray-100 transition-all"
                  >
                    <FaChevronLeft />
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={isDataLoading}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-900 text-white' : 'bg-white border text-gray-600 hover:border-blue-300'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button 
                    disabled={currentPage === totalPages || isDataLoading}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 border rounded-lg bg-white disabled:opacity-30 hover:bg-gray-100 transition-all"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View for Active Loans */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Active Loan Accounts</h2>
              <button onClick={() => setIsFormVisible(true)} className="flex items-center justify-center bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-600/20">
                <FaPlusCircle className="mr-2" /> Apply New Loan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <div key={loan._id} className="bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
                   <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-900">ID: {loan.loan_id.substring(0, 10)}</span>
                      <FaBusinessTime className="text-blue-900 opacity-20" />
                   </div>
                   <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm font-medium">Principal</span>
                        <span className="text-lg font-bold text-blue-900">₹ {formatNumberIndianStyle(loan.loan_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm font-medium">Issue Date</span>
                        <span className="text-sm font-bold">{formatDateDDMMYYYY(loan.start_date)}</span>
                      </div>
                   </div>
                   <button onClick={() => setLoanId(loan._id)} className="mt-auto bg-blue-900 text-white font-bold py-4 hover:bg-blue-800 transition-colors uppercase tracking-widest text-xs">
                     View Transactions
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Simplified Close Handler for Form */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           {/* Your existing form logic goes here - ensure dates shown there are also formatted */}
        </div>
      )}
    </div>
  );
};

export default MyLoan;