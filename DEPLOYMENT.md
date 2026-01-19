# Deployment Guide - MotoGo RD

## Quick Setup: GitHub + Railway

### Step 1: Connect to GitHub

1. **Create a GitHub repository** (if you haven't already):
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., `moto-errand` or `motogo-rd`)
   - Don't initialize with README (we already have files)

2. **Add GitHub remote and push**:
   ```bash
   cd /Users/nelsonbarreto/Downloads/Moto-Errand
   
   # Add GitHub as remote (replace with your repo URL)
   git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # Stage all changes
   git add .
   
   # Commit current changes
   git commit -m "Initial commit: MotoGo RD app with driver features"
   
   # Push to GitHub
   git push -u github main
   ```

### Step 2: Deploy to Railway

1. **Sign up/Login to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (easiest way)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub
   - Select your `moto-errand` repository

3. **Add PostgreSQL Database**:
   - In your Railway project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will create a database and set `DATABASE_URL` automatically

4. **Configure Environment Variables**:
   - Go to your service → "Variables" tab
   - Add these variables:
   
   ```
   SESSION_SECRET=<generate-random-string-here>
   NODE_ENV=production
   PORT=5000
   ```
   
   To generate `SESSION_SECRET`, run:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**:
   - Railway will automatically detect the build settings
   - It will run `npm run build` then `npm start`
   - Wait for deployment to complete (usually 2-3 minutes)

6. **Run Database Migrations**:
   - After first deployment, go to your service
   - Click on "Deployments" → Latest deployment
   - Open "View Logs" → Click "..." → "Open Shell"
   - Run:
     ```bash
     npm run db:push
     ```

7. **Get Your URL**:
   - Railway will provide a `.railway.app` URL
   - You can add a custom domain later in "Settings" → "Networking"

### Step 3: Verify Deployment

1. Visit your Railway URL (e.g., `https://yourapp.railway.app`)
2. Test the app:
   - Try logging in (Replit Auth should still work)
   - Create a test order
   - Check database is working

## Important Notes

### Environment Variables on Railway

Railway automatically provides:
- `DATABASE_URL` - From PostgreSQL service
- `PORT` - Automatically set (default: 5000)
- `RAILWAY_ENVIRONMENT` - Set to "production"

You need to set manually:
- `SESSION_SECRET` - Required for authentication sessions
- `NODE_ENV=production` - Ensures production mode

### Database Migrations

After deploying, always run migrations:
```bash
railway run npm run db:push
```

Or use Railway CLI:
```bash
# Install Railway CLI (if not installed)
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npm run db:push
```

### Updating Your App

Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push github main
```

Railway will automatically:
1. Detect the push
2. Build your app
3. Deploy the new version
4. Restart services

### Troubleshooting

**Build Fails**:
- Check Railway logs: Service → "Deployments" → "View Logs"
- Ensure `package.json` has correct `build` and `start` scripts
- Verify all dependencies are in `dependencies` (not `devDependencies`)

**Database Connection Fails**:
- Verify `DATABASE_URL` is set in Railway variables
- Check PostgreSQL service is running
- Ensure migrations ran: `railway run npm run db:push`

**App Doesn't Start**:
- Check PORT is set correctly (Railway auto-sets this)
- Verify `NODE_ENV=production`
- Check server logs for errors

### Cost Estimation (Railway)

- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month (after free tier)
  - 512MB RAM
  - 1GB storage
  - Unlimited bandwidth
- **PostgreSQL**: Included in plans (up to certain limits)

### Alternative: Keep on Replit

If you prefer to stay on Replit:
- No GitHub needed (unless for backup)
- No Railway needed
- Already configured to work on Replit
- Just keep using Replit's deployment

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL certificates (Railway handles automatically)
3. ✅ Set up monitoring/alerts
4. ✅ Configure backups for database
5. ✅ Add error tracking (e.g., Sentry)

---

**Questions?** Check Railway docs: [docs.railway.app](https://docs.railway.app)



