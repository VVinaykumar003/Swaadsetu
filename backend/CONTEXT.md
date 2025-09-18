# Project Context: Swad Setu Backend

## Overview

Node.js/Express backend for restaurant management system with:

- MongoDB database
- Redis for caching/sessions
- Socket.io for real-time updates
- JWT authentication

## Key Technologies

```json
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "database": "MongoDB (Mongoose ODM)",
  "cache": "Redis",
  "realtime": "Socket.io",
  "auth": "JWT"
}
```

## Directory Structure

```
backend/
├── common/          # Shared utilities
│   ├── libs/        # Library modules (logger.js)
│   └── middlewares/ # Auth, validation, rate limiting
├── config/          # Configuration (index.js)
├── controllers/     # Business logic
├── db/              # Database connections
├── models/          # MongoDB schemas
├── routes/          # API endpoint definitions
├── services/        # Additional services (socket.service.js)
├── .env             # Environment variables
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## Detailed Directory Structure

'''
backend/
├── common  
│ ├── libs  
│ │ ├── logger.js  
│ ├── middlewares
│ │ ├── auth.middleware.js
│ │ ├── rateLimit.middleware.js
│ │ ├── validate.middleware.js
├── config
│ ├── index.js
├── controllers
│ ├── admin.controller.js
│ ├── bill.controller.js
│ ├── call.controller.js
│ ├── order.controller.js
│ ├── table.controller.js
├── db
│ ├── mongoose.js
│ ├── redis.js
├── models
│ ├── admin.model.js
│ ├── bill.model.js
│ ├── call.model.js
│ ├── order.model.js
│ ├── table.model.js
├── routes
│ ├── admin.route.js
│ ├── bill.route.js
│ ├── call.route.js
│ ├── order.route.js
│ ├── table.route.js
├── services
│ ├── socket.service.js
├── .env
├── CONTEXT.md
├── app.js
├── package-lock.json
├── package.json
├── server.js
├── tree.js
'''

## Key Files

| File                                    | Purpose                              |
| --------------------------------------- | ------------------------------------ |
| `server.js`                             | Main entry point, starts HTTP server |
| `app.js`                                | Express app configuration            |
| `db/mongoose.js`                        | MongoDB connection                   |
| `db/redis.js`                           | Redis connection                     |
| `common/middlewares/auth.middleware.js` | JWT authentication                   |
| `services/socket.service.js`            | Socket.io implementation             |

## API Structure

Endpoints follow RESTful patterns:

- `POST /api/{resource}` - Create resource
- `GET /api/{resource}` - Get resources
- `GET /api/{resource}/:id` - Get single resource
- `PATCH /api/{resource}/:id` - Update resource
- `DELETE /api/{resource}/:id` - Delete resource

Resources include: `admin`, `bill`, `call`, `order`, `table`

## Environment Variables

Key variables in `.env`:

- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm start

# Environment setup
cp .env.example .env
# Edit .env with actual values
```

## Dependencies

See `package.json` for full list. Key packages:

- `express`
- `mongoose`
- `redis`
- `socket.io`
- `jsonwebtoken`
