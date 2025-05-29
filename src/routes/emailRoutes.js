import express from 'express';
import { sendEmailController, getEmailsController, starEmailController, importantEmailController, trashEmailController, deleteEmailController, emailSettingController } from '../controllers/EmailController/index.js';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import upload from '../middlewares/upload.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser,checkRole, passCompanyDetails);

router.post('/', upload.array('attachments', 5), sendEmailController.handler);
router.get('/', getEmailsController.handler);
router.delete('/:id', deleteEmailController.handler);
// router.put('/:id', EmailController.updateEmail);
router.put('/star/:id', starEmailController.handler);
router.put('/trash/:id', trashEmailController.handler);
router.put('/important/:id', importantEmailController.handler);

router.post('/settings', emailSettingController.createSettings.handler);
router.delete('/settings/:id', emailSettingController.deleteSettings.handler);
router.get('/settings', emailSettingController.getSettings.handler);
router.put('/settings/:id', emailSettingController.updateSettings.handler);



// router.put('/move/:id', EmailController.moveEmail);


export default router;
