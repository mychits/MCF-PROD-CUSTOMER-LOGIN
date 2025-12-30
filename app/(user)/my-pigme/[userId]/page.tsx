"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft,
  FaSave,
  FaFingerprint,
  FaCheckCircle,
  FaWallet,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisH,
  FaPhone,
  FaEnvelope,
  FaTrendingUp,
} from "react-icons/fa";
import url from "@/app/utils/urls/BaseUrl";

// --- Types ---
interface PigmeAccount {
  _id: string;
  pigme_id: string;
}

interface Payment {
  _id: string;
  receipt_no: string;
  pay_date: string;
  amount: number;
}

interface PaymentsSummary {
  totalPaidAmount: number;
}

// --- Constants ---
const DOCS_PER_PAGE = 7;
const CONTACT_PHONE = "+919483900777";
const CONTACT_EMAIL = "info.mychits@gmail.com";

const PigmeList = () => {
  const router = useRouter();

  // Replace with real auth context
  const userId = "mock-user-id";

  const [isLoading, setIsLoading] = useState(true);
  const [pigmeAccounts, setPigmeAccounts] = useState<PigmeAccount[]>([]);
  const [selectedPigme, setSelectedPigme] = useState<PigmeAccount | null>(null);
  const [paymentsSummary, setPaymentsSummary] = useState<PaymentsSummary | null>(null);
  const [totalPayments, setTotalPayments] = useState<Payment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // --- Fetch Pigme Accounts ---
  const fetchPigmeAccounts = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${url}/pigme/get-pigme-customer-by-user-id/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const data = await res.json();
      const accounts = (data || []).map((item: any) => ({
        _id: item._id || item.pigme?._id,
        pigme_id: item.pigme_id || item.pigme?.pigme_id,
      }));
      setPigmeAccounts(accounts);
    } catch (err) {
      toast.error("Could not load Pigme accounts.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // --- Fetch Pigme Details ---
  useEffect(() => {
    if (!userId || !selectedPigme) return;
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [summaryRes, paymentsRes] = await Promise.all([
          fetch(`${url}/payment/user/${userId}/pigme/${selectedPigme._id}/summary`),
          fetch(`${url}/payment/pigme/${selectedPigme._id}/user/${userId}/total-docs/${DOCS_PER_PAGE}/page/${currentPage}`),
        ]);

        const summaryData = await summaryRes.json();
        const summary = Array.isArray(summaryData) ? summaryData[0] : summaryData;
        setPaymentsSummary(summary);

        const paymentsData = await paymentsRes.json();
        setTotalPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (err) {
        toast.error("Failed to load Pigme payment history.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, [userId, selectedPigme, currentPage]);

  // --- Fetch Total Pages ---
  useEffect(() => {
    if (!userId || !selectedPigme) return;
    const fetchTotalPages = async () => {
      try {
        const res = await fetch(`${url}/payment/pigme/totalPages/user/${userId}/pigme/${selectedPigme._id}/total-docs/${DOCS_PER_PAGE}`);
        const data = await res.json();
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error("Pagination error", err);
      }
    };
    fetchTotalPages();
  }, [userId, selectedPigme]);

  // --- Format Number (Indian Style) ---
  const formatNumberIndianStyle = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return "0.00";
    const safeNum = isNaN(parseFloat(num as string)) ? 0 : parseFloat(num as string);
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeNum);
  };

  // --- Handlers ---
  const handlePhonePress = () => {
    window.location.href = `tel:${CONTACT_PHONE}`;
  };

  const handleEmailPress = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}`;
  };

  // --- Pagination Logic ---
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const limit = 3;
    const start = Math.max(1, currentPage - Math.floor(limit / 2));
    const end = Math.min(totalPages, start + limit - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // --- Calculations ---
  const currentSavings = paymentsSummary ? parseFloat(paymentsSummary.totalPaidAmount.toString()) : 0;

  // --- Load Data on Mount ---
  useEffect(() => {
    fetchPigmeAccounts();
  }, [fetchPigmeAccounts]);

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900 text-white pb-24">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-blue-900 sticky top-0 z-40">
        {selectedPigme ? (
          <button
            onClick={() => {
              setSelectedPigme(null);
              setCurrentPage(1);
            }}
            className="p-2"
          >
            <FaArrowLeft size={24} className="text-white" />
          </button>
        ) : (
          <button onClick={() => router.back()} className="p-2">
            <FaArrowLeft size={24} className="text-white" />
          </button>
        )}
        <h1 className="text-xl font-bold">Pigmy Reports</h1>
        <div className="w-8" />
      </header>

      <main className="p-4">
        {selectedPigme ? (
          isDataLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Savings Card */}
              <div className="bg-white rounded-xl overflow-hidden border-l-4 border-orange-500">
                <div className="p-5 flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mr-4">
                    <FaTrendingUp className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Total Savings</p>
                    <p className="text-orange-500 font-bold text-2xl">
                      ₹ {formatNumberIndianStyle(currentSavings)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit History */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">Deposit History</h2>
                {totalPayments.length > 0 ? (
                  <div className="space-y-3">
                    {totalPayments.map((pay) => (
                      <div key={pay._id} className="flex items-center bg-white p-4 rounded-lg border">
                        <FaWallet className="text-orange-500 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">Receipt: {pay.receipt_no}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(pay.pay_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-orange-500">
                          ₹ {formatNumberIndianStyle(pay.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No deposits found for this Pigmy account.</p>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded disabled:opacity-30"
                    >
                      <FaChevronLeft />
                    </button>
                    {getPaginationNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={idx} className="px-3 py-1">
                          <FaEllipsisH />
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`w-10 h-10 rounded flex items-center justify-center ${
                            currentPage === page
                              ? "bg-blue-900 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded disabled:opacity-30"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {pigmeAccounts.length > 0 ? (
              pigmeAccounts.map((pigme) => (
                <div key={pigme._id} className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div className="bg-orange-100 p-4 flex items-center">
                    <FaSave className="text-orange-500 mr-3" />
                    <div>
                      <p className="font-bold text-gray-800">Pigmy Account</p>
                      <p className="text-sm text-gray-600">ID: {pigme.pigme_id}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center">
                      <FaFingerprint className="text-gray-600 mr-2" />
                      <span className="text-gray-700">Account ID: {pigme.pigme_id}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="text-gray-700">Status: Active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPigme(pigme)}
                    className="w-full bg-orange-500 text-white py-3 font-bold"
                  >
                    View Deposits & Summary
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-orange-500 rounded-xl overflow-hidden text-center p-4">
                <div className="bg-orange-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaWallet className="text-white text-2xl" />
                </div>
                <h2 className="font-bold text-white">Start Your Savings Journey</h2>
                <p className="text-white text-sm mt-2 mb-3">
                  You currently have no active Pigmy savings accounts. Start saving now!
                </p>
                <p className="bg-blue-900 text-white py-1 font-semibold text-sm">
                  Request your new Pigmy account by contacting our executive now!
                </p>
                <div className="space-y-2 mt-3">
                  <button
                    onClick={handlePhonePress}
                    className="flex items-center justify-center bg-green-500 text-white w-full py-2 rounded-lg text-sm"
                  >
                    <FaPhone className="mr-1" /> Request Pigmy: {CONTACT_PHONE}
                  </button>
                  <button
                    onClick={handleEmailPress}
                    className="flex items-center justify-center border-2 border-orange-500 text-orange-500 w-full py-2 rounded-lg text-sm"
                  >
                    <FaEnvelope className="mr-1" /> Email: {CONTACT_EMAIL}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PigmeList;