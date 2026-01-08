import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { getJobs } from "../api/jobs";
const JobsListing = ({ onBack, onViewJob, onPostJob }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const filters = {
          search: searchTerm,
          location: locationFilter,
          type: jobTypeFilter
        };
        const response = await getJobs(filters);
        if (response.data.success) {
          setJobs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, locationFilter, jobTypeFilter]);

  // Helper for color
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
  return <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      {
        /* Header */
      }
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Available Jobs</h1>
            <p className="text-muted-foreground mt-2">Find farming jobs near you</p>
          </div>
          <Button onClick={onPostJob} className="bg-gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Post a Job
          </Button>
        </div>

        {
          /* Filters */
        }
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Punjab">Punjab</SelectItem>
              <SelectItem value="Haryana">Haryana</SelectItem>
              <SelectItem value="Rajasthan">Rajasthan</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Gujarat">Gujarat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Seasonal">Seasonal</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {
        /* Jobs Grid */
      }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => <Card key={job._id || job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{job.company}</p>
              </div>
              <Badge className={getJobTypeColor(job.jobType)}>
                {job.jobType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-2" />
                {typeof job.pay === 'object' ? `\u20B9${job.pay.min}-${job.pay.max} ${job.pay.type}` : job.pay}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Duration: {job.duration}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                {job.applicants ? job.applicants.length : 0} applicants
              </div>

              <p className="text-sm text-foreground line-clamp-2 mt-2">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-1 mt-2">
                {job.skills && job.skills.slice(0, 2).map((skill, index) => <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>)}
                {job.skills && job.skills.length > 2 && <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 2} more
                </Badge>}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-xs text-muted-foreground">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                <Button
                  onClick={() => onViewJob(job._id || job.id)}
                  className="bg-gradient-primary text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}
      </div>

      {jobs.length === 0 && !loading && <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No jobs found matching your criteria</p>
          <p className="text-sm">Try adjusting your filters or search terms</p>
        </div>
      </div>}

      {loading && <div className="text-center py-12">Loading jobs...</div>}
    </div>
  </div>;
};
var stdin_default = JobsListing;
export {
  stdin_default as default
};
