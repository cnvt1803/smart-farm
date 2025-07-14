import React from "react";

const Footer = () => {
  return (
    <footer className="h-[20vh] bg-blue-200 text-blue-800 py-8 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-6">
        <div>
          <h3 className="font-semibold mb-3">🏷️ Name</h3>
          <p>Cao Nguyen Van Truong</p>
          <p>Nguyen Le Anh Duc</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">🏛️ University</h3>
          <p>Ho Chi Minh University of Technology</p>
          <p>Ho Chi Minh University of Technology</p>
        </div>

        <div className="ml-5">
          <h3 className="font-semibold mb-3">📞  Phone number</h3>
          <p className="ml-6">0967 413 008</p>
          <p className="ml-6">0983 779 276</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">📧 Email</h3>
          <p>truong.caonguyenvan@hcmut.edu.vn</p>
          <p>duc.nguyenterabyte13@hcmut.edu.vn</p>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-blue-700">
        © ABC solution - 2025 SmartFarm. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
