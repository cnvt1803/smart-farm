import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import OverviewPage from "./pages/Monitor";
import ControlPump from "./pages/PumpControl";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />

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
          path="/dashboard"
          element={
            <MainLayout activeItem="dashboard">
              <h1>Dashboard</h1>
              <p>This is the dashboard page.</p>
            </MainLayout>
          }
        />
        <Route 
          path="/dashboard/operating-status"
          element={
            <MainLayout activeItem="operating_status">
              <h1>Operating Status</h1>
              <p>This is the operating status page.</p>
            </MainLayout>
          }
        />
        <Route 
          path="/dashboard/sensor-management"
          element={
            <MainLayout activeItem="sensor_management">
              <h1>Sensor Management</h1>
              <p>This is the sensor management page.</p>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
