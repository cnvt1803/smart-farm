import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import OverviewPage from "./pages/Dashboard";
import ControlPump from "./pages/PumpControl"; 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/control" element={<ControlPump />} />
      </Routes>
    </Router>
  );
}

export default App;
