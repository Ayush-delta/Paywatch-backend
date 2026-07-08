import User from "../models/user.model.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";

export const getUsers = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const { search } = req.query;

        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const [users, totalCount] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            message: "Users fetched successfully",
            ...paginatedResponse({ data: users, page, limit, totalCount }),
        });
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if(!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: user,
        }) 
    } catch (error) {
        next(error);
    }
}
