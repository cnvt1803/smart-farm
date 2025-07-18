import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AccountSettings = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          setName(data.full_name || "");
          setAddress(data.address || "");
          setProvince(data.province || "");
          setPhoneNumber(data.phone_number || "");
          setEmail(data.email || "");
          setRole(data.role || "");
        }
      } catch (err) {
        console.error("Error loading user information:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: name,
          address,
          province,
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Personal information has been updated!");
      } else {
        alert(data.error || "An error occurred while updating.");
      }
    } catch (err) {
      alert("System error: " + err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Account email not found!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Password change email sent.");
      } else {
        alert(data.error || "An error occurred.");
      }
    } catch (error) {
      alert("System error: " + error.message);
    }
  };

  if (loading)
    return <p className="text-center py-10">Loading account information...</p>;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-center">Personal Information</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Province / City</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                type="text"
                value={role}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-2 text-center">Change Password</h3>
        <p className="text-center text-gray-600 mb-4">
          The system will send a password change email to your registered email.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleForgotPassword}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Send Password Change Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
