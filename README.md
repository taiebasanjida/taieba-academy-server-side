# Taieba Academy Server

Backend API server for Taieba Academy learning platform.

## Features

- RESTful API with Express.js
- MongoDB database integration
- Firebase Admin SDK for authentication
- Course management endpoints
- Enrollment tracking
- CORS enabled for client integration

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Firebase Admin SDK
- CORS
- Morgan (logging)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase Admin credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

3. Run the server:
```bash
npm run dev
```

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/mine` - Get my courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/mine` - Get my enrollments

## License

MIT

