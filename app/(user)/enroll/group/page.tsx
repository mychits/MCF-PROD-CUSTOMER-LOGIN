"use client";
import React, { useEffect, useState, useCallback, use } from "react";
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoReceiptOutline,
  IoArrowUpCircleOutline,
  IoArrowDownCircleOutline,
  IoArrowBack,
  IoAlertCircleOutline,
} from "react-icons/io5";
import axios from "axios";
import baseUrl from "@/app/utils/urls/BaseUrl";
import { useRouter } from "next/navigation";

// --- Interfaces ---

interface GroupData {
  _id?: string;
  group_name?: string;
  group_value?: number;
  group_type?: "single" | "double";
}

interface PaymentTransaction {
  _id: string;
  receipt_no?: string;
  old_receipt_no?: string;
  pay_date: string;
  amount: number;
}

interface OverviewData {
  totalPaid?: number;
  totalProfit?: number;
  totalInvestment?: number;
  totalPayable?: number;
}

interface AuctionData {
  divident_head?: string | number;
}

interface SearchParams {
  searchParams: Promise<{ userId: string; groupId: string; ticket: string }>;
}

// --- Utilities ---

const formatNumberIndianStyle = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return "0";
  const parts = num.toString().split(".");
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? "." + parts[1] : "";
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return formattedOtherNumbers + "," + lastThree + decimalPart;
  }
  return lastThree + decimalPart;
};

// --- Main Component ---

