// Enrollment.tsx

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaFilter,
  FaInfoCircle,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaHourglassHalf,
  FaStar,
} from "react-icons/fa";
import { NetworkContext } from "../context/NetworkProvider";
import { ContextProvider } from "../context/UserProvider";

// Helper function to format numbers in Indian style
const formatNumberIndianStyle = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return "0";
  }

  const parts = num.toString().split(".");
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? "." + parts[1] : "";
  let isNegative = false;

  if (integerPart.startsWith("-")) {
    isNegative = true;
    integerPart = integerPart.substring(1);
  }

  // Logic for Indian style (2-digit grouping after the first 3)
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== "") {
    const formattedOtherNumbers = otherNumbers.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      ","
    );
    integerPart = formattedOtherNumbers + "," + lastThree;
  } else {
    integerPart = lastThree;
  }

  return (isNegative ? "-" : "") + integerPart + decimalPart;
};

// Helper function to get vacant seats
const getVacantSeats = (card: any): number => {
  // 1. Prioritize the new app_display_vacany_seat field
  const appDisplaySeats = parseInt(card.app_display_vacany_seat, 10);
  if (!isNaN(appDisplaySeats) && appDisplaySeats > 0) {
    return appDisplaySeats;
  }

  // 2. Fallback: Calculate vacant seats using old logic
  const totalMembers = parseInt(card.number_of_members, 10) || 0;
  const enrolledMembers = parseInt(card.enrolled_members, 10) || 0;

  const calculatedSeats = totalMembers - enrolledMembers;

  // Ensure the result is not negative
  return Math.max(0, calculatedSeats);
};

// Group colors configuration
const groupColors: Record<
  string,
  {
    primary: string;
    secondary: string;
    text: string;
    darkText: string;
    buttonBackground: string;
    selectedBorder: string;
    iconColor: string;
  }
