import React from "react";
import Logo from "../assets/footer.png";

const Footer = () => {
  return (
    <footer className="h-[20vh] bg-blue-200 text-blue-800 py-8 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-6">
        <div className="flex flex-col items-start">
          <img src={Logo} alt="SmartSprout" className="w-16 mb-2" />
        </div>

        <div>
          <h3 className="font-semibold mb-1">📍 Address</h3>
          <p>Đại học Bách Khoa Cơ sở 1</p>
          <p>Đại học Bách Khoa Cơ sở 2</p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">📞 Phone number</h3>
          <p>0123 123 123</p>
          <p>0123 123 123</p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">📧 Email</h3>
          <p>xxx.XxxxXxxx@hcmut.edu.vn</p>
          <p>abc.Abcdef@hcmut.edu.vn</p>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-blue-700">
        © 2025 SmartSprout. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
