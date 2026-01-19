# Migration from Replit to Railway - Complete ✅

This document summarizes all changes made to remove Replit dependencies and make the app fully compatible with Railway.

## 🔄 Changes Made

### 1. **New Authentication System**
- ✅ Replaced Replit Auth (OAuth/OIDC) with email/password authentication
- ✅ Created new auth system in `server/auth/` (replacing `server/replit_integrations/auth/`)
- ✅ Uses Passport.js with Local Strategy for email/password login
- ✅ Password hashing with bcryptjs
- ✅ Session-based authentication stored in PostgreSQL

### 2. **New Auth Endpoints**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### 3. **Frontend Updates**
- ✅ Created new Login page (`/login`) with register/login forms
- ✅ Updated Profile page to redirect to `/login` instead of Replit Auth
- ✅ Updated auth hooks to use new endpoints
- ✅ All user references now use `user.id` instead of `user.claims.sub`

### 4. **Dependencies Removed**
- ✅ Removed `openid-client` (ESM-only package)
- ✅ Removed `@replit/vite-plugin-cartographer`
- ✅ Removed `@replit/vite-plugin-dev-banner`
- ✅ Removed `@replit/vite-plugin-runtime-error-modal`

### 5. **Dependencies Added**
- ✅ Added `bcryptjs` for password hashing
- ✅ Added `@types/bcryptjs` for TypeScript support

### 6. **Database Schema Update**
- ✅ Added `password` field to `users` table (varchar, nullable for backward compatibility)

### 7. **Build Configuration**
- ✅ Removed Replit plugins from `vite.config.ts`
- ✅ Updated `script/build.ts` to include `bcryptjs` in allowlist
- ✅ Removed `openid-client` references from build script

### 8. **Documentation**
- ✅ Updated README.md with new authentication info
- ✅ Removed Replit-specific instructions

## 🚀 What You Need to Do

### 1. **Database Migration**
The users table now has a `password` field. Run the database migration:

```bash
npm run db:push
```

This will add the `password` column to your existing `users` table.

### 2. **Environment Variables on Railway**
Make sure these are set in your Railway project:

- ✅ `DATABASE_URL` - Already set (from Postgres service)
- ✅ `SESSION_SECRET` - Already set
- ✅ `NODE_ENV=production` - Already set
- ✅ `PORT` - Railway sets this automatically

**You can remove these (if they exist):**
- ❌ `REPL_ID` - No longer needed
- ❌ `REPL_APP_SECRET` - No longer needed
- ❌ `ISSUER_URL` - No longer needed

### 3. **Create Initial Users**
After deployment, you'll need to create user accounts:

1. **Via the App**: Go to `/login` and click "Sign up" to create a customer account
2. **Create Driver Account**: Register with email/password, then update the user in the database:
   ```sql
   UPDATE users SET role = 'driver' WHERE email = 'driver@example.com';
   ```

Or use the registration endpoint directly:
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "securepassword",
    "firstName": "Driver",
    "lastName": "Name",
    "role": "driver"
  }'
```

### 4. **Deploy to Railway**
1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Remove Replit dependencies, add email/password auth"
   git push github main
   ```

2. Railway will automatically:
   - Install new dependencies (bcryptjs)
   - Remove old dependencies (openid-client, Replit plugins)
   - Build and deploy the app

### 5. **Test the App**
1. Visit your Railway app URL
2. Go to `/login` to create an account
3. Login and test creating orders
4. Create a driver account and test the driver dashboard

## ✅ Verification Checklist

- [ ] Database migration completed (`npm run db:push`)
- [ ] Removed Replit environment variables from Railway
- [ ] App builds successfully on Railway
- [ ] Can register new account at `/login`
- [ ] Can login with email/password
- [ ] Can create orders as customer
- [ ] Can access driver dashboard as driver
- [ ] Sessions persist after page refresh

## 🔒 Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- Sessions are stored securely in PostgreSQL
- Cookies are httpOnly and secure in production
- No sensitive data in client-side code

## 📝 Notes

- The old `server/replit_integrations/` folder is still in the codebase but no longer used
- You can safely delete it after verifying everything works
- Existing users in the database will need to set passwords (or you can create new accounts)

## 🆘 Troubleshooting

**Issue**: "Cannot find module 'bcryptjs'"
- **Solution**: Make sure `npm install` ran successfully. Check Railway build logs.

**Issue**: "Password field doesn't exist"
- **Solution**: Run `npm run db:push` to update the database schema.

**Issue**: "Cannot login after registration"
- **Solution**: Check that sessions table exists in PostgreSQL. It should be created automatically.

**Issue**: "401 Unauthorized on all API calls"
- **Solution**: Make sure you're logged in. Visit `/login` and create/login to an account first.

---

**The app is now fully independent of Replit and ready for Railway! 🎉**

