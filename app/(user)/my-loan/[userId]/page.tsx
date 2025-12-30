"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft,
  FaWallet,
  FaCashRegister,
  FaCheckCircle,
  FaCalculator,
  FaReceipt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaEllipsisH,
  FaRocket,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaShieldAlt,
  FaPlusCircle,
  FaTimesCircle,
  FaFileAlt,
  FaBusinessTime,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import url from "@/app/utils/urls/BaseUrl";

// --- Types ---
interface Loan {
  _id: string;
  loan_id: string;
  loan_amount: number;
  tenure: number;
  start_date: string;
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
const PURPOSE_OPTIONS = ["Personal", "Medical", "Education", "Business", "Others"];
const CONTACT_EMAIL = "info.mychits@gmail.com";
const CONTACT_PHONE = "+919483900777";

const MyLoan = ({params}:{params:Promise<{userId:string}>}) => {
  const router = useRouter();

  // User ID - replace with real auth logic
  const userId = use(params);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);

  const [paymentsSummary, setPaymentsSummary] = useState<PaymentsSummary | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  const [totalPayments, setTotalPayments] = useState<Payment[]>([]);
  const [totalPaymentsError, setTotalPaymentsError] = useState<string | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loanId, setLoanId] = useState<string | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // --- Form State ---
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    loanAmount: "",
    loanPurpose: "",
    otherPurpose: "",
  });

  // --- Fetch User Data for Form ---
  useEffect(() => {
    const fetchFreshProfile = async () => {
      if (!userId || !url) return;
      try {
        const profileUrl = `${url}/user/get-user-by-id/${userId}`;
        const response = await axios.get(profileUrl);
        const userData = response.data;

        if (userData) {
          setFormData((prev) => ({
            ...prev,
            fullName: userData.full_name || prev.fullName,
            phoneNumber: userData.phone_number || prev.phoneNumber,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch fresh user profile:", err);
      }
    };

    fetchFreshProfile();
  }, [userId]);

  // --- Fetch Loans ---
  useEffect(() => {
    if (!userId) return;
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${url}/loans/get-borrower-by-user-id/${userId}`;
        const response = await axios.get(apiUrl);
        setLoans(response.data || []);
      } catch (err) {
        setError("Failed to fetch loan data.");
        toast.error("Could not load loan data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoans();
  }, [userId]);

  // --- Fetch Loan Details & Payments ---
  useEffect(() => {
    if (!userId || !loanId) return;
    const fetchData = async () => {
      setIsDataLoading(true);
      setIsSummaryExpanded(false);
      try {
        const summaryApiUrl = `${url}/payment/user/${userId}/loan/${loanId}/summary`;
        const summaryResponse = await axios.get(summaryApiUrl);
        const summary = Array.isArray(summaryResponse.data)
          ? summaryResponse.data[0]
          : summaryResponse.data;
        setPaymentsSummary(summary);

        const paymentsApiUrl = `${url}/payment/loan/${loanId}/user/${userId}/total-docs/7/page/${currentPage}`;
        const paymentsResponse = await axios.get(paymentsApiUrl);
        setTotalPayments(paymentsResponse.data);
      } catch (err) {
        setPaymentsError("Failed to fetch loan data.");
        setTotalPaymentsError("Failed to fetch total payments.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, [userId, loanId, currentPage]);

  // --- Fetch Pagination ---
  useEffect(() => {
    if (!userId || !loanId) return;
    const fetchTotalPages = async () => {
      try {
        const apiUrl = `${url}/payment/loan/totalPages/user/${userId}/loan/${loanId}/total-docs/7`;
        const res = await axios.get(apiUrl);
        setTotalPages(res.data.totalPages || 0);
      } catch (err) {
        console.error("Failed to fetch total pages", err);
      }
    };
    fetchTotalPages();
  }, [userId, loanId]);

  // --- Format Number (Indian Style) ---
  const formatNumberIndianStyle = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return "0";
    const safeNum = isNaN(parseFloat(num as string)) ? 0 : parseFloat(num as string);
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeNum);
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
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // --- Handlers ---
  const handlePhonePress = () => {
    window.location.href = `tel:${CONTACT_PHONE}`;
  };

  const handleEmailPress = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}`;
  };

  const handleFormSubmit = async () => {
    const finalPurpose =
      formData.loanPurpose === "Others" ? formData.otherPurpose : formData.loanPurpose;

    if (!formData.loanAmount || !finalPurpose || !formData.fullName || !formData.phoneNumber) {
      toast.error("Please fill in all the fields and select a purpose.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      user_id: userId,
      loan_amount: Number(formData.loanAmount),
      loan_purpose: finalPurpose,
    };

    console.log("----------------------------");
    console.log("LOAN APPLICATION SUBMITTED");
    console.log("Data:", JSON.stringify(payload, null, 2));
    console.log("----------------------------");

    try {
      const res = await axios.post(`${url}/loans/loan-approval-request`, payload);
      if (res.status === 201 || res.status === 200) {
        setIsFormVisible(false);
        toast.success(res.data.message || "Your loan request was submitted successfully!", {
          autoClose: 4000,
        });
        setFormData({ ...formData, loanAmount: "", loanPurpose: "", otherPurpose: "" });
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Calculations ---
  let totalLoanBalance = 0;
  let loanAmount = 0;
  let totalRepayment = 0;

  if (loanId && !isDataLoading) {
    const currentLoan = loans.find((loan) => loan._id === loanId);
    loanAmount = parseFloat((currentLoan?.loan_amount || 0).toString());
    totalRepayment = parseFloat((paymentsSummary?.totalPaidAmount || 0).toString());
    totalLoanBalance = loanAmount - totalRepayment;
  }

  // --- Render Loading ---
  if (isLoading) {
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
      <header className="flex items-center justify-between px-4 py-4 bg-blue-900 sticky top-0 z-40">
        {loanId ? (
          <button
            onClick={() => {
              setLoanId(null);
              setCurrentPage(1);
            }}
            className="p-2"
          >
            <FaArrowLeft size={24} className="text-white" />
          </button>
        ) : (
          <button
            onClick={() => router.back()}
            className="p-2"
          >
            <FaArrowLeft size={24} className="text-white" />
          </button>
        )}
        <h1 className="text-xl font-bold">My Loan</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </header>

      <main className="p-4">
        {loanId ? (
          isDataLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-xl overflow-hidden border-l-4 border-cyan-500">
                <button
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                  className="w-full flex justify-between items-center p-5 bg-gray-50 border-b"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center mr-4">
                      <FaWallet className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Remaining Loan Balance</p>
                      <p className="text-blue-900 font-bold text-lg">
                        ₹ {formatNumberIndianStyle(totalLoanBalance)}
                      </p>
                    </div>
                  </div>
                  {isSummaryExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {isSummaryExpanded && !paymentsError && (
                  <div className="p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <FaCashRegister className="text-cyan-500 mr-2" />
                        <span className="text-gray-700">Original Loan Amount</span>
                      </div>
                      <span className="font-bold text-blue-900">
                        ₹ {formatNumberIndianStyle(loanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        <span className="text-gray-700">TOTAL PAID</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ₹ {formatNumberIndianStyle(totalRepayment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <FaCalculator className="text-blue-900 mr-2" />
                        <span className="text-gray-700">Remaining Balance</span>
                      </div>
                      <span className="font-bold text-blue-900">
                        ₹ {formatNumberIndianStyle(totalLoanBalance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">Payment History</h2>
                {totalPaymentsError ? (
                  <p className="text-red-500">{totalPaymentsError}</p>
                ) : totalPayments.length > 0 ? (
                  <div className="space-y-3">
                    {totalPayments.map((pay) => (
                      <div key={pay._id} className="flex items-center bg-white p-4 rounded-lg border">
                        <FaReceipt className="text-blue-900 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">Receipt: {pay.receipt_no}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(pay.pay_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-cyan-600">
                          ₹ {formatNumberIndianStyle(pay.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No payments found for this loan.</p>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded ${currentPage === 1 ? "text-gray-400" : "text-gray-800"}`}
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
                      className={`p-2 rounded ${currentPage === totalPages ? "text-gray-400" : "text-gray-800"}`}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {loans.length > 0 && (
              <button
                onClick={() => setIsFormVisible(true)}
                className="flex items-center justify-center bg-cyan-500 text-white py-3 rounded-lg"
              >
                <FaPlusCircle className="mr-2" /> Need another loan? Apply Here
              </button>
            )}

            {loans.length > 0 ? (
              loans.map((loan) => (
                <div key={loan._id} className="bg-white rounded-xl overflow-hidden border">
                  <div className="bg-blue-100 p-4 flex items-center">
                    <FaBusinessTime className="text-blue-900 mr-3" />
                    <div>
                      <p className="font-bold text-gray-800">Loan Account</p>
                      <p className="text-sm text-gray-600">ID: {loan.loan_id.substring(0, 10)}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Loan Amount</span>
                      <span className="font-bold text-blue-900">
                        ₹ {formatNumberIndianStyle(loan.loan_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tenure</span>
                      <span className="text-gray-800">{loan.tenure} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Start Date</span>
                      <span className="text-gray-800">
                        {new Date(loan.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLoanId(loan._id);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-green-500 text-white py-3 font-bold"
                  >
                    View Payments & Details
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-blue-900 rounded-xl overflow-hidden text-center">
                <div className="bg-blue-800 p-6">
                  <FaRocket className="text-white text-4xl mx-auto" />
                  <h2 className="text-xl font-bold text-white mt-3">Unlock Your Potential</h2>
                </div>
                <p className="text-white p-4">
                  You currently have no active loans. Ready to make a move? Take a loan and enjoy the
                  flexibility.
                </p>
                <p className="bg-cyan-500 text-white py-2 font-semibold">
                  Request your next loan instantly by applying below!
                </p>
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => setIsFormVisible(true)}
                    className="flex items-center justify-center bg-green-500 text-white w-full py-3 rounded-lg"
                  >
                    <FaFileAlt className="mr-2" /> Apply for Personal Loan
                  </button>
                  <button
                    onClick={handlePhonePress}
                    className="flex items-center justify-center border-2 border-green-500 text-green-500 w-full py-3 rounded-lg"
                  >
                    <FaPhone className="mr-2" /> Call Us: {CONTACT_PHONE}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsFormVisible(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h2 className="text-xl font-bold text-blue-900">Personal Loan Request Form</h2>
              <button onClick={() => setIsFormVisible(false)}>
                <IoMdClose size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Applicant Details:</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Enter Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number:</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Mobile Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Loan Amount (₹):
                </label>
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 250000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Loan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PURPOSE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, loanPurpose: option })}
                      className={`py-2 px-3 rounded border ${
                        formData.loanPurpose === option
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {formData.loanPurpose === "Others" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Please specify:</label>
                  <input
                    type="text"
                    value={formData.otherPurpose}
                    onChange={(e) => setFormData({ ...formData, otherPurpose: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your specific reason"
                  />
                </div>
              )}

              <div className="flex items-start bg-gray-100 p-3 rounded">
                <FaShieldAlt className="text-gray-500 mt-0.5 mr-2" />
                <p className="text-sm text-gray-600 italic">
                  I certify that information provided is true and accurate.
                </p>
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 rounded font-bold ${
                  isSubmitting ? "bg-blue-700" : "bg-blue-900"
                } text-white`}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLoan;

