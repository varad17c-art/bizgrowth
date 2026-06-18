import express from 'express';

const router = express.Router();

// GET /api/reviews
router.get('/', async (req, res) => {
  // Return a paginated list of sample review events for now
  const sample = {
    page: 1,
    perPage: 20,
    total: 3,
    items: [
      {id: 'r_1', event: 'signup', user: 'user1', ts: Date.now() - 100000},
      {id: 'r_2', event: 'purchase', user: 'user2', ts: Date.now() - 50000},
      {id: 'r_3', event: 'cancel', user: 'user3', ts: Date.now() - 15000},
    ],
  };
  res.json({ok: true, data: sample});
});

// POST /api/reviews - accept a review event
router.post('/', async (req, res) => {
  // stub: validate & persist the event
  const body = req.body || {};
  // echo back
  res.status(201).json({ok: true, data: {received: body}});
});

export default router;
