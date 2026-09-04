# Gloss — Customer Web App

React + Vite frontend for the salon booking platform. Talks to the
`salon-backend` API — nothing in here touches a database directly.

## Setup

```bash
npm install
cp .env.example .env
# make sure VITE_API_URL points at your running backend
npm run dev
```

Runs at `http://localhost:5173`. Make sure `salon-backend` is running
first (`http://localhost:5000`), and that its `.env` `CORS_ORIGINS`
includes `http://localhost:5173`.

## Project structure

```
src/
  api/client.js         -> the ONLY file that calls the backend API
  context/AuthContext.jsx -> tracks who's logged in, app-wide
  components/            -> reusable pieces (NavBar, AppointmentTicket, ProtectedRoute)
  pages/                  -> one file per screen
  App.jsx                 -> routes URLs to pages
```

## The booking flow, screen by screen

```
DiscoverPage (/)
  -> search/browse salons
SalonDetailPage (/salons/:id)
  -> pick a service, then pick a stylist who offers it
BookingPage (/salons/:id/book)
  -> pick a date, see live available times, confirm
MyBookingsPage (/bookings) [requires login]
  -> view upcoming/past bookings, cancel (>2hrs before start)
```

## Key decisions

**One `api/client.js` file for every backend call.** No component ever
calls `fetch()` directly — they all import functions from here. This
means auth headers, the base URL, and error handling are written once,
not copy-pasted into every page.

**Auth state lives in React Context** (`AuthContext.jsx`), not in each
page individually. On app load, if a token is saved in `localStorage`,
it calls `GET /api/auth/me` to restore who's logged in — this is what
lets you refresh the page without being logged out.

**Booking state is passed via React Router's `location.state`**, not
a separate global store. When you pick a service/stylist on the salon
page and click through, that data rides along to the booking page
without a re-fetch. If someone lands on `/salons/:id/book` directly
(e.g. pasted the URL), there's no state, so it redirects back — this
is a deliberate simplification for this scope; a production app might
persist selection in the URL instead.
