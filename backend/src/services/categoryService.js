import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";

export const getCategories = async (userRole) => {
  // Customer and agent only see active categories. Admin can view all
  const filter = userRole == "admin" ? {} : { isActive: true };
  return Category.find(filter).sort({ name: 1 });
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
};

export const createCategory = async (data) => {
  const existingCategory = await Category.findOne({
    $or: [{ code: data.code }, { name: data.name }],
  });

  if (existingCategory) {
    throw new AppError("Category with this name or code already exists", 409);
  }

  return Category.create(data);
};

export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByIdAndUpdate(categoryId, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};
