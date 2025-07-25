import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import OverviewPage from "./pages/Monitor";
import ControlPump from "./pages/PumpControl";
import RegisterPage from "./pages/Register"
import MainLayout from "./components/MainLayout";
import OperatingStatus from "./pages/OperatingStatus";
import SensorManagement from "./pages/SensorManagement";
import ForgotPasswordPage from "./pages/ForgotPassword"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/monitor"
          element={
            <MainLayout activeItem="monitor">
              <OverviewPage />
            </MainLayout>
          }
        />

        <Route
          path="/pump-control"
          element={
            <MainLayout activeItem="pump_control">
              <ControlPump />
            </MainLayout>
          }
        />
        <Route 
          path="/dashboard/operating-status"
          element={
            <MainLayout activeItem="operating_status">
              <OperatingStatus />
            </MainLayout>
          }
        />
        <Route 
          path="/dashboard/sensor-management"
          element={
            <MainLayout activeItem="sensor_management">
              <SensorManagement />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
