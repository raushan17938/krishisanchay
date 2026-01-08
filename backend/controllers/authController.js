import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import User from '../models/User.js';
import EmailService from '../services/EmailService.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;
        email = email.toLowerCase();

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            // Check if they are trying to register with password but already have a social account
            if (userExists.authMethods.length > 0 && !userExists.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Account exists via Social Login. Please Login with Google/GitHub first to set a password.'
                });
            }
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            isEmailVerified: false // Explicitly set to false 
        });

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and save to DB
        user.verificationOtp = crypto.createHash('sha256').update(otp).digest('hex');
        user.verificationOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await user.save();

        // Send Email
        try {
            await EmailService.sendEmail(
                user.email,
                'Verify your email - Krishi Sanchay',
                'verification',
                {
                    otp,
                    email: user.email,
                    name: user.name
                }
            );

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for verification OTP.',
                userId: user._id
            });

        } catch (emailError) {
            // Rollback user creation if email fails? 
            // Or just let them resend? Let's just log it for now and tell them to resend.
            console.error('Registration Email Error:', emailError);
            res.status(201).json({
                success: true,
                message: 'Registration successful but failed to send email. Please use "Resend OTP".',
                userId: user._id
            });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }
        email = email.toLowerCase();

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            verificationOtp: hashedOtp,
            verificationOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Verify user
        user.isEmailVerified = true;
        user.verificationOtp = undefined;
        user.verificationOtpExpire = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            _id: user.id,
            name: user.name,
            email: user.email,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Email not verified. Please verify your email first.',
                isUnverified: true // Frontend can use this to show OTP input
            });
        }

        // Check if user has a password (if not, they probably used social login)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'Account exists but has no password. Please login with Google or GitHub.'
            });
        }

        // Check if password matches
        if (await user.matchPassword(password)) {
            const token = generateToken(user._id);

            res.json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token,
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Handle Avatar Upload
            if (req.file) {
                const streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'Krishi_Sanchay_Profiles',
                            },
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };
                const result = await streamUpload(req);
                user.avatar = result.secure_url;
            }

            // If location is being updated
            // With FormData, nested objects might come differently or as flattened keys if manually handled.
            // Express urlencoded extended: true supports nested objects like location[village]
            if (req.body.location) {
                user.location = {
                    ...user.location,
                    ...req.body.location
                };
            }

            // Update other fields as needed
            if (req.body.bio) user.bio = req.body.bio;
            if (req.body.mobile) user.mobile = req.body.mobile;
            if (req.body.skills) user.skills = req.body.skills;

            // Handle password update separately if needed, but usually separate endpoint
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    location: updatedUser.location,
                    bio: updatedUser.bio,
                    mobile: updatedUser.mobile,
                    skills: updatedUser.skills,
                    avatar: updatedUser.avatar
                },
                message: "Profile updated successfully"
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile update error", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
};

// @desc    Initiate Google Login
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req, res) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`}/api/auth/google/callback`,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);
    res.redirect(`${rootUrl}?${qs.toString()}`);
};

// @desc    Google Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
    const code = req.query.code;

    try {
        const { id_token, access_token } = await getGoogleOAuthTokens({ code });
        const googleUser = await getGoogleUser({ id_token, access_token });

        if (!googleUser.verified_email) {
            return res.status(403).send('Google email not verified');
        }

        const user = await findOrCreateUser({
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            provider: 'google',
            providerId: googleUser.id
        });

        const token = generateToken(user._id);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?token=${token}`);

    } catch (error) {
        console.error('Google Auth Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=Google_Auth_Failed`);
    }
};

// @desc    Initiate GitHub Login
// @route   GET /api/auth/github
// @access  Public
export const githubAuth = (req, res) => {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`}/api/auth/github/callback`,
        scope: 'user:email',
    };

    const qs = new URLSearchParams(options);
    res.redirect(`${rootUrl}?${qs.toString()}`);
};

