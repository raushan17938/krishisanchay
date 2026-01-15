import Job from '../models/Job.js';
import EmailService from '../services/EmailService.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res) => {
    try {
        req.body.recruiter = req.user.id;

        // Handle nested pay object if sent flattened or ensure structure
        // Frontend sends: payMin, payMax, payType
        if (req.body.payMin && req.body.payMax) {
            req.body.pay = {
                min: Number(req.body.payMin),
                max: Number(req.body.payMax),
                type: req.body.payType || 'per day'
            };
        }

        const job = await Job.create(req.body);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
    try {
        const { search, location, type, state } = req.query;
        const query = { isActive: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (location && location !== 'all') {
            query.$or = [
                { state: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } },
                { location: { $regex: location, $options: 'i' } }
            ]
        }

        if (state && state !== 'all') {
            query.state = { $regex: state, $options: 'i' };
        }

        if (type && type !== 'all') {
            query.jobType = type;
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('recruiter', 'name email avatar')
            .populate('applicants.user', 'name email avatar mobile location skills bio'); // Populating applicants to show in details

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
export const applyJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if user already applied
        const alreadyApplied = job.applicants.find(
            app => app.user.toString() === req.user.id
        );

        if (alreadyApplied) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        // Check if recruiter is applying to own job
        if (job.recruiter.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot apply to your own job' });
        }

        job.applicants.push({ user: req.user.id });
        await job.save();

        // Send Email to Candidate
        try {
            await EmailService.sendEmail(
                req.user.email,
                'Application Received',
                'job_applied_candidate',
                {
                    name: req.user.name,
                    jobTitle: job.title,
                    company: job.company
                }
            );
        } catch (emailError) {
            console.error('Candidate email failed:', emailError);
        }

        // Send Email to Recruiter
        try {
            const recruiter = await Job.findById(job._id).populate('recruiter');
            if (recruiter && recruiter.recruiter) {
                await EmailService.sendEmail(
                    recruiter.recruiter.email,
                    'New Job Application',
                    'job_applied_recruiter',
                    {
                        recruiterName: recruiter.recruiter.name,
                        jobTitle: job.title,
                        applicantName: req.user.name,
                        applicantEmail: req.user.email,
                        applicantPhone: req.user.phone || req.user.mobile || 'N/A'
                    }
                );
            }
        } catch (emailError) {
            console.error('Recruiter email failed:', emailError);
        }

        res.status(200).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get jobs posted by current user
// @route   GET /api/jobs/my-jobs
// @access  Private
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user.id })
            .sort({ createdAt: -1 })
            .populate('applicants.user', 'name email phone mobile avatar skills');
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


// @desc    Get jobs applied by current user
// @route   GET /api/jobs/applied-jobs
// @access  Private
export const getAppliedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ 'applicants.user': req.user.id })
            .select('title company jobType location status salary applicants')
            .sort({ createdAt: -1 });

        // Map jobs to include the specific status for this user
        const jobsWithStatus = jobs.map(job => {
            const application = job.applicants.find(app => app.user.toString() === req.user.id);
            return {
                ...job.toObject(),
                myStatus: application ? application.status : 'unknown',
                appliedAt: application ? application.appliedAt : null
            };
        });

        res.status(200).json({ success: true, count: jobsWithStatus.length, data: jobsWithStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application status (Accept/Reject)
// @route   PUT /api/jobs/:id/applications/:userId
// @access  Private (Recruiter)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'shortlisted', 'rejected', 'hired'
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Verify Recruiter
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const application = job.applicants.find(
            app => app.user.toString() === req.params.userId
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = status;
        await job.save();

        // Send Email to Applicant
        try {
            // Need to fetch user details to get email
            const populatedJob = await Job.findById(job._id).populate('applicants.user');
            const applicantUser = populatedJob.applicants.find(a => a.user._id.toString() === req.params.userId)?.user;

            if (applicantUser) {
                await EmailService.sendEmail(
                    applicantUser.email,
                    'Application Status Update',
                    'job_status_update',
                    {
                        name: applicantUser.name,
                        jobTitle: job.title,
                        company: job.company,
                        status: status.charAt(0).toUpperCase() + status.slice(1),
                        isAccepted: status === 'shortlisted' || status === 'hired'
                    }
                );
            }
        } catch (emailError) {
            console.error('Status update email failed:', emailError);
        }

        res.status(200).json({ success: true, message: `Application ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
