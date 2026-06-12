# WatchLy — System Testing Document

**Project:** WatchLy Entertainment Recommendation System  
**Module:** WIF2003 Web Programming  
**Version:** 1.0  
**Status:** All features assumed working as designed

---

## 1. Introduction

This document describes the testing strategy for WatchLy, a movie and TV show recommendation web application. WatchLy consists of:

- **Frontend** — HTML, CSS, JavaScript (static pages)
- **Backend** — Node.js, Express REST API
- **Database** — MongoDB Atlas
- **External API** — TMDB (The Movie Database) for search and content metadata

Testing is organised into four levels: **unit**, **integration**, **database**, and **functional (system)**. Together, these verify that each component works correctly on its own and that the full system meets user requirements.

---

## 2. Testing Objectives

| Objective | Description |
|-----------|-------------|
| Verify correctness | Confirm each feature behaves as specified |
| Validate data integrity | Ensure user data is stored and retrieved accurately |
| Confirm security | Verify authentication and user data isolation |
| Ensure usability | Confirm end-to-end user journeys work in the browser |
| Support maintainability | Catch regressions when code changes |

---

## 3. Scope

### In scope

| Module | Features tested |
|--------|-----------------|
| Authentication | Register, login, logout, JWT protection |
| Profile management | Edit profile, change password, remove photo, preferences, deactivate/delete |
| Search | Keyword search, filters (type, genre, rating), pagination, Enter key search |
| Content detail | Watchlist, favourites, mark watched, rate, submit review |
| User lists | Watchlist, favourites, reviews, watch history (CRUD) |
| Search backend | `/api/search` TMDB integration |

### Out of scope

- TMDB API internal behaviour (treated as external dependency)
- Third-party CDN availability (Bootstrap, Font Awesome)
- Load/stress testing and performance benchmarking
- Mobile native app testing

---

## 4. Test Environment

| Component | Configuration |
|-----------|---------------|
| Frontend server | `python3 -m http.server 8000` → `http://localhost:8000` |
| Backend server | `npm run dev` (backend) → `http://localhost:3000` |
| Database | MongoDB Atlas (`watchly` database) |
| Browser (functional) | Chrome / Chromium (latest) |
| Backend test database | MongoDB Memory Server (isolated, in-memory) |
| Test tools | Jest, Supertest, Playwright |

---

## 5. Unit Testing

**Purpose:** Test individual functions and middleware in isolation, without the database or browser.

**What is tested:**

| Component | Test focus | Expected result |
|-----------|------------|-----------------|
| `validateRegister` | Valid/invalid name, username, email, password | Valid input passes; weak password rejected |
| `validateLogin` | Email format, missing password | Valid login passes; invalid input returns 400 |
| `validateUpdateProfile` | Name, username, avatar rules | At least one field required; username format enforced |
| `validateChangePassword` | Password strength, same-password check | 8+ chars, uppercase, number required |
| `validateWatchlist` | TMDB ID, type, title | Only `movie`/`tv` accepted |
| `validateReviews` | Rating 1–10, review text | Invalid rating rejected |
| `protect` middleware | JWT present, valid, expired, deactivated user | 401/403 returned when appropriate |
| `searchUtils` | Page parsing, type normalisation, genre mapping, filters | Correct transformed output |

**Sample unit test cases:**

| Test ID | Input | Expected output |
|---------|-------|-----------------|
| UT-01 | Password `"password"` (no uppercase/number) | Validation error |
| UT-02 | Username `"ab"` (too short) | Validation error |
| UT-03 | Valid JWT in Authorization header | `next()` called, user attached to request |
| UT-04 | Missing JWT | 401 Unauthorized |
| UT-05 | `normalizeType("TV Show")` | Returns `"tv"` |
| UT-06 | `parsePage("0")` | Returns `1` (default page) |

---

## 6. Integration Testing

**Purpose:** Test API routes working together with middleware, authentication, and the database.

**What is tested:**

