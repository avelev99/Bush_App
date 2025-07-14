@echo off

echo Starting backend server...
cd backend
start "Backend Server" npm start
cd ..

echo Starting Android emulator and Expo...
cd frontend
npm run emulate:android

echo Press Ctrl+C to stop both processes
pause