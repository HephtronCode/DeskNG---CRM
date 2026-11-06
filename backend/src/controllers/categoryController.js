import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as categoryService from "../services/categoryService.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.user.role);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Category retrieved successfully",
    data: category,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Category created successfully",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Category updated successfully",
    data: category,
  });
});
