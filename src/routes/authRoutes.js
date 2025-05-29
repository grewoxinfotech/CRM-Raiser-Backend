import express from "express";
import { signup, login, register, getAllUsers, getUserById, updateUser, deleteUser, verifySignup, resendSignupOtp, forgotPassword, verifyOtp, resetPassword, verify } from "../controllers/authControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { checkSubscriptionLimits, getActiveSubscription, checkSubscriptionDates } from "../middlewares/checkSubscriptionLimits.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.post('/signup', authenticateUser, checkRole, getActiveSubscription, passCompanyDetail, signup.validator, signup.handler);
router.post('/login', checkSubscriptionDates, login.validator, login.handler);
router.post('/register', register.validator, register.handler);
router.post('/admin-login', login.adminValidator, login.adminHandler);
router.post("/verify-signup", authenticateUser, checkSubscriptionLimits, verifySignup.validator, verifySignup.handler);
router.post("/resend-signup-otp", authenticateUser, resendSignupOtp.handler);
router.post("/forgot-password", forgotPassword.validator, forgotPassword.handler);
router.post("/verify-otp", authenticateUser, verifyOtp.validator, verifyOtp.handler);
router.post("/reset-password", authenticateUser, resetPassword.validator, resetPassword.handler);

router.post("/verify", authenticateUser, verify.validator, verify.handler);

//Super-Admin 
router.use(authenticateUser, checkRole);

router.get('/', getAllUsers.validator, getAllUsers.handler);
router.get('/:id', getUserById.validator, getUserById.handler);
router.put('/:id', updateUser.validator, updateUser.handler);
router.delete('/:id', deleteUser.validator, deleteUser.handler);

export default router;