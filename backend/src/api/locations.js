const express = require('express');
const multer = require('multer');
const path = require('path');
const { Location } = require('../models');
const { authenticateToken } = require('./middleware');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET /api/locations
router.get('/', async (req, res, next) => {
    try {
        const locations = await Location.find().populate('user', ['username']);
        res.json(locations);
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// POST /api/locations
router.post('/', authenticateToken, async (req, res, next) => {
    const { latitude, longitude, description } = req.body;
    const userId = req.user.id;

    try {
        const newLocation = new Location({
            user: userId,
            latitude,
            longitude,
            description,
        });

        const location = await newLocation.save();
        res.json(location);
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// GET /api/locations/:id
router.get('/:id', async (req, res, next) => {
    try {
        const location = await Location.findById(req.params.id)
            .populate('user', ['username'])
            .populate('comments.user', ['username']);
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }
        res.json(location);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Location not found' });
        }
        next(err);
    }
});

// POST /api/locations/:id/comments
router.post('/:id/comments', authenticateToken, async (req, res, next) => {
    const { text } = req.body;
    const userId = req.user.id;

    try {
        const location = await Location.findById(req.params.id);

        const newComment = {
            user: userId,
            text,
        };

        location.comments.unshift(newComment);

        await location.save();

        res.json(location.comments);
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// POST /api/locations/:id/images
router.post('/:id/images', authenticateToken, upload.array('images', 10), async (req, res, next) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }

        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        location.imageUrls.push(...imageUrls);

        await location.save();
        res.json(location);
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

module.exports = router;
