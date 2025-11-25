# MindWell Chatbot Integration Setup Guide

This guide will help you set up the integrated AI chatbot in your MindWell platform.

## 🚀 Quick Start

### 1. Environment Setup

First, create your environment files:

```bash
# Copy environment templates
cp env.example .env
cp mindcareAi_incomplete/env.example mindcareAi_incomplete/.env
```

### 2. Configure Environment Variables

#### Main Application (.env in root):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mindwell

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email (for OTP and notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password

# AI Service
AI_SERVICE_URL=http://localhost:8001
```

#### AI Service (mindcareAi_incomplete/.env):
```env
# Groq API (for AI responses)
GROQ_API_KEY=your-groq-api-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```

### 3. Get Required API Keys

#### Groq API Key (Required for AI responses):
1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account
3. Create an API key
4. Add it to `mindcareAi_incomplete/.env`

#### Gmail App Password (Required for email):
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate an app password for "Mail"
3. Use this password (not your regular Gmail password) in both `.env` files

### 4. Install Dependencies

#### Node.js Dependencies:
```bash
npm install
```

#### Python AI Service Dependencies:
```bash
cd mindcareAi_incomplete
python -m venv venv

# On Windows:
venv\Scripts\activate
pip install -r requirements.txt

# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Start the Services

#### Option 1: Start All Services Together
```bash
npm run dev:full
```

#### Option 2: Start Services Separately

Terminal 1 - Node.js Backend:
```bash
npm run server
```

Terminal 2 - React Frontend:
```bash
npm run client
```

Terminal 3 - Python AI Service:
```bash
npm run ai-service
```

## 🔧 Service Configuration

### Ports Used:
- **Frontend (React)**: http://localhost:5173
- **Backend (Node.js)**: http://localhost:8000
- **AI Service (Python)**: http://localhost:8001
- **MongoDB**: mongodb://localhost:27017

### API Endpoints:

#### Chatbot API (Node.js Backend):
- `POST /api/chatbot/session/start` - Start new chat session
- `POST /api/chatbot/session/respond` - Send message to chatbot
- `GET /api/chatbot/sessions` - Get user's chat history
- `GET /api/chatbot/health` - Check AI service health

#### AI Service (Python):
- `POST /session/start` - Start session (internal)
- `POST /session/respond` - Process message (internal)
- `GET /user/{user_id}/history` - Get user history (internal)
- `GET /health` - Health check

## 🎯 Features Implemented

### ✅ Backend Integration
- [x] Node.js API routes for chatbot communication
- [x] Python AI service integration
- [x] Session management
- [x] Error handling and fallbacks
- [x] Health check endpoints

### ✅ Frontend Components
- [x] Floating chat button
- [x] Chatbot modal interface
- [x] Dedicated chat page
- [x] Message history display
- [x] Real-time messaging UI
- [x] Risk level indicators
- [x] Responsive design

### ✅ AI Capabilities
- [x] LangGraph-based conversation flow
- [x] Emotion detection and analysis
- [x] Risk assessment and crisis intervention
- [x] Multi-language support
- [x] Session summarization
- [x] Memory management

## 🧪 Testing the Integration

### 1. Test AI Service Health:
```bash
curl http://localhost:8001/health
```

### 2. Test Backend Health:
```bash
curl http://localhost:8000/api/health
```

### 3. Test Chatbot API:
```bash
# Start a session (requires authentication)
curl -X POST http://localhost:8000/api/chatbot/session/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "consentEmail": true}'
```

### 4. Test Frontend:
1. Open http://localhost:5173
2. Login to your account
3. Click the floating chat button
4. Start a conversation with the AI

## 🔍 Troubleshooting

### Common Issues:

#### 1. AI Service Won't Start
- Check if Python virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8001 is available
- Verify `.env` file exists and has correct API keys

#### 2. Backend Can't Connect to AI Service
- Ensure AI service is running on port 8001
- Check `AI_SERVICE_URL` in `.env` file
- Verify network connectivity

#### 3. Frontend Chat Not Working
- Check if user is authenticated
- Verify backend is running on port 8000
- Check browser console for errors
- Ensure CORS is properly configured

#### 4. Database Connection Issues
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Ensure database exists

### Debug Commands:

```bash
# Check if ports are in use
lsof -i :8000  # Backend
lsof -i :8001  # AI Service
lsof -i :5173  # Frontend

# Check Python dependencies
cd mindcareAi_incomplete
source venv/bin/activate
pip list

# Check Node.js dependencies
npm list
```

## 📱 Usage

### For Users:
1. **Access Chat**: Click the floating chat button on any page
2. **Start Conversation**: Click "Start Conversation" to begin
3. **Send Messages**: Type and press Enter or click Send
4. **View History**: Go to `/chat` page to see past conversations
5. **End Session**: Type "end", "finish", or "stop" to end the session

### For Developers:
- Chat sessions are stored in MongoDB
- AI responses are processed by the Python service
- Risk levels are assessed and displayed
- Sessions can be resumed and managed

## 🚀 Next Steps

### Planned Enhancements:
- [ ] WebSocket support for real-time messaging
- [ ] Voice input/output capabilities
- [ ] Advanced emotion visualization
- [ ] Integration with mood tracking
- [ ] Push notifications
- [ ] Mobile app support

### Production Deployment:
- Use MongoDB Atlas for database
- Deploy AI service to cloud (AWS/GCP/Azure)
- Set up proper monitoring and logging
- Configure SSL certificates
- Set up CI/CD pipeline

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console logs for errors
3. Verify all environment variables are set correctly
4. Ensure all services are running and accessible

---

**Happy coding! 🎉**
