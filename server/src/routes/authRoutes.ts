import { Router } from "express";
import type { Response } from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import type { AuthenticatedRequest } from "../types/auth.js";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me",protect,(
    req: AuthenticatedRequest,
    res: Response
) => {
    res.status(200).json({
        success: true,
        message: "Authentication user",
        data: {
            user: req.user,
        },
    });
});
export default router;