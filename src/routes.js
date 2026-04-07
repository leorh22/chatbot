import { Router } from "express";
import {
  academiesController,
  chatController,
  healthController
} from "./controllers/chatController.js";

const router = Router();

router.get("/health", healthController);
router.get("/academies", academiesController);
router.post("/chat", chatController);

export default router;
