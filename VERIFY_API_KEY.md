# How to Verify Google Maps API Key Setup

## Quick Check: Browser Console

1. **Open your app** in the browser
2. **Open Developer Tools** (F12 or Right-click → Inspect)
3. **Go to Console tab**
4. **Enter pickup and dropoff locations** on the booking page
5. **Look for these messages:**

### ✅ If API Key is Working:
You should see:
```
[Distance Calculation] API Key present: true
[Distance Calculation] API Key length: 39
✅ Google Maps API success: { distanceKm: 13.0, ... }
```

### ❌ If API Key is NOT Set:
You should see:
```
[Distance Calculation] API Key present: false
[Distance Calculation] API Key length: 0
⚠️ Google Maps API key not configured, using Haversine fallback
```

### ❌ If API Key is Invalid:
You should see:
```
❌ Google Maps API returned error: { status: "REQUEST_DENIED", error_message: "..." }
```

---

## Verify in Railway

### Step 1: Check if Variable Exists

1. Go to [railway.app](https://railway.app)
2. Open your project
3. Click on your **service** (the one running your app)
4. Click on **"Variables"** tab
5. Look for `VITE_GOOGLE_MAPS_API_KEY`

### Step 2: If Variable Doesn't Exist

1. In the **Variables** tab, click **"+ New Variable"**
2. **Name**: `VITE_GOOGLE_MAPS_API_KEY`
3. **Value**: Your Google Maps API key (starts with `AIza...`)
4. Click **"Add"**
5. **Redeploy** your service (Railway should auto-redeploy, or click "Redeploy")

### Step 3: Verify Variable Name

**IMPORTANT**: The variable name must be **exactly**:
```
VITE_GOOGLE_MAPS_API_KEY
```

Common mistakes:
- ❌ `GOOGLE_MAPS_API_KEY` (missing `VITE_` prefix)
- ❌ `VITE_GOOGLE_API_KEY` (wrong name)
- ❌ `GOOGLE_MAPS_KEY` (missing parts)

### Step 4: Check Variable Value

The API key should:
- Start with `AIza` (Google API keys start with this)
- Be about 39 characters long
- Not have any spaces or extra characters

---

## Get Your Google Maps API Key

If you don't have an API key yet:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create/Select a project**
3. **Enable Distance Matrix API**:
   - Go to "APIs & Services" → "Library"
   - Search "Distance Matrix API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key (starts with `AIza...`)
5. **Restrict the Key** (Recommended):
   - Click on the key to edit
   - Under "API restrictions": Select "Restrict key" → Choose "Distance Matrix API"
   - Under "Application restrictions": You can restrict by HTTP referrer (your Railway domain)

---

## Test the API Key

After adding the key to Railway:

1. **Wait for redeploy** (usually 1-2 minutes)
2. **Open your app** in browser
3. **Open Console** (F12)
4. **Try booking a ride** with two locations
5. **Check console messages** (see "Quick Check" above)

---

## Troubleshooting

### Problem: Still showing "API Key not configured"

**Solutions:**
1. ✅ Verify variable name is exactly `VITE_GOOGLE_MAPS_API_KEY`
2. ✅ Check variable has a value (not empty)
3. ✅ Redeploy after adding variable
4. ✅ Clear browser cache and hard refresh (Ctrl+Shift+R)

### Problem: "REQUEST_DENIED" error

**Solutions:**
1. ✅ Check Distance Matrix API is enabled in Google Cloud Console
2. ✅ Verify API key restrictions allow your domain
3. ✅ Check if billing is enabled (required for Google Maps APIs)

### Problem: "OVER_QUERY_LIMIT" error

**Solutions:**
1. ✅ Check your Google Cloud billing/quota
2. ✅ Verify you haven't exceeded free tier ($200/month)
3. ✅ Wait a few minutes and try again

---

## Expected Behavior

- **With API Key**: Distance matches Google Maps (e.g., 13 km)
- **Without API Key**: Distance is straight-line (e.g., 7.1 km) - shorter than road distance

If you see 7.1 km when Google Maps shows 13 km, the API key is **not configured correctly**.
