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
      </Routes>
    </Router>
  );
}

export default App;
