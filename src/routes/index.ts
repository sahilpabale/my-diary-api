import { Router, Request, Response } from "express";
import UserController from "../controllers/UserControllers";
import DiaryController from "../controllers/DiaryController";
import verifyAuth from "../middlewares/verifyAuth";
import verifyEmail from "../utils/emailVerification";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Home Page of API",
  });
});

// Users related API routes
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user", verifyAuth, userController.users); //protected route

// Diary related API rooutes
const diaryController = new DiaryController();

router.get("/diary", verifyAuth, diaryController.getAllDiaries);
router.get("/diary/:id", verifyAuth, diaryController.getDiary);
router.post("/diary", verifyAuth, diaryController.createDiary);
router.patch("/diary/:id", verifyAuth, diaryController.updateDiary);
router.delete("/diary/:id", verifyAuth, diaryController.deleteDiary);

// Email Verify Route
const verifyMail = new verifyEmail();

router.get("/confirm/:token", verifyMail.verify);

export default router;