// @desc    GitHub Callback
// @route   GET /api/auth/github/callback
// @access  Public
export const githubCallback = async (req, res) => {
    const code = req.query.code;


    try {
        const tokenData = await getGithubOAuthToken({ code });


        if (tokenData.error || !tokenData.access_token) {
            throw new Error(`GitHub Token Error: ${tokenData.error_description || tokenData.error || 'No access token'}`);
        }

        const githubUser = await getGithubUser(tokenData.access_token);


        if (!githubUser.id) {
            throw new Error('Failed to get GitHub User ID');
        }

        const githubEmail = await getGithubEmail(tokenData.access_token);


        const primaryEmailObj = githubEmail.find(email => email.primary);
        if (!primaryEmailObj) {
            throw new Error('No primary email found in GitHub account');
        }
        const primaryEmail = primaryEmailObj.email;

        const user = await findOrCreateUser({
            email: primaryEmail,
            name: githubUser.name || githubUser.login,
            avatar: githubUser.avatar_url,
            provider: 'github',
            providerId: githubUser.id.toString()
        });

        const token = generateToken(user._id);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?token=${token}`);

    } catch (error) {
        console.error('GitHub Auth Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
    }
};

// Helper Functions
async function getGoogleOAuthTokens({ code }) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`}/api/auth/google/callback`,
        grant_type: 'authorization_code',
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(values),
    });

    if (!res.ok) throw new Error('Failed to fetch Google tokens');
    return await res.json();
}

async function getGoogleUser({ id_token, access_token }) {
    const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
            Authorization: `Bearer ${id_token}`,
        },
    });
    if (!res.ok) throw new Error('Failed to fetch Google user');
    return await res.json();
}

async function getGithubOAuthToken({ code }) {
    const rootUrl = 'https://github.com/login/oauth/access_token';
    const options = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
    };

    const res = await fetch(`${rootUrl}?${new URLSearchParams(options).toString()}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!res.ok) throw new Error('Failed to fetch GitHub token');
    return await res.json();
}

async function getGithubUser(access_token) {
    const res = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': 'Krishi-Sanchay'
        },
    });
    if (!res.ok) {
        console.error('GitHub User Fetch Error:', res.status, await res.text());
        throw new Error('Failed to fetch GitHub user');
    }
    return await res.json();
}

async function getGithubEmail(access_token) {
    const res = await fetch('https://api.github.com/user/emails', {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': 'Krishi-Sanchay'
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('GitHub Email Fetch Error:', res.status, errorText);

        if (res.status === 403 && errorText.includes('Resource not accessible by integration')) {
            throw new Error('GitHub App Config Error: Missing "Email addresses" permission. Please enable it in GitHub App settings.');
        }

        throw new Error(`Failed to fetch GitHub emails: ${res.status}`);
    }
    return await res.json();
}

async function findOrCreateUser({ email, name, avatar, provider, providerId }) {
    if (email) {
        email = email.toLowerCase().trim();
    }

    // 1. First, check if user exists by Provider ID (googleId or githubId)
    // This handles cases where they are already linked but might have changed email
    let query = {};
    if (provider === 'google') query.googleId = providerId;
    if (provider === 'github') query.githubId = providerId;

    let user = await User.findOne(query);

    if (user) {
        return user;
    }

    // 2. If not found by Provider ID, check by Email
    // Use regex for case-insensitive exact match to be extra safe
    user = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (user) {
        // User exists with this email, so LINK the account
        let isModified = false;

        if (provider === 'google' && !user.googleId) {
            user.googleId = providerId;
            if (!user.authMethods.includes('google')) user.authMethods.push('google');
            isModified = true;
        } else if (provider === 'github' && !user.githubId) {
            user.githubId = providerId;
            if (!user.authMethods.includes('github')) user.authMethods.push('github');
            isModified = true;
        }

        if (avatar && (!user.avatar || user.avatar === 'no-photo.jpg')) {
            // Optional: update avatar
            // user.avatar = avatar; 
            // isModified = true;
        }

        if (isModified) await user.save();
        return user;
    }

    // 3. Create new user if not found by ID or Email
    const newUser = {
        name,
        email,
        authMethods: [provider],
        isEmailVerified: true, // Social logins are trusted
        avatar: avatar || 'no-photo.jpg'
    };

    if (provider === 'google') newUser.googleId = providerId;
    if (provider === 'github') newUser.githubId = providerId;

    return await User.create(newUser);
}


// @desc    Set Password for Social User
// @route   POST /api/auth/set-password
// @access  Private
export const setPassword = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If user already has a password, they should use the "Change Password" flow instead
        if (user.password) {
            return res.status(400).json({ success: false, message: 'Password already set. Use change password instead.' });
        }

        user.password = password; // Will be hashed by pre-save hook

        if (!user.authMethods.includes('email')) {
            user.authMethods.push('email');
        }

        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password set successfully',
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and save to DB
        user.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send Email
        try {
            await EmailService.sendEmail(
                user.email,
                'Password Reset Code - Krishi Sanchay',
                'otp',
                {
                    otp,
                    email: user.email
                }
            );

            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.toLowerCase();

        // Hash incoming OTP to compare
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordOtp: hashedOtp,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // OTP is valid. Return a temporary token or just success status so frontend can proceed to reset screen.
        // For security, we can issue a short-lived signed token specifically for password reset
        const resetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({
            success: true,
            message: 'OTP verified',
            resetToken
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { password, resetToken } = req.body;

        // Verify the special reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        if (decoded.type !== 'reset') {
            return res.status(400).json({ success: false, message: 'Invalid token type' });
        }

        const user = await User.findById(decoded.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = password;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;

        // If user was social-only, now they have email auth too
        if (!user.authMethods.includes('email')) {
            user.authMethods.push('email');
        }

        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token,
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
};
