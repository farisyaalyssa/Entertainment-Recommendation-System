# WatchLy

Entertainment recommendation web app for discovering movies and TV shows, managing personal lists, and sharing reviews. Built for **WIF2003 Web Programming** (University of Malaya).

## Features

- **Authentication** — Register, login, JWT-protected sessions, onboarding
- **Browse & search** — Movies and TV shows via TMDB (keyword search, filters, pagination)
- **Content detail** — Metadata, watchlist, favourites, watch history, star ratings, reviews
- **Profile** — Edit profile, change password, preferences, avatar
- **Personal lists** — Watchlist, favourites, reviews, and watch history (CRUD)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript (static pages) |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| External API | [TMDB](https://www.themoviedb.org/) (search & content metadata) |
| Auth | JWT + bcrypt |
| Testing | Jest, Supertest, Playwright |

## Project structure

```
Entertainment-Recommendation-System/
├── index.html              # Landing page
├── pages/                  # App pages (home, search, profile, etc.)
├── css/                    # Stylesheets
├── js/                     # Frontend JavaScript (api.js, auth.js, …)
├── assets/                 # Images
├── tests/functional/       # Playwright browser tests
├── docs/                   # Report & testing documentation
└── backend/
    ├── server.js           # Entry point
    ├── app.js              # Express app (API + static frontend)
    ├── config/             # Database connection
    ├── models/             # Mongoose schemas (users, watchlist, …)
    ├── routes/             # REST API routes
    ├── middleware/         # Auth & validation
    ├── utils/              # Search/content helpers
    └── tests/              # Unit, integration & database tests
```

## Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- [Git](https://git-scm.com)
- MongoDB Atlas credentials (from your team lead)
- TMDB API key ([free at themoviedb.org](https://www.themoviedb.org/settings/api))

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd Entertainment-Recommendation-System
cd backend && npm install
```

Install root dependencies only if you plan to run Playwright tests:

```bash
cd .. && npm install
```

### 2. Configure environment

Copy the example env file and fill in real values. **Never commit `backend/.env` to Git.**

```bash
cd backend
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default `3000` — must match `js/api.js`) |
| `MONGODB_URI` | MongoDB Atlas connection string (shared by the team) |
| `JWT_SECRET` | Secret for signing login tokens — **must be identical for all teammates** |
| `TMDB_API_KEY` | API key for movie/TV search and content metadata |

Example:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/watchly
JWT_SECRET=watchly_super_secret_key_2026
TMDB_API_KEY=your_tmdb_api_key_here
```

**Team note:** Everyone uses the same `MONGODB_URI` and `JWT_SECRET` so you share one cloud database and login tokens work across machines. Get these from your project lead privately (not via GitHub).

The `/watchly` at the end of `MONGODB_URI` is the database name — do not omit it.

### 3. Run the app

```bash
cd backend
npm run dev
```

Wait for:

```
MongoDB connected: ...
WatchLy server running on port 3000
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

The backend serves both the **API** and the **frontend** on one port. No separate frontend server is required for normal use.

### 4. Verify

| Check | Expected |
|-------|----------|
| Landing page | [http://localhost:3000](http://localhost:3000) loads |
| Register / login | Creates account and redirects to onboarding or home |
| Search | [http://localhost:3000/pages/search.html](http://localhost:3000/pages/search.html) returns results |

## API overview

Base URL: `http://localhost:3000`

| Route | Purpose |
|-------|---------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Login (returns JWT) |
| `GET/PUT /api/users/profile` | Profile read/update |
| `PUT /api/users/password` | Change password |
| `PUT /api/users/preferences` | Save genre & notification preferences |
| `GET/POST/DELETE /api/watchlist` | Watchlist CRUD |
| `GET/POST/DELETE /api/favourites` | Favourites CRUD |
| `GET/POST/PUT/DELETE /api/reviews` | Reviews & ratings |
| `GET/POST/DELETE /api/history` | Watch history |
| `GET /api/search` | Search & browse (TMDB proxy) |
| `GET /api/content/:type/:id` | Content detail (TMDB proxy) |

Protected routes require:

```
Authorization: Bearer <token>
```

## Database

Schemas live in `backend/models/`:

| Collection | Model file |
|------------|------------|
| `users` | `User.js` |
| `watchlists` | `Watchlist.js` |
| `favourites` | `Favourite.js` |
| `reviews` | `Review.js` |
| `histories` | `History.js` |

View live data: MongoDB Atlas → **Browse Collections** → database `watchly`.

## Testing

```bash
# All backend tests (unit + integration + database)
cd backend && npm test

# Individual suites
npm run test:unit
npm run test:integration
npm run test:database

# Browser tests (from project root; starts servers automatically)
npm run test:all
```

See `docs/TESTING.md` for the full testing strategy and `docs/TESTING-RESULTS.md` for recorded results.

## Troubleshooting

### MongoDB connection error

- Check username/password in `MONGODB_URI`
- Atlas → **Network Access** → add your IP (or `0.0.0.0/0` for development)

### Port already in use

On macOS, port 5000 is often taken by AirPlay Receiver. WatchLy uses **3000** by default. If 3000 is busy, change `PORT` in `backend/.env` and update `API_BASE` in `js/api.js` to match.

### Profile / watchlist / reviews not saving

The backend must be running (`npm run dev` in `backend/`). Check the terminal for `MongoDB connected`.

### Search or content detail shows no results

Ensure `TMDB_API_KEY` is set in `backend/.env` and restart the backend.

### Login works on one machine but not another

All teammates must use the **same** `JWT_SECRET` in their local `.env`.

## Documentation

| File | Contents |
|------|----------|
| `docs/TESTING.md` | Testing strategy & test cases |
| `docs/TESTING-RESULTS.md` | Executed test results |
| `docs/SECTION3-BACKEND.md` | Backend report section (architecture, security, etc.) |

## License

ISC — university project.