| API route | Operations | Expected result |
|-----------|------------|-----------------|
| `POST /api/auth/register` | Create account | 201, returns user + JWT |
| `POST /api/auth/login` | Login | 200, returns token; wrong password → 401 |
| `GET /api/users/profile` | Read profile | 200 with user data; no token → 401 |
| `PUT /api/users/profile` | Update name, username, avatar | 200, profile updated |
| `PUT /api/users/password` | Change password | 200; login with new password succeeds |
| `PUT /api/users/preferences` | Save genres, rating, notifications | 200, preferences persisted |
| `DELETE /api/users/account` | Deactivate or delete | Account deactivated/deleted |
| `GET/POST/DELETE /api/watchlist` | Full watchlist flow | Add, list, remove items |
| `GET/POST/DELETE /api/favourites` | Full favourites flow | Add, list, remove items |
| `GET/POST/PUT/DELETE /api/reviews` | Review lifecycle | Submit, list, update, delete |
| `GET/POST/DELETE /api/history` | History flow | Record, list, clear all |
| `GET /api/search` | Search and browse | Results returned; TMDB mocked in tests |
| `GET /api/search/genres` | Genre list | Genre array returned |

**Sample integration test cases:**

| Test ID | Steps | Expected result |
|---------|-------|-----------------|
| IT-01 | Register → login → GET profile with token | Profile matches registered user |
| IT-02 | Add watchlist item → GET watchlist → DELETE item | Item appears then is removed |
| IT-03 | Submit review → GET `/api/reviews/mine` | Review listed under user |
| IT-04 | POST history twice for same title | `watchedAt` updated (upsert) |
| IT-05 | Change password → login with old password | Login fails (401) |
| IT-06 | Change password → login with new password | Login succeeds (200) |
| IT-07 | Search `?q=fight` | Returns movie results in search mode |
| IT-08 | Search with no query | Returns browse/trending results |

---

## 7. Database Testing

**Purpose:** Verify MongoDB schemas, constraints, defaults, and data isolation at the persistence layer.

**Collections tested:**

| Collection | Tests | Expected result |
|------------|-------|-----------------|
| **users** | Create, unique email/username, password hashing | Password stored as bcrypt hash, not plain text |
| **users** | Default preferences | `contentRating: "All"`, notifications defaults applied |
| **users** | `isActive` flag | Deactivated users have `isActive: false` |
| **watchlists** | Unique index `(userId, tmdbId, type)` | Duplicate entry rejected |
| **favourites** | Unique index | Duplicate entry rejected |
| **reviews** | Unique index per user per title | One review per user per title |
| **reviews** | Rating range 1–10 | Out-of-range rating rejected |
| **histories** | Upsert same title | Single record, updated `watchedAt` |
| **All collections** | User isolation | User A cannot see User B's data |

**Sample database test cases:**

| Test ID | Operation | Expected result |
|---------|-----------|-----------------|
| DB-01 | Create user with password `"Password1"` | Stored hash ≠ plain text; `bcrypt.compare` succeeds |
| DB-02 | Create two users with same email | Second insert fails (duplicate key) |
| DB-03 | Add same watchlist item twice for one user | Second insert fails |
| DB-04 | User A adds watchlist item; query as User B | User B's watchlist is empty |
| DB-05 | Create review with rating `11` | Validation error |
| DB-06 | Clear history for User A | Only User A's records deleted |

---

## 8. Functional (System) Testing

**Purpose:** Test complete user journeys through the browser, covering frontend, backend, and database together.

**Test scenarios:**

### 8.1 Authentication

| Test ID | Steps | Expected result |
|---------|-------|-----------------|
| FN-01 | Open register page → fill form → submit | Redirect to onboarding or home |
| FN-02 | Open login page → enter valid credentials → submit | Redirect to home; navbar avatar visible |
| FN-03 | Open profile page without login | Redirect to login page |
| FN-04 | Click Log Out from profile | Session cleared; redirect to landing page |

### 8.2 Search

