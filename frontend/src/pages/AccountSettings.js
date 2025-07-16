import React, { useState, useEffect } from "react";

const AccountSettings = () => {
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const [imageFile, setImageFile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSaveAvatar = async () => {
    // TODO: Gửi imageFile lên server nếu muốn
  };

  const handleSaveChanges = () => {
    alert("Thông tin cá nhân đã được cập nhật!");
    handleSaveAvatar(); // Gửi avatar nếu có
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Vui lòng nhập email!");
      return;
    }

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Email khôi phục mật khẩu đã được gửi.");
      } else {
        alert(data.error || "Đã xảy ra lỗi.");
      }
    } catch (error) {
      alert("Lỗi hệ thống: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Cài Đặt Tài Khoản</h2>

      {/* Thông Tin Cá Nhân */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Thông Tin Cá Nhân</h3>
        <div className="flex items-center space-x-4 mb-4">
          <img src={profileImage} alt="Avatar" className="w-20 h-20 rounded-full border" />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <label className="block mb-1">Họ và tên</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleSaveChanges}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Lưu thay đổi
        </button>
      </div>

      {/* Đổi Mật Khẩu qua Email */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Khôi Phục Mật Khẩu</h3>
        <p className="text-gray-600 mb-3">
          Hệ thống sẽ gửi một email khôi phục mật khẩu về địa chỉ của bạn.
        </p>
        <button
          onClick={handleForgotPassword}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Gửi email khôi phục mật khẩu
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
