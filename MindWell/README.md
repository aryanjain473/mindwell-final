# MindWell - Mental Health Platform

A comprehensive mental health platform built with React, Node.js, Express, and MongoDB. Features modern UI design, authentication system, and backend scaffolding ready for advanced integrations.

## 🌟 Features

### Frontend
- **Modern UI**: Clean, accessible design with soft pastel color palette
- **Responsive Design**: Mobile-first approach with perfect tablet and desktop layouts  
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Multi-page Application**: Landing, Features, About, Contact, Login, and Signup pages
- **Form Validation**: Client-side validation with user-friendly error handling

### Backend
- **RESTful API**: Well-structured endpoints for authentication and contact forms
- **JWT Authentication**: Secure user authentication with token-based system
- **MongoDB Integration**: Flexible data storage with Mongoose ODM
- **Input Validation**: Server-side validation and sanitization
- **Error Handling**: Comprehensive error handling and logging

### Key Pages & Components
- **Landing Page**: Hero section, features showcase, testimonials, and statistics
- **Features Page**: Detailed feature cards with benefits and animations  
- **About Page**: Mission, vision, team profiles, and company values
- **Contact Page**: Contact form with backend integration and FAQ section
- **Authentication**: Login and signup with form validation and security features

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Axios for API calls

### Backend  
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled
- Input validation middleware

## 📦 Installation & Setup

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
- Install MongoDB locally or use MongoDB Atlas
- Update MONGODB_URI in .env file

4. **Google Maps Setup (Optional)**
```bash
# Get a Google Maps API key from Google Cloud Console
# 1. Go to https://console.cloud.google.com/
# 2. Create a new project or select existing one
# 3. Enable Maps JavaScript API
# 4. Create credentials (API Key)
# 5. Add the API key to your .env file as VITE_GOOGLE_MAPS_API_KEY
```

5. **Run Development Servers**
```bash
# Runs both frontend and backend concurrently
npm run dev

# Or run separately:
npm run client  # Frontend only
npm run server  # Backend only
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: development/production
- `PORT`: Backend server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLIENT_URL`: Frontend URL for CORS
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key for interactive maps

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

#### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact/messages` - Get messages (admin)

## 🎨 Design System

### Color Palette
- **Primary**: Mint green shades (#14b8a6 to #0d9488)
- **Secondary**: Lavender shades (#a855f7 to #7c3aed)  
- **Accent**: Warm orange (#f97316)
- **Neutral**: Comprehensive gray scale

### Typography
- **Font**: Inter system font stack
- **Headings**: Bold weights with proper hierarchy
- **Body**: 150% line height for readability

### Components
- Consistent 8px spacing system
- Rounded corners and subtle shadows
- Hover states and micro-interactions
- Accessible color contrasts

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting middleware
- CORS configuration
- Environment variable protection

## 🚀 Deployment Ready

### Production Build
```bash
npm run build
```

### Docker Support (Future)
The application structure supports containerization for easy deployment.

### Environment Considerations
- Environment-specific configuration
- Production-ready error handling
- Database connection resilience
- Security best practices

## 📱 Responsive Design

- **Mobile**: < 768px - Optimized touch interactions
- **Tablet**: 768px - 1024px - Balanced layout
- **Desktop**: > 1024px - Full feature layout

## 🎯 Future Enhancements

### Planned Features
- AI chatbot integration
- Real-time emotion detection
- Location-based therapist discovery
- Gamification system
- Advanced analytics dashboard
- Push notifications
- Social features

### Integration Points
- OpenAI API for AI responses
- Stripe for payments
- Twilio for SMS/calling
- Cloudinary for file uploads
- Email service integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from modern mental health platforms
- Icons by Lucide React
- Stock photos from Pexels
- Color palette inspired by wellness and tranquility themes

---

Built with ❤️ for mental wellness and accessibility.