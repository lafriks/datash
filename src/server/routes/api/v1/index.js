const express = require('express');
const clientsRouter = require('./clients');
const feedbackRouter = require('./feedback');

const router = express.Router();

router.use('/clients', clientsRouter);
router.use('/feedback', feedbackRouter);

module.exports = router;
