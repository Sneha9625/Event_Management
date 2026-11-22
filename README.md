# 🎟️ EventHub – Event Management System

A full-stack **MERN** event platform where people can discover events, RSVP in one click, and organizers can create events, upload banners, see attendees and mark attendance. Venues are automatically placed on a map using OpenStreetMap.

---

## ✨ Features

**Everyone**
- Browse upcoming events in a responsive grid
- Search by title, filter by category, paginate
- Event page with banner, date, capacity bar (`x / y spots`), organizer and an interactive map

**Attendees** (default role)
- Sign up with **email OTP verification** (6-digit code, 10-minute expiry, resend with rate limit)
- RSVP / cancel RSVP (re-register after cancelling is allowed)
- Confirmation email on RSVP
- "My Events" page with upcoming RSVPs

**Organizers** (everything attendees can do, plus)
- Create / edit / delete **their own** events
- Upload a banner image (JPG/PNG/WEBP, max 2MB → Cloudinary)
- Venue is geocoded to lat/lng automatically (re-geocoded when the venue changes)
- Dashboard with stats and an RSVP count per event
- Attendee list with an **Attended** checkbox

**Admins** (set manually in the database)
- Delete any event
- `GET /api/auth/users` lists all users

**Security**
- Passwords **and** OTPs hashed with bcrypt; they are never returned by the API
- JWT auth (7-day expiry); "admin" can never be chosen at signup
- Ownership checked **on the server** for edit / delete / attendees / attendance
- Input validation with express-validator, rate limiting on auth routes, CORS restricted to `CLIENT_URL`

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router v6, Axios, Tailwind CSS v4 (Inter font), lucide-react icons, react-leaflet + Leaflet, react-hot-toast |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | jsonwebtoken, bcryptjs |
| Email | nodemailer (Gmail App Password) |
| Uploads | multer (memoryStorage) + Cloudinary |
| Maps | OpenStreetMap tiles + Nominatim geocoding (free, no API key) |
| Other | express-validator, express-rate-limit, cors, dotenv, nodemon |

---

## 📁 Folder Structure

```
Event_Management_System/
├── server/
│   ├── config/         db.js, cloudinary.js
│   ├── models/         User.js, Event.js, Registration.js
│   ├── controllers/    authController.js, eventController.js, registrationController.js
│   ├── routes/         authRoutes.js, eventRoutes.js, registrationRoutes.js
│   ├── middleware/     authMiddleware.js, roleMiddleware.js, upload.js, errorHandler.js, validate.js
│   ├── utils/          sendEmail.js, generateOtp.js, geocode.js, uploadToCloudinary.js
│   ├── seed.js         demo data
│   ├── app.js          the Express app (routes + middleware)
│   ├── server.js       local/Render entry: connects DB + app.listen()
│   ├── api/index.js    Vercel serverless entry (uses app.js)
│   ├── vercel.json     sends every URL to api/index.js
│   └── .env.example
└── client/
    ├── src/
    │   ├── api/axios.js             axios instance + JWT/401 interceptors
    │   ├── context/AuthContext.jsx  user, token, login(), logout(), loading
    │   ├── components/              Layout, Navbar, Footer, EventCard, EventForm, ImageUpload, MapView,
    │   │                            SearchBar, Pagination, AuthLayout, OtpInput, PageHeader, StatCard...
    │   ├── components/ui/           Button, Input, PasswordInput, Select, Textarea, Card, Badge, Modal,
    │   │                            EmptyState, Skeleton, Switch, Container (the design system)
    │   ├── hooks/usePageTitle.js    sets document.title per page
    │   ├── pages/                   Home, Login, Register, VerifyOtp, EventDetails, CreateEvent, EditEvent,
    │   │                            MyEvents, OrganizerDashboard, Attendees, NotFound
    │   ├── utils/                   helpers.js (dates), categories.js, cn.js (class joiner)
    │   ├── App.jsx, main.jsx, index.css
    ├── vercel.json     SPA rewrites for Vercel
    └── .env.example
```

---

## 🚀 Getting Started (local)

