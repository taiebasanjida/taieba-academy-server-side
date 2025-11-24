# Taieba Academy Server

Backend API server for Taieba Academy learning platform.

## Features

- RESTful API with Serverless Functions (Vercel)
- MongoDB database integration (Atlas)
- Firebase Admin SDK for authentication
- Course management endpoints
- Enrollment tracking
- CORS enabled for client integration

## Tech Stack

- Node.js
- Serverless Functions (Vercel)
- MongoDB (Mongoose + Atlas)
- Firebase Admin SDK
- Vercel Deployment

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
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
NODE_ENV=development
```

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) and [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions.

3. Run the server:
```bash
npm run dev
```

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/[id]` - Get course by ID
- `GET /api/courses/mine` - Get my courses
- `POST /api/courses` - Create course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/mine` - Get my enrollments
- `GET /api/enrollments/status/[courseId]` - Get enrollment status

## Deployment

This project is configured for Vercel serverless deployment. See:
- [VERCEL_DEPLOY_CHECKLIST.md](./VERCEL_DEPLOY_CHECKLIST.md) - Complete deployment guide
- [DEPLOY_BANGLA.md](./DEPLOY_BANGLA.md) - Deployment guide in Bangla
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Alternative deployment (Render.com)

## Architecture

This project uses **Serverless Functions** instead of traditional Express server:
- File-based routing (`api/` directory)
- Automatic scaling
- Pay-per-use pricing
- Zero server management

See [KENO_SERVERLESS.md](./KENO_SERVERLESS.md) for why we chose serverless architecture.

## Documentation

- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - MongoDB connection setup
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase Admin setup
- [ATLAS_CHECK_BN.md](./ATLAS_CHECK_BN.md) - MongoDB Atlas troubleshooting (Bangla)
- [EXPRESS_TO_SERVERLESS_CONVERSION.md](./EXPRESS_TO_SERVERLESS_CONVERSION.md) - Migration guide

## License

MIT

