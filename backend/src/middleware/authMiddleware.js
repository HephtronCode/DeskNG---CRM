import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized, no token provided", 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("The user belonging to this token no longer exists", 401);
    }

    if (!user.isActive) {
      throw new AppError(
        "Your account has been deactivated. Please contact administrator.",
        403,
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized, please log in", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Insufficient permission to access this resource", 403),
      );
    }

    next();
  };
};

