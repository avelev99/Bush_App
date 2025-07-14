# Bush App Backend

This repository includes a simple Express/MongoDB backend. A frontend directory exists but is empty.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in your MongoDB connection string and JWT secret.
2. Run `npm install` in the `backend` directory to install dependencies.
3. Start the server with `npm start` from within `backend`.
4. Run tests with `npm test` from within `backend`.

The backend exposes routes under `/api` for authentication and locations. Uploaded files are served from `/uploads`.
See the source files in `backend/src/` for details.
