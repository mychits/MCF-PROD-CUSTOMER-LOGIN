"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MdSecurity, 
  MdTouchApp, 
  MdTrendingUp, 
  MdVerified, 
  MdGroups, 
  MdOutlineAccountBalance 
} from "react-icons/md";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";

const AboutUs = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
 
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <img src="/images/MyChitsLogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black text-[#053B90] tracking-tight">MY CHITS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <Link href="/" className="hover:text-[#053B90] transition-colors">Home</Link>
            <Link href="https://mychits.co.in/about-us" target="_blank" className="text-[#053B90]">About Us</Link>
            <Link href="https://mychits.co.in/faqs" target="_blank" className="hover:text-[#053B90] transition-colors">F&Q</Link>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 text-sm font-bold text-[#053B90] hover:bg-blue-50 rounded-xl transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => router.push("/register")}
              className="px-6 py-2.5 text-sm font-bold bg-[#053B90] text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0747A6] transition-all transform hover:-translate-y-0.5"
            >
              Register Now
            </button>
          </div>
        </div>
      </nav>

   
      <header className="relative bg-gradient-to-b from-blue-50 to-white pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-[#053B90] uppercase bg-blue-100 rounded-full">
            The Future of Savings
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#053B90] leading-[1.1] mb-8">
            India's 100% Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Chit Fund Firm
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed mb-10">
            Join thousands of smart investors who are redefining financial independence through our secure, transparent, and fully regulated digital chit platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-8 py-4 bg-[#053B90] text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl transition-all"
            >
              Start Saving Today <FaArrowRight />
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 px-4">
              <MdVerified className="text-green-500 text-xl" />
              Govt. Registered
            </div>
          </div>
        </div>
        
 
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl"></div>
        </div>
      </header>


      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-blue-100 overflow-hidden shadow-2xl">
              <img 
                src="/images/ImageBanner.png" 
                alt="Digital Finance" 
                className="w-full h-full object-contain mix-blend-multiply opacity-80"
              />
            </div>
            {/* Trust Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <MdSecurity size={24} />
                </div>
                <span className="font-black text-[#053B90]">100% Secure</span>
              </div>
              <p className="text-xs text-gray-500">Regulated under the Chit Fund Act 1982.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#053B90] mb-6">
                Redefining Financial Independence
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We are a registered chit fund company helping people from all walks of life. We understand the necessity of financial independence and thus connect them with necessary funds when they require it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                "Transparent Auctions",
                "Instant Payouts",
                "Govt. Compliant",
                "Paperless Process",
                "Flexible Plans",
                "High Returns"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700 font-bold">
                  <FaCheckCircle className="text-blue-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE PILLARS --- */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Why Choose MY CHITS?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">We combine traditional values with modern technology to provide the best financial experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MdTouchApp />,
                title: "User Friendly",
                desc: "Our intuitive digital interface makes participating in chits as easy as ordering food online."
              },
              {
                icon: <MdOutlineAccountBalance />,
                title: "Registered & Legal",
                desc: "Fully compliant with the Chit Fund Act 1982, ensuring your savings are always protected."
              },
              {
                icon: <MdTrendingUp />,
                title: "Exciting Returns",
                desc: "Maximize your savings with competitive dividend distributions and low-interest loans."
              }
            ].map((card, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="text-4xl text-blue-400 mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
                <h4 className="text-xl font-bold mb-4">{card.title}</h4>
                <p className="text-slate-400 leading-relaxed text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CAREERS / RECRUITMENT --- */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-sm mb-8">
            <MdGroups size={48} className="text-[#053B90] mx-auto" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#053B90] mb-6">Join Our Growing Team</h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Join our fast-growing team that's disrupting the traditional chit fund segment and offering exciting new opportunities to retail investors in India. We're looking for passionate individuals to help us build the future of finance.
          </p>
          
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <img src="/images/MyChitsLogo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-black text-[#053B90]">MY CHITS</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-gray-500">
              <Link href="https://mychits.co.in/privacypolicy.php" target="_blank" className="hover:text-[#053B90]">Privacy Policy</Link>
              <Link href="https://mychits.co.in/refundpolicy.php" target="_blank" className="hover:text-[#053B90]">Terms and Conditions</Link>
              <Link href="https://mychits.co.in/contact-us" className="hover:text-[#053B90]" target="_blank">Contact Us</Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            <p>© 2025 MY CHITS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;