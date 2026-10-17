import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { generateToken } from "../utils/token.js";

export const registerCustomer = async ({
  name,
  email,
  password,
  department,
}) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in registered", 409);
  }

  // Force customer role on public registration
  const newUser = await User.create({
    name,
    email,
    password,
    role: "customer",
    department: department || null,
  });

  const token = generateToken({
    id: newUser._id,
    role: newUser.role,
  });

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
    },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  // Explicitly select password since the password field is excluded by default in the User model
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated. Please contact administrator.",
      403,
    );
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
  };
};
