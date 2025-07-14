#!/bin/bash
# Fix locale warnings
export LC_ALL=en_US.UTF-8

echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Verify backend started successfully
sleep 2
if ! ps -p $BACKEND_PID > /dev/null; then
    echo "Error: Backend failed to start!"
    exit 1
fi

echo "Starting Android emulator and Expo..."
cd frontend
npm run emulate:android &
FRONTEND_PID=$!
cd ..

# Improved cleanup function
cleanup() {
    echo "Stopping processes..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Press Ctrl+C to stop both processes"
wait