# Containerized CRUD Student App

## Overview

- Backend: Node.js + Express + Mongoose
- Database: MongoDB
- Frontend: Vanilla HTML/CSS/JS served by the backend

## Project Structure

```bash
crud-docker-app/
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

## Run

```bash
docker-compose up --build
```

Access: ```bash http://localhost:3000```

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
