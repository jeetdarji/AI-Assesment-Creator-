import { Router } from "express";
import { upload } from "../middleware/upload";
import { validateAssignment } from "../middleware/validate";
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentOutput,
  deleteAssignment,
  retryAssignment,
} from "../controllers/assignmentController";

const router = Router();

router.post("/", upload, validateAssignment, createAssignment);
router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);
router.get("/:id/output", getAssignmentOutput);
router.delete("/:id", deleteAssignment);
router.post("/:id/retry", retryAssignment);

export default router;
