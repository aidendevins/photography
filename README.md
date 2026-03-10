# Aiden Devins Photography

A stunning dark, cinematic photography portfolio showcasing landscape, wildlife, and travel photography.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Railway)
- **Database**: PostgreSQL via `pg` npm package (Railway Postgres)

## Features

- Full-screen hero with smooth animations
- Filterable photo gallery (Landscapes / Wildlife / Travel)
- Full-screen lightbox viewer with keyboard navigation
- Contact form for print inquiries (saved to database)
- Admin dashboard with analytics and contact management
- Mobile-first responsive design

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### Environment Variables

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:8000/api
```

**Backend** (`backend/.env`):
```
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/photography
FRONTEND_URL=http://localhost:5173
```

## Deployment

### Railway (Backend)

1. Create new project at railway.app
2. Deploy from GitHub → select this repo
3. Set Root Directory: `backend`
4. Add PostgreSQL service
5. Set environment variables:
   - `FRONTEND_URL` = your Vercel domain
   - `DATABASE_URL` = Reference from Postgres service
   - `NODE_ENV` = production

### Vercel (Frontend)

1. Import project at vercel.com
2. Set Root Directory: `frontend`
3. Set environment variable:
   - `VITE_API_URL` = your Railway backend URL + `/api`

## Routes

- `/` - Main portfolio site
- `/admin` - Analytics dashboard (password: 0612)
- `/privacy` - Privacy policy

## License

All photographs are © Aiden Devins. All rights reserved.
