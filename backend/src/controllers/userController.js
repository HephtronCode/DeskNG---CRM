import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getActiveStaff } from "../services/userService.js";

export const listAgents = asyncHandler(async (req, res) => {
  const staff = await getActiveStaff();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Active staff retrieved successfully",
    data: staff,
  });
});
