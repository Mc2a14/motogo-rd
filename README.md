# MotoGo RD - Motorcycle Delivery & Ride App

An Uber-like app for the Dominican Republic using motorcycle riders for errands, food delivery, mototaxi, and courier services.

## 🚀 Features

- **Multiple Service Types**: Ride, Food Delivery, Courier/Documents, Errands
- **Real-time Order Tracking**: Live map updates with driver locations
- **Bilingual Support**: English & Spanish (Español)
- **Driver Dashboard**: Accept orders, track trips, update status
- **Customer App**: Book services, track orders, view history
- **Dark/Light Theme**: Automatic theme switching

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Leaflet Maps
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Email/Password with Passport.js (Session-based)
- **Build**: Vite + esbuild

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database
- Environment variables (see below)

## 🔧 Environment Variables

Create a `.env` file or set these in your deployment platform:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
SESSION_SECRET=your-secret-key-here  # Required: Generate a random secret for session encryption

# Server
PORT=5000  # Default: 5000
NODE_ENV=production
```

## 🚀 Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Run database migrations**:
   ```bash
   npm run db:push
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## 📦 Deployment

### Railway Deployment

1. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/moto-errand.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add PostgreSQL database service
   - Set environment variables:
     - `DATABASE_URL` (auto-set from PostgreSQL service)
     - `SESSION_SECRET` (generate a random string)
     - `NODE_ENV=production`
   - Railway will automatically deploy!

### Manual Database Setup

Run migrations on Railway:
```bash
railway run npm run db:push
```

Or connect to your database and run:
```bash
npm run db:push
```

## 🗂️ Project Structure

```
Moto-Errand/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database layer
│   └── db.ts            # DB connection
├── shared/              # Shared code
│   ├── schema.ts        # Database schema
│   └── routes.ts        # API definitions
└── script/              # Build scripts
```

## 🔐 Authentication

The app uses email/password authentication with session-based auth:

- **Register**: Users can create accounts with email and password
- **Login**: Secure login with password hashing (bcrypt)
- **Sessions**: Stored in PostgreSQL for persistence
- **Roles**: Customer, Driver, or Admin (set during registration)

To create a driver account, register with `role: "driver"` or update the user in the database.

## 📱 User Roles

- **Customer**: Can create orders, track trips, view history
- **Driver**: Can accept orders, update location, manage trips
- **Admin**: (Future) Full system access

## 🗺️ Default Location

Default map center: **Santo Domingo, Dominican Republic** (18.4861, -69.9312)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made for the Dominican Republic** 🇩🇴