export default function EnrollGroup({ searchParams }: SearchParams) {
  const router = useRouter();
  const { userId, groupId, ticket } = use(searchParams);

  const [groups, setGroups] = useState<GroupData>({});
  const [paymentData, setPaymentData] = useState<PaymentTransaction[]>([]);
  const [error, setError] = useState<null | string>(null);
  const [singleOverview, setSingleOverview] = useState<OverviewData>({});
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupRes, paymentRes, overviewRes, auctionRes] = await Promise.all([
        axios.get(`${baseUrl}/group/get-by-id-group/${groupId}`),
        axios.post(`${baseUrl}/payment/payment-list`, { groupId, userId, ticket }),
        axios.get(`${baseUrl}/single-overview?user_id=${userId}&group_id=${groupId}&ticket=${ticket}`),
        axios.get(`${baseUrl}/auction/get-group-auction/${groupId}`),
      ]);

      setGroups(groupRes.data);
      if (paymentRes.data.success) {
        const sorted = (paymentRes.data.data as PaymentTransaction[]).sort(
          (a, b) => new Date(b.pay_date).getTime() - new Date(a.pay_date).getTime()
        );
        setPaymentData(sorted);
      }
      setSingleOverview(overviewRes.data);
      setAuctions(auctionRes.data);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [groupId, userId, ticket]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toBePaidAmount =
    groups.group_type === "double"
      ? singleOverview.totalInvestment || 0
      : (singleOverview.totalPayable || 0) + parseFloat(String(auctions[0]?.divident_head || 0));

  const balanceAmount = toBePaidAmount - (singleOverview.totalPaid || 0);
  const isBalanceExcess = balanceAmount < 0;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-[#053B90] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#053B90] font-bold">Loading Details...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#053B90] font-sans pb-10">
      <header className="p-4 flex items-center text-white max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <IoArrowBack size={24} />
        </button>
        <span className="ml-4 font-bold text-lg uppercase tracking-wider">Group Overview</span>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-10 overflow-hidden border border-white/20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-emerald-600 mb-2">
              ₹ {formatNumberIndianStyle(groups.group_value)}
            </h2>
            <h1 className="text-2xl font-black text-slate-800 leading-tight mb-2">
              {groups.group_name}
            </h1>
            <div className="inline-block px-4 py-1 bg-slate-100 rounded-full">
              <span className="text-slate-500 font-bold text-sm">Ticket: </span>
              <span className="text-[#053B90] font-black">{ticket}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <SummaryBox
              icon={<IoWalletOutline size={26} />}
              amount={singleOverview.totalPaid || 0}
              label="Investment"
              containerClass="bg-[#004775] text-white"
            />
            <SummaryBox
              icon={<IoTrendingUpOutline size={26} />}
              amount={singleOverview.totalProfit || 0}
              label="Dividend / Profit"
              containerClass="bg-[#357500] text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatBorderBox
              icon={<IoWalletOutline size={22} />}
              amount={toBePaidAmount}
              label="TO BE PAID"
              color="text-orange-500"
              borderColor="border-orange-500"
            />
            <StatBorderBox
              icon={<IoReceiptOutline size={22} />}
              amount={singleOverview.totalPaid || 0}
              label="TOTAL PAID"
              color="text-purple-600"
              borderColor="border-purple-600"
            />
            <StatBorderBox
              icon={isBalanceExcess ? <IoArrowUpCircleOutline size={22} /> : <IoArrowDownCircleOutline size={22} />}
              amount={Math.abs(balanceAmount)}
              label={isBalanceExcess ? "BALANCE EXCESS" : "BALANCE OUTSTANDING"}
              color={isBalanceExcess ? "text-emerald-500" : "text-red-500"}
              borderColor={isBalanceExcess ? "border-emerald-500" : "border-red-500"}
            />
          </div>

          <div className="border-t border-slate-100 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter">Last 10 Transactions</h3>
              <button
                onClick={() => router.push(`/dashboard/view-more?userId=${userId}&groupId=${groupId}&ticket=${ticket}`)}
                className="bg-[#053B90] text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                VIEW MORE
              </button>
            </div>

            <div className="space-y-3">
              {paymentData.length > 0 ? (
                paymentData.slice(0, 10).map((transaction) => (
                  <TransactionItem key={transaction._id} transaction={transaction} />
                ))
              ) : (
                <div className="text-center py-10 opacity-40">
                  <IoAlertCircleOutline size={50} className="mx-auto mb-2" />
                  <p className="font-bold">No transactions found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Typed UI Sub-Components ---

interface SummaryBoxProps {
  icon: React.ReactNode;
  amount: number;
  label: string;
  containerClass: string;
}

function SummaryBox({ icon, amount, label, containerClass }: SummaryBoxProps) {
  return (
    <div className={`${containerClass} p-6 rounded-3xl flex flex-col items-center justify-center shadow-xl transition-transform hover:scale-[1.02]`}>
      <div className="mb-2 opacity-60">{icon}</div>
      <span className="text-2xl font-black">₹ {formatNumberIndianStyle(amount)}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">{label}</span>
    </div>
  );
}

interface StatBorderBoxProps {
  icon: React.ReactNode;
  amount: number;
  label: string;
  color: string;
  borderColor: string;
}

function StatBorderBox({ icon, amount, label, color, borderColor }: StatBorderBoxProps) {
  return (
    <div className={`border-2 ${borderColor} ${color} p-4 rounded-2xl flex flex-col items-center justify-center bg-white shadow-sm transition-colors`}>
      <div className="mb-2">{icon}</div>
      <span className="text-sm font-black text-center">₹ {formatNumberIndianStyle(amount)}</span>
      <span className="text-[8px] font-black text-center mt-1 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

interface TransactionItemProps {
  transaction: PaymentTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
      <div className="flex-1">
        <span className="block text-sm font-black text-slate-700 group-hover:text-[#053B90] transition-colors">
          #{transaction.receipt_no || transaction.old_receipt_no || "N/A"}
        </span>
      </div>
      <div className="flex-1 text-center">
        <span className="text-xs font-bold text-slate-400">
          {new Date(transaction.pay_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="flex-1 text-right">
        <span className="text-lg font-black text-[#053B90]">₹{formatNumberIndianStyle(transaction.amount)}</span>
      </div>
    </div>
  );
}