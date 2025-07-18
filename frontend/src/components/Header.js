import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import Logo from "../assets/footer.png";
import AccountSettings from "../components/AccountSettings";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Bạn chưa đăng nhập");
        }

        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Không lấy được thông tin người dùng");
        }

        setUserName(data.full_name || "");

      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchUserProfile();
  }, [localStorage.getItem("access_token")]); 

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[9vh] bg-blue-200 shadow-md text-blue-800 flex items-center justify-between px-6">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="w-12 h-auto object-contain" />
          <span className="text-2xl font-dancing font-semibold tracking-wide text-blue-700">
            SmartFarm
          </span>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 hover:scale-105 transition"
          >
            <img
              src={Logo}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-blue-300 object-cover"
            />
            <span className="font-medium text-blue-800">
              {userName}
            </span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-20">
              <ul className="py-2 text-sm text-gray-700">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setShowAccountSettings(true);
                    setIsOpen(false);
                  }}
                >
                  Account settings
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    navigate("/login");
                  }}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Popup Account Settings */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-xl">
            <button
              onClick={() => setShowAccountSettings(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
            <AccountSettings />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