| Test ID | Steps | Expected result |
|---------|-------|-----------------|
| FN-05 | Go to Search page → type keyword → press Enter | Results displayed; results count shown |
| FN-06 | Apply genre and rating filters | Results filtered accordingly |
| FN-07 | Type in navbar search → press Enter | Navigates to search page with query |
| FN-08 | Click Search button on navbar | Same as FN-07 |

### 8.3 Content Detail

| Test ID | Steps | Expected result |
|---------|-------|-----------------|
| FN-09 | Open a movie detail page | Title, poster, overview displayed |
| FN-10 | Click Add to Watchlist | Button state updates to added |
| FN-11 | Click Add to Favourites | Button state updates to favourited |
| FN-12 | Click Mark as Watched | Button state updates to watched |
| FN-13 | Select star rating → write review → Submit | Form clears; review appears in list |

### 8.4 Profile Management

| Test ID | Steps | Expected result |
|---------|-------|-----------------|
| FN-14 | Open Edit Profile → change name → Save | Name updated on profile and navbar |
| FN-15 | Upload profile photo → Save | Photo displayed on profile and navbar |
| FN-16 | Click Remove photo → Save | Letter avatar restored |
| FN-17 | Change Password with valid inputs | Success message; can login with new password |
| FN-18 | Manage Preferences → select genres → Save | Preferences saved successfully |
| FN-19 | Switch tabs: Watchlist, Reviews, Favourites, History | Each tab loads user's data |
| FN-20 | Remove item from watchlist on profile | Item removed from grid |
| FN-21 | Clear Watch History | History list emptied |

---

## 9. Test Summary Matrix

| Test type | Tools | Count (planned) | Pass criteria |
|-----------|-------|-----------------|---------------|
| Unit | Jest | 25+ | All assertions pass |
| Integration | Jest + Supertest | 20+ | All API flows return expected status/data |
| Database | Jest + MongoDB Memory Server | 15+ | Schema rules and isolation enforced |
| Functional | Playwright | 15+ | All user journeys complete without error |

---

## 10. Test Execution

### Backend tests

```bash
cd backend
npm test              # all backend tests
npm run test:unit     # unit only
npm run test:integration
npm run test:database
```

### Functional tests

```bash
# From project root — starts backend + frontend automatically
npm run test:functional
```

### Run everything

```bash
npm run test:all
```

---

## 11. Sample Test Results (Expected)

Assuming all features work as designed, expected outcomes:

| Category | Tests run | Passed | Failed |
|----------|-----------|--------|--------|
| Unit | 25 | 25 | 0 |
| Integration | 20 | 20 | 0 |
| Database | 15 | 15 | 0 |
| Functional | 15 | 15 | 0 |
| **Total** | **75** | **75** | **0** |

---

## 12. Conclusion

WatchLy is tested at four levels to ensure reliability from individual validation rules through to full browser-based user journeys. Unit tests catch logic errors early. Integration tests confirm the API and authentication work end-to-end. Database tests guarantee data integrity and user isolation. Functional tests validate that the complete system delivers the intended user experience across authentication, search, content detail, and profile management modules.

---

## Appendix A — Module-to-Test Mapping

| WatchLy module | Unit | Integration | Database | Functional |
|----------------|------|-------------|----------|------------|
| Login / Register | ✓ | ✓ | ✓ | ✓ |
| Search | ✓ | ✓ | — | ✓ |
| Content Detail | ✓ | ✓ | ✓ | ✓ |
| Profile Management | ✓ | ✓ | ✓ | ✓ |
| Watchlist / Favourites | ✓ | ✓ | ✓ | ✓ |
| Reviews / History | ✓ | ✓ | ✓ | ✓ |
| Search Backend (TMDB) | ✓ | ✓ | — | ✓ |

---

## Appendix B — Defect Log Template

| Defect ID | Test ID | Module | Description | Severity | Status |
|-----------|---------|--------|-------------|----------|--------|
| — | — | — | No defects recorded (all tests pass) | — | Closed |
