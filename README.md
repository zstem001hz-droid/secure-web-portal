# Secure Web Portal

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![bcrypt](https://img.shields.io/badge/Security-bcrypt-red)
![Passport](https://img.shields.io/badge/OAuth-Passport.js-blue)
![GitHub OAuth](https://img.shields.io/badge/Provider-GitHub-black)

A secure Express API implementing local authentication with bcrypt and JWT, and third-party authentication via GitHub OAuth 2.0. Users can register, log in through both methods, and manage a private collection of bookmarks accessible only to their owner.

## Tech Stack

- [Node.js](https://nodejs.org/) — runtime environment
- [Express](https://expressjs.com/) — web framework
- [MongoDB Atlas](https://www.mongodb.com/atlas) — cloud database
- [Mongoose](https://mongoosejs.com/) — MongoDB ODM
- [bcrypt](https://www.npmjs.com/package/bcrypt) — password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) — JWT signing and verification
- [Passport.js](http://www.passportjs.org/) — OAuth middleware
- [passport-github2](https://www.npmjs.com/package/passport-github2) — GitHub OAuth strategy
- [dotenv](https://www.npmjs.com/package/dotenv) — environment variable management

## Project Structure

```
secure-web-portal/
├── config/
│   ├── connection.js        ← MongoDB connection
│   └── passport.js          ← GitHub OAuth strategy configuration
├── models/
│   ├── index.js             ← exports all models
│   ├── Bookmark.js          ← bookmark schema with user ownership
│   └── User.js              ← user schema supporting local and OAuth auth
├── routes/
│   ├── api/
│   │   ├── index.js         ← mounts user and bookmark routes
│   │   ├── bookmarkRoutes.js ← full CRUD with auth and ownership
│   │   └── userRoutes.js    ← register, login, GitHub OAuth routes
│   └── index.js             ← top level router with 404 handler
├── utils/
│   └── auth.js              ← signToken and authMiddleware
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v20+
- MongoDB Atlas account
- GitHub OAuth App credentials

### Installation
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `nodemon server.js`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Port the server runs on |
| `JWT_SECRET` | Secret key for signing JWTs — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL |

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register a new user | No |
| POST | `/api/users/login` | Login and receive JWT | No |
| GET | `/api/users/auth/github` | Initiate GitHub OAuth flow | No |
| GET | `/api/users/auth/github/callback` | GitHub OAuth callback | No |
| GET | `/api/bookmarks` | Get all bookmarks for logged-in user | Yes |
| POST | `/api/bookmarks` | Create a new bookmark | Yes |
| GET | `/api/bookmarks/:id` | Get a single bookmark | Yes |
| PUT | `/api/bookmarks/:id` | Update a bookmark — owner only | Yes |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark — owner only | Yes |

## Authentication Flow

1. Client sends credentials to `/api/users/register` or `/api/users/login`
2. Server hashes password using bcrypt with 10 salt rounds on registration
3. On login, `bcrypt.compare()` validates incoming password against stored hash
4. Server signs and returns a JWT containing non-sensitive user data
5. Client includes JWT in `Authorization: Bearer <token>` header on subsequent requests
6. `authMiddleware` intercepts every bookmark request and verifies the token
7. Decoded user data attached to `req.user` for downstream route handlers

## Authorization Flow

1. Client sends credentials to `/api/users/login` or completes GitHub OAuth flow
2. Server issues a signed JWT on successful authentication
3. Client includes JWT in `Authorization: Bearer <token>` header
4. `authMiddleware` verifies token and attaches `req.user` to the request
5. Route handler retrieves the bookmark and compares ownership
6. Access granted or `403 Forbidden` returned based on ownership match

## Security Features

- Passwords hashed and salted using bcrypt with 10 salt rounds
- JWT authentication required on all bookmark endpoints
- Ownership-based authorization — users can only access their own bookmarks
- Generic error messages on failed login prevent email enumeration attacks
- GitHub OAuth handles private email accounts — falls back to generated placeholder email when GitHub profile email is unavailable
- Cryptographically generated JWT secret using Node.js `crypto` module
- Environment variables protect all sensitive credentials
- `.env` excluded from version control via `.gitignore`

## Error Responses

| Status Code | Message | Reason |
|-------------|---------|--------|
| 400 | Incorrect email or password. | Invalid login credentials |
| 401 | You must be logged in to do that. | Missing token |
| 401 | Invalid token. | Expired or invalid token |
| 403 | User is not authorized to view this bookmark. | Wrong user token |
| 403 | User is not authorized to update this bookmark. | Wrong user token |
| 403 | User is not authorized to delete this bookmark. | Wrong user token |
| 404 | No bookmark found with this id! | Bookmark doesn't exist |

## Usage Examples

### Register a New User
**POST** `/api/users/register`
```json
{
  "username": "sws-testuser",
  "email": "sws-test@test.com",
  "password": "sws-password123"
}
```

**Response — 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "sws-testuser",
    "email": "sws-test@test.com"
  }
}
```

### Login
**POST** `/api/users/login`
```json
{
  "email": "sws-test@test.com",
  "password": "sws-password123"
}
```

### GitHub OAuth
**GET** `/api/users/auth/github`

Redirects to GitHub authorization page. On approval, returns:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "your-github-username",
    "githubId": "..."
  }
}
```

### Create a Bookmark
**POST** `/api/bookmarks`
```json
{
  "title": "SWS Test Bookmark",
  "url": "https://github.com",
  "description": "GitHub homepage bookmark for testing"
}
```

**Response — 201 Created:**
```json
{
  "_id": "...",
  "title": "SWS Test Bookmark",
  "url": "https://github.com",
  "description": "GitHub homepage bookmark for testing",
  "user": "...",
  "createdAt": "..."
}
```

## References

- [Passport.js Official Website](http://www.passportjs.org/)
- [passport-github2 on npm](https://www.npmjs.com/package/passport-github2)
- [GitHub Docs: Authorizing OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Mongoose pre() Middleware](https://mongoosejs.com/docs/middleware.html#pre)
- [bcrypt on npm](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken on npm](https://www.npmjs.com/package/jsonwebtoken)
- [Express.js Routing Documentation](https://expressjs.com/en/guide/routing.html)
- [Mongoose Population](https://mongoosejs.com/docs/populate.html)
- [OAuth 2.0 Official Spec](https://oauth.net/2/)
- [How To Safely Store A Password](https://codahale.com/how-to-safely-store-a-password/)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Reflection

> 🚧 Work in progress