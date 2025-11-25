# Google Places API Setup Guide

## 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

## 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Google Places API (for nearby therapists)
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
```

## 3. API Usage Limits

- **Free Tier**: 1,000 requests per day
- **Paid Tier**: $0.017 per request after free tier
- **Nearby Search**: $0.032 per request
- **Place Details**: $0.017 per request

## 4. Security Best Practices

1. **Restrict API Key**:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Click on your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain: `localhost:8000/*` (for development)
   - Add your production domain: `yourdomain.com/*`

2. **API Restrictions**:
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" only

## 5. Testing the Integration

1. Start your server:
   ```bash
   npm run server
   ```

2. Test the endpoint:
   ```bash
   curl "http://localhost:8000/api/therapists/nearby?lat=40.7128&lng=-74.0060&radius=5000"
   ```

3. Test in browser:
   - Go to `http://localhost:5173/therapists`
   - Click "Nearby Therapists"
   - Click "Use My Location"
   - Allow location access

## 6. Error Handling

Common errors and solutions:

- **403 Forbidden**: API key restrictions or billing not enabled
- **400 Bad Request**: Invalid parameters (lat/lng out of range)
- **429 Too Many Requests**: Rate limit exceeded
- **Location Permission Denied**: User needs to allow location access

## 7. Production Considerations

1. **Rate Limiting**: Implement caching for repeated requests
2. **Error Fallback**: Show platform therapists if Google API fails
3. **Monitoring**: Track API usage and costs
4. **Caching**: Cache results for 1 hour to reduce API calls

## 8. Alternative APIs

If Google Places API doesn't meet your needs:

- **Foursquare Places API**: Good for local business data
- **Yelp Fusion API**: Great for reviews and ratings
- **Mapbox Geocoding API**: For address-to-coordinates conversion
- **OpenStreetMap Nominatim**: Free alternative for geocoding
