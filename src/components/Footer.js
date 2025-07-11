import React from "react";
import Logo from "../assets/footer.png";

const Footer = () => {
  return (
    <footer className="h-[20vh] bg-blue-200 text-blue-800 py-8 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-6">
        <div>
          <h3 className="font-semibold mb-3">🏷️ Name</h3>
          <p>Cao Nguyen Van Truong</p>
          <p>Đại học Bách Khoa Cơ sở 2</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">🏛️ University</h3>
          <p>Ho Chi Minh University of Technology</p>
          <p>Ho Chi Minh University of Technology</p>
        </div>

        <div className="ml-5">
          <h3 className="font-semibold mb-3">📞  Phone number</h3>
          <p className="ml-6">0967 413 008</p>
          <p className="ml-6">0123 123 123</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">📧 Email</h3>
          <p>truong.caonguyenvan@hcmut.edu.vn</p>
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
