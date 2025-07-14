const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./src/api');

function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', apiRouter);
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Something went wrong!' });
    });

    return app;
}

module.exports = createApp;

