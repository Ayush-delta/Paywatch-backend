import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Activity from '../models/Activity.js';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } from '../config/env.js'

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' }); // Short-lived (15m)
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET || JWT_SECRET, { expiresIn: '7d' }); // Long-lived (7d)
    return { accessToken, refreshToken };
}

const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

export const signUp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword });

        const { accessToken, refreshToken } = generateTokens(newUser._id);

        // Save refresh token to DB
        newUser.refreshToken = refreshToken;
        await newUser.save();

        setRefreshTokenCookie(res, refreshToken);

        await Activity.create({
            type: "user",
            message: `New user registered: ${name} (${email})`,
            meta: { userId: newUser._id, name, email },
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token: accessToken,
                user: newUser,
            }
        })
    } catch (error) {
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password'); // Explicitly select password

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        // Update refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        setRefreshTokenCookie(res, refreshToken);

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token: accessToken,
                user,
            }
        });
    } catch (error) {
        next(error);
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            const error = new Error('Refresh Token needed');
            error.statusCode = 401;
            throw error;
        }

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET || JWT_SECRET);
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            const error = new Error('Invalid Refresh Token');
            error.statusCode = 403;
            throw error;
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

        // Rotate refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        setRefreshTokenCookie(res, newRefreshToken);

        res.status(200).json({
            success: true,
            data: {
                token: newAccessToken
            }
        });

    } catch (error) {
        next(error);
    }
}

export const signOut = async (req, res, next) => {
    try {
        // Clear cookie
        res.clearCookie("refreshToken");

        // Remove from DB (optional, if you want complete invalidation)
        // const { refreshToken } = req.cookies;
        // if(refreshToken) { ...find user and clear token... }

        res.status(200).json({
            success: true,
            message: 'Signed out successfully'
        });
    } catch (error) {
        next(error);
    }
}