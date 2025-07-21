import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/footer.png";
import { API_BASE_URL } from "../config";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`❌ ${data.error || "Request failed"}`);
      } else {
        setStatus("✅ Please check your email to reset your password.");
      }
    } catch (err) {
      setStatus("❌ Error connecting to server.");
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <div className="w-full max-w-md px-8 py-10 rounded-lg bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="SmartSprout" className="w-24 mb-4" />
          <h2 className="text-3xl font-bold text-blue-500 font-dancing">SmartFarm</h2>
          <p className="text-gray-500 mb-6">Forgot your password?</p>
        </div>

        <form onSubmit={handleForgotPassword}>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {status && (
            <p
              className={`text-sm mb-4 ${
                status.startsWith("✅") ? "text-green-500" : "text-red-500"
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
            {loading ? "Processing..." : "Send reset link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="block mx-auto mt-4 text-blue-500 hover:underline"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
