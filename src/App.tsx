import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ActivityList } from "@/pages/ActivityList";
import { ActivityDetail } from "@/pages/ActivityDetail";
import { DataManagement } from "@/pages/DataManagement";
import { ImageLibrary } from "@/pages/ImageLibrary";
import { OnSiteKanban } from "@/pages/OnSiteKanban";
import { OnSiteQuickClaim } from "@/pages/OnSiteQuickClaim";
import { MaterialTemplateLibrary } from "@/pages/MaterialTemplateLibrary";
import { TemplateIndependenceVerification } from "@/pages/TemplateIndependenceVerification";
import { ActivityReviewReport } from "@/components/ActivityReviewReport";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<ActivityList />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/activity/:id/kanban" element={<OnSiteKanban />} />
          <Route path="/activity/:id/report" element={<ActivityReviewReport />} />
          <Route path="/activity/:id/quick-claim" element={<OnSiteQuickClaim />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/images" element={<ImageLibrary />} />
          <Route path="/templates" element={<MaterialTemplateLibrary />} />
          <Route path="/verification" element={<TemplateIndependenceVerification />} />
        </Routes>
      </div>
    </Router>
  );
}
