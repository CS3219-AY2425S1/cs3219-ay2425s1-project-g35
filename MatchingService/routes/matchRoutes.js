import express from 'express';
import MatchController from '../controllers/matchController.js';

const router = express.Router();

router.post('/match', MatchController.handleMatchRequest);
router.post('/cancel', MatchController.cancelRequest);

export default router;
