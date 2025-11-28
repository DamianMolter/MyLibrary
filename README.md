# 📚 Library Management System

Full-stack library management application with AI-powered book recommendations.

## Features

- 🔐 Authentication & Authorization (Admin/Reader roles)
- 📚 Book Management (CRUD operations)
- 👥 User Management
- 📖 Rental System (Borrow, Return, Extend)
- 🔍 Google Books API Integration
- 🤖 AI Chatbot for Book Recommendations (Google Gemini)
- 📊 Statistics Dashboard

## Tech Stack

### Backend
- Node.js + Express
- MySQL
- JWT Authentication
- bcrypt
- Google Books API
- Google Gemini AI

### Frontend
- React
- React Router
- Axios
- Context API
- CSS3

## Local Development

### Prerequisites
- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/library-app.git
cd library-app
```

2. Backend setup
```bash
cd backend
npm install
cp example.env .env
# Edit .env with your credentials
npm run dev
```

3. Frontend setup
```bash
cd frontend
npm install
cp example.env .env
# Edit .env with API URL
npm start
```

4. Database setup
- Create MySQL database
- Run SQL from `backend/database/production-setup.sql`

### Default Login
- Admin: `admin@library.com` / `admin123`
- Reader: `jan@example.com` / `password123`

## Deployment

### Backend (Railway)
- Deploy from GitHub
- Add MySQL database
- Configure environment variables
- Root directory: `backend`

### Frontend (Vercel)
- Deploy from GitHub
- Configure environment variables
- Root directory: `frontend`

## Environment Variables

### Backend
See `backend/example.env`

### Frontend
See `frontend/example.env`

## License

MIT

## Author

Damian Molter