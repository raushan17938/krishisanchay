import Dashboard from "@/components/Dashboard";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import CommunityForum from "@/components/CommunityForum";
import EcommercePage from "@/components/EcommercePage";
import CropDoctor from "@/components/CropDoctor";
import AIAdvisor from "@/components/AIAdvisor";
import FarmersList from "@/components/FarmersList";
import FarmerDetail from "@/components/FarmerDetail";
import FarmerProfile from "./FarmerProfile";
import LandManagement from "./LandManagement";
import LandRental from "@/components/LandRental";
import ProductManagement from "./ProductManagement";
import JobsListing from "./JobsListing";
import JobDetails from "./JobDetails";
import PostJob from "./PostJob";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [currentView, setCurrentView] = useState("hero");
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const navigate = useNavigate();

  // Define protected views that require authentication
  const protectedViews = [
    "dashboard",
    "farmer-profile",
    "land-management",
    "product-management",
    "post-job"
  ];

  // Check authentication when view changes
  useEffect(() => {
    if (protectedViews.includes(currentView)) {
      const userInfo = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");

      if (!userInfo || !token) {
        toast.error("Please login to access this page");
        navigate("/login");
        // Optional: revert to hero if we want to stay on this route, but navigation away is cleaner
        // setCurrentView("hero"); 
      }
    }
  }, [currentView, navigate]);

  const handleViewFarmer = (farmerId) => {
    setSelectedFarmerId(farmerId);
    setCurrentView("farmer-detail");
  };
  const handleBackToList = () => {
    setCurrentView("land-rental");
    setSelectedFarmerId(null);
  };
  const handleViewJob = (jobId) => {
    setSelectedJobId(jobId);
    setCurrentView("job-details");
  };
  const handleBackToJobs = () => {
    setCurrentView("jobs-listing");
    setSelectedJobId(null);
  };
  const handlePostJob = () => {
    setCurrentView("post-job");
  };
  const handleApplyForJob = (jobId) => {

  };
  const renderCurrentView = () => {
    switch (currentView) {
      case "hero":
        return <Hero onNavigate={setCurrentView} />;
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />;
      case "land-rental":
        return <LandRental />;
      case "farmer-detail":
        return selectedFarmerId ? <FarmerDetail farmerId={selectedFarmerId} onBack={handleBackToList} /> : <FarmersList onViewFarmer={handleViewFarmer} />;
      case "community":
        return <CommunityForum />;
      case "shop":
        return <EcommercePage />;
      case "crop-doctor":
        return <CropDoctor />;
      case "ai-advisor":
        return <AIAdvisor />;
      case "farmer-profile":
        return <FarmerProfile onBack={() => setCurrentView("dashboard")} />;
      case "land-management":
        return <LandManagement onBack={() => setCurrentView("dashboard")} />;
      case "product-management":
        return <ProductManagement onBack={() => setCurrentView("dashboard")} />;
      case "jobs-listing":
        return <JobsListing onBack={() => setCurrentView("dashboard")} onViewJob={handleViewJob} onPostJob={handlePostJob} />;
      case "job-details":
        return selectedJobId ? <JobDetails jobId={selectedJobId} onBack={handleBackToJobs} onApply={handleApplyForJob} /> : <JobsListing onBack={() => setCurrentView("dashboard")} onViewJob={handleViewJob} onPostJob={handlePostJob} />;
      case "post-job":
        return <PostJob onBack={handleBackToJobs} onPreview={(jobData) => { }} />
      default:
        return <Hero />;
    }
  };
  return <div className="min-h-screen bg-background">
    <Navigation currentView={currentView} setCurrentView={setCurrentView} />
    <div className="pt-16 lg:pt-24">
      {renderCurrentView()}
    </div>
  </div>;

};
var stdin_default = Index;
export {
  stdin_default as default
};
