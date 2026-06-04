import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ActivityList } from "@/pages/ActivityList";
import { ActivityDetail } from "@/pages/ActivityDetail";
import { DataManagement } from "@/pages/DataManagement";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<ActivityList />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/data" element={<DataManagement />} />
        </Routes>
      </div>
    </Router>
  );
}
