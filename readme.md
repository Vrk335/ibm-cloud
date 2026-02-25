# Containerized CRUD Student App

## Overview
- Backend: Node.js + Express + Mongoose
- Database: MongoDB
- Frontend: Vanilla HTML/CSS/JS served by the backend

## Project Structure

```
backend/
  app.js
  package.json
  routes/
  models/
  Dockerfile
frontend/
  index.html
  script.js
  style.css
docker-compose.yml
README.md
```

## Run Locally

```bash
docker-compose up --build
```

Access: http://localhost:3000

## API Endpoints
- POST /students
- GET /students
- GET /students/:id
- PUT /students/:id
- DELETE /students/:id

## Sample cURL
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","age":22}'

curl http://localhost:3000/students

curl http://localhost:3000/students/<id>

curl -X PUT http://localhost:3000/students/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Updated","email":"jane.updated@example.com","age":23}'

curl -X DELETE http://localhost:3000/students/<id>
```

## Deploy on Render (Docker)

### Option A: Use MongoDB Atlas (recommended)
1. Create a MongoDB Atlas cluster and get a connection string.
2. Add Render outbound IPs to Atlas network access.
3. In Render, create a Web Service:
   - Connect your GitHub repo.
   - Root directory: repo root.
   - Language: Docker.
   - Plan: free or your choice.
4. Add environment variables in Render:
   - `MONGO_URL` = your Atlas connection string
   - `PORT` = `10000`
5. Deploy. The service URL (onrender.com) will serve both the API and frontend.

### Option B: Host MongoDB on Render
1. Create a private MongoDB service on Render (see Render MongoDB guide).
2. Use its internal connection string in `MONGO_URL` for the web service.
3. Deploy the web service as Docker (same steps as above).

### Notes
- Render does not use `docker-compose` for deployment. It builds the Dockerfile per service.
- The frontend goes live automatically because it is served by the backend.