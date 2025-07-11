import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../components/supabaseClient";
import Logo from "../assets/footer.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // ✅ Lấy user đang login từ Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Nếu bạn có thêm metadata như full_name thì dùng user.user_metadata.full_name
        setUserName(user.user_metadata?.full_name || user.email);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="h-[9vh] bg-blue-200 shadow-md text-blue-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="Logo" className="w-16 h-auto object-contain" />
          <span className="text-2xl font-dancing font-semibold tracking-wide text-blue-700">
            SmartFarm
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Avatar + Dropdown */}
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
                {userName || "User"}
              </span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-20">
                <ul className="py-2 text-sm text-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate("/account-settings")}
                  >
                    Account settings
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={async () => {
                      await supabase.auth.signOut(); // ✅ logout khỏi Supabase
                      navigate("/login");            // 👉 quay lại login
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
