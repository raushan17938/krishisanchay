import Job from '../models/Job.js';

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
        const job = await Job.findById(req.params.id).populate('recruiter', 'name email avatar');

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
        const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
