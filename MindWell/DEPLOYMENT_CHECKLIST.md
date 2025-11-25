# 🚀 MindWell Deployment Checklist

## ✅ Pre-Deployment Checks

### Code Quality
- [x] **Linting Errors**: All linting errors fixed
- [x] **TypeScript Errors**: No type errors
- [x] **Build Success**: Frontend builds successfully (`npm run build`)
- [x] **No TODO/FIXME**: No incomplete code markers

### Security
- [x] **Environment Variables**: All sensitive data in `.env` (not committed)
- [x] **JWT Secret**: Strong secret configured
- [x] **CORS**: Properly configured for production domain
- [x] **Input Validation**: Server-side validation in place
- [x] **Password Hashing**: Using bcryptjs
- [x] **API Keys**: Not hardcoded, using environment variables

### Configuration
- [x] **Environment Files**: `.env.example` provided as template
- [x] **Database**: MongoDB connection string configured
- [x] **Port Configuration**: Configurable via environment variables
- [x] **Error Handling**: Comprehensive error handling in place

### Dependencies
- [x] **Package.json**: All dependencies listed
- [x] **Node Version**: Compatible with Node.js 18+
- [x] **Build Tools**: Vite configured correctly

## 📋 Deployment Steps

### 1. Environment Setup

Create production `.env` file with:

```env
# Server Configuration
NODE_ENV=production
PORT=8000
CLIENT_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mindwell?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_EXPIRE=7d

# Email (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Google APIs (optional)
GOOGLE_PLACES_API_KEY=your-key
VITE_GOOGLE_MAPS_API_KEY=your-key

# AI Service (if using)
AI_SERVICE_URL=https://your-ai-service.com
```

### 2. Database Setup

**Option A: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

**Option B: Self-Hosted MongoDB**
1. Install MongoDB on server
2. Configure authentication
3. Update `MONGODB_URI` in `.env`

### 3. Build Frontend

```bash
npm install
npm run build
```

This creates `dist/` folder with production-ready files.

### 4. Deploy Backend

**Using PM2 (Recommended):**
```bash
npm install -g pm2
pm2 start server/index.js --name mindwell-api
pm2 save
pm2 startup
```

**Using Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["node", "server/index.js"]
```

### 5. Deploy Frontend

**Option A: Static Hosting (Vercel/Netlify)**
1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables for Vite (prefix with `VITE_`)

**Option B: Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/mindwell/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL/HTTPS Setup

**Using Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. Environment Variables for Frontend

For Vite, prefix with `VITE_`:
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_API_URL` (if different from proxy)

## 🔍 Post-Deployment Verification

### Health Checks
- [ ] Frontend loads at production URL
- [ ] Backend API responds at `/api/health`
- [ ] Database connection works
- [ ] Authentication endpoints work
- [ ] CORS allows frontend domain

### Feature Testing
- [ ] User registration works
- [ ] User login works
- [ ] OTP email sending works
- [ ] Dashboard loads
- [ ] Wellness games work
- [ ] Academic stress feature works
- [ ] Chatbot works (if enabled)
- [ ] Therapist search works (if enabled)

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images optimized
- [ ] Bundle size acceptable

### Security
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] API rate limiting works
- [ ] Input validation works
- [ ] JWT tokens expire correctly

## 🐛 Known Issues & Notes

### Build Warnings
- **Chunk Size Warning**: Main bundle is ~978KB. Consider code-splitting for better performance.
  - Solution: Use dynamic imports for large components
  - Not critical for deployment, but good for optimization

### Optional Features
- **Google Maps**: Requires API key (optional)
- **AI Service**: Requires separate Python service (optional)
- **Email**: Required for OTP, but has fallback to console logging

### Console Logs
- Some `console.log` statements remain for debugging
- Consider removing or using a logging service in production
- Not critical, but good practice

## 📝 Production Recommendations

1. **Monitoring**: Set up error tracking (Sentry, LogRocket)
2. **Logging**: Use structured logging (Winston, Pino)
3. **Caching**: Add Redis for session management
4. **CDN**: Use CDN for static assets
5. **Backup**: Set up MongoDB backups
6. **Rate Limiting**: Already implemented, verify limits
7. **Security Headers**: Add security headers middleware
8. **Database Indexes**: Verify indexes are created

## 🚨 Rollback Plan

If issues occur:
1. Keep previous version ready
2. Database migrations should be reversible
3. Environment variables documented
4. Deployment logs saved

## 📞 Support

For deployment issues:
1. Check server logs: `pm2 logs mindwell-api`
2. Check browser console for frontend errors
3. Verify environment variables
4. Check database connectivity
5. Review API health endpoint

---

**Last Updated**: 2025-01-XX
**Status**: ✅ Ready for Deployment

