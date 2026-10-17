import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as authService from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCustomer(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getUserProfile(req.user.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Profile retrieved successfully",
    data: result,
  });
});
