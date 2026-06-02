# WatchLy — Entertainment Recommendation System

A static web app for discovering movies and TV shows with personalized recommendations.

## Project Structure

```
├── index.html              # Landing page
├── pages/                  # App pages
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── onboarding.html
│   ├── search.html
│   ├── movies.html
│   ├── tvshows.html
│   ├── profile.html
│   └── content-detail.html
├── css/
│   ├── styles.css          # Base styles, landing & auth
│   ├── app.css             # App pages (search, profile, detail, navbar)
│   ├── home.css            # Home page (carousel, chat widget)
│   └── browse.css          # Movies & TV shows browse pages
├── js/
│   ├── auth.js             # Login, register, session
│   ├── main.js             # Landing page utilities
│   ├── home.js             # Home page helpers
│   ├── navigation.js       # Navigation helpers
│   ├── profile.js          # Profile page logic
│   └── search.js           # Search page logic
└── assets/
    └── images/             # Static images
```

## Getting Started

Open `index.html` in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
