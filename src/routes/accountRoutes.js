import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount, createAccountTransfer, getAccountTransfer, updateAccountTransfer, deleteAccountTansfer } from "../controllers/accountControllers/index.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";
    // import { createAccountTransfer } from "../controllers/accountControllers/index.js";

const router = express.Router();



router.use(authenticateUser, checkRole, passCompanyDetail);

router.post('/', createAccount.validator, createAccount.handler);
router.get('/', getAccounts.validator, getAccounts.handler);
// router.get('/:id', getAccountById.validator, getAccountById.handler);
router.put('/:id', updateAccount.validator, updateAccount.handler);
router.delete('/:id', deleteAccount.validator, deleteAccount.handler);



router.get('/transfer', getAccountTransfer.validator, getAccountTransfer.handler);
router.post('/transfer', createAccountTransfer.validator, createAccountTransfer.handler);
router.put('/transfer/:id', updateAccountTransfer.validator, updateAccountTransfer.handler);
router.delete('/transfer/:id', deleteAccountTansfer.validator, deleteAccountTansfer.handler);

// router.get('/transfer', getAccountTransfer.validator, getAccountTransfer.handler);


export default router;