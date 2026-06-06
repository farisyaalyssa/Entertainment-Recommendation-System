# WatchLy — Setup Guide for the Team

This guide explains how to get WatchLy running on your computer. No heavy tech knowledge needed — just follow the steps in order.

---

## What you're setting up

WatchLy has **two parts** that run at the same time:

1. **Frontend** — the website you see in the browser (HTML pages)
2. **Backend** — the server that saves data to the database (users, watchlist, reviews, etc.)

The database (MongoDB) lives **online in the cloud**, not on your laptop. Everyone on the team connects to the **same database**, so you all see the same data.

---

## Before you start

Make sure you have these installed:

- **Node.js** — [https://nodejs.org](https://nodejs.org) (download the LTS version)
- **Git** — to clone the project from GitHub
- **Python 3** — usually already on Mac (used to open the website locally)

Ask the project lead (who set up MongoDB) to send you these **privately** (WhatsApp/Discord — not GitHub):

- The **MongoDB connection link** (`MONGODB_URI`)
- The **JWT secret key** (`JWT_SECRET`)

---

## Step 1: Get the project on your computer

Open Terminal and run:

```bash
git clone <your-github-repo-link>
cd Entertainment-Recommendation-System
```

---

## Step 2: Set up the backend

### Install the backend packages

```bash
cd backend
npm install
```

Wait until it finishes — this downloads everything the server needs.

### Create your `.env` file

The `.env` file stores secret settings (database link, passwords). **Never upload this file to GitHub.**

1. Copy the example file:

```bash
cp .env.example .env
```

2. Open `backend/.env` in any text editor (VS Code, Notepad, etc.)

3. Fill in the values the project lead sent you. It should look like this:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster....mongodb.net/watchly
JWT_SECRET=watchly_super_secret_key_2026
```

#### What do these mean?

**`MONGODB_URI`** — The link to our shared online database.
- Everyone uses the same link
- Make sure it ends with `/watchly`
- This is where user accounts, watchlists, reviews, etc. are saved

**`JWT_SECRET`** — A secret code the server uses when someone logs in.
- Everyone on the team must use the **exact same** secret
- If yours is different, login won't work properly

**`PORT=5000`** — The address the backend runs on. Leave this as is.

### Start the backend

```bash
npm run dev
```

**If it worked**, you'll see something like:

```
MongoDB connected: ...
WatchLy server running on port 5000
```

Keep this terminal window open — the backend needs to keep running.

**If it didn't work**, see the Troubleshooting section at the bottom.

---

## Step 3: Open the website (frontend)

Open a **new** Terminal window (leave the backend running in the first one).

Go to the main project folder and start a simple web server:

```bash
cd Entertainment-Recommendation-System
python3 -m http.server 8000
```

Then open your browser and go to:

**http://localhost:8000**

You should see the WatchLy landing page.

---

## Step 4: Check everything is working

| Check | How |
|---|---|
| Website loads | Open `http://localhost:8000` |
| Backend is running | Open `http://localhost:5000` — should say `"WatchLy API is running"` |
| Database connected | Backend terminal shows `MongoDB connected` |

---

## How to run WatchLy every time

You always need **two terminal windows**:

**Window 1 — Backend:**
```bash
cd backend
npm run dev
```

**Window 2 — Frontend:**
```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

---

## Important rules for the team

1. **Don't commit `.env` to GitHub** — it contains passwords
2. **Use the same `MONGODB_URI` and `JWT_SECRET`** as everyone else
3. **Ask the project lead** if you need Atlas access to view the database online
4. **Backend must be running** for profile, watchlist, reviews, etc. to save data

---

## Troubleshooting

### "MongoDB connection error"

Your computer might not be allowed to connect to Atlas.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Open your project → **Network Access**
3. Click **Add IP Address**
4. For development, you can choose **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Try `npm run dev` again

Also double-check the username and password in your `MONGODB_URI` are correct.

### "Cannot find module" or "server.js not found"

Make sure you're inside the `backend` folder before running commands:

```bash
cd backend
npm run dev
```

Not from the main project folder.

### Profile page redirects to login

That's normal for now. The login/register pages need to be connected to the backend first. Once login saves a token, profile and content-detail will work.

### Website works but nothing saves

The backend probably isn't running. Check Terminal 1 for `MongoDB connected` and `running on port 5000`.

---

## Who to ask for help

| Problem | Ask |
|---|---|
| MongoDB link / JWT secret | Project lead (who set up Atlas) |
| Login / register not working | Teammate doing auth module |
| Profile, watchlist, reviews | Teammate doing profile module |
| Home, movies, search pages | Respective page owners |

---

## Quick summary

1. Clone the repo
2. `cd backend` → `npm install` → create `.env` → `npm run dev`
3. Open another terminal → `python3 -m http.server 8000`
4. Go to **http://localhost:8000**
5. Keep both terminals running while you work

That's it!
