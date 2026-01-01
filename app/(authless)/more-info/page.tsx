"use client";
import React, { use } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaAward, FaShieldAlt, FaGlobe, FaRocket, FaUsers } from "react-icons/fa";

export default function About({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const appParams = use(params);
  const router = useRouter();
  const userId = appParams.userId;

  return (
    <div className="min-h-screen bg-[#053B90] text-white selection:bg-[#FF9933] selection:text-white relative overflow-hidden">
      
      {/* --- Abstract Background Decor --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {/* Pulsing Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        
        {/* Subtle Grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <main className="relative z-10 p-6 md:p-12 lg:p-20 flex flex-col items-center">
        
        {/* --- Navigation --- */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <button
            onClick={() => router.back()}
            className="group flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full transition-all border border-white/20"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          <div className="hidden md:block text-xs font-bold tracking-widest text-white/40 uppercase">
            Digitizing Trust Since 1998
          </div>
        </div>

        {/* --- Hero Section --- */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
            <span className="inline-block px-4 py-1 rounded-full bg-[#FF9933]/20 text-[#FF9933] text-sm font-bold tracking-widest uppercase border border-[#FF9933]/30">
              Our Legacy
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
              MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] to-orange-300">CHITS</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-blue-100 italic opacity-90">
              "India's 100% Digital Chit Fund Firm"
            </p>
            <div className="h-1.5 w-20 bg-[#FF9933] mx-auto lg:mx-0 rounded-full"></div>
          </div>

          <div className="relative group animate-in fade-in zoom-in duration-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9933] to-blue-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video lg:aspect-square max-h-[500px]">
              <img
                src="/images/MyChitsLogo.png"
                alt="About MyChits"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>

        {/* --- Story Cards --- */}
        <div className="w-full max-w-6xl mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom duration-700 [animation-delay:200ms]">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
              <FaRocket size={26} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-blue-100/70 leading-relaxed text-lg text-justify font-light">
              We are a registered chit fund company helping people from all walks of life. We understand the necessity of financial independence and thus connect them with necessary funds when they require it.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#FF9933]/30 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom duration-700 [animation-delay:400ms]">
            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 text-[#FF9933]">
              <FaUsers size={26} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Join The Revolution</h3>
            <p className="text-blue-100/70 leading-relaxed text-lg text-justify font-light">
              Join our fast-growing team that's disrupting the traditional chit fund segment and offering exciting new opportunities to retail investors in India. We combine heritage trust with future tech.
            </p>
          </div>
        </div>

        {/* --- Trust Features Bar --- */}
        <div className="w-full max-w-6xl mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: <FaShieldAlt />, label: "Registered", desc: "100% Legal & Secure", color: "text-green-400" },
            { icon: <FaGlobe />, label: "100% Digital", desc: "Paperless Experience", color: "text-blue-400" },
            { icon: <FaAward />, label: "Trusted", desc: "Serving since 1998", color: "text-[#FF9933]" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group p-8 text-center bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all duration-300 animate-in fade-in zoom-in duration-700 [animation-delay:600ms]"
            >
              <div className={`${stat.color} text-4xl mb-4 flex justify-center group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <h4 className="text-xl font-bold tracking-tight mb-1 uppercase">{stat.label}</h4>
              <p className="text-blue-200/50 text-sm font-medium">{stat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Adding custom keyframes for smooth entry animations */}
      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-top { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-in-left { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-in-bottom { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .animate-in {
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-top { animation-name: slide-in-top; }
        .slide-in-from-left { animation-name: slide-in-left; }
        .slide-in-from-bottom { animation-name: slide-in-bottom; }
        .zoom-in { animation-name: zoom-in; }
      `}</style>
    </div>
  );
}