### Prerequisites
- **Node.js 18+** (the geocoder uses the built-in `fetch`)
- **MongoDB** running locally, or a free MongoDB Atlas cluster

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Environment variables
```bash
cd server && cp .env.example .env
cd ../client && cp .env.example .env
```
Edit `server/.env`:

| Variable | What it is |
|---|---|
| `MONGO_URI` | `mongodb://127.0.0.1:27017/eventhub` or your Atlas string |
| `JWT_SECRET` | Long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | `http://localhost:5173` (comma-separate several origins) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address + [App Password](https://myaccount.google.com/apppasswords). **Optional in dev**: if empty, emails are skipped and **OTPs are printed in the server console**. |
| `CLOUDINARY_*` | From your Cloudinary dashboard. Only needed to upload banners (events work without them). |
| `NOMINATIM_USER_AGENT` | Optional. Leave empty to use the default. Placeholder values like `you@example.com` are blocked by Nominatim. |

`client/.env` → `VITE_API_URL=http://localhost:5000/api`

### 3. Seed demo data (optional but recommended)
```bash
cd server && npm run seed
```
⚠️ This **deletes** all users, events and registrations in that database first.

| Role | Email | Password |
|---|---|---|
| Organizer | organizer@eventhub.com | 123456 |
| Attendee | alice@eventhub.com | 123456 |
| Attendee | bob@eventhub.com | 123456 |

The "UI/UX Design Workshop" has capacity 3 with 2 RSVPs, so you can test the "Event full" state quickly.

**Make an admin:** `mongosh eventhub --eval 'db.users.updateOne({email:"alice@eventhub.com"},{$set:{role:"admin"}})'` (then log in again).

### 4. Run
```bash
# terminal 1
cd server && npm run dev      # http://localhost:5000
# terminal 2
cd client && npm run dev      # http://localhost:5173
```

---

## 📡 API Reference

All responses look like `{ "success": true|false, "message": "...", "data": ... }`.
Protected routes need the header `Authorization: Bearer <token>`.

### Auth: `/api/auth`
| Method | Endpoint | Access | Body / Notes |
|---|---|---|---|
| POST | `/register` | Public (rate limited) | `{ name, email, password, role? }` where role is `attendee` or `organizer` |
| POST | `/verify-otp` | Public | `{ email, otp }` |
| POST | `/resend-otp` | Public (5 / 15 min) | `{ email }` |
| POST | `/login` | Public (rate limited) | `{ email, password }` → `{ token, user }` (403 if not verified) |
| GET | `/me` | Logged in | Current user |
| GET | `/users` | Admin | All users |

### Events: `/api/events`
| Method | Endpoint | Access | Body / Notes |
|---|---|---|---|
| GET | `/` | Public | `?search=&category=&page=&limit=&includePast=true` (upcoming only by default, sorted by date) |
| GET | `/:id` | Public | Includes organizer name/email + `registeredCount` |
| POST | `/` | Organizer | **multipart/form-data**: `title, description, category, date, venue, capacity, banner?` |
| PUT | `/:id` | Owner organizer | Same fields, all optional; re-geocodes if venue changes |
| DELETE | `/:id` | Owner or admin | Also deletes its registrations |
| GET | `/:id/attendees` | Owner organizer | Registered users + `attended` |
| GET | `/organizer/mine` | Organizer | Own events with `registeredCount` |

### Registrations: `/api/registrations`
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/:eventId` | Logged in | RSVP (checks: exists, not past, not full, not already registered, not your own event) |
| DELETE | `/:eventId` | Logged in | Cancel RSVP |
| GET | `/my` | Logged in | Your active registrations, event populated |
| PATCH | `/:registrationId/attendance` | Owner organizer | `{ attended: true/false }` (omit to toggle) |

### Quick test with curl / Postman / Thunder Client
```bash
# Login (copy data.token from the response)
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"organizer@eventhub.com","password":"123456"}'

