import { useState, useEffect } from "react";
import { getJob, updateApplicationStatus } from "../api/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User, MoreVertical, Phone, Mail, MapPin, Eye, Briefcase } from "lucide-react";
import { toast } from "sonner";

const ApplicantsList = ({ jobId }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await getJob(jobId);
                if (response.data.success) {
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
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold">Applicants for {job.title}</h2>
                <p className="text-muted-foreground text-sm">
                    Total Applicants: {job.applicants?.length || 0}
                </p>
            </div>

            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {job.applicants && job.applicants.length > 0 ? (
                    job.applicants.map((app) => (
                        <Card key={app._id || app.user._id} className="overflow-hidden border shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                    {/* Applicant Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="w-10 h-10 border border-primary/10">
                                            {app.user?.avatar ? (
                                                <AvatarImage src={app.user.avatar.url} />
                                            ) : (
                                                <AvatarFallback><User className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                                            )}
                                        </Avatar>

                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-semibold">{app.user?.name || "Applicant Name"}</h3>
                                                <Badge variant={
                                                    app.status === 'hired' ? 'default' :
                                                        app.status === 'shortlisted' ? 'secondary' :
                                                            app.status === 'rejected' ? 'destructive' : 'outline'
                                                } className="text-[10px] h-5">
                                                    {app.status.toUpperCase()}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {app.user?.email || "No email"}
                                                </div>
                                                {app.user?.mobile && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {app.user.mobile}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedApplicant(app.user)}
                                            className="h-8 w-8 p-0"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4 text-primary" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8">
                                                    Status <MoreVertical className="ml-1 h-3 w-3" />
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
                    <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                        <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-sm font-medium">No Applicants Yet</h3>
                    </div>
                )}
            </div>

            {/* Applicant Details Modal (Nested) */}
            <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
                <DialogContent className="sm:max-w-md z-50">
                    <DialogHeader>
                        <DialogTitle>Applicant Details</DialogTitle>
                        <DialogDescription>
                            Profile information for {selectedApplicant?.name}
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

export default ApplicantsList;
