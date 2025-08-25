import React from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import Footer from "../components/Footer";
import Logomain from "../assets/logo-full.png";
import Logo from "../assets/homepage.jpg";
import homepagePic1 from "../assets/homepage1.webp";
import homepagePic2 from "../assets/homepage2.png";

const HomePage = () => {
    const navigate = useNavigate(); // Khởi tạo hook navigate

    return (
        <div className="font-sans flex flex-col min-h-screen bg-white">
            {/* Navbar */}
            <nav className="
                sticky top-0 z-50
                backdrop-blur-xl
                bg-gradient-to-r from-[#E3E0FF]/95 via-[#D7DBFF]/95 to-[#E3E0FF]/95
                border-b border-[#C3C9FF]/80
                dark:from-[#121833]/75 dark:via-[#0F2236]/70 dark:to-[#121833]/75 dark:border-white/10
                ">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-lime-400/20 to-transparent blur-md" />
                        <img
                        src={Logomain}
                        alt="SmartFarm"
                        className="relative w-10 h-10 rounded-2xl bg-white p-1 ring-1 ring-emerald-500/40 shadow-xl object-contain
                                    transition-transform duration-200 hover:scale-105"
                        />
                    </div>
                    <span className="text-base sm:text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
                        Smart Farm Platform
                    </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/register')}
                        className="
                        h-10 px-4 rounded-xl
                        border border-white/60 bg-white/60 text-slate-800
                        hover:bg-white/80
                        shadow-sm backdrop-blur
                        focus:outline-none focus:ring-2 focus:ring-indigo-300
                        dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 dark:focus:ring-white/30
                        "
                    >
                        Đăng ký
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="
                        h-10 px-4 rounded-xl
                        bg-indigo-500 text-white hover:bg-indigo-600
                        shadow focus:outline-none focus:ring-2 focus:ring-indigo-300
                        "
                    >
                        Đăng nhập
                    </button>
                    </div>
                </div>
                </nav>

            {/* Nội dung chính */}
            <main className="flex-grow">
            <div className="mr-5 flex justify-center items-center p-4 space-x-20 flex-wrap">
                <div className="text-center py-10 px-6">
                <h1 className="text-4xl font-bold">Chào mừng tới</h1>
                <h2 className="text-5xl text-blue-500 mt-2 font-dancing">Smart Farm Platform</h2>
                <img src={Logo} alt="Logo" className="w-[330px] mx-auto" />
                <p className="text-lg mt-4">
                 Hãy để công nghệ giúp bạn tạo ra không gian xanh hoàn hảo!
                </p>
                <p className="text-lg">
                    Trải nghiệm hệ thống Smart Farm Platform ngay!</p>
                </div>

                <div className="ml-5 flex flex-col items-center space-y-4">
                <img src={homepagePic1} alt="Logo" className="w-[330px]" />
                <img src={homepagePic2} alt="Logo" className="w-[330px]" />
                </div>
            </div>
            </main>

            {/* Footer luôn ở cuối */}
            <Footer />
        </div>
        );

};

export default HomePage;
