const express = require('express');
const authRouter = require('./auth');
const locationsRouter = require('./locations');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/locations', locationsRouter);

module.exports = router;