> = {
  new: {
    primary: "#E0F7FA",
    secondary: "#00BCD4",
    text: "#00BCD4",
    darkText: "#263238",
    buttonBackground: "#00BCD4",
    selectedBorder: "#00BCD4",
    iconColor: "#00BCD4",
  },
  ongoing: {
    primary: "#E8F5E9",
    secondary: "#4CAF50",
    text: "#4CAF50",
    darkText: "#263232",
    buttonBackground: "#4CAF50",
    selectedBorder: "#4CAF50",
    iconColor: "#4CAF50",
  },
  ended: {
    primary: "#FBE9E7",
    secondary: "#FF7043",
    text: "#FF7043",
    darkText: "#263238",
    buttonBackground: "#FF7043",
    selectedBorder: "#FF7043",
    iconColor: "#FF7043",
  },
  members_5_value_1000: {
    primary: "#FFFDE7",
    secondary: "#FFC107",
    text: "#E65100",
    darkText: "#5D4037",
    buttonBackground: "#FF8F00",
    selectedBorder: "#FF8F00",
    iconColor: "#FFC107",
  },
  members_10_value_500: {
    primary: "#F3E5F5",
    secondary: "#9C27B0",
    text: "#4A148C",
    darkText: "#424242",
    buttonBackground: "#7B1FA2",
    selectedBorder: "#6A1B9A",
    iconColor: "#9C27B0",
  },
  value_very_high: {
    primary: "#E3F2FD",
    secondary: "#2196F3",
    text: "#1565C0",
    darkText: "#1A237E",
    buttonBackground: "#1976D2",
    selectedBorder: "#0D47A1",
    iconColor: "#2196F3",
  },
  small_members_high_value: {
    primary: "#FCE4EC",
    secondary: "#EC407A",
    text: "#C2185B",
    darkText: "#880E4F",
    buttonBackground: "#D81B60",
    selectedBorder: "#AD1457",
    iconColor: "#EC407A",
  },
  large_members_any_value: {
    primary: "#F1F8E9",
    secondary: "#8BC34A",
    text: "#558B2F",
    darkText: "#33691E",
    buttonBackground: "#689F38",
    selectedBorder: "#33691E",
    iconColor: "#8BC34A",
  },
  high_performing: {
    primary: "#F0FFF4",
    secondary: "#388E3C",
    text: "#1B5E20",
    darkText: "#33691E",
    buttonBackground: "#4CAF50",
    selectedBorder: "#2E7D32",
    iconColor: "#388E3C",
  },
  low_engagement: {
    primary: "#FFF8E1",
    secondary: "#FFB300",
    text: "#E65100",
    darkText: "#BF360C",
    buttonBackground: "#FB8C00",
    selectedBorder: "#EF6C00",
    iconColor: "#FFB300",
  },
  very_small_group: {
    primary: "#F3E5F5",
    secondary: "#EF6C00",
    text: "#4A148C",
    darkText: "#2D0B4B",
    buttonBackground: "#EF6C00",
    selectedBorder: "#EF6C00",
    iconColor: "#EF6C00",
  },
  medium_sized_group: {
    primary: "#E1F5FE",
    secondary: "#03A9F4",
    text: "#0277BD",
    darkText: "#01579B",
    buttonBackground: "#29B6F6",
    selectedBorder: "#0288D1",
    iconColor: "#03A9F4",
  },
  tech_innovation: {
    primary: "#E0F7FA",
    secondary: "#00BCD4",
    text: "#00838F",
    darkText: "#006064",
    buttonBackground: "#00ACC1",
    selectedBorder: "#00838F",
    iconColor: "#00BCD4",
  },
  community_outreach: {
    primary: "#FCE4EC",
    secondary: "#E91E63",
    text: "#C2185B",
    darkText: "#880E4F",
    buttonBackground: "#D81B60",
    selectedBorder: "#AD1457",
    iconColor: "#E91E63",
  },
  members_value_other: {
    primary: "#F5F5DC",
    secondary: "#A1887F",
    text: "#5D4037",
    darkText: "#3E2723",
    buttonBackground: "#8D6E63",
    selectedBorder: "#4E342E",
    iconColor: "#795548",
  },
  creative_arts: {
    primary: "#FFF3E0",
    secondary: "#FF9800",
    text: "#E65100",
    darkText: "#BF360C",
    buttonBackground: "#FB8C00",
    selectedBorder: "#EF6C00",
    iconColor: "#FF9800",
  },
  health_wellness: {
    primary: "#E0F2F7",
    secondary: "#607D8B",
    text: "#37474F",
    darkText: "#263238",
    buttonBackground: "#78909C",
    selectedBorder: "#455A64",
    iconColor: "#607D8B",
  },
  finance_investment: {
    primary: "#E6EE9C",
    secondary: "#AFB42B",
    text: "#827717",
    darkText: "#33691E",
    buttonBackground: "#CDDC39",
    selectedBorder: "#9E9D24",
    iconColor: "#AFB42B",
  },
  environmental_sustainability: {
    primary: "#E8F5E9",
    secondary: "#388E3C",
    text: "#1B5E20",
    darkText: "#1B5E20",
    buttonBackground: "#4CAF50",
    selectedBorder: "#2E7D32",
    iconColor: "#388E3C",
  },
  education_development: {
    primary: "#EDE7F6",
    secondary: "#673AB7",
    text: "#4527A0",
    darkText: "#311B92",
    buttonBackground: "#7E57C2",
    selectedBorder: "#5E35B1",
    iconColor: "#673AB7",
  },
  social_impact: {
    primary: "#FFE0B2",
    secondary: "#FB8C00",
    text: "#EF6C00",
    darkText: "#BF360C",
    buttonBackground: "#FF9800",
    selectedBorder: "#F57C00",
    iconColor: "#FB8C00",
  },
  sports_fitness: {
    primary: "#FFEBF0",
    secondary: "#D81B60",
    text: "#C2185B",
    darkText: "#880E4F",
    buttonBackground: "#E91E63",
    selectedBorder: "#AD1457",
    iconColor: "#D81B60",
  },
  travel_adventure: {
    primary: "#E0F7FA",
    secondary: "#00ACC1",
    text: "#00838F",
    darkText: "#006064",
    buttonBackground: "#00BCD4",
    selectedBorder: "#00838F",
    iconColor: "#00ACC1",
  },
  culinary_arts: {
    primary: "#FFFDE7",
    secondary: "#FFD600",
    text: "#FFAB00",
    darkText: "#FF6F00",
    buttonBackground: "#FFC107",
    selectedBorder: "#FF8F00",
    iconColor: "#FFD600",
  },
  default: {
    primary: "#ECEFF1",
    secondary: "#90A4AE",
    text: "#455A64",
    darkText: "#263238",
    buttonBackground: "#90A4AE",
    selectedBorder: "#78909C",
    iconColor: "#78909C",
  },
};

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const Enrollment = () => {
  const router = useRouter();
  const { groupFilter } = router.query;
  const [appUser, setAppUser] = useContext(ContextProvider);
  const userId = appUser?.userId || appUser?.user_id;
  const userName = appUser?.name || appUser?.user_name || "User";
  const [selectedCardIndex, setSelectedCardIndex] = useState<string | null>(
    null
  );
  const [cardsData, setCardsData] = useState<any[]>([]);

  const initialGroupFilter = "NewGroups";
  const [selectedGroup, setSelectedGroup] = useState<string>(
    (groupFilter as string) || initialGroupFilter
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { isConnected, isInternetReachable } = useContext(NetworkContext);
  const [moreFiltersModalVisible, setMoreFiltersModalVisible] = useState(false);

  const [isJoining, setIsJoining] = useState(false);
  const [joinGroupId, setJoinGroupId] = useState<string | null>(null);

  // Fetch groups from API
  const fetchGroups = async () => {
    if (!isConnected || !isInternetReachable) {
      setIsLoading(false);
      setError(
        "No internet connection. Please check your network and try again."
      );
      setCardsData([]);
      toast.error("Cannot load groups without internet connection.", {
        position: "bottom-right",
        autoClose: 4000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    let endpoint = `${API_URL}/group/get-group/`;
    if (selectedGroup === "AllGroups") {
      endpoint = `${API_URL}/group/filter/AllGroups`;
    } else if (selectedGroup === "NewGroups") {
      endpoint = `${API_URL}/group/filter/NewGroups`;
    } else if (selectedGroup === "OngoingGroups") {
      endpoint = `${API_URL}/group/filter/OngoingGroups`;
    } else if (selectedGroup === "VacantGroups") {
      endpoint = `${API_URL}/group/filter/VacantGroups`;
    }

    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();

        let groupsData = data?.groups || [];

        if (selectedGroup === "VacantGroups") {
          // Filter using the helper function that applies the fallback logic
          const vacantGroups = groupsData.filter((group) => {
            return getVacantSeats(group) > 0;
          });
          setCardsData(vacantGroups);
        } else {
          setCardsData(groupsData);
        }

        setIsLoading(false);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to load groups. Please try again."
        );
        setIsLoading(false);
      }
    } catch (error) {
      setError(
        "An unexpected error occurred while fetching groups. Please retry."
      );
      setIsLoading(false);
      toast.error("Could not fetch groups. Please retry.", {
        position: "bottom-right",
        autoClose: 4000,
      });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedGroup, isConnected, isInternetReachable]);

  useEffect(() => {
    if (groupFilter) {
      const normalizedGroupFilter =
        groupFilter === "New Groups"
          ? "NewGroups"
          : groupFilter === "Ongoing Groups"
          ? "OngoingGroups"
          : groupFilter;
      if (normalizedGroupFilter !== selectedGroup) {
        setSelectedGroup(normalizedGroupFilter);
      }
    }
  }, [groupFilter]);

  // Get group type based on dates
  const getGroupType = (card: any): string => {
    const now = new Date();
    const startDate = new Date(card.start_date);
    const endDate = new Date(card.end_date);
    if (startDate > now) {
      return "new";
    } else if (startDate <= now && endDate > now) {
      return "ongoing";
    } else if (endDate <= now) {
      return "ended";
    }
    return "default";
  };

  // Get custom card color key based on group properties
  const getCustomCardColorKey = (card: any): string => {
    const members =
      typeof card.group_members === "number"
        ? card.group_members
        : parseInt(card.group_members);
    const value =
      typeof card.group_value === "number"
        ? card.group_value
        : parseFloat(card.group_value);
    const performanceStatus = card.performance_status;
    const category = card.category;

    if (category === "tech_innovation") return "tech_innovation";
    if (category === "community_outreach") return "community_outreach";
    if (category === "creative_arts") return "creative_arts";
    if (category === "health_wellness") return "health_wellness";
    if (category === "finance_investment") return "finance_investment";
    if (category === "environmental_sustainability")
      return "environmental_sustainability";
    if (category === "education_development") return "education_development";
    if (category === "social_impact") return "social_impact";
    if (category === "sports_fitness") return "sports_fitness";
    if (category === "travel_adventure") return "travel_adventure";
    if (category === "culinary_arts") return "culinary_arts";

    if (performanceStatus === "high") return "high_performing";
    if (performanceStatus === "low") return "low_engagement";
    if (value > 10000) return "value_very_high";
    if (members >= 1 && members <= 2) return "very_small_group";
    if (members >= 4 && members <= 10) return "medium_sized_group";
    if (members > 20) return "large_members_any_value";
    if (members === 5 && value === 1000) return "members_5_value_1000";
    if (members === 10 && value === 500) return "members_10_value_500";
    if (isNaN(members) || isNaN(value)) return "default";
    return "members_value_other";
  };

  // Get display cards based on selected group filter
  const getDisplayCards = () => {
    const now = new Date();
    const newGroups = cardsData.filter(
      (card) => new Date(card.start_date) > now
    );
    const ongoingGroups = cardsData.filter((card) => {
      const startDate = new Date(card.start_date);
      const endDate = new Date(card.end_date);
      return startDate <= now && endDate > now;
    });
    const endedGroups = cardsData.filter(
      (card) => new Date(card.end_date) <= now
    );

    // Filter vacant groups using the helper function
    const vacantGroups = cardsData.filter((card) => getVacantSeats(card) > 0);

    if (selectedGroup === "AllGroups") {
      return {
        new: newGroups,
        ongoing: ongoingGroups,
        ended: endedGroups,
        vacant: [],
      };
    } else if (selectedGroup === "NewGroups") {
      return { new: cardsData, ongoing: [], ended: [], vacant: [] };
    } else if (selectedGroup === "OngoingGroups") {
      return { new: [], ongoing: cardsData, ended: [], vacant: [] };
    } else if (selectedGroup === "VacantGroups") {
      // cardsData is already filtered in fetchGroups when selectedGroup is "VacantGroups"
      return { new: [], ongoing: [], ended: [], vacant: cardsData };
    }
    return { new: [], ongoing: [], ended: [], vacant: [] };
  };

  // Handle enrollment details view
  const handleEnrollment = (card: any) => {
    if (!isConnected || !isInternetReachable) {
      setModalMessage(
        "You are offline. Please connect to the internet to view details."
      );
      setEnrollmentModalVisible(true);
      return;
    }
    const selectedGroupId = card._id;
    if (selectedGroupId) {
      router.push(`/enroll-form?groupId=${selectedGroupId}&userId=${userId}`);
    } else {
      setModalMessage("Error: Could not retrieve group ID.");
      setEnrollmentModalVisible(true);
    }
  };

  // Handle direct enrollment (joining)
  const handleJoinNow = async (card: any) => {
    if (!isConnected || !isInternetReachable) {
      toast.error("Please check your network and try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const selectedGroupId = card._id;

    if (!selectedGroupId) {
      toast.error("Could not retrieve group ID for enrollment.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    // Use the helper function for the check
    const vacantSeats = getVacantSeats(card);

    if (vacantSeats === 0) {
      toast.info("This group currently has no vacant seats.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    // Navigate directly to EnrollForm
    router.push(`/enroll-form?groupId=${selectedGroupId}&userId=${userId}`);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    } as const;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", options);
  };

  // Get filter display name
  const getFilterDisplayName = (filterKey: string): string => {
    switch (filterKey) {
      case "NewGroups":
        return "New Group";
      case "OngoingGroups":
        return "Ongoing";
      case "VacantGroups":
        return "Vacant Group";
      case "AllGroups":
        return "Group";
      default:
        return "Group";
    }
  };

  // InstallmentRow component
  const InstallmentRow = ({
    amount,
    label,
    timeUnit,
    colors,
  }: {
    amount: number | undefined | null;
    label: string;
    timeUnit: string;
    colors: any;
  }) => {
    if (amount === undefined || amount === null || amount === "") return null;

    const formattedAmount = formatNumberIndianStyle(amount);
    if (formattedAmount === "0") return null;

    return (
      <div
        className="flex justify-between items-center px-2 py-2 rounded-md border-l-4"
        style={{
          backgroundColor: colors.primary,
          borderLeftColor: colors.secondary,
        }}>
        <span className="text-xs font-bold" style={{ color: colors.darkText }}>
          {label}:
        </span>
        <span className="text-sm font-bold" style={{ color: colors.secondary }}>
          ₹ {formattedAmount} / {timeUnit}
        </span>
      </div>
    );
  };

  // CardContent component
  const CardContent = ({
    card,
    colors,
    isSelected,
    currentFilter,
  }: {
    card: any;
    colors: any;
    isSelected: boolean;
    currentFilter: string;
  }) => {
    const vacantSeats = getVacantSeats(card);
    const isCurrentCardJoining = isJoining && joinGroupId === card._id;
    const badgeText = getFilterDisplayName(currentFilter);
    const shouldShowBadge = !(
      currentFilter === "AllGroups" && getGroupType(card) === "ended"
    );
    const monthlyInstallment = card.monthly_installment;

    return (
      <>
        <div className="flex flex-col mb-1 relative">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => setSelectedCardIndex(card._id)}
              className="pr-2 mr-1">
              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
              )}
            </button>

            <div className="flex-1 ml-0 overflow-hidden">
              <div className="flex items-baseline mb-0">
                <span
                  className="text-2xl font-bold mr-1.5"
                  style={{ color: "#FF8C00" }}>
                  ₹ {formatNumberIndianStyle(card.group_value)}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: colors.darkText }}>
                  Chit Value
                </span>
              </div>

              <h3
                className="text-base font-bold mt-0.5 truncate"
                style={{ color: isSelected ? colors.text : colors.darkText }}>
                {card.group_name}
              </h3>
            </div>

            <div className="flex items-center ml-2.5">
              {shouldShowBadge && (
                <div
                  className="px-1.5 py-0.75 rounded"
                  style={{ backgroundColor: colors.secondary }}>
                  <span className="text-white text-xs font-bold">
                    {badgeText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="h-px w-full my-2"
          style={{ backgroundColor: "#E0E0E0" }}
        />

        <div className="flex justify-between mb-2.5">
          <div className="flex-1 text-center px-0.5">
            <p
              className="text-xs font-medium"
              style={{ color: colors.darkText }}>
              Starts
            </p>
            <p
              className="text-xs font-bold text-center"
              style={{ color: isSelected ? colors.text : colors.darkText }}>
              {formatDate(card.start_date)}
            </p>
          </div>
          <div className="flex-1 text-center px-0.5">
            <p
              className="text-xs font-medium"
              style={{ color: colors.darkText }}>
              Ends
            </p>
            <p
              className="text-xs font-bold text-center"
              style={{ color: isSelected ? colors.text : colors.darkText }}>
              {formatDate(card.end_date)}
            </p>
          </div>
          <div className="flex-1 text-center px-0.5">
            <p
              className="text-xs font-medium"
              style={{ color: colors.darkText }}>
              Members
            </p>
            <p
              className="text-xs font-bold text-center"
              style={{ color: isSelected ? colors.text : colors.darkText }}>
              {card.group_members}
            </p>
          </div>
          <div className="flex-1 text-center px-0.5">
            <p
              className="text-xs font-medium"
              style={{ color: colors.darkText }}>
              Vacant
            </p>
            <p
              className="text-xs font-bold text-center px-1.5 py-0.5 rounded-full overflow-hidden"
              style={{
                backgroundColor: "#1de94cff",
                color: "#060806ff",
              }}>
              {vacantSeats}
            </p>
          </div>
        </div>

        {/* Installment Details */}
        <div
          className="mt-1.5 mb-2.5 rounded-lg border overflow-hidden px-1 py-1"
          style={{
            backgroundColor: colors.primary,
            borderColor: "#E0E0E0",
          }}>
          <InstallmentRow
            amount={monthlyInstallment}
            label="Monthly Installment"
            timeUnit="month"
            colors={colors}
          />
        </div>

        <div
          className="w-full flex items-center mt-1.5 flex-row justify-end px-0 gap-2 border-t pt-2"
          style={{ borderTopColor: "#E0E0E0" }}>
          <button
            className={`flex items-center py-2 px-2.5 rounded-md border-2 bg-transparent min-w-[100px] justify-center flex-1 ${
              !isConnected || !isInternetReachable || isCurrentCardJoining
                ? "opacity-50"
                : ""
            }`}
            style={{
              borderColor: colors.secondary,
            }}
            onClick={() => handleEnrollment(card)}
            disabled={
              !isConnected || !isInternetReachable || isCurrentCardJoining
            }>
            <span
              className="text-xs font-bold mr-0.75"
              style={{ color: colors.secondary }}>
              Details
            </span>
            <FaInfoCircle size={16} color={colors.secondary} />
          </button>
          <button
            className={`py-2 px-3.5 rounded-md min-w-[100px] justify-center items-center flex-1 ${
              !isConnected ||
              !isInternetReachable ||
              isCurrentCardJoining ||
              vacantSeats === 0
                ? "opacity-50"
                : ""
            }`}
            style={{
              backgroundColor: colors.secondary,
            }}
            onClick={() => handleJoinNow(card)}
            disabled={
              !isConnected ||
              !isInternetReachable ||
              isCurrentCardJoining ||
              vacantSeats === 0
            }>
            {isCurrentCardJoining ? (
              <FaSpinner className="animate-spin text-white" />
            ) : (
              <span className="text-white text-sm font-bold">
                {vacantSeats === 0 ? "No Seats" : "Join Now"}
              </span>
            )}
          </button>
        </div>
      </>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-blue-800 text-4xl" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
        <FaExclamationCircle size={50} color="#DC143C" />
        <p className="text-red-600 text-center mt-2.5 font-bold">{error}</p>
        <button
          className="mt-5 bg-blue-800 py-3 px-6 rounded-lg shadow-lg"
          onClick={fetchGroups}>
          <span className="text-white text-base font-bold">Retry</span>
        </button>
      </div>
    );
  }

  // Get display cards
  const {
    new: newGroups,
    ongoing: ongoingGroups,
    ended: endedGroups,
    vacant: vacantGroups,
  } = getDisplayCards();

  // Determine which groups to display
  let groupsToDisplay: any[] = [];
  let noGroupsMessage = "";
  let noGroupsTitle = "";

  if (selectedGroup === "NewGroups") {
    groupsToDisplay = newGroups;
    noGroupsTitle = "No New Groups";
    noGroupsMessage =
      "No new groups found. Check back later for exciting additions!";
  } else if (selectedGroup === "OngoingGroups") {
    groupsToDisplay = ongoingGroups;
    noGroupsTitle = "No Ongoing Groups";
    noGroupsMessage = "No ongoing groups found. Check back later!";
  } else if (selectedGroup === "VacantGroups") {
    groupsToDisplay = vacantGroups;
    noGroupsTitle = "No Vacant Groups";
    noGroupsMessage =
      "There are no groups with vacant seats at the moment. Please check back later.";
  } else if (selectedGroup === "AllGroups") {
    groupsToDisplay = [...newGroups, ...ongoingGroups, ...endedGroups];
    noGroupsTitle = "No Groups Available";
    noGroupsMessage =
      "It looks like there are no groups that match your current filter. Try changing the filter or check back later for new additions!";
  }

  return (
    <div className="min-h-screen bg-blue-800 pt-4">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Group Enrollment</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {userName}</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-100 rounded-xl p-4 pb-6">
          {/* Filter Chips */}
          <div className="px-4 pb-2.5 overflow-x-auto">
            <div className="flex gap-2.5 items-center min-w-max">
              <button
                className={`flex items-center py-2 px-4 rounded-md shadow-sm justify-center ${
                  selectedGroup === "NewGroups"
                    ? "bg-blue-800 shadow-md"
                    : "bg-blue-50"
                }`}
                onClick={() => setSelectedGroup("NewGroups")}>
                <FaStar
                  size={16}
                  color={selectedGroup === "NewGroups" ? "#fff" : "#666"}
                  className="mr-0.5"
                />
                <span
                  className={`text-xs font-semibold ${
                    selectedGroup === "NewGroups"
                      ? "text-white"
                      : "text-gray-700"
                  }`}>
                  New Groups
                </span>
              </button>
              <button
                className={`flex items-center py-2 px-4 rounded-md shadow-sm justify-center ${
                  selectedGroup === "OngoingGroups"
                    ? "bg-blue-800 shadow-md"
                    : "bg-blue-50"
                }`}
                onClick={() => setSelectedGroup("OngoingGroups")}>
                <FaHourglassHalf
                  size={16}
                  color={selectedGroup === "OngoingGroups" ? "#fff" : "#666"}
                  className="mr-0.5"
                />
                <span
                  className={`text-xs font-semibold ${
                    selectedGroup === "OngoingGroups"
                      ? "text-white"
                      : "text-gray-700"
                  }`}>
                  Ongoing Groups
                </span>
              </button>

              <button
                className="p-2.5 bg-blue-50 rounded-md shadow-sm flex justify-center items-center"
                onClick={() => setMoreFiltersModalVisible(true)}>
                <FaFilter size={20} color="#053B90" />
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div className="py-2 px-0">
            {groupsToDisplay.length === 0 ? (
              <div className="flex flex-col justify-center items-center mt-15 px-5">
                <div className="w-64 h-64 bg-gray-200 rounded-full flex items-center justify-center mb-5">
                  <FaExclamationCircle size={64} color="#053B90" />
                </div>
                <h2 className="text-xl font-bold text-blue-800 mb-2.5 text-center">
                  {noGroupsTitle}
                </h2>
                <p className="text-gray-600 text-center mt-3.5 leading-6">
                  {noGroupsMessage}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupsToDisplay.map((card) => {
                  const primaryGroupType = getGroupType(card);
                  const customColorKey = getCustomCardColorKey(card);
                  const colors = {
                    key: customColorKey,
                    ...(groupColors[customColorKey] ||
                      groupColors[primaryGroupType] ||
                      groupColors.default),
                  };
                  const isSelected = selectedCardIndex === card._id;

                  return (
                    <div
                      key={card._id}
                      className={`p-2.5 my-1.5 rounded-xl shadow-md cursor-pointer transition-all ${
                        isSelected ? "ring-2" : ""
                      } ${
                        (!isConnected || !isInternetReachable) && !isSelected
                          ? "opacity-60"
                          : ""
                      }`}
                      style={{
                        backgroundColor: colors.primary,
                        borderColor: isSelected
                          ? colors.selectedBorder
                          : "#E0E0E0",
                        borderWidth: isSelected ? "2px" : "1px",
                      }}
                      onClick={() => setSelectedCardIndex(card._id)}>
                      <CardContent
                        card={card}
                        colors={colors}
                        isSelected={isSelected}
                        currentFilter={selectedGroup}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Modal for offline or error messages */}
      {enrollmentModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-5 text-center text-gray-800">
              {modalMessage || "Please select a group to continue!"}
            </h3>
            <button
              className="bg-blue-800 py-2.5 px-5 rounded-lg mt-2.5 w-full"
              onClick={() => setEnrollmentModalVisible(false)}>
              <span className="text-white text-base font-bold">Got It!</span>
            </button>
          </div>
        </div>
      )}

      {/* More Filters Modal */}
      {moreFiltersModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-10">
            <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
              Select a Filter
            </h3>
            <button
              className="py-4 border-b border-gray-200 w-full"
              onClick={() => {
                setSelectedGroup("AllGroups");
                setMoreFiltersModalVisible(false);
              }}>
              <span className="text-base text-blue-800 text-center block">
                All Groups
              </span>
            </button>
            <button
              className="py-4 border-b border-gray-200 w-full"
              onClick={() => {
                setSelectedGroup("NewGroups");
                setMoreFiltersModalVisible(false);
              }}>
              <span className="text-base text-blue-800 text-center block">
                New Groups
              </span>
            </button>
            <button
              className="py-4 border-b border-gray-200 w-full"
              onClick={() => {
                setSelectedGroup("OngoingGroups");
                setMoreFiltersModalVisible(false);
              }}>
              <span className="text-base text-blue-800 text-center block">
                Ongoing Groups
              </span>
            </button>
            <button
              className="py-4 border-b border-gray-200 w-full"
              onClick={() => {
                setSelectedGroup("VacantGroups");
                setMoreFiltersModalVisible(false);
              }}>
              <span className="text-base text-blue-800 text-center block">
                Vacant Groups
              </span>
            </button>
            <button
              className="mt-5 p-4 bg-gray-200 rounded-lg w-full"
              onClick={() => setMoreFiltersModalVisible(false)}>
              <span className="text-base font-bold text-gray-600 text-center block">
                Cancel
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enrollment;
