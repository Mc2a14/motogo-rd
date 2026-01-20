# Google Maps API Setup

To get accurate road distance calculations, you need to set up a Google Maps API key.

## Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Distance Matrix API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Distance Matrix API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
5. (Recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Distance Matrix API"
   - Under "Application restrictions", you can restrict by HTTP referrer for web apps

## Set the API Key:

### For Local Development:
Create a `.env` file in the project root:
```
VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
```

### For Railway Deployment:
1. Go to your Railway project
2. Click on "Variables" tab
3. Add a new variable:
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key
4. Redeploy your service

## Pricing:
- Google Maps Distance Matrix API has a free tier: $200 credit per month
- After that, it's $5 per 1,000 requests
- For a small app, the free tier should be sufficient

## Fallback:
If the API key is not set, the app will automatically fall back to Haversine formula (straight-line distance) for calculations.
