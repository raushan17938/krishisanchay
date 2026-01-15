import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  Building2,
  User,
  MoreVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { getJob, applyJob, updateApplicationStatus } from "../api/jobs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const JobDetails = ({ jobId, onBack, onApply }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from local storage
    const user = JSON.parse(localStorage.getItem('userInfo'));
    setCurrentUser(user);

    const fetchJob = async () => {
      try {
        const response = await getJob(jobId);
        if (response.data.success) {
          setJob(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load job details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    try {
      await applyJob(jobId);
      toast.success("Applied successfully!");
      // Refresh job details to update applied status
      const response = await getJob(jobId);
      if (response.data.success) {
        setJob(response.data.data);
      }
      onApply && onApply(jobId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  const handleStatusUpdate = async (userId, status) => {
    try {
      await updateApplicationStatus(jobId, userId, status);
      toast.success(`Application ${status}`);
      // Refresh job details
      const response = await getJob(jobId);
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case "Full-time":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Part-time":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Seasonal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) return <div className="p-8 text-center">Loading job details...</div>;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  const isRecruiter = currentUser && job.recruiter && (typeof job.recruiter === 'object' ? job.recruiter._id === currentUser._id : job.recruiter === currentUser._id);

  console.log("JobDetails Debug:", {
    currentUser: currentUser?._id,
    jobRecruiter: job.recruiter,
    isRecruiter,
    applicants: job.applicants
  });

  const hasApplied = currentUser && job.applicants && job.applicants.some(app => app.user === currentUser._id || (app.user && app.user._id === currentUser._id));

  // Helper to safely access nested properties
  const requirements = job.requirements ? (typeof job.requirements === 'string' ? job.requirements.split('\n') : job.requirements) : [];
  const responsibilities = job.responsibilities ? (typeof job.responsibilities === 'string' ? job.responsibilities.split('\n') : job.responsibilities) : [];
  const benefits = job.benefits ? (typeof job.benefits === 'string' ? job.benefits.split('\n') : job.benefits) : [];

  const displayContact = {
    name: job.contactName || job.contact?.name || "N/A",
    designation: job.designation || job.contact?.designation || "N/A",
    phone: job.phone || job.contact?.phone || "N/A",
    whatsapp: job.whatsapp || job.contact?.whatsapp || ""
  };

  return <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recruiter View: Applicants List */}
          {isRecruiter && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Applicants ({job.applicants?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.applicants && job.applicants.length > 0 ? (
                  <div className="space-y-4">
                    {job.applicants.map((app) => (
                      <div key={app._id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback><User /></AvatarFallback>
                          </Avatar>
                          <div>
                            {/* Note: In getJob regular view, applicant user details might not be populated. 
                                 Ideally we should fetch a separate endpoint for applicants details if getJob deeply populates or if we trust partial data.
                                 If user names are missing, it means getJob needs deeper population for recruiter.
                             */}
                            <p className="font-medium">{app.user?.name || "Applicant"}</p>
                            <p className="text-sm text-muted-foreground">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            app.status === 'hired' || app.status === 'shortlisted' ? 'default' :
                              app.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {app.status}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(app.user._id || app.user, 'shortlisted')}>
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(app.user._id || app.user, 'hired')}>
                                Hire
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(app.user._id || app.user, 'rejected')} className="text-red-600">
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No applicants yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Building2 className="w-4 h-4 mr-2" />
                    {job.company}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location}
                  </div>
                </div>
                <Badge className={getJobTypeColor(job.jobType)}>
                  {job.jobType}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">
                    {typeof job.pay === 'object' ? `\u20B9${job.pay.min}-${job.pay.max}` : job.pay}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {typeof job.pay === 'object' ? job.pay.type : 'per day'}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">{job.duration}</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">{job.applicants ? job.applicants.length : 0}</div>
                  <div className="text-xs text-muted-foreground">Applicants</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">Posted</div>
                  <div className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {requirements.length > 0 && <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {requirements.map((req, index) => <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{req}</span>
                </li>)}
              </ul>
            </CardContent>
          </Card>}

          {/* Responsibilities */}
          {responsibilities.length > 0 && <Card>
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {responsibilities.map((resp, index) => <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span className="text-foreground">{resp}</span>
                </li>)}
              </ul>
            </CardContent>
          </Card>}

          {/* Benefits */}
          {benefits.length > 0 && <Card>
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>)}
              </ul>
            </CardContent>
          </Card>}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card - Only show if not recruiter */}
          {!isRecruiter && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Apply for this Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasApplied ? (
                  <Button disabled className="w-full bg-green-600 text-white" size="lg">
                    <CheckCircle className="w-4 h-4 mr-2" /> Applied
                  </Button>
                ) : (
                  <Button
                    onClick={handleApply}
                    className="w-full bg-gradient-primary text-white"
                    size="lg"
                  >
                    Apply Now
                  </Button>
                )}

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Quick Contact</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`tel:${displayContact.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                    {displayContact.whatsapp && <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`https://wa.me/${displayContact.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recruiter sidebar info */}
          {isRecruiter && (
            <Card className="sticky top-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>Recruiter Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You are the poster of this job. Use the "Applicants" section to manage applications.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.workingHours && <div>
                <p className="text-sm font-medium mb-1">Working Hours</p>
                <p className="text-sm text-muted-foreground">{job.workingHours}</p>
                <Separator className="mt-4" />
              </div>}

              {job.startDate && <div>
                <p className="text-sm font-medium mb-1">Start Date</p>
                <p className="text-sm text-muted-foreground">{new Date(job.startDate).toLocaleDateString()}</p>
                <Separator className="mt-4" />
              </div>}

              {job.endDate && <div>
                <p className="text-sm font-medium mb-1">End Date</p>
                <p className="text-sm text-muted-foreground">{new Date(job.endDate).toLocaleDateString()}</p>
              </div>}
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{displayContact.name}</p>
                  <p className="text-sm text-muted-foreground">{displayContact.designation}</p>
                  <p className="text-sm text-muted-foreground mt-1">{displayContact.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>;
};
var stdin_default = JobDetails;
export {
  stdin_default as default
};
