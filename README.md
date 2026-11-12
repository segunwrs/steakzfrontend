# Steakz MIS – Front end (React)

React web app for the Steakz restaurant Management Information System: public site, login,
and a separate dashboard for each role (admin, HQ manager, branch manager, chef, cashier/waiter, driver, customer).
It talks to the **steakz-backend** API, which must be running.

**Stack:** React 18 · React Router 6 · Recharts · Vite

## 1. Requirements

- **Node.js 18 or newer** (22 recommended) – check with `node -v`.
- The back end running on http://localhost:4000 (see the steakz-backend README).

## 2. Run it (development)

Open a **second** terminal (keep the back end running in the first):

```bash
cd steakz-frontend
npm install
npm run dev
```

Open **http://localhost:5173**

In development you don't need a `.env` file: Vite forwards every `/api` request to `http://localhost:4000` (see `vite.config.js`).

## 3. Log in

Click **Staff & customer login**. On the login page open **Demo accounts** and click a role to fill in the details.
All demo accounts use the password **Steakz@2026**.

| Try this account | To see |
|---|---|
| admin@steakz.co.uk | Admin dashboard, users & roles, branches, audit log (Level 1) |
| hq@steakz.co.uk | Group report comparing all branches (Level 2) |
| manager.manchester@steakz.co.uk | Branch dashboard locked to Manchester (Level 2) |
| chef.manchester@steakz.co.uk | Kitchen board and stock count (Level 3) |
| cashier.manchester@steakz.co.uk | POS / till, orders and payments (Level 3) |
| driver.manchester@steakz.co.uk | Delivery screen (Level 3) |
| emily@example.com | Customer online ordering (Level 3) |

## 4. Build for production

```bash
cp .env.example .env              # Windows: copy .env.example .env
# edit .env:  VITE_API_URL=https://your-backend.onrender.com
npm run build                     # output goes to dist/
npm run preview                   # optional: test the built site locally
```

`VITE_API_URL` is the address of the deployed back end (no trailing slash). It is read at **build time**,
so rebuild after changing it.

## 5. Deploy (Netlify, free)

1. Push this folder to its own GitHub repo (e.g. `steakz-frontend`).
2. netlify.com → **Add new site → Import from Git** → choose the repo. Build settings come from `netlify.toml`.
3. **Site settings → Environment variables** → add `VITE_API_URL` = your back-end URL. Redeploy.
4. Copy your Netlify URL into the back end's `CORS_ORIGIN` setting on Render.

`netlify.toml` and `public/_redirects` send every route to `index.html`, so refreshing a page like `/app/orders` works.

## 6. Project structure

```
src/
  main.jsx            routes + role-based route guards
  api.js              fetch wrapper (adds the login token), formatting helpers
  auth.jsx            login state (who is logged in)
  nav.js              which menu items each role sees
  styles.css          all styling
  components/
    Layout.jsx        sidebar + top bar
    ui.jsx            cards, tables, badges, modals, toasts, data-loading hook
  pages/
    Home.jsx          public site: menu, branches, book a table (open area)
    Login.jsx         login + customer registration
    Dashboard.jsx     picks the right start page for each role
    AdminDashboard.jsx, Users.jsx, Branches.jsx, AuditLog.jsx      admin
    Reports.jsx                                                    HQ & branch managers
    Orders.jsx, Pos.jsx, Kitchen.jsx, Deliveries.jsx               operations
    Inventory.jsx, Reservations.jsx, MenuAdmin.jsx, Account.jsx    shared
```

## Troubleshooting

- **Login says "Request failed" / network error** → the back end isn't running. Start it with `npm start` in steakz-backend.
- **Deployed site can't reach the API** → check `VITE_API_URL` on Netlify (then redeploy) and `CORS_ORIGIN` on Render.
- **Blank page after refresh on Netlify** → make sure `netlify.toml` is in the repo.
