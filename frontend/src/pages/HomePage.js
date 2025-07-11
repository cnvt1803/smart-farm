import React from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import Footer from "../components/Footer";
import LogoBk from "../assets/LogoBk.png";
import Logo from "../assets/homepage.jpg";
import homepagePic1 from "../assets/homepage1.webp";
import homepagePic2 from "../assets/homepage2.png";

const HomePage = () => {
    const navigate = useNavigate(); // Khởi tạo hook navigate

    return (
        <div className="font-sans flex flex-col min-h-screen bg-white">
            {/* Navbar */}
            <nav className="mb-10 flex justify-between items-center p-4 border-b bg-blue-100 shadow-sm">
                <div className="flex items-center space-x-2">
                    <img src={LogoBk} alt="Logo" className="w-[50px]" />
                    <span className="font-semibold text-lg text-blue-800">
                    Ho Chi Minh University of Technology
                    </span>
                </div>
                <div className="space-x-4">
                    <button
                    onClick={() => navigate("/register")}
                    className="border-2 border-blue-600 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition"
                    >
                    Đăng ký
                    </button>
                    <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                    Đăng nhập
                    </button>
                </div>
            </nav>

            {/* Nội dung chính */}
            <main className="flex-grow">
            <div className="mr-5 flex justify-center items-center p-4 space-x-20 flex-wrap">
                <div className="text-center py-10 px-6">
                <h1 className="text-4xl font-bold">Welcome to</h1>
                <h2 className="text-5xl text-blue-500 mt-2 font-dancing">Smart Farm Platform</h2>
                <img src={Logo} alt="Logo" className="w-[330px] mx-auto" />
                <p className="text-lg mt-4">
                    Let technology help you create the perfect green space!
                </p>
                <p className="text-lg">Experience the Smart Farm Platform system now!</p>
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
