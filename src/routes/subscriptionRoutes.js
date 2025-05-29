import express from 'express';
import { authenticateUser, checkRole, checkUserRole } from '../middlewares/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import { createPlan, getAllPlans, updatePlan, deletePlan, assignPlanToClient, getAllAssignedPlans, planrequest, removePlanFromClient } from '../controllers/subscriptionController/index.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);
router.get('/', getAllPlans.validator, getAllPlans.handler);

router.post('/request', planrequest.validator, planrequest.handler);
router.get('/assign', getAllAssignedPlans.validator, getAllAssignedPlans.handler);


router.use(authenticateUser, checkUserRole(['super-admin']));
router.post('/', createPlan.validator, createPlan.handler);
router.put('/:id', updatePlan.validator, updatePlan.handler);
router.delete('/:id', deletePlan.validator, deletePlan.handler);

// Assign plan to client
router.post('/assign', assignPlanToClient.validator, assignPlanToClient.handler);


// Remove plan from client
router.delete('/remove/:id', removePlanFromClient.validator, removePlanFromClient.handler);

// New route for getting all assigned plans



export default router;
