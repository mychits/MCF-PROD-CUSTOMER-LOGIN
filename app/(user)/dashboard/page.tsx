"use client"
import React, { useContext, useState, useEffect, useRef, use } from 'react';
import axios from 'axios';
import { 
  MdNotificationsNone, MdHelpOutline, MdVerified, MdPayments, 
  MdGavel, MdHistory, MdGroupAdd, MdAccountBalance, MdDescription,
  MdSecurity, MdHome, MdSchool, MdFavorite, MdArrowForward, MdStar
} from 'react-icons/md';
import { FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { FaBolt } from 'react-icons/fa';
import url from "@/app/utils/urls/BaseUrl";



const SCROLL_IMAGES = [
    "/images/50k_blue.png", "/images/1lakhblue.png", "/images/2lakhblue.png",
    "/images/3lakgblue.png", "/images/5lakhblue.png", "/images/10lakhblue.png",
    "/images/25lakhblue.png", "/images/50lakhblue.png", "/images/1croreblue.png",
];

const REVIEWS = [
    { id: '1', name: 'Prakash', review: 'Great service! The app is incredibly easy to navigate, and the digital process saved me so much time.', location: 'Bangalore' },
    { id: '2', name: 'Geetha Kumari', review: 'Very transparent and trustworthy company. I appreciate the regular updates.', location: 'Chamarajanagr' },
    { id: '3', name: 'Ravi Kumar', review: 'The interface is simple to understand even for beginners.', location: 'Bangalore' },
    { id: '4', name: 'Nisha Singh', review: 'Secure, simple, and transparent. It makes chit fund investments feel modern.', location: 'Davanagere' },
    { id: '5', name: 'Suresh Raina', review: 'I have been using this for 6 months now. The auction process is very fair and clear.', location: 'Mysuru' },
    { id: '6', name: 'Jeevitha', review: 'Customer support is very helpful. They guided me through my first enrollment perfectly.', location: 'Tumkuru' },
    { id: '7', name: 'Rajath R Shetty', review: 'Best way to save money for long-term goals. Highly recommended for families.', location: 'Mangalore' },
    { id: '8', name: 'Meena Iyer', review: 'Finally a digital chit fund that feels safe. The documentation is very professional.', location: 'Chennai' },
    { id: '9', name: 'Sanjay', review: 'The passbook feature is excellent. I can track my savings anytime, anywhere.', location: 'Hassan' },
    { id: '10', name: 'Priyanka M.', review: 'Very convenient and reliable. It helped me save up for my new scooter easily!', location: 'Belagavi' },
];

const QUICK_ACTIONS = [
    { id: '1', icon: <MdPayments />, label: 'New Groups', color: '#10B981', target: '/enrollment' },
    { id: '2', icon: <MdGavel />, label: 'Auction', color: '#F59E0B', target: '/auction-list' },
    { id: '3', icon: <MdHistory />, label: 'Passbook', color: '#3B82F6', target: '/passbook' },
    { id: '4', icon: <MdGroupAdd />, label: 'Refer', color: '#8B5CF6', target: '/refer' },
    { id: '5', icon: <MdAccountBalance />, label: 'Bank Info', color: '#64748B', target: '/bank-info' },
    { id: '6', icon: <MdDescription />, label: 'Legal', color: '#EF4444', target: '/legal' },
];

const GOALS = [
    { title: 'Dream Home', icon: <MdHome />, desc: 'Save for your downpayment', bgColor: '#ECFDF5', iconColor: '#059669' },
    { title: 'Education', icon: <MdSchool />, desc: 'Secure your child’s future', bgColor: '#FFF7ED', iconColor: '#D97706' },
    { title: 'Wedding', icon: <MdFavorite />, desc: 'Plan the perfect ceremony', bgColor: '#FFF1F2', iconColor: '#E11D48' },
];
interface Params{
    params:Promise<{userId:string}>
}
const Home = ({params}:Params) => {
    const paramsObject = use(params)
    const {userId} = paramsObject;
   
    const [activeChitsCount, setActiveChitsCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const horizontalScrollRef = useRef(null);

    // Fetch Logic (Preserved)
    useEffect(() => {
        const fetchActiveCounts = async () => {
            try {
                const [newRes, ongoingRes] = await Promise.all([
                    axios.get(`${url}/group/filter/NewGroups`),
                    axios.get(`${url}/group/filter/OngoingGroups`)
                ]);
                setActiveChitsCount((newRes.data?.groups?.length || 0) + (ongoingRes.data?.groups?.length || 0));
            } catch (error) { console.error(error); }
        };
        fetchActiveCounts();
    }, []);

    // Auto-scroll Logic for Schemes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SCROLL_IMAGES.length);
            if (horizontalScrollRef.current) {
                const scrollAmount = horizontalScrollRef.current.offsetWidth * 0.8;
                horizontalScrollRef.current.scrollLeft = currentIndex * scrollAmount;
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden pb-10">
            {/* --- BRAND HEADER --- */}
            <header className="relative bg-[#042f74] text-white pt-10 pb-24 px-6 rounded-b-[45px] overflow-hidden transition-all duration-700 animate-in fade-in slide-in-from-top-5">
                {/* Decorative Orbs */}
                <div className="absolute w-48 h-48 bg-white opacity-5 rounded-full -top-12 -right-12 animate-pulse"></div>
                <div className="absolute w-36 h-36 bg-white opacity-5 rounded-full -bottom-10 -left-8 animate-pulse"></div>

                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-lg">
                                <img src="/assets/Group400.png" alt="Logo" className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight leading-tight">MyChits</h1>
                                <p className="text-[10px] font-bold opacity-40 tracking-widest uppercase -mt-1">Trusted Investments</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><MdNotificationsNone size={22} /></button>
                            <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><MdHelpOutline size={22} /></button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-white/60 text-base font-medium">Welcome,</p>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{ 'User'}</h2>
                            <MdVerified className="text-[#4FC3F7]" size={20} />
                        </div>
                    </div>
                </div>
            </header>

            {/* --- STATUS CARD --- */}
            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between border border-[#F1F5F9]">
                    <div className="flex items-center divide-x divide-[#F1F5F9] w-full md:w-auto mb-4 md:mb-0">
                        <div className="pr-8">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Active Chits</p>
                            <p className="text-xl font-black text-[#042f74]">{activeChitsCount}</p>
                        </div>
                        <div className="px-8">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Auction Every</p>
                            <p className="text-xl font-black text-[#042f74]">10 Days</p>
                        </div>
                    </div>
                    <button className="w-full md:w-auto bg-[#EF6C00] hover:bg-[#d45f00] text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95">
                        ENROLL NOW
                    </button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-12 space-y-16">
                {/* --- QUICK ACTIONS GRID --- */}
                <section>
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px bg-[#E2E8F0] flex-1"></div>
                        <h3 className="text-xs font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Financial Hub</h3>
                        <div className="h-px bg-[#E2E8F0] flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {QUICK_ACTIONS.map((item) => (
                            <button 
                                key={item.id} 
                                className="group relative bg-white p-6 rounded-[2rem] flex flex-col items-center border border-transparent hover:border-slate-200 transition-all shadow-sm hover:shadow-md overflow-hidden"
                            >
                                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: item.color }}></div>
                                <div className="p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                    {React.cloneElement(item.icon, { size: 28 })}
                                </div>
                                <span className="text-[10px] font-black tracking-tight">{item.label.toUpperCase()}</span>
                                <div className="absolute bottom-0 w-1/3 h-1 rounded-t-full transition-all group-hover:w-1/2" style={{ backgroundColor: item.color }}></div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* --- PREMIUM SCHEMES --- */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-xl font-black">Premium Schemes</h3>
                            <p className="text-sm text-[#64748B]">Tailored for high growth</p>
                        </div>
                        <button className="text-[#EF6C00] font-black text-sm hover:underline">See All</button>
                    </div>
                    <div 
                        ref={horizontalScrollRef}
                        className="flex gap-4 overflow-x-auto no-scrollbar snap-x scroll-smooth pb-4"
                    >
                        {SCROLL_IMAGES.map((img, idx) => (
                            <div key={idx} className="min-w-[80%] md:min-w-[40%] lg:min-w-[30%] h-48 rounded-[2.5rem] overflow-hidden snap-start relative group cursor-pointer shadow-lg">
                                <img src={img} alt="Scheme" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
                                    <FaBolt className="text-yellow-400" size={10} />
                                    <span className="text-[10px] font-black text-white tracking-widest uppercase">High Demand</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- ABOUT HIGHLIGHT --- */}
                <section className="bg-white rounded-[2.5rem] border border-[#E3F2FD] overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                        <div className="flex-1 space-y-4">
                            <span className="bg-[#E3F2FD] text-[#042f74] text-[10px] font-black px-3 py-1 rounded-md uppercase">Government Registered</span>
                            <h3 className="text-2xl font-black text-[#042f74]">India's Digital Leader</h3>
                            <p className="text-[#64748B] text-sm leading-relaxed max-w-md">Experience the most transparent and secure chit fund platform. Our legacy is built on trust.</p>
                            <div className="flex items-center gap-2 text-[#042f74] font-black text-sm group-hover:gap-4 transition-all">
                                <span>Our Legacy</span> <FiChevronRight />
                            </div>
                        </div>
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#E3F2FD] rounded-full flex items-center justify-center text-[#042f74] transition-transform group-hover:rotate-12">
                            <MdSecurity size={40} />
                        </div>
                    </div>
                </section>

                {/* --- SAVING GOALS --- */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="md:col-span-3 text-xl font-black mb-2">Plan Your Future</h3>
                    {GOALS.map((goal, idx) => (
                        <button key={idx} className="bg-white p-5 rounded-[2rem] flex items-center gap-4 border border-[#F8FAFC] shadow-sm hover:shadow-md transition-all group">
                            <div className="p-4 rounded-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: goal.bgColor, color: goal.iconColor }}>
                                {React.cloneElement(goal.icon, { size: 24 })}
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-[#0F172A]">{goal.title}</h4>
                                <p className="text-xs text-[#64748B]">{goal.desc}</p>
                            </div>
                            <MdArrowForward className="text-[#64748B] group-hover:text-[#042f74] transition-colors" />
                        </button>
                    ))}
                </section>

                {/* --- REVIEWS --- */}
                <section>
                    <h3 className="text-xl font-black mb-8 text-center md:text-left">Member Success Stories</h3>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-6">
                        {REVIEWS.map((item) => (
                            <div key={item.id} className="min-w-[300px] bg-white p-8 rounded-[2.5rem] border border-[#F1F5F9] snap-start hover:border-blue-200 transition-colors shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#042f74] text-white flex items-center justify-center font-bold text-lg">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">{item.name}</p>
                                        <p className="text-[10px] font-bold text-[#64748B] uppercase">{item.location}</p>
                                    </div>
                                </div>
                                <p className="text-sm italic text-[#0F172A] leading-relaxed mb-6">"{item.review}"</p>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => <MdStar key={i} className="text-amber-400" size={14} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FINAL ACTION --- */}
                <section className="pb-10">
                    <button className="w-full bg-[#042f74] hover:bg-[#063b8d] text-white h-20 rounded-[2rem] flex items-center justify-center gap-4 font-black tracking-widest transition-all shadow-xl active:scale-95 group">
                        VIEW INVESTMENT PLANS
                        <div className="bg-white p-2 rounded-xl transition-transform group-hover:translate-x-1">
                            <FiTrendingUp className="text-[#042f74]" size={20} />
                        </div>
                    </button>
                </section>
            </main>
            
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Home;