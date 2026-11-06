import { Router } from "express";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/categoryValidators.js";

const router = Router();

// All category routes require an authenticated session
router.use(protect);

router.get("/", listCategories);
router.get("/:id", getCategory);

// Mutations restricted strictly to admin role
router.post(
  "/",
  authorize("admin"),
  validate(createCategorySchema),
  createCategory,
);

router.patch(
  "/:id",
  authorize("admin"),
  validate(updateCategorySchema),
  updateCategory,
);

export default router;
