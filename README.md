# WatchLy — Entertainment Recommendation System

A web app for discovering movies and TV shows with personalized recommendations.

## Project Structure

```
├── index.html              # Landing page
├── pages/                  # App pages
├── css/                    # Stylesheets
├── js/                     # Frontend JavaScript
├── assets/                 # Static images
└── backend/                # Express API + MongoDB
    ├── server.js
    ├── config/
    ├── models/
    ├── routes/
    └── middleware/
```

## Team Setup

Everyone on the team uses **one shared MongoDB Atlas database**. Each person runs the backend locally, but all data goes to the same cloud database.

### 1. Clone and install

```bash
git clone <repo-url>
cd Entertainment-Recommendation-System
cd backend && npm install
```

### 2. Environment variables

Copy the example env file and fill in the real values (ask the team lead — **do not commit `.env` to GitHub**):

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Atlas connection string (shared by the team) |
| `JWT_SECRET` | Must be **the same for everyone** or login tokens won't work across machines |
| `PORT` | Default `5000` |

Your `backend/.env` should look like this (get the real values from the team lead via WhatsApp/Discord — **never push this file to GitHub**):

```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/watchly
JWT_SECRET=some_random_secret_string_everyone_shares
```

#### What is `MONGODB_URI`?

This is basically the **address + password for your database** in the cloud (MongoDB Atlas).

- Think of it like a Google Drive link, but for your app's data (users, watchlists, reviews, etc.)
- Everyone on the team uses the **same URL** so you all read/write to the **same database**
- The `/watchly` at the end is the database name — don't leave it out
- You run the backend on your laptop, but the data lives in Atlas (cloud), not on your machine

If the backend says `MongoDB connection error`, usually it means:
- Wrong username/password in the URL
- Your IP isn't allowed in Atlas → go to **Network Access** and add your IP (or `0.0.0.0/0` for dev)

#### What is `JWT_SECRET`?

This is a **secret password the server uses to create login tokens**.

- When a user logs in, the backend gives them a JWT token (like a temporary pass)
- The server signs that token using `JWT_SECRET`
- Every protected route (profile, watchlist, etc.) checks that token

**Important:** all teammates must use the **exact same** `JWT_SECRET` in their `.env`. If one person uses a different secret, login tokens won't work on their machine.

Pick any long random string, e.g. `watchly_super_secret_key_2026` — just make sure everyone copies the same one.

#### Who shares these?

Usually **one person** (project lead) creates the Atlas cluster and sends the team:
1. The full `MONGODB_URI`
2. The `JWT_SECRET`

Everyone pastes them into their own local `backend/.env`. That's it — no one needs to create their own database unless you want separate dev environments.

### 3. Run the app

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Wait for `MongoDB connected` and `WatchLy server running on port 5000`.

**Terminal 2 — Frontend:**
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000`.

### 4. MongoDB Atlas access

- **View data:** Atlas → Browse Collections → database `watchly`
- **Connection fails?** Atlas → Network Access → add your IP (or `0.0.0.0/0` for dev)
- **Need Atlas UI access?** Ask the project owner to invite you to the Atlas project

### 5. API overview

| Route | Purpose |
|---|---|
| `/api/auth` | Register & login (returns JWT) |
| `/api/users` | Profile, password, preferences |
| `/api/watchlist` | Watchlist CRUD |
| `/api/favourites` | Favourites CRUD |
| `/api/reviews` | Reviews & ratings |
| `/api/history` | Watch history |

Protected routes require: `Authorization: Bearer <token>`

### 6. Frontend ↔ backend status

| Page / feature | Status |
|---|---|
| `content-detail.html` | Connected to API (needs JWT from login) |
| `profile.html` / `profile.js` | Connected to API (needs JWT from login) |
| Login / register (`auth.js`) | Needs wiring to `/api/auth` |

## Getting Started (frontend only)

If you only need the static frontend without the backend:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
