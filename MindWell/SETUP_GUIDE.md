# MindWell Setup Guide

This guide will help you set up the MindWell application and resolve the current errors.

## Current Issues Fixed

✅ **Google Maps API Error**: Added proper error handling and fallback UI
✅ **Location Service Errors**: Improved error messages and fallback options
✅ **Missing Environment Variables**: Added comprehensive error handling

## Required Setup

### 1. Environment Variables

Create a `.env` file in the `MindWell` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mindwell
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# Email Configuration (for OTP and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Google Maps API (for interactive maps)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Google Places API (for nearby therapists)
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Session Configuration
SESSION_SECRET=your-session-secret-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Google Maps API Setup

#### Get Google Maps API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for interactive maps)
   - **Places API** (for nearby therapists)
   - **Geocoding API** (for address conversion)

4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

#### Configure API Key Restrictions:

1. Click on your API key in the credentials page
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add `localhost:5173/*` (for development)
   - Add your production domain when ready

3. Under "API restrictions":
   - Select "Restrict key"
   - Choose only the APIs you need:
     - Maps JavaScript API
     - Places API
     - Geocoding API

#### Add API Keys to Environment:

Replace the placeholder values in your `.env` file:
- `VITE_GOOGLE_MAPS_API_KEY=your-actual-maps-api-key`
- `GOOGLE_PLACES_API_KEY=your-actual-places-api-key`

### 3. Database Setup

#### Install MongoDB:

**On macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**On Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**On Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service

### 4. Email Configuration (Optional)

For OTP and email notifications:

1. **Gmail Setup:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password:
     - Go to Google Account settings
     - Security > 2-Step Verification > App passwords
     - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

2. **Other Email Providers:**
   - Update `EMAIL_HOST`, `EMAIL_PORT` accordingly
   - Use appropriate credentials

### 5. Running the Application

#### Install Dependencies:

```bash
# Frontend dependencies
cd MindWell
npm install

# Backend dependencies
cd server
npm install
cd ..
```

#### Start the Application:

**Terminal 1 - Backend Server:**
```bash
cd MindWell/server
npm start
```

**Terminal 2 - Frontend Development Server:**
```bash
cd MindWell
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Error Resolution

### Google Maps API Errors

**Error**: `ApiProjectMapError` or `NoApiKeys`
**Solution**: 
1. Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env` file
2. Verify the API key is valid and has the correct restrictions
3. Check that Maps JavaScript API is enabled

### Location Service Errors

**Error**: `Location information is unavailable`
**Solutions**:
1. **Browser Permissions**: Allow location access when prompted
2. **HTTPS Required**: Use HTTPS or localhost (geolocation requires secure context)
3. **Network Issues**: Check internet connection
4. **Fallback**: Use the "Platform Search" option instead

### Database Connection Errors

**Error**: `MongoDB connection failed`
**Solutions**:
1. Ensure MongoDB is running: `brew services start mongodb/brew/mongodb-community`
2. Check the `MONGODB_URI` in your `.env` file
3. Verify MongoDB is accessible on the default port (27017)

## Testing the Setup

### 1. Test Google Maps:
- Navigate to any page with a map component
- The map should load without errors
- If API key is missing, you'll see a helpful error message

### 2. Test Location Services:
- Go to the Therapists page
- Click "Use My Location"
- Allow location access when prompted
- You should see nearby therapists or a helpful error message

### 3. Test Database:
- Try creating an account or logging in
- Check the server console for database connection logs

## Troubleshooting

### Common Issues:

1. **Environment variables not loading:**
   - Ensure `.env` file is in the correct directory
   - Restart the development server after adding variables
   - Check for typos in variable names

2. **CORS errors:**
   - Verify `FRONTEND_URL` matches your frontend URL
   - Check that both servers are running on correct ports

3. **API rate limits:**
   - Google APIs have usage limits
   - Monitor usage in Google Cloud Console
   - Implement caching for production use

### Getting Help:

1. Check the browser console for detailed error messages
2. Check the server console for backend errors
3. Verify all environment variables are set correctly
4. Ensure all required services (MongoDB, APIs) are running

## Production Considerations

1. **Security:**
   - Use strong, unique secrets for JWT and sessions
   - Restrict API keys to specific domains
   - Use environment-specific configurations

2. **Performance:**
   - Implement caching for API responses
   - Use CDN for static assets
   - Monitor API usage and costs

3. **Monitoring:**
   - Set up error tracking (e.g., Sentry)
   - Monitor API usage and costs
   - Set up health checks

## Next Steps

Once the basic setup is working:

1. **Customize the application** for your specific needs
2. **Add more therapists** to the platform database
3. **Configure email templates** for better user experience
4. **Set up monitoring and logging** for production use
5. **Implement additional features** like video consultations

---

**Note**: This setup guide assumes you're running the application locally. For production deployment, additional configuration will be needed for security, performance, and scalability.
