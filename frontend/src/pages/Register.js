import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo-full.png";
import { createClient } from "@supabase/supabase-js";
import { API_BASE_URL } from "../config";
const supabase = createClient(
   process.env.REACT_APP_SUPABASE_URL,
   process.env.REACT_APP_SUPABASE_KEY
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
        setStatus("❌ Confirmation password does not match.");
        setLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
            data: { full_name: formData.fullName },
            // emailRedirectTo: "https://recover-password-de6c8.web.app/succesNoti.html",
            },
        });

        if (error) {
        setStatus("❌ " + error.message);
        } else {
        setStatus("✅ Registration successful!");

        // 👇 Thêm vào bảng user_profiles
        const res = await fetch(`${API_BASE_URL}/api/create-profile`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            user_id: data.user.id,
            full_name: formData.fullName,
            email: formData.email,
            address: "",   
            province: "",
            phone_number: "",
            }),
        });

        if (!res.ok) {
            const resData = await res.json();
            console.error("❌ Error saving profile:", resData.error);
        }
        }
    } catch (err) {
        setStatus("❌ System error: " + err.message);
    }

    setLoading(false);
    };


  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <div className="w-full max-w-md flex flex-col justify-center items-center px-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg py-10">
        <img src={Logo} alt="SmartSprout" className="w-40" />
        <h2 className="text-3xl font-bold text-blue-500 font-dancing">SmartFarm</h2>
        <p className="text-gray-500 mb-6">Tạo một tài khoản mới để bắt đầu</p>

        <form className="w-full" onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-medium mb-1">Tên hiển thị</label>
          <input
            type="text"
            name="fullName"
            placeholder="Nhập tên hiển thị"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {status && (
            <p
                className={`text-sm mb-4 ${
                status.startsWith("❌") ? "text-red-500" : "text-green-500"
                }`}
            >
                {status}
            </p>
            )}


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "⏳ Registering..." : "Register"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-blue-500 hover:underline"
        >
          Bạn đã có tài khoản? Đăng nhập ngay!
        </button>
      </div>
    </div>
  );
};

export default RegisterPage; 
