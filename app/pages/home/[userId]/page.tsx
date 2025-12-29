"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBars,
  FaWhatsapp,
  FaPhone,
  FaStar,
  FaExternalLinkAlt,
  FaUser,
  FaSignOutAlt,
  FaHeart,
} from "react-icons/fa";
import {
  IoInformationCircleOutline,
  IoClose,
  IoChevronForward,
  IoCall,
} from "react-icons/io5";
import {
  MdVerifiedUser,
  MdEmojiEvents,
  MdLocalOffer,
  MdCheckCircle,
  MdMoreHoriz,
  MdEventNote,
  MdMore,
  MdHealthAndSafety,
  MdAccountCircle,
  MdGroups,
  MdLockClock,
  MdGavel,
  MdEvent,
  MdSupportAgent,
  MdCurrencyRupee,
} from "react-icons/md";
import url from "@/app/utils/urls/BaseUrl";

// Define types
interface UserData {
  full_name: string;
  phone_number: string;
  address: string;
}

interface RelationshipManager {
  groupName: string;
  name: string;
  phoneNumber: string;
}

interface ServiceItem {
  navigateTo: string;
  screen?: string;
  icon: string;
  title: string;
  bgColor: string;
  iconBg: string;
  disabled: boolean;
  filter?: string;
  featureTitle?: string;
}

interface AdvantageItem {
  icon: string;
  text1: string;
  text2: string;
  iconColor: string;
  action?: "call" | "navigate";
  phoneNumber?: string;
  targetScreen?: string;
}

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  review: string;
  location: string;
}

const Home = () => {
  const router = useRouter();

  // User context simulation (in real app, use your own context or auth system)
  const userId = "mock-user-id"; // Replace with actual user ID from auth context
  const [userData, setUserData] = useState<UserData>({ full_name: "", phone_number: "", address: "" });
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [relationshipManagers, setRelationshipManagers] = useState<RelationshipManager[]>([]);
  const [greeting, setGreeting] = useState("Hello");
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const res = await axios.get(`${url}/user/get-user-by-id/${userId}`);
      setUserData(res.data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
      toast.error("Could not load user data");
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Fetch relationship managers
  const fetchRelationshipManagerDetails = async () => {
    try {
      const res = await axios.post(`${url}/enroll/get-user-tickets/${userId}`);
      const uniqueGroups = new Map<string, RelationshipManager>();
      (res.data || []).forEach((ticket: any) => {
        const rm = ticket.group_id?.relationship_manager;
        const name = ticket.group_id?.group_name;
        const id = ticket.group_id?._id;
        if (rm?.phone_number && name && id) {
          uniqueGroups.set(id, {
            groupName: name,
            name: rm.name,
            phoneNumber: rm.phone_number,
          });
        }
      });
      setRelationshipManagers(Array.from(uniqueGroups.values()));
    } catch (err) {
      toast.error("Could not fetch RM details");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRelationshipManagerDetails();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleWhatsAppPress = () => {
    const whatsappUrl = `https://wa.me/919483900777?text=${encodeURIComponent("Hello, I need assistance with MyChits App.")}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCallUs = () => {
    window.location.href = "tel:9483900777";
  };

  const handleWebsiteLink = () => {
    window.open("https://mychits.co.in/", "_blank");
  };

  const handleMenuItemPress = (item: any) => {
    setIsHelpModalVisible(false);
    if (item.onPress) {
      item.onPress();
    } else if (item.link) {
      router.push(`/${item.link}`);
    }
  };

  const handleAdvantagePress = (item: AdvantageItem) => {
    if (item.action === "call" && item.phoneNumber) {
      window.location.href = `tel:${item.phoneNumber}`;
    } else if (item.action === "navigate" && item.targetScreen) {
      router.push(`/${item.targetScreen}`);
    }
  };

  const handleLogout = () => {
    setIsSideMenuVisible(false);
    // Clear auth, then redirect
    router.replace("/login");
  };

  const menuItems = [
    { title: "About Us", icon: "info", link: "about" },
    { title: "Privacy Policy", icon: "privacy", link: "privacy" },
    { title: "Help", icon: "help", link: "help" },
    { title: "F&Q", icon: "faq", link: "faq" },
    { title: "WhatsApp", icon: "whatsapp", onPress: handleWhatsAppPress },
  ];

  const sideMenuItems = [
    { title: "Chat with MyChit", icon: "chat", onPress: handleWhatsAppPress },
    { title: "Get Help", icon: "help", link: "help" },
    {
      title: "Earn Rewards",
      icon: "rewards",
      onPress: () => toast.info("Feature Coming Soon\nRewards feature is under development."),
    },
    { title: "My Profile", icon: "profile", link: "profile" },
  ];

  const services: ServiceItem[] = [
    { navigateTo: "mygroups", icon: "group", title: "My Groups", bgColor: "#E8F5E9", iconBg: "#2E7D32", disabled: false },
    { navigateTo: "enroll", screen: "EnrollScreenMain", icon: "group-add", title: "New Groups", bgColor: "#E3F2FD", iconBg: "#053B90", filter: "New Groups", disabled: false },
    { navigateTo: "passbook", icon: "book", title: "My Passbook", bgColor: "#E0F7FA", iconBg: "#006064", disabled: false },
    { navigateTo: "report", icon: "bar-chart", title: "My Pigmy", bgColor: "#F3E5F5", iconBg: "#7c36a8ff", disabled: false },
    { navigateTo: "payment", icon: "payment", title: "My Payments", bgColor: "#FFF3E0", iconBg: "#EF6C00", disabled: false },
    { navigateTo: "auction", icon: "gavel", title: "Auction", bgColor: "#F1F8E9", iconBg: "#558B2F", disabled: false, featureTitle: "Auction" },
    { navigateTo: "loan", screen: "MyLoan", icon: "wallet", title: "My Loan", bgColor: "#EDE7F6", iconBg: "#3e09a7ff", filter: "My Loan", disabled: false },
    { navigateTo: "refer", icon: "person-add", title: "Refer Now", bgColor: "#FFFDE7", iconBg: "#F9A825", disabled: false },
    { navigateTo: "dues", icon: "rupee", title: "Pay Your Dues", bgColor: "#FFEBEE", iconBg: "#B71C1C", disabled: false },
  ];

  const mychitsAdvantages: AdvantageItem[] = [
    { icon: "lock", text1: "Join a Chit", text2: "in Minutes", iconColor: "#EF6C00", action: "navigate", targetScreen: "enroll" },
    { icon: "gavel", text1: "In app", text2: "Auctions", iconColor: "#795548", action: "navigate", targetScreen: "auction" },
    { icon: "event", text1: "Auctions", text2: "every month", iconColor: "#FBC02D", action: "navigate", targetScreen: "auction" },
    { icon: "support", text1: "1 Click customer", text2: "support", iconColor: "#607D8B", action: "call", phoneNumber: "919483900777" },
    { icon: "verified", text1: "Fully Compliant as", text2: "per Chit Act 1998", iconColor: "#3F51B5" },
    { icon: "groups", text1: "Chit Plans for", text2: "everyone", iconColor: "#4CAF50", action: "navigate", targetScreen: "enroll" },
  ];

  const customerReviews: ReviewItem[] = [
    { id: "1", name: "Prakash", rating: 5, review: "Great service! The app is easy to use...", location: "Bangalore" },
    { id: "2", name: "Geetha Kumari", rating: 4, review: "Very transparent and trustworthy...", location: "Chamarajanagr" },
  ];

  if (isLoadingUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#053B90] to-[#0747A6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#053B90] via-[#0747A6] to-[#064D9E] text-white">
      <ToastContainer position="bottom-right" />
      
      {/* Header - Responsive */}
      <header className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-5 bg-[#053B90]/90 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-white/10">
        <button 
          onClick={() => setIsSideMenuVisible(true)} 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
        >
          <FaBars size={24} className="text-white" />
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <img src="./images/MyChitsLogo.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold">MyChits</h1>
        </div>
        
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold lg:hidden">Chit Plans</h1>
        
        {/* Desktop Menu Items */}
        <nav className="hidden lg:flex items-center gap-6">
          <button onClick={() => router.push("/mygroups")} className="hover:text-blue-200 transition-colors">My Groups</button>
          <button onClick={() => router.push("/enroll")} className="hover:text-blue-200 transition-colors">New Groups</button>
          <button onClick={() => router.push("/auction")} className="hover:text-blue-200 transition-colors">Auction</button>
          <button onClick={() => router.push("/profile")} className="hover:text-blue-200 transition-colors">Profile</button>
        </nav>
        
        <button
          onClick={() => setIsHelpModalVisible(true)}
          className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-[#B3E5FC] to-[#81D4FA] text-[#053B90] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <IoInformationCircleOutline size={16} className="sm:block hidden" />
          <span>Need Help?</span>
        </button>
      </header>

      {/* Main Content - Responsive Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {/* Greeting Card */}
        <div className="bg-gradient-to-r from-[#B3E5FC] to-[#81D4FA] rounded-2xl p-5 sm:p-6 lg:p-8 mb-6 lg:mb-8 text-[#053B90] shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{greeting}!</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold">{userData.full_name || "User"}</p>
          <p className="text-sm sm:text-base mt-2 opacity-80">Welcome back to your dashboard</p>
        </div>

        {/* Services Grid - Responsive */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 border-4 border-[#053B90] relative shadow-2xl">
          <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-300 px-6 py-2 rounded-full text-[#053B90] font-bold text-sm sm:text-base shadow-lg">
            Our Services
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mt-4">
            {services.map((item, idx) => (
              <button
                key={idx}
                onClick={() => !item.disabled && router.push(`/${item.navigateTo}`)}
                disabled={item.disabled}
                className={`p-4 sm:p-5 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ backgroundColor: item.bgColor }}
              >
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md" 
                  style={{ backgroundColor: item.iconBg }}
                >
                  <MdEventNote size={24} className="text-white" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-black text-center leading-tight">{item.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {[
            { title: "My Profile", icon: <FaUser size={24} className="text-[#053B90]" />, route: "/profile", gradient: "from-blue-100 to-blue-50" },
            { title: "More Info", icon: <MdMore size={24} className="text-[#053B90]" />, route: "/more", gradient: "from-purple-100 to-purple-50" },
            { title: "My Insurance", icon: <MdHealthAndSafety size={24} className="text-[#053B90]" />, route: "/insurance", gradient: "from-green-100 to-green-50" },
            { title: "Become Agent", icon: <MdAccountCircle size={24} className="text-[#053B90]" />, route: "/agent", gradient: "from-orange-100 to-orange-50" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.route)}
              className={`bg-gradient-to-br ${item.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200`}
            >
              <div className="mb-2 sm:mb-3">{item.icon}</div>
              <span className="text-xs sm:text-sm font-semibold text-black text-center">{item.title}</span>
            </button>
          ))}
        </div>

        {/* RM List - Responsive */}
        {relationshipManagers.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-2xl p-4 sm:p-6 mb-6 lg:mb-8 shadow-lg">
            <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-4 flex items-center gap-2">
              <MdSupportAgent size={24} className="text-yellow-600" />
              Your Relationship Managers
            </h3>
            <div className="space-y-3">
              {relationshipManagers.map((rm, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3 px-4 bg-white rounded-xl border border-yellow-200 shadow-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{rm.groupName}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Manager: {rm.name}</p>
                  </div>
                  <button
                    onClick={() => (window.location.href = `tel:${rm.phoneNumber}`)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 self-start sm:self-center"
                  >
                    <FaPhone size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose MyChits - Responsive */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 lg:p-8 mb-6 lg:mb-8 shadow-2xl">
          <h2 className="text-center text-[#053B90] font-bold text-xl sm:text-2xl lg:text-3xl mb-6 lg:mb-8">
            Why Choose MyChits?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                icon: <MdLockClock size={32} className="text-red-600" />, 
                title: "Easy Accessibility", 
                desc: "Use our online presence to join chits anytime, anywhere" 
              },
              { 
                icon: <MdCurrencyRupee size={32} className="text-blue-600" />, 
                title: "Large Choice of Chits", 
                desc: "From ₹50,000 to ₹1 Crore - plans for everyone" 
              },
              { 
                icon: <MdVerifiedUser size={32} className="text-green-600" />, 
                title: "Most Trusted", 
                desc: "MY CHITS has been trusted since 1998 with thousands of happy customers" 
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="bg-gray-100 p-3 rounded-xl h-fit">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Responsive */}
        <div className="text-center mt-8 lg:mt-12 space-y-4">
          <button 
            onClick={handleWebsiteLink} 
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white underline text-sm sm:text-base font-medium transition-colors group"
          >
            Visit our Website: mychits.co.in
            <FaExternalLinkAlt size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-gray-200 text-sm sm:text-base flex items-center justify-center gap-2">
            Made with <FaHeart className="text-red-400 animate-pulse" /> in India
          </p>
          <p className="text-gray-300 text-xs">© 2025 MyChits. All rights reserved.</p>
        </div>
      </main>

      {/* Help Modal - Responsive */}
      {isHelpModalVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" 
          onClick={() => setIsHelpModalVisible(false)}
        >
          <div 
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E]">How can we help?</h2>
              <button 
                onClick={() => setIsHelpModalVisible(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoClose size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-2">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleMenuItemPress(item)}
                  className="w-full flex justify-between items-center py-4 px-3 border-b border-gray-100 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    {item.icon === "whatsapp" ? (
                      <FaWhatsapp size={22} className="text-green-600" />
                    ) : (
                      <IoInformationCircleOutline size={22} className="text-[#053B90]" />
                    )}
                    <span className="text-left font-medium text-gray-700 group-hover:text-[#053B90] transition-colors">
                      {item.title}
                    </span>
                  </span>
                  <IoChevronForward size={20} className="text-gray-400 group-hover:text-[#053B90] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Still need help? Give us a call.</p>
              <button
                onClick={handleCallUs}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                <IoCall size={22} />
                Call Us Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Menu - Responsive */}
      {isSideMenuVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
          onClick={() => setIsSideMenuVisible(false)}
        >
          <div 
            className="absolute left-0 top-0 h-full w-[85%] sm:w-80 lg:w-96 bg-white shadow-2xl overflow-y-auto animate-slideInLeft" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSideMenuVisible(false)}
              className="absolute right-4 top-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            >
              <IoClose size={22} className="text-gray-700" />
            </button>

            {/* User Profile Section */}
            <div className="bg-gradient-to-br from-[#053B90] to-[#0747A6] pt-16 pb-8 px-6 text-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaUser size={36} className="text-white" />
                </div>
                <h3 className="font-bold text-xl mb-1">{userData.full_name || "User"}</h3>
                <p className="text-sm text-blue-100">You're on track!</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-5 py-6 space-y-2">
              {sideMenuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsSideMenuVisible(false);
                    if (item.onPress) item.onPress();
                    else if (item.link) router.push(`/${item.link}`);
                  }}
                  className="w-full flex items-center gap-4 py-3 px-4 text-left hover:bg-blue-50 rounded-xl transition-colors group"
                >
                  {item.icon === "whatsapp" ? (
                    <FaWhatsapp size={22} className="text-green-600" />
                  ) : item.icon === "profile" ? (
                    <FaUser size={22} className="text-gray-700 group-hover:text-[#053B90]" />
                  ) : item.icon === "rewards" ? (
                    <MdEmojiEvents size={22} className="text-yellow-600" />
                  ) : (
                    <IoInformationCircleOutline size={22} className="text-gray-700 group-hover:text-[#053B90]" />
                  )}
                  <span className="font-medium text-gray-700 group-hover:text-[#053B90] transition-colors">
                    {item.title}
                  </span>
                </button>
              ))}

              <div className="border-t border-gray-200 my-4"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 py-3 px-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <FaSignOutAlt size={22} />
                <span>Sign Out</span>
              </button>

              <div className="mt-8 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 text-center">
                <p className="text-sm text-gray-700 mb-2">Love us? Rate the app!</p>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" size={18} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }.animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;