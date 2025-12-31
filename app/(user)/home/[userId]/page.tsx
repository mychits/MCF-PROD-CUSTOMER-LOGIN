"use client";

import React, { useState, useEffect, use } from "react";
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
  MdAddBox,
  MdMenuBook,
  MdBarChart,
  MdPayments,
  MdAccountBalanceWallet,
  MdPersonAdd,
} from "react-icons/md";
import url from "@/app/utils/urls/BaseUrl";

// Types
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

const Home = ({ params }: { params: Promise<{ userId: string }> }) => {
  const router = useRouter();
  const userIdData = use(params);
  const userId = userIdData.userId;

  const [userData, setUserData] = useState<UserData>({ full_name: "", phone_number: "", address: "" });
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [relationshipManagers, setRelationshipManagers] = useState<RelationshipManager[]>([]);
  const [greeting, setGreeting] = useState("Hello");
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);

  // Helper to render the correct icon based on the service item
  const renderServiceIcon = (iconName: string) => {
    const props = { size: 28, className: "text-white" };
    switch (iconName) {
      case "group": return <MdGroups {...props} />;
      case "group-add": return <MdAddBox {...props} />;
      case "book": return <MdMenuBook {...props} />;
      case "bar-chart": return <MdBarChart {...props} />;
      case "payment": return <MdPayments {...props} />;
      case "gavel": return <MdGavel {...props} />;
      case "wallet": return <MdAccountBalanceWallet {...props} />;
      case "person-add": return <MdPersonAdd {...props} />;
      case "rupee": return <MdCurrencyRupee {...props} />;
      default: return <MdEventNote {...props} />;
    }
  };

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

  const handleCallUs = () => { window.location.href = "tel:9483900777"; };
  const handleWebsiteLink = () => { window.open("https://mychits.co.in/", "_blank"); };

  const handleMenuItemPress = (item: any) => {
    setIsHelpModalVisible(false);
    if (item.onPress) item.onPress();
    else if (item.link) router.push(`/${item.link}`);
  };

  const handleLogout = () => {
    setIsSideMenuVisible(false);
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
    { title: "Earn Rewards", icon: "rewards", onPress: () => toast.info("Feature Coming Soon\nRewards feature is under development.") },
    { title: "My Profile", icon: "profile", link: `profile/${userId}` },
  ];

  const services: ServiceItem[] = [
    { navigateTo: `my-groups/${userId}`, icon: "group", title: "My Groups", bgColor: "#E8F5E9", iconBg: "#2E7D32", disabled: false },
    { navigateTo: `new-groups/${userId}`, screen: "EnrollScreenMain", icon: "group-add", title: "New Groups", bgColor: "#E3F2FD", iconBg: "#053B90", filter: "New Groups", disabled: false },
    { navigateTo: `my-passbook/${userId}`, icon: "book", title: "My Passbook", bgColor: "#E0F7FA", iconBg: "#006064", disabled: false },
    { navigateTo: `my-pigmy/${userId}`, icon: "bar-chart", title: "My Pigmy", bgColor: "#F3E5F5", iconBg: "#7c36a8ff", disabled: false },
    { navigateTo: `my-payments/${userId}`, icon: "payment", title: "My Payments", bgColor: "#FFF3E0", iconBg: "#EF6C00", disabled: false },
    { navigateTo: `auctions/${userId}`, icon: "gavel", title: "Auction", bgColor: "#F1F8E9", iconBg: "#558B2F", disabled: false, featureTitle: "Auction" },
    { navigateTo: `my-loan/${userId}`, screen: "MyLoan", icon: "wallet", title: "My Loan", bgColor: "#EDE7F6", iconBg: "#3e09a7ff", filter: "My Loan", disabled: false },
    { navigateTo: `refer/${userId}`, icon: "person-add", title: "Refer Now", bgColor: "#FFFDE7", iconBg: "#F9A825", disabled: false },
    { navigateTo: `pay-your-dues/${userId}`, icon: "rupee", title: "Pay Your Dues", bgColor: "#FFEBEE", iconBg: "#B71C1C", disabled: false },
  ];

  if (isLoadingUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#053B90]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#053B90] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSideMenuVisible(true)}
              className="p-2 hover:bg-white/10 rounded-lg lg:hidden"
            >
              <FaBars size={22} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <img src="/images/MyChitsLogo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">MyChits</h1>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm uppercase tracking-wide">
            <button onClick={() => router.push(`/my-groups/${userId}`)} className="hover:text-blue-300 transition-colors">My Groups</button>
            <button onClick={() => router.push(`/new-groups/${userId}`)} className="hover:text-blue-300 transition-colors">New Groups</button>
            <button onClick={() => router.push(`/auctions/${userId}`)} className="hover:text-blue-300 transition-colors">Auction</button>
            <button onClick={() => router.push(`/profile/${userId}`)} className="hover:text-blue-300 transition-colors">Profile</button>
          </nav>

          <button
            onClick={() => setIsHelpModalVisible(true)}
            className="flex items-center gap-2 bg-yellow-400 text-[#053B90] px-4 py-2 rounded-full text-xs sm:text-sm font-black shadow-md hover:bg-yellow-300 transition-all hover:scale-105"
          >
            <IoInformationCircleOutline size={18} />
            <span className="hidden sm:inline">Need Help?</span>
            <span className="sm:hidden">Help</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Greeting Section */}
        <section className="bg-gradient-to-br from-[#053B90] to-[#0a56cc] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-blue-200 text-lg font-medium">{greeting}!</h2>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-1">
              {userData.full_name || "Valued Member"}
            </h1>
            <p className="text-blue-100/80 mt-4 max-w-md">Welcome back to your digital chit dashboard. Manage your savings and auctions with ease.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        </section>

        {/* Services Grid */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Our Services</h3>
            <div className="h-1 flex-1 bg-slate-200 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {services.map((item, idx) => (
              <button
                key={idx}
                onClick={() => !item.disabled && router.push(`/${item.navigateTo}`)}
                disabled={item.disabled}
                className={`group flex flex-col items-center p-5 rounded-[2rem] border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  item.disabled ? "opacity-40 cursor-not-allowed" : "bg-white"
                }`}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg"
                  style={{ backgroundColor: item.iconBg }}
                >
                  {renderServiceIcon(item.icon)}
                </div>
                <p className="text-sm font-bold text-slate-700 text-center leading-tight">
                  {item.title}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "My Profile", icon: <FaUser size={22} />, route: `/profile/${userId}`, bg: "bg-blue-50 text-blue-700 border-blue-100" },
            { title: "More Info", icon: <MdMore size={22} />, route: "/more", bg: "bg-purple-50 text-purple-700 border-purple-100" },
            { title: "My Insurance", icon: <MdHealthAndSafety size={22} />, route: `/insurance/${userId}`, bg: "bg-green-50 text-green-700 border-green-100" },
            { title: "Become Agent", icon: <MdAccountCircle size={22} />, route: `/become-an-agent/${userId}`, bg: "bg-orange-50 text-orange-700 border-orange-100" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.route)}
              className={`${item.bg} border p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md active:scale-95`}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">{item.icon}</div>
              <span className="text-sm font-bold">{item.title}</span>
            </button>
          ))}
        </section>

        {/* Relationship Managers */}
        {relationshipManagers.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-wider">
              <MdSupportAgent size={28} className="text-blue-600" />
              Your Support Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relationshipManagers.map((rm, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">{rm.groupName}</p>
                    <p className="text-xs font-medium text-slate-500">Manager: {rm.name}</p>
                  </div>
                  <a href={`tel:${rm.phoneNumber}`} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    <FaPhone size={16} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trust Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <MdLockClock size={32} className="text-red-600" />, title: "Easy Accessibility", desc: "Use our online presence to join chits anytime, anywhere" },
            { icon: <MdCurrencyRupee size={32} className="text-blue-600" />, title: "Large Choice of Chits", desc: "From ₹50,000 to ₹1 Crore - plans for everyone" },
            { icon: <MdVerifiedUser size={32} className="text-green-600" />, title: "Most Trusted", desc: "MY CHITS has been trusted since 1998 with thousands of happy customers" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">{item.icon}</div>
              <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="pt-10 pb-20 border-t border-slate-200 text-center space-y-6">
          <button onClick={handleWebsiteLink} className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline transition-all group">
            Visit our Website: mychits.co.in
            <FaExternalLinkAlt size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-400 text-sm flex items-center gap-2">
              Made with <FaHeart className="text-rose-500 animate-pulse" /> in India
            </p>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">© 2025 MyChits. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {/* Side Menu Drawer */}
      {isSideMenuVisible && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSideMenuVisible(false)} />
          <div className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl animate-slideInLeft flex flex-col">
            <div className="p-6 bg-[#053B90] text-white">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                <FaUser size={40} />
              </div>
              <h3 className="font-black text-xl">{userData.full_name || "User"}</h3>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mt-1">Chit Member</p>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {sideMenuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsSideMenuVisible(false);
                    if (item.onPress) item.onPress();
                    else if (item.link) router.push(`/${item.link}`);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="text-blue-600">{item.icon === "chat" ? <FaWhatsapp size={20} /> : <MdEmojiEvents size={20} />}</span>
                  {item.title}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-4" />
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-colors">
                <FaSignOutAlt size={20} />
                Sign Out
              </button>
            </nav>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Rate Our App</p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400" size={20} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalVisible && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsHelpModalVisible(false)}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-slideUp flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">Support Center</h2>
              <button onClick={() => setIsHelpModalVisible(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <IoClose size={24} />
              </button>
            </div>
            <div className="space-y-3">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleMenuItemPress(item)}
                  className="w-full flex justify-between items-center p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <span className="flex items-center gap-3 font-bold text-slate-700 group-hover:text-blue-700">
                    {item.icon === "whatsapp" ? <FaWhatsapp size={20} className="text-green-600" /> : <IoInformationCircleOutline size={20} className="text-blue-600" />}
                    {item.title}
                  </span>
                  <IoChevronForward size={20} className="text-slate-300 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
            <div className="mt-10 text-center bg-blue-50 p-6 rounded-[2rem]">
              <p className="text-slate-600 text-sm font-medium mb-4">Still need help? Give us a call.</p>
              <button onClick={handleCallUs} className="w-full bg-[#053B90] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all">
                <IoCall size={20} />
                Call 9483900777
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideInLeft { animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Home;