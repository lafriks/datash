const express = require('express');
const clientsRouter = require('./clients');

const router = express.Router();

router.use('/clients', clientsRouter);

module.exports = router;
