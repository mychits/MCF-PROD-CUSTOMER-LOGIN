"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaWallet,
  FaChartLine,
  FaPeopleGroup,
  FaArrowRight,
} from "react-icons/fa";
import url from "@/app/utils/urls/BaseUrl";

// --- Types ---
interface ChitGroup {
  _id: string;
  group_name: string;
  payments?: { totalPaidAmount: number };
  profit?: { totalProfit: number };
}

// --- Component ---
const MyPassbook = () => {
  const router = useRouter();

  // Replace with real auth context in production
  const userId = "mock-user-id";

  const [chitGroups, setChitGroups] = useState<ChitGroup[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [enrolledGroupsCount, setEnrolledGroupsCount] = useState(0);

  // --- Fetch Passbook Data ---
  const fetchAllOverview = useCallback(async () => {
    if (!userId) {
      setIsLoadingData(false);
      setDataError("User ID not found. Please log in again.");
      return;
    }

    setIsLoadingData(true);
    setDataError(null);

    try {
      const response = await fetch(`${url}/enroll/get-user-tickets-report/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to load data");

      const data: ChitGroup[] = await response.json();

      const paid = data.reduce((sum, g) => sum + (g.payments?.totalPaidAmount || 0), 0);
      const profit = data.reduce((sum, g) => sum + (g.profit?.totalProfit || 0), 0);

      setTotalPaid(paid);
      setTotalProfit(profit);
      setChitGroups(data);
      setEnrolledGroupsCount(data.length);
    } catch (error) {
      console.error("Error fetching passbook data:", error);
      setDataError("Join a group to track your payments here!");
      toast.error("Could not load your passbook details. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllOverview();
  }, [fetchAllOverview]);

  // --- Format Indian Number ---
  const formatIndianNumber = (num: number): string => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // --- Handlers ---
  const handleViewAllChits = () => {
    router.push("/mygroups");
  };

  const handleDiscoverGroups = () => {
    router.push("/discover");
  };

  // --- Render Loading ---
  if (isLoadingData) {
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
      <header className="p-4 bg-blue-900 sticky top-0 z-40 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white">
          <FaArrowRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-xl font-bold">My Passbook</h1>
        <div className="w-8" />
      </header>

      <main className="p-4">
        <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">
            Your Financial Snapshot
          </h2>
          <p className="text-gray-600 text-center mb-6">
            A quick look at your investments & returns.
          </p>

          {dataError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-center">
              {dataError}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-900 rounded-xl p-4 flex items-center">
              <FaWallet className="text-white text-2xl mr-3" />
              <div>
                <p className="text-blue-200 text-sm">Total Investment</p>
                <p className="text-white font-bold">₹ {formatIndianNumber(totalPaid)}</p>
              </div>
            </div>

            <div className="bg-green-700 rounded-xl p-4 flex items-center">
              <FaChartLine className="text-white text-2xl mr-3" />
              <div>
                <p className="text-green-200 text-sm">Total Dividend / Profit</p>
                <p className="text-white font-bold">₹ {formatIndianNumber(totalProfit)}</p>
              </div>
            </div>

            <div className="bg-purple-700 rounded-xl p-4 flex items-center">
              <FaPeopleGroup className="text-white text-2xl mr-3" />
              <div>
                <p className="text-purple-200 text-sm">Enrolled Groups</p>
                <p className="text-white font-bold">{enrolledGroupsCount}</p>
              </div>
            </div>
          </div>

          {/* Chit Groups Section */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Your Chit Groups</h3>
            {(chitGroups.length > 0 || !dataError) && (
              <button
                onClick={handleViewAllChits}
                className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm"
              >
                View All <FaArrowRight className="ml-1" />
              </button>
            )}
          </div>

          {/* No Data State */}
          {chitGroups.length === 0 && !dataError && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Chit Groups Enrolled Yet!</h3>
              <p className="text-gray-600 mb-6">
                It looks like you haven't joined any groups. Explore available chits and start your journey!
              </p>
              <button
                onClick={handleDiscoverGroups}
                className="bg-blue-900 text-white px-6 py-2 rounded-lg font-medium"
              >
                Discover Groups
              </button>
            </div>
          )}

          {/* Chit Groups List (Optional - can expand later) */}
          {chitGroups.length > 0 && (
            <div className="space-y-3">
              {chitGroups.slice(0, 3).map((group) => (
                <div key={group._id} className="bg-white p-3 rounded-lg border">
                  <p className="font-medium text-gray-800">{group.group_name}</p>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Paid: ₹ {formatIndianNumber(group.payments?.totalPaidAmount || 0)}</span>
                    <span>Profit: ₹ {formatIndianNumber(group.profit?.totalProfit || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPassbook;