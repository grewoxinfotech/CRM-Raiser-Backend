import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { getAllVendor, createVendor, updateVendor, deleteVendor } from "../controllers/vendorControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import queryMiddleware from "../middleware/queryMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();
const searchFields = ['id', 'name', 'contact', 'phonecode', 'email', 'taxNumber', 'address', 'city', 'state', 'country', 'zipcode', 'client_id', 'created_by'];

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', upload.single('attachment'), createVendor.validator, createVendor.handler);
router.get('/', queryMiddleware(searchFields), getAllVendor.validator, getAllVendor.handler);
// router.get('/:id', getVendorById.validator, getVendorById.handler);
router.put('/:id', updateVendor.validator, updateVendor.handler);
router.delete('/:id', deleteVendor.validator, deleteVendor.handler);

export default router;