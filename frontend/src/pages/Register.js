import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/footer.png";
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
        setStatus("✅ Registration successful! Check your email for confirmation.");

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
        <img src={Logo} alt="SmartSprout" className="w-24 mb-4" />
        <h2 className="text-3xl font-bold text-blue-500 font-dancing">SmartSprout</h2>
        <p className="text-gray-500 mb-6">Create a new account to get started</p>

        <form className="w-full" onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-medium mb-1">Display name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter display name"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Confirm password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
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
          Already have an account? Sign in now
        </button>
      </div>
    </div>
  );
};

export default RegisterPage; 
