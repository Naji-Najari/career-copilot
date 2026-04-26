#!/bin/bash

# career-copilot - Start script

echo "Starting career-copilot..."
echo ""

# Start backend
echo "Starting backend on http://localhost:8080..."
(cd backend && uv run uvicorn app.main:app --reload --port 8080) &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "Starting frontend on http://localhost:3000..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "career-copilot is running!"
echo "  Backend:   http://localhost:8080"
echo "  API docs:  http://localhost:8080/docs"
echo "  Frontend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
