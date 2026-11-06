# WebChat

Real-time chat with user and admin roles, one-to-one messages, and groups.

- `frontend` — Next.js and Material UI
- `backend` — Node.js, Express, Socket.io, and MongoDB

## What it covers

- Sign up and sign in with first name, last name, email, country, and password
- Roles: `user` and `admin`
- Search for a person and chat one to one over WebSockets
- Create a group, join one, leave it, and read the history after rejoining
- Messages are stored in MongoDB
- Admin dashboard lists users and can block, unblock, or delete a user

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

1. Start MongoDB on `mongodb://127.0.0.1:27017`, or set `MONGODB_URI` in `backend/.env`.
2. From this folder:

```bash
npm install
npm run install:all
npm run dev
```

The API runs at http://localhost:5000 and the app at http://localhost:3000.

You can also start them separately:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Seeded admin

The API creates this account on first launch if it does not exist:

- Email: `admin@webchat.com`
- Password: `Admin@123`

Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before the first start if you want different credentials. Signup always creates a normal user.

## Try it

1. Sign in as the admin and open Dashboard.
2. In a private window, sign up as a second user.
3. From Chat, search for the other person and send a message. It shows up without a refresh.
4. Create a group, join it from the other account, exchange messages, leave, then join again. The earlier messages are still there.
5. As admin, block that user. Their session ends and they cannot sign in until you unblock them.
