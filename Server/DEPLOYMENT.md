# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (free tier available)
2. MongoDB Atlas account (for cloud database)
3. GitHub repository for the project

## Environment Variables
Set these in your Vercel dashboard under Project Settings > Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `Server` folder as the root directory
5. Set environment variables in the project settings
6. Deploy!

### Option 2: Deploy via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the Server directory: `cd Server`
3. Run: `vercel`
4. Follow the prompts to configure your project
5. Set environment variables: `vercel env add MONGO_URI`

## Important Notes

- The server is configured to export the Express app as a serverless function
- MongoDB connection should use MongoDB Atlas (cloud) for production
- Environment variables must be set in Vercel dashboard
- The build command will compile TypeScript to JavaScript
- CORS is enabled for all origins (adjust in production if needed)

## Testing the Deployment

Once deployed, test these endpoints:
- `GET /` - Health check
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/freshers` - Get fresher jobs
- `GET /api/jobs/:id` - Get job by ID

## Troubleshooting

1. **Build errors**: Check that all imports don't use `.js` extensions
2. **Database connection**: Ensure MONGO_URI is set correctly
3. **404 errors**: Verify the vercel.json routing configuration
4. **Module errors**: Ensure TypeScript is configured for CommonJS
