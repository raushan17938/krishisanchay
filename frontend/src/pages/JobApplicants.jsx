import { useState, useEffect } from "react";
import { getJob, updateApplicationStatus } from "../api/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User, MoreVertical, ArrowLeft, Phone, Mail, MapPin, Eye, Briefcase } from "lucide-react"; // Added Eye, Briefcase
import { toast } from "sonner";

const JobApplicants = ({ jobId, onBack }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState(null); // State for modal

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await getJob(jobId);
                if (response.data.success) {
                    console.log("Job Data:", response.data.data);
                    setJob(response.data.data);
                }
            } catch (error) {
                toast.error("Failed to load applicants");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (jobId) fetchJob();
    }, [jobId]);

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

    if (loading) return <div className="p-8 text-center">Loading applicants...</div>;
    if (!job) return <div className="p-8 text-center">Job not found</div>;

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="container mx-auto px-6 py-8">
                <Button variant="ghost" onClick={onBack} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Applicants</h1>
                        <p className="text-muted-foreground">
                            Managing applications for <span className="font-semibold text-foreground">{job.title}</span>
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {job.applicants && job.applicants.length > 0 ? (
                            job.applicants.map((app) => (
                                <Card key={app._id || app.user._id} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">

                                            {/* Applicant Info */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <Avatar className="w-12 h-12 border-2 border-primary/10">
                                                    {app.user?.avatar ? (
                                                        <AvatarImage src={app.user.avatar.url} />
                                                    ) : (
                                                        <AvatarFallback><User className="w-6 h-6 text-muted-foreground" /></AvatarFallback>
                                                    )}
                                                </Avatar>

                                                <div>
                                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                                        <h3 className="font-semibold text-lg">{app.user?.name || "Applicant Name"}</h3>
                                                        <Badge variant={
                                                            app.status === 'hired' ? 'default' :
                                                                app.status === 'shortlisted' ? 'secondary' :
                                                                    app.status === 'rejected' ? 'destructive' : 'outline'
                                                        }>
                                                            {app.status.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3" />
                                                            {app.user?.email || "No email"}
                                                        </div>
                                                        {app.user?.mobile && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-3 h-3" />
                                                                {app.user.mobile}
                                                            </div>
                                                        )}
                                                        {/* If we had location or skills for user, distinct from job location, we'd show it here */}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Applied Date */}
                                            <div className="text-sm text-muted-foreground md:text-right">
                                                <p className="mb-1">Applied on</p>
                                                <p className="font-medium text-foreground">{new Date(app.appliedAt).toLocaleDateString()}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 md:border-l md:pl-6">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedApplicant(app.user)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            Update Status <MoreVertical className="ml-2 h-4 w-4" />
                                                        </Button>
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
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No Applicants Yet</h3>
                                <p className="text-muted-foreground">Waiting for candidates to apply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Applicant Details Modal */}
            <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Applicant Details</DialogTitle>
                        <DialogDescription>
                            Full profile information for {selectedApplicant?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApplicant && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    {selectedApplicant.avatar ? (
                                        <AvatarImage src={selectedApplicant.avatar.url} />
                                    ) : (
                                        <AvatarFallback>{selectedApplicant.name?.charAt(0)}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedApplicant.name}</h3>
                                    <p className="text-muted-foreground">{selectedApplicant.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4" /> Contact
                                    </h4>
                                    <p>{selectedApplicant.mobile || "Not provided"}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4" /> Location
                                    </h4>
                                    <p>
                                        {[
                                            selectedApplicant.location?.village,
                                            selectedApplicant.location?.district,
                                            selectedApplicant.location?.state
                                        ].filter(Boolean).join(", ") || "Not provided"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="w-4 h-4" /> Skills & Experience
                                    </h4>
                                    <div className="bg-muted/30 p-3 rounded-md text-sm">
                                        <p><strong>Experience:</strong> {selectedApplicant.skills?.experience || "N/A"}</p>
                                        <p><strong>Specialization:</strong> {selectedApplicant.skills?.specialization || "N/A"}</p>
                                        <p><strong>Land Owned:</strong> {selectedApplicant.skills?.landSize || "N/A"}</p>
                                    </div>
                                </div>
                                {selectedApplicant.bio && (
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                                        <p className="text-sm text-gray-600">{selectedApplicant.bio}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => setSelectedApplicant(null)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JobApplicants;
