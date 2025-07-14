const mongoose = require('mongoose');
const createApp = require('./app');
require('dotenv').config();

async function startServer() {
    const { MONGO_URI, JWT_SECRET } = process.env;
    if (!MONGO_URI || !JWT_SECRET) {
        console.error('Missing required environment variables. Please copy .env.example to .env and fill in the values.');
        process.exit(1);
    }

    const app = createApp();

    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }

    const PORT = process.env.PORT || 5000;
    return app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer, createApp };

