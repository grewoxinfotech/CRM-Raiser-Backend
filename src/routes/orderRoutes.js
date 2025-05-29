import { Router } from "express";
import { createOrder, getOrders, updateOrder, deleteOrder } from "../controllers/orderControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/:id", createOrder.validator, createOrder.handler);
router.get("/:id", getOrders.validator, getOrders.handler);
router.put("/:id", updateOrder.validator, updateOrder.handler);
router.delete("/:id", deleteOrder.validator, deleteOrder.handler);

export default router;
