import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Plus,
  X,
  Save,
  Eye
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createJob } from "../api/jobs";
const PostJob = ({ onBack, onPreview }) => {
  const { toast } = useToast();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    state: "",
    city: "",
    payMin: "",
    payMax: "",
    payType: "per day",
    jobType: "Full-time",
    duration: "",
    startDate: "",
    endDate: "",
    workingHours: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    contactName: "",
    designation: "",
    phone: "",
    whatsapp: "",
    accommodationProvided: false,
    transportationProvided: false,
    mealsProvided: false
  });
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    try {
      const jobData = {
        ...formData,
        skills
      };
      await createJob(jobData);
      toast({
        title: "Job posted successfully!",
        description: "Your job listing is now live and visible to farmers."
      });
      onBack();
    } catch (error) {
      console.error("Job post failed:", error);
      toast({
        title: "Failed to post job",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };
  const handlePreview = () => {
    const jobData = {
      ...formData,
      skills,
      id: Date.now(),
      postedDate: "Today",
      applicants: 0
    };
    onPreview(jobData);
  };
  return <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Jobs
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Post a New Job</h1>
            <p className="text-muted-foreground mt-2">Find the right candidates for your farming needs</p>
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {
          /* Basic Information */
        }
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Harvest Helper, Tractor Driver"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company/Farm Name *</Label>
                <Input
                  id="company"
                  placeholder="e.g., Green Valley Farms"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="punjab">Punjab</SelectItem>
                    <SelectItem value="haryana">Haryana</SelectItem>
                    <SelectItem value="rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="gujarat">Gujarat</SelectItem>
                    <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="madhya-pradesh">Madhya Pradesh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City/District *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Ludhiana"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Full Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Village Kharar, Ludhiana"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {
          /* Job Details */
        }
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="jobType">Job Type</Label>
                <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 months, 6 months"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  placeholder="e.g., 6:00 AM - 2:00 PM"
                  value={formData.workingHours}
                  onChange={(e) => handleInputChange("workingHours", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (if applicable)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {
          /* Compensation */
        }
        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="payMin">Minimum Pay *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="payMin"
                    placeholder="500"
                    value={formData.payMin}
                    onChange={(e) => handleInputChange("payMin", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="payMax">Maximum Pay *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="payMax"
                    placeholder="800"
                    value={formData.payMax}
                    onChange={(e) => handleInputChange("payMax", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="payType">Pay Type</Label>
                <Select value={formData.payType} onValueChange={(value) => handleInputChange("payType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per day">Per Day</SelectItem>
                    <SelectItem value="per month">Per Month</SelectItem>
                    <SelectItem value="per hour">Per Hour</SelectItem>
                    <SelectItem value="per task">Per Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {
          /* Job Description */
        }
        <Card>
          <CardHeader>
            <CardTitle>Job Description & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the job role, what the candidate will be doing, and any important details..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List the skills, experience, and qualifications required for this job..."
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="responsibilities">Key Responsibilities</Label>
              <Textarea
                id="responsibilities"
                placeholder="List the main tasks and responsibilities..."
                value={formData.responsibilities}
                onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <Textarea
                id="benefits"
                placeholder="List any additional benefits, bonuses, or perks..."
                value={formData.benefits}
                onChange={(e) => handleInputChange("benefits", e.target.value)}
                rows={3}
              />
            </div>

            {
              /* Skills */
            }
            <div>
              <Label>Required Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => <Badge key={skill} variant="secondary" className="pl-2 pr-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {
          /* Additional Benefits */
        }
        <Card>
          <CardHeader>
            <CardTitle>Additional Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accommodation"
                  checked={formData.accommodationProvided}
                  onCheckedChange={(checked) => handleInputChange("accommodationProvided", !!checked)}
                />
                <Label htmlFor="accommodation">Accommodation Provided</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transportation"
                  checked={formData.transportationProvided}
                  onCheckedChange={(checked) => handleInputChange("transportationProvided", !!checked)}
                />
                <Label htmlFor="transportation">Transportation Provided</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="meals"
                  checked={formData.mealsProvided}
                  onCheckedChange={(checked) => handleInputChange("mealsProvided", !!checked)}
                />
                <Label htmlFor="meals">Meals Provided</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {
          /* Contact Information */
        }
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Contact Person Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Your full name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  placeholder="e.g., Farm Manager, Owner"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  placeholder="+91 98765 43210"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {
          /* Submit */
        }
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-primary text-white">
            <Save className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        </div>
      </form>
    </div>
  </div>;
};
var stdin_default = PostJob;
export {
  stdin_default as default
};
