import { Router } from "express";
import { createProducts, getAllProducts, updateProducts, deleteProducts, getallproduct } from "../controllers/productsControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from "../middleware/queryMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();
const searchFields = ['id', 'related_id', 'name', 'currency', 'buying_price', 'selling_price', 'category', 'sku', 'hsn_sac', 'stock_quantity', 'stock_status', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/:id", upload.single('image'), createProducts.validator, createProducts.handler);
router.get("/", queryMiddleware(searchFields), getAllProducts.validator, getAllProducts.handler);
router.get("/:id", getallproduct.validator, getallproduct.handler);
router.put("/:id", upload.single('image'), updateProducts.validator, updateProducts.handler);
router.delete("/:id", deleteProducts.validator, deleteProducts.handler);

export default router;
