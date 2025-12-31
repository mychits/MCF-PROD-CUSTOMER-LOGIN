"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  MdPerson, 
  MdInfo, 
  MdPrivacyTip, 
  MdHelpOutline, 
  MdQuestionAnswer, 
  MdLockReset, 
  MdChevronRight,
  MdLogout,
  MdArrowBack,
  MdCameraAlt
} from "react-icons/md";

import url from "@/app/utils/urls/BaseUrl";

const Profile = ({ params }: { params: Promise<{ userId: string }> }) => {
  const paramUser = use(params);
  const router = useRouter();
  const userId = paramUser.userId;

  const [userData, setUserData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  const menuItems = [
    { title: "Basic Details", sub: "Name, Phone, and Address", icon: <MdPerson />, link: "account" },
    { title: "About Us", sub: "Learn more about MyChits", icon: <MdInfo />, link: "about" },
    { title: "Privacy Policy", sub: "How we protect your data", icon: <MdPrivacyTip />, link: "privacy" },
    { title: "Help", sub: "Contact support & assistance", icon: <MdHelpOutline />, link: "help" },
    { title: "F&Q", sub: "Commonly asked questions", icon: <MdQuestionAnswer />, link: "faq" },
    { title: "Reset Password", sub: "Update your security", icon: <MdLockReset />, link: "reset-password" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${url}/user/get-user-by-id/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* --- TOP BRANDED BAR --- */}
      <div className="h-48 bg-[#053B90] w-full absolute top-0 left-0 z-0 shadow-lg" />

      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto py-6 sm:py-12 px-4">
        
        {/* --- MAIN PROFILE CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Area */}
          <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50">
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-white/80 hover:text-white transition-all bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
            >
              <MdArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Back</span>
            </button>
            <h1 className="text-white font-black tracking-tight text-lg uppercase">Account Settings</h1>
            <div className="w-16 hidden sm:block" /> 
          </div>

          <div className="flex flex-col">
            {/* User Identity Section */}
            <div className="flex flex-col items-center py-10 bg-gradient-to-b from-[#053B90] to-blue-800 text-white text-center px-4">
              <div className="relative group mb-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 p-1 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src="/images/profile.png" 
                    alt="User"
                    className="w-full h-full rounded-full object-cover bg-white shadow-inner"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userData.full_name}&background=ffffff&color=053B90&bold=true`;
                    }}
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-white text-blue-900 p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <MdCameraAlt size={18} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{userData.full_name || "User Name"}</h2>
              <p className="text-blue-100/70 font-bold text-sm sm:text-base mt-1">{userData.phone_number}</p>
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/${item.link}/${userId}`)}
                  className="bg-white group flex items-center justify-between p-6 sm:p-8 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#053B90] flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:bg-[#053B90] group-hover:text-white shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">
                        {item.title}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.sub}
                      </span>
                    </div>
                  </div>
                  <MdChevronRight className="text-slate-300 group-hover:text-blue-900 group-hover:translate-x-1 transition-all" size={24} />
                </button>
              ))}
            </div>

            {/* Logout Footer */}
            <div className="p-8 sm:p-12 bg-white flex flex-col items-center">
              <button
                onClick={() => router.push("/login")}
                className="w-full max-w-sm bg-rose-50 text-rose-600 border border-rose-100 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-rose-600 hover:text-white active:scale-95 shadow-sm"
              >
                <MdLogout size={22} />
                Logout Account
              </button>
              
              
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;