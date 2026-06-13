import { Router } from 'express';
import { getAllVenues, createVenue } from '../controllers/venue.controller';

const router = Router();

router.get('/', getAllVenues);
router.post('/', createVenue);

export default router;