# Create an event (in Postman: Body → form-data; "banner" is type File)
curl -X POST http://localhost:5000/api/events -H "Authorization: Bearer <TOKEN>" \
  -F title="My Meetup" -F description="A friendly meetup for devs" -F category=Tech \
  -F date=2030-01-15T18:00:00.000Z -F venue="Cubbon Park, Bengaluru" -F capacity=50 \
  -F banner=@./banner.jpg

# RSVP as an attendee
curl -X POST http://localhost:5000/api/registrations/<EVENT_ID> -H "Authorization: Bearer <ATTENDEE_TOKEN>"
```

---

## ☁️ Deployment

### 1. Database: MongoDB Atlas
1. Create a free **M0** cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user + password.
3. **Network Access** → allow `0.0.0.0/0` (Vercel/Render IPs change, so a fixed IP list won't work).
4. **Connect → Drivers** → copy the connection string and add a DB name:
   `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/eventhub`

You will create **two Vercel projects from the same GitHub repo**: one for `server/`, one for `client/`.

### 2. Backend: Vercel (serverless)
How it works: `server/api/index.js` is the serverless function, and `server/vercel.json` sends every URL to it.
The Express app itself lives in `server/app.js` (shared with `server.js`, which is only used locally).

1. Push the project to GitHub.
2. Vercel → **Add New → Project** → import the repo.
3. **Root Directory:** `server` · **Framework Preset:** `Other` · leave Build/Output commands empty.
4. **Environment Variables** (Vercel does *not* read your `.env` file): add
   `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `NODE_ENV=production`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`,
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (and optionally `NOMINATIM_USER_AGENT`).
   Leave `CLIENT_URL` for step 4.
5. Deploy and open the URL, e.g. `https://eventhub-api.vercel.app` → you should see `"EventHub API is running"`.
6. (Optional) seed Atlas from your machine: temporarily set `MONGO_URI` locally to the Atlas string and run `npm run seed`.

> Serverless notes: the first request after a quiet period takes a second or two (cold start + DB connect).
> Uploads are capped at 2MB by the app (Vercel's own limit is 4.5MB). Rate limits are counted per function instance.

*Prefer an always-on server?* Render works too: **New → Web Service**, Root Directory `server`, Build `npm install`, Start `npm start`, same env vars.

### 3. Frontend: Vercel
1. Vercel → **Add New → Project** → import the **same** repo again.
2. **Root Directory:** `client` (Vercel detects Vite automatically).
3. Env var: `VITE_API_URL=https://eventhub-api.vercel.app/api` (your backend URL + `/api`).
4. Deploy. `client/vercel.json` makes deep links like `/events/123` work on refresh.

### 4. Connect them
In the **backend** project → Settings → Environment Variables, set
`CLIENT_URL=https://your-frontend.vercel.app` (comma-separate several URLs if needed), then **Redeploy** the backend.
Env var changes only apply after a redeploy — on both projects.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| CORS error in the browser | `CLIENT_URL` must exactly match the frontend origin (no trailing slash) |
| Not receiving OTP email | In dev, read the OTP from the server console. For Gmail, use an **App Password** (needs 2-Step Verification). |
| "Image upload is not configured" | Add the three `CLOUDINARY_*` variables, or create the event without a banner |
| Map shows "not available" | Nominatim couldn't find the venue. Try a more specific address like "Cubbon Park, Bengaluru". |
| Logged out unexpectedly | Your JWT expired (7 days) or `JWT_SECRET` changed; log in again |

---

## 📜 Scripts

| Folder | Command | Does |
|---|---|---|
| server | `npm run dev` | Start API with nodemon (auto-restart) |
| server | `npm start` | Start API (production) |
| server | `npm run seed` | Reset DB with demo data |
| client | `npm run dev` | Vite dev server |
| client | `npm run build` | Production build to `dist/` |
| client | `npm run preview` | Preview the production build |

---

## 📷 Photo credits

Landing-page, login and category photos in `client/public/images/` are from [Unsplash](https://unsplash.com) and used under the [Unsplash License](https://unsplash.com/license) (free for commercial and non-commercial use). Events without an uploaded banner show one of the category photos.
