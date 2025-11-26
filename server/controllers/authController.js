import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role = 'admin') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for admin credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminUsername = process.env.ADMIN_USERNAME;

        if (email === adminEmail && password === adminPassword) {
            // Generate token with admin ID (using username as ID for simplicity)
            const token = generateToken(adminUsername);

            res.json({
                success: true,
                token: token,
                user: {
                    id: adminUsername,
                    username: adminUsername,
                    email: adminEmail,
                    role: 'admin'
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminUsername = process.env.ADMIN_USERNAME;

        res.json({
            success: true,
            user: {
                id: adminUsername,
                username: adminUsername,
                email: adminEmail,
                role: 'admin',
                lastLogin: new Date()
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        // For simplified admin, we don't actually update credentials
        // You can update environment variables here if needed

        res.json({
            success: true,
            message: 'Profile update functionality disabled for demo admin',
            user: {
                id: process.env.ADMIN_USERNAME,
                username: process.env.ADMIN_USERNAME,
                email: process.env.ADMIN_EMAIL,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};