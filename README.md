# GMM Devengos — Frontend

Web client for the GMM Devengos payroll and time-tracking application.  
Built with **React 18 + TypeScript + Vite**, communicating with the [gmm-devengos-backend](https://github.com/jfranciscogomezn/gmm-devengos-backend) REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios |
| UI Library | React Bootstrap 5 + Bootstrap Icons |
| Testing | Vitest + Testing Library |
| Linting | ESLint + TypeScript ESLint |

---

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                   # Axios client + per-domain service modules
│   │   ├── client.ts          # Axios instance, JWT interceptor, 401 handler
│   │   ├── auth.service.ts
│   │   ├── roles.service.ts
│   │   └── users.service.ts
│   ├── components/
│   │   ├── Layout/            # AppLayout (sidebar + outlet)
│   │   ├── Sidebar/           # Dynamic sidebar built from menu options
│   │   └── ProtectedRoute/    # Auth & role guard HOC
│   ├── context/
│   │   └── AuthContext.tsx    # JWT token, user profile, menu options
│   ├── pages/
│   │   ├── Login/             # Login form
│   │   ├── profile/           # View profile + change password
│   │   ├── roles/             # Role list, form, menu-option assignment
│   │   └── users/             # User list + form
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── test/
│   │   └── setup.ts           # Vitest global setup
│   ├── App.tsx                # Route definitions
│   ├── main.tsx               # React DOM entry point
│   └── vite-env.d.ts          # Vite client type declarations
├── .env.example               # Environment variable template
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts             # Dev server + API proxy
```

---

## Prerequisites

- **Node.js** 20 LTS or later
- **npm** 10 or later
- Backend API running on `http://localhost:8080` (see [gmm-devengos-backend](https://github.com/jfranciscogomezn/gmm-devengos-backend))

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Default content — the relative URL routes all API calls through the **Vite dev proxy**, avoiding CORS issues:

```env
VITE_API_URL=/api/v1
```

> **Note:** Do not use an absolute URL (`http://localhost:8080/api/v1`) in development.  
> The Vite proxy (configured in `vite.config.ts`) forwards `/api/v1/*` to `http://localhost:8080/api/v1`.

### 3. Start the development server

```bash
npm run dev
```

The app is available at **http://localhost:3000**.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server (port 3000) |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Authentication Flow

1. User submits credentials on `/login`.
2. `AuthService.login()` calls `POST /api/v1/auth/login`.
3. On success the JWT token, profile, and menu options are stored in `AuthContext`.
4. Axios request interceptor attaches `Authorization: Bearer <token>` to every subsequent request.
5. A 401 response interceptor clears the token and redirects to `/login`.

---

## Default Credentials

| Field | Value |
|---|---|
| Email | `admin@gmm.com` |
| Password | `Admin@2026!` |

> The admin account is seeded automatically by the backend on first startup.

---

## Role-Based Access

| Role | Accessible Sections |
|---|---|
| `ADMIN` | Role management, user management, payroll config, employee config, time records (admin), reports, profile |
| `EMPLOYEE` | My time records, my profile |

Routes and sidebar items are rendered dynamically from the `menuOptions` returned in the login response.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Base path for API calls (relative = goes through Vite proxy) |

---

## Related Repositories

- **Backend:** [gmm-devengos-backend](https://github.com/jfranciscogomezn/gmm-devengos-backend)
