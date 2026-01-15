import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WeatherWidget from "@/components/WeatherWidget";
import MarketPrices from "@/components/MarketPrices";
import {
  Mic,
  Camera,
  MessageCircle,
  ShoppingCart,
  Zap,
  Bell,
  User,
  Settings,
  Leaf,
  Briefcase,
  Tractor,
  FileText
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getMyJobs, getAppliedJobs } from "../api/jobs";
import { chatWithAI } from "@/api/ai";
import { toast } from "sonner";
import { Users, PlusCircle } from "lucide-react";
import LandOwnerRequests from "./LandOwnerRequests"; // Added import
const FarmerDashboard = ({ onNavigate, onViewApplicants }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const handleVoiceAsk = () => {
    // Stop Speaking logic
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Stop Listening logic
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.lang = 'en-US'; // Can be dynamic based on i18n
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Ask your question");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;

      toast.success(`You said: "${transcript}"`);

      try {
        // Call AI
        const data = await chatWithAI(transcript);

        if (data.success && data.reply) {
          speakResponse(data.reply);
        }
      } catch (error) {
        console.error("AI Error:", error);
        toast.error("Failed to get answer");
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
      // toast.error("Could not hear you. Please try again.");
    };

    recognitionRef.current.start();
  };

  const speakResponse = (text) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };
  return <div className="min-h-screen bg-background">
    {
      /* Header */
    }
    <header className="bg-card shadow-soft border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary w-10 h-10 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Krishi Sanchay</h1>
              <p className="text-sm text-muted-foreground">Ram Kumar's Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Icons removed as per user request */}
          </div>
        </div>
      </div>
    </header>

    <div className="container mx-auto px-6 py-8">
      {/* Voice Assistant */}
      <Card className="farm-card mb-8 text-center bg-gradient-to-br from-green-50 to-white">
        <div className="flex flex-col items-center py-4">
          <div className={`bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${isListening ? 'animate-pulse scale-110 shadow-green-500/50' : isSpeaking ? 'animate-pulse shadow-blue-500/50' : 'animate-bounce-soft'}`}>
            <Mic className={`w-8 h-8 text-white ${isListening ? 'animate-ping' : ''}`} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ask AI Assistant</h2>
          <p className="text-muted-foreground mb-4">
            {isListening ? "Listening... (Click to stop)" : isSpeaking ? "Speaking... (Click to stop)" : "Ask \"How's the weather?\" or \"What's the wheat price?\""}
          </p>
          <Button
            className={`btn-farm transition-all duration-300 w-48 ${isListening ? 'bg-red-500 hover:bg-red-600' : isSpeaking ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            onClick={handleVoiceAsk}
          >
            {isListening ? "Stop Listening" : isSpeaking ? "Stop Speaking" : "Ask with Voice"}
          </Button>
        </div>
      </Card>

      {
        /* Main Dashboard Grid */
      }
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {
          /* Left Column */
        }
        <div className="lg:col-span-2 space-y-6">
          {
            /* Weather & Prices Row */
          }
          <div className="grid md:grid-cols-2 gap-6">
            <WeatherWidget />
            <MarketPrices />
          </div>

          {
            /* Quick Actions */
          }
          <Card className="farm-card">
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                className="btn-farm justify-start h-14"
                onClick={() => onNavigate("farmer-profile")}
              >
                <User className="w-5 h-5 mr-3" />
                My Profile
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 border-primary hover:bg-primary/10"
                onClick={() => onNavigate("land-management")}
              >
                <Leaf className="w-5 h-5 mr-3" />
                My Land
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 border-accent hover:bg-accent/10"
                onClick={() => onNavigate("product-management")}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                My Products
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 border-secondary hover:bg-secondary/50"
                onClick={() => onNavigate("crop-doctor")}
              >
                <Camera className="w-5 h-5 mr-3" />
                Crop Doctor
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 border-purple-500 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                onClick={() => onNavigate("land-requests")}
              >
                <Tractor className="w-5 h-5 mr-3" />
                Land Requests
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 border-orange-500 hover:bg-orange-500/10 text-orange-700 dark:text-orange-300"
                onClick={() => onNavigate("jobs-listing")}
              >
                <Briefcase className="w-5 h-5 mr-3" />
                Find Jobs
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 border-blue-500 hover:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                onClick={() => onNavigate("my-applications")}
              >
                <FileText className="w-5 h-5 mr-3" />
                My Applications
              </Button>
            </div>
          </Card>
        </div>

        {
          /* Right Column */
        }
        <div className="space-y-6">
          {
            /* Farm Stats */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Your Farm</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Land</span>
                <span className="font-semibold">5.2 Acres</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Crop</span>
                <span className="font-semibold">Wheat</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Planting Date</span>
                <span className="font-semibold">15 Nov 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Expected Harvest</span>
                <span className="font-semibold text-primary">20 Mar 2025</span>
              </div>
            </div>
          </Card>

          {
            /* Recent Activity */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Received AI advice</p>
                  <p className="text-muted-foreground">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-accent/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Uploaded crop photo</p>
                  <p className="text-muted-foreground">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-secondary/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Asked question in community</p>
                  <p className="text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Land Rental Requests Section */}
      <div className="mb-8">
        <LandOwnerRequests />
      </div>

      {/* My Jobs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MyJobsSection onNavigate={onNavigate} />
        <MyApplicationsSection />
      </div>

    </div>
  </div>;
};

const MyApplicationsSection = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await getAppliedJobs();
        if (response.data.success) {
          setApplications(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <Card className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">My Applications</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium text-muted-foreground">Job Title</th>
              <th className="pb-3 font-medium text-muted-foreground">Company</th>
              <th className="pb-3 font-medium text-muted-foreground">Applied Date</th>
              <th className="pb-3 font-medium text-muted-foreground text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-muted-foreground">You haven't applied to any jobs yet</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app._id} className="hover:bg-gray-50/50">
                  <td className="py-4 font-medium text-sm">{app.title}</td>
                  <td className="py-4 text-sm text-gray-600">{app.company}</td>
                  <td className="py-4 text-sm">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${app.myStatus === 'hired' ? 'bg-green-100 text-green-700' :
                      app.myStatus === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                        app.myStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {app.myStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ... imports
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ApplicantsList from "./ApplicantsList";

// ... inside FarmerDashboard component
const MyJobsSection = ({ onNavigate }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewApplicantsJobId, setViewApplicantsJobId] = useState(null); // State for modal

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getMyJobs();
        if (response.data.success) {
          setJobs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">My Posted Jobs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Title</th>
                <th className="pb-3 font-medium text-muted-foreground">Type</th>
                <th className="pb-3 font-medium text-muted-foreground">Posted Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Applicants</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center">Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-muted-foreground">No jobs posted yet</td></tr>
              ) : (
                jobs.map(job => (
                  <tr key={job._id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-medium text-sm">{job.title}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${job.jobType === 'Full-time' ? 'bg-green-100 text-green-700' :
                        job.jobType === 'Part-time' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {job.jobType}
                      </span>
                    </td>
                    <td className="py-4 text-sm">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {job.applicants ? job.applicants.length : 0}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewApplicantsJobId(job._id)}
                      >
                        View Applicants
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Applicants Modal */}
      <Dialog open={!!viewApplicantsJobId} onOpenChange={() => setViewApplicantsJobId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {viewApplicantsJobId && <ApplicantsList jobId={viewApplicantsJobId} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
var stdin_default = FarmerDashboard;
export {
  stdin_default as default
};




