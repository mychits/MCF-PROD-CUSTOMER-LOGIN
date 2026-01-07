import React from "react";
import { 
  MdArrowBack, 
  MdQrCodeScanner, 
  MdVerifiedUser, 
  MdAccountBalance,
  MdInfoOutline 
} from "react-icons/md";
import { HiOutlineBadgeCheck } from "react-icons/hi";

const QrCodePage = () => {
 
    const qrCodeImageUrl = "/assets/upi_qr.png"; 

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] font-sans selection:bg-blue-100">
            <div className="bg-[#042f74] pt-10 pb-24 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-[-10px] w-28 h-28 bg-white/5 rounded-full blur-2xl"></div>

                <div className="max-w-4xl mx-auto relative">
                    <button 
                        onClick={handleBack}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-90 flex items-center justify-center border border-white/5"
                        aria-label="Go back"
                    >
                        <MdArrowBack size={24} />
                    </button>

                    <div className="text-center mt-10 text-white transform transition-all duration-700 ease-out">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Payment QR Code</h1>
                        <p className="text-white/70 text-sm md:text-base font-medium max-w-xs mx-auto">
                            Use this code to make payments instantly to your chit account
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-6 -mt-12 relative z-10 pb-20">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-900/10 border border-slate-100 flex flex-col items-center">
                    
                    <div className="flex flex-col items-center gap-3 mb-10">
                        <div className="bg-blue-50 p-4 rounded-2xl text-[#042f74]">
                            <MdQrCodeScanner size={40} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">MyChits Payments</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Payment Gateway</p>
                        </div>
                    </div>

                    <div className="w-full flex flex-col items-center gap-8">
                        <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-slate-100 transition-colors">
                            <p className="text-lg font-bold text-slate-700 text-center">
                                <span className="text-slate-400 font-medium mr-2">UPI ID:</span>
                                <span className="text-[#042f74] select-all uppercase">mychits@kotak</span>
                            </p>
                        </div>

                        {/* QR Image Frame */}
                        <div className="relative p-6 bg-white rounded-[3rem] border-8 border-slate-50 shadow-inner group transition-transform duration-500 hover:scale-[1.02]">
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#042f74] rounded-tl-lg"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#042f74] rounded-tr-lg"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#042f74] rounded-bl-lg"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#042f74] rounded-br-lg"></div>

                            <img 
                                src={qrCodeImageUrl} 
                                alt="UPI Payment QR" 
                                className="w-60 h-60 md:w-72 md:h-72 object-contain"
                                onError={(e) => {
                                    e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=mychits@kotak&pn=MyChits&cu=INR";
                                }}
                            />
                        </div>
                    </div>

                    <div className="w-full mt-10 pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full">
                            <HiOutlineBadgeCheck size={20} />
                            <p className="text-sm font-bold tracking-tight">Verified Secure Payment</p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 py-4 px-8 rounded-3xl w-full hover:bg-slate-100 transition-colors group">
                            <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <MdAccountBalance size={24} className="text-[#042f74]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nodal Bank</p>
                                <p className="text-lg font-black text-slate-800 leading-none">Kotak Mahindra Bank</p>
                            </div>
                        </div>

                        {/* Instructional Help */}
                        <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl w-full">
                            <MdInfoOutline className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Once the payment is complete, please allow 5-10 minutes for the balance to reflect in your MyChits Passbook.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button className="text-[#042f74] text-sm font-bold hover:underline flex items-center gap-2">
                        Download QR for Later
                    </button>
                    <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
                    <p className="text-xs text-slate-400">
                        Transaction secured by BHIM UPI Standard
                    </p>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                body { -webkit-tap-highlight-color: transparent; }
                ::-webkit-scrollbar { width: 0px; background: transparent; }
            `}} />
        </div>
    );
};

export default QrCodePage;