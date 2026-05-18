# TeamHub

TeamHub is a MERN stack collaboration app built with Node.js, Express, MongoDB, Mongoose, Next.js App Router, WebSocket, UploadThing, and Jest.

## Features

- JWT authentication
- Register, login, logout
- Protected frontend pages and backend routes
- User profile with avatar upload
- Project CRUD
- Task CRUD
- Project members many-to-many relation
- User projects one-to-many relation
- Real-time project chat with ws
- Online users list
- UploadThing avatar uploads
- UploadThing project/task file support
- Search and filtering
- Responsive plain CSS
- Jest unit and integration tests

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- ws
- Jest
- Supertest

### Frontend

- Next.js App Router
- React
- JavaScript
- CSS Modules
- UploadThing
- React Context API
- React Testing Library

## Environment Variables

### Backend

Create `backend/.env`.

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=[localhost](http://localhost:3000)
