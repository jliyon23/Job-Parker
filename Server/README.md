# Job Parker API Server

A Node.js/Express API server for the Job Parker application, ready for deployment on Vercel.

## Features

- RESTful API for job data
- MongoDB integration with Mongoose
- TypeScript support
- CORS enabled
- Vercel serverless deployment ready

## API Endpoints

- `GET /` - Health check
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/freshers` - Get fresher jobs only
- `GET /api/jobs/:id` - Get specific job by ID

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MongoDB connection string:
   ```
   MONGO_URI=mongodb://localhost:27017/jobparker
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The server will start on http://localhost:4000

## Build for Production

```bash
npm run build
```

## Deployment

This server is configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript
- **Deployment**: Vercel (Serverless)

## Project Structure

```
src/
├── controllers/     # Route handlers
├── models/         # Mongoose models
├── routes/         # Express routes
├── db.ts          # Database connection
└── index.ts       # Main application file
```
