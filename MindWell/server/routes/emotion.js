import express from "express";
import multer from "multer";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { authMiddleware } from "../middleware/auth.js";
import Activity from "../models/Activity.js";
import EmotionHistory from "../models/EmotionHistory.js";
import fs from "fs";

const router = express.Router();
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "emotion-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Emotion detection endpoint
router.post("/detect-emotion", authMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const scriptPath = path.join(__dirname, "../ai/emotion_detector.py");
  const imagePath = req.file.path;

  try {
    // Check if Python script exists
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ 
        error: "Emotion detection script not found. Please contact support." 
      });
    }

    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ 
        error: "Uploaded image file not found." 
      });
    }

    // Execute Python script with timeout
    const { stdout, stderr } = await Promise.race([
      execAsync(`python3 "${scriptPath}" "${imagePath}"`),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Emotion detection timeout (30s)")), 30000)
      )
    ]);

    // Log stderr for debugging (DeepFace may output warnings here)
    if (stderr && !stderr.includes("WARNING") && !stderr.includes("INFO")) {
      console.error("Python script stderr:", stderr);
    }

    // Parse output
    const output = stdout.trim();
    if (!output) {
      throw new Error("No output from emotion detection script");
    }

    try {
      const data = JSON.parse(output);
      
      if (data.error) {
        // Clean up uploaded file before returning error
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting uploaded file:", err);
        });
        return res.status(400).json({ 
          error: data.error,
          userFriendly: true 
        });
      }

      if (!data.emotion || data.confidence === undefined) {
        throw new Error("Invalid response from emotion detection");
      }

      // Clean up uploaded file after successful processing
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });

      // Return emotion and confidence
      res.json({
        success: true,
        emotion: data.emotion,
        confidence: data.confidence,
      });
    } catch (parseError) {
      console.error("Error parsing Python output:", parseError);
      console.error("Raw output:", output);
      console.error("Stderr:", stderr);
      
      // Clean up uploaded file
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
      
      res.status(500).json({ 
        error: "Failed to process emotion detection result. Please try again with a clear face photo.",
        details: output.substring(0, 200) // First 200 chars of output
      });
    }
  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
    }

    console.error("Error executing emotion detection:", error);
    
    let errorMessage = "Failed to detect emotion";
    if (error.message.includes("timeout")) {
      errorMessage = "Emotion detection took too long. Please try again with a smaller image.";
    } else if (error.message.includes("ENOENT") || error.message.includes("not found")) {
      errorMessage = "Emotion detection service unavailable. Please contact support.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Emotion detection with automatic mood logging
router.post("/detect-and-log", authMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const userId = req.user.userId;
  const scriptPath = path.join(__dirname, "../ai/emotion_detector.py");
  const imagePath = req.file.path;

  try {
    // Check if Python script exists
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ 
        error: "Emotion detection script not found. Please contact support." 
      });
    }

    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ 
        error: "Uploaded image file not found." 
      });
    }

    // Execute Python script with timeout
    const { stdout, stderr } = await Promise.race([
      execAsync(`python3 "${scriptPath}" "${imagePath}"`),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Emotion detection timeout (30s)")), 30000)
      )
    ]);

    // Log stderr for debugging (DeepFace may output warnings here)
    if (stderr && !stderr.includes("WARNING") && !stderr.includes("INFO")) {
      console.error("Python script stderr:", stderr);
    }

    // Parse output
    const output = stdout.trim();
    if (!output) {
      throw new Error("No output from emotion detection script");
    }

    try {
      const data = JSON.parse(output);
      
      if (data.error) {
        // Clean up uploaded file before returning error
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting uploaded file:", err);
        });
        return res.status(400).json({ 
          error: data.error,
          userFriendly: true 
        });
      }

      if (!data.emotion || data.confidence === undefined) {
        throw new Error("Invalid response from emotion detection");
      }

      // Map emotion to mood scale (1-10)
      // Emotions: angry, disgust, fear, happy, sad, surprise, neutral
      const emotionToMood = {
        "angry": 3,
        "disgust": 2,
        "fear": 3,
        "happy": 8,
        "sad": 4,
        "surprise": 7,
        "neutral": 5,
      };

      const mood = emotionToMood[data.emotion.toLowerCase()] || 5;

      // Create activity log with facial AI metadata
      const activity = new Activity({
        userId,
        type: "mood",
        mood: mood,
        notes: `Facial emotion detected: ${data.emotion}`,
        activities: ["Mood Check-in"],
        tags: ["facial_AI"],
        metadata: {
          source: "facial_AI",
          detected_emotion: data.emotion,
          confidence: data.confidence,
        },
      });

      await activity.save();

      // Clean up uploaded file after successful processing
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });

      res.json({
        success: true,
        emotion: data.emotion,
        confidence: data.confidence,
        mood: mood,
        activityId: activity._id,
        message: "Emotion detected and mood logged successfully",
      });
    } catch (parseError) {
      console.error("Error parsing Python output:", parseError);
      console.error("Raw output:", output);
      console.error("Stderr:", stderr);
      
      // Clean up uploaded file
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
      
      res.status(500).json({ 
        error: "Failed to process emotion detection result. Please try again with a clear face photo.",
        details: output.substring(0, 200) // First 200 chars of output
      });
    }
  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
    }

    console.error("Error executing emotion detection:", error);
    
    let errorMessage = "Failed to detect emotion";
    if (error.message.includes("timeout")) {
      errorMessage = "Emotion detection took too long. Please try again with a smaller image.";
    } else if (error.message.includes("ENOENT") || error.message.includes("not found")) {
      errorMessage = "Emotion detection service unavailable. Please contact support.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ===========================================
// EMOTION HISTORY & RECOMMENDATIONS
// ===========================================

/**
 * Save emotion history from chatbot interaction
 * POST /api/emotion/save-history
 */
router.post("/save-history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      sessionId,
      textEmotion,
      facialEmotion,
      userMessage,
      chatbotResponse,
      recommendations
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required"
      });
    }

    // Determine combined emotion
    let combinedEmotion = {
      primaryEmotion: "neutral",
      confidence: 0.5,
      mood: 5,
      riskLevel: "low"
    };

    // Prioritize facial emotion if available (more immediate)
    if (facialEmotion && facialEmotion.emotion) {
      combinedEmotion.primaryEmotion = facialEmotion.emotion.toLowerCase();
      combinedEmotion.confidence = facialEmotion.confidence || 0.5;
      combinedEmotion.mood = facialEmotion.mood || 5;
    } else if (textEmotion && textEmotion.emotion) {
      combinedEmotion.primaryEmotion = textEmotion.emotion.toLowerCase();
      combinedEmotion.confidence = textEmotion.confidence || 0.5;
      combinedEmotion.riskLevel = textEmotion.risk || "low";
      
      // Map text emotion to mood
      const emotionToMood = {
        "sadness": 3, "sad": 3,
        "joy": 8, "happy": 8,
        "anger": 2, "angry": 2,
        "fear": 3, "anxiety": 3,
        "neutral": 5
      };
      combinedEmotion.mood = emotionToMood[combinedEmotion.primaryEmotion] || 5;
    }

    // Combine risk levels
    if (textEmotion && textEmotion.risk) {
      const riskLevels = { "low": 1, "medium": 2, "high": 3 };
      const textRisk = riskLevels[textEmotion.risk] || 1;
      const currentRisk = riskLevels[combinedEmotion.riskLevel] || 1;
      if (textRisk > currentRisk) {
        combinedEmotion.riskLevel = textEmotion.risk;
      }
    }

    // Create emotion history record
    const emotionHistory = new EmotionHistory({
      userId,
      sessionId,
      textEmotion: textEmotion ? {
        emotion: textEmotion.emotion,
        polarity: textEmotion.polarity,
        risk: textEmotion.risk,
        confidence: textEmotion.confidence,
        source: "text_ml"
      } : null,
      facialEmotion: facialEmotion ? {
        emotion: facialEmotion.emotion,
        confidence: facialEmotion.confidence,
        mood: facialEmotion.mood
      } : null,
      combinedEmotion,
      recommendations: recommendations || [],
      context: {
        userMessage: userMessage || "",
        chatbotResponse: chatbotResponse || "",
        timestamp: new Date()
      }
    });

    await emotionHistory.save();

    res.json({
      success: true,
      emotionHistoryId: emotionHistory._id,
      combinedEmotion,
      message: "Emotion history saved successfully"
    });

  } catch (error) {
    console.error("Error saving emotion history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save emotion history",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get user's emotion history
 * GET /api/emotion/history
 */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId, limit = 10 } = req.query;

    let query = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const history = await EmotionHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('textEmotion facialEmotion combinedEmotion recommendations context createdAt')
      .lean();

    res.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error("Error fetching emotion history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch emotion history",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get user's emotion patterns
 * GET /api/emotion/patterns
 */
router.get("/patterns", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    const patterns = await EmotionHistory.getUserEmotionPatterns(userId, parseInt(days));
    const trends = await EmotionHistory.getEmotionTrends(userId, parseInt(days));

    res.json({
      success: true,
      patterns,
      trends,
      message: "Emotion patterns retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching emotion patterns:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch emotion patterns",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Generate recommendations from a single emotion
 * POST /api/emotion/generate-recommendations
 */
router.post("/generate-recommendations", authMiddleware, async (req, res) => {
  try {
    const { emotion, mood } = req.body;

    if (!emotion) {
      return res.status(400).json({
        success: false,
        error: "Emotion is required"
      });
    }

    const emotionLower = emotion.toLowerCase();
    const recommendations = [];

    // Comprehensive emotion resources mapping
    const emotionResources = {
      "sad": {
        activities: ["Guided meditation", "Light walk", "Journaling", "Deep breathing"],
        videos: [
          {
            title: "10 Minute Meditation for Depression & Anxiety",
            url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
            description: "Guided meditation to help ease feelings of sadness"
          },
          {
            title: "Calming Mood Lighting - Soft Warm Lights",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            description: "Relaxing mood lighting video to create a peaceful atmosphere"
          },
          {
            title: "Mood Boosting Music - Uplifting & Happy",
            url: "https://www.youtube.com/watch?v=4zLfCnGVeL4",
            description: "Calming music to help improve your mood"
          }
        ],
        blogs: [
          {
            title: "Coping with Depression: 10 Tips",
            url: "https://www.healthline.com/health/depression/how-to-fight-depression",
            description: "Practical strategies for managing depression"
          }
        ]
      },
      "happy": {
        activities: ["Gratitude practice", "Share positivity", "Maintain momentum", "Social connection"],
        videos: [
          {
            title: "Warm Mood Lighting - Cozy Atmosphere",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            description: "Beautiful warm lighting to maintain your positive mood"
          },
          {
            title: "Uplifting Music - Positive Energy",
            url: "https://www.youtube.com/watch?v=4zLfCnGVeL4",
            description: "Upbeat music to maintain your positive energy"
          }
        ],
        blogs: [
          {
            title: "How to Maintain Positive Mental Health",
            url: "https://www.healthline.com/health/mental-health/how-to-maintain-positive-mental-health",
            description: "Tips for sustaining positive mental wellbeing"
          }
        ]
      },
      "angry": {
        activities: ["Physical exercise", "Breathing exercises", "Stress-relief techniques", "Mindful walk"],
        videos: [
          {
            title: "Anger Management Meditation",
            url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
            description: "Guided meditation to help manage anger"
          },
          {
            title: "Calming Breathing Exercises",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            description: "Breathing techniques to help calm your mind"
          }
        ],
        blogs: [
          {
            title: "Anger Management Tips",
            url: "https://www.healthline.com/health/mental-health/anger-management",
            description: "Practical strategies for managing anger"
          }
        ]
      },
      "fear": {
        activities: ["Grounding exercises", "Deep breathing", "Progressive muscle relaxation", "Mindfulness"],
        videos: [
          {
            title: "Soothing Mood Lighting for Anxiety",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            description: "Calming mood lighting to help reduce anxiety"
          },
          {
            title: "Guided Meditation for Anxiety",
            url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
            description: "Meditation practice to help ease anxiety"
          }
        ],
        blogs: [
          {
            title: "Coping with Anxiety and Fear",
            url: "https://www.healthline.com/health/anxiety/how-to-cope-with-anxiety",
            description: "Practical tips for managing anxiety"
          }
        ]
      },
      "surprise": {
        activities: ["Channel excitement", "Try something new", "Light exercise", "Journaling"],
        videos: [
          {
            title: "Peaceful Mood Lighting - Ambient Atmosphere",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            description: "Gentle mood lighting for a balanced environment"
          }
        ],
        blogs: [
          {
            title: "Managing Emotional Responses",
            url: "https://www.healthline.com/health/mental-health",
            description: "Understanding and managing emotional reactions"
          }
        ]
      },
      "disgust": {
        activities: ["Mindfulness exercises", "Gentle movement", "Self-compassion", "Soothing sounds"],
        videos: [
          {
            title: "Calming Meditation",
            url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
            description: "Meditation to help process difficult emotions"
          }
        ],
        blogs: [
          {
            title: "Self-Compassion and Emotional Wellbeing",
            url: "https://www.healthline.com/health/mental-health",
            description: "Practices for emotional self-care"
          }
        ]
      },
      "neutral": {
        activities: ["Mindfulness meditation", "Gentle walk", "Gratitude practice", "Calming music"],
        videos: [
          {
            title: "Peaceful Mood Lighting - Ambient Atmosphere",
            url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            description: "Gentle mood lighting for a balanced, peaceful environment"
          },
          {
            title: "10 Minute Mindfulness Meditation",
            url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
            description: "Practice mindfulness for emotional balance"
          },
          {
            title: "Calming Music for Relaxation",
            url: "https://www.youtube.com/watch?v=4zLfCnGVeL4",
            description: "Peaceful music for relaxation and balance"
          }
        ],
        blogs: [
          {
            title: "Mindfulness and Mental Health",
            url: "https://www.healthline.com/health/mindfulness",
            description: "Learn about the benefits of mindfulness practice"
          }
        ]
      }
    };

    const resources = emotionResources[emotionLower] || emotionResources["neutral"];

    // Add activities (2-3 based on mood)
    const activityCount = mood && mood < 5 ? 3 : 2;
    resources.activities.slice(0, activityCount).forEach((activity) => {
      recommendations.push({
        type: "activity",
        title: activity,
        description: `Try ${activity.toLowerCase()} to support your emotional wellbeing`,
        priority: 3
      });
    });

    // Add videos (2-3 based on mood)
    const videoCount = mood && mood < 5 ? 3 : 2;
    resources.videos.slice(0, videoCount).forEach((video) => {
      recommendations.push({
        type: "video",
        title: video.title,
        description: video.description,
        url: video.url,
        priority: 4
      });
    });

    // Add blogs (1-2 based on mood)
    const blogCount = mood && mood < 5 ? 2 : 1;
    resources.blogs.slice(0, blogCount).forEach((blog) => {
      recommendations.push({
        type: "blog",
        title: blog.title,
        description: blog.description,
        url: blog.url,
        priority: 3
      });
    });

    res.json({
      success: true,
      recommendations: recommendations,
      emotion: emotionLower,
      mood: mood || 5,
      message: "Recommendations generated successfully"
    });

  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate recommendations",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get personalized recommendations based on emotion history
 * GET /api/emotion/recommendations
 */
router.get("/recommendations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 5 } = req.query;

    // Get recent emotions
    const recentEmotions = await EmotionHistory.getRecentEmotions(userId, 5);
    
    // Get emotion patterns
    const patterns = await EmotionHistory.getUserEmotionPatterns(userId, 7);

    // Determine dominant emotion pattern
    let dominantEmotion = "neutral";
    let avgMood = 5;
    
    if (patterns && patterns.length > 0) {
      dominantEmotion = patterns[0]._id || "neutral";
      avgMood = patterns[0].avgMood || 5;
    } else if (recentEmotions && recentEmotions.length > 0) {
      dominantEmotion = recentEmotions[0].combinedEmotion?.primaryEmotion || "neutral";
      avgMood = recentEmotions[0].combinedEmotion?.mood || 5;
    }

    // Get latest recommendations if available
    let recommendations = [];
    if (recentEmotions && recentEmotions.length > 0) {
      const latest = recentEmotions[0];
      if (latest.recommendations && latest.recommendations.length > 0) {
        recommendations = latest.recommendations;
      }
    }

    // If no recommendations, generate based on dominant emotion
    // Only generate if we have emotion data (similar to Python backend)
    if (recommendations.length === 0 && dominantEmotion && dominantEmotion !== "neutral") {
      const emotionResources = {
        "sad": {
          activities: ["Guided meditation", "Light walk", "Journaling"],
          videos: [
            {
              title: "10 Minute Meditation for Depression & Anxiety",
              url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
              description: "Guided meditation to help ease feelings of sadness"
            }
          ],
          blogs: [
            {
              title: "Coping with Depression: 10 Tips",
              url: "https://www.healthline.com/health/depression/how-to-fight-depression",
              description: "Practical strategies for managing depression"
            }
          ]
        },
        "happy": {
          activities: ["Gratitude practice", "Share positivity"],
          videos: [
            {
              title: "Warm Mood Lighting - Cozy Atmosphere",
              url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
              description: "Beautiful warm lighting to maintain your positive mood"
            }
          ],
          blogs: [
            {
              title: "How to Maintain Positive Mental Health",
              url: "https://www.healthline.com/health/mental-health/how-to-maintain-positive-mental-health",
              description: "Tips for sustaining positive mental wellbeing"
            }
          ]
        },
        "fear": {
          activities: ["Grounding exercises", "Deep breathing"],
          videos: [
            {
              title: "Soothing Mood Lighting for Anxiety",
              url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
              description: "Calming mood lighting to help reduce anxiety"
            }
          ],
          blogs: [
            {
              title: "Coping with Anxiety and Fear",
              url: "https://www.healthline.com/health/anxiety/how-to-cope-with-anxiety",
              description: "Practical tips for managing anxiety"
            }
          ]
        }
      };

      const resources = emotionResources[dominantEmotion];
      if (resources) {
        // Add activities
        resources.activities.slice(0, 2).forEach((activity, index) => {
          recommendations.push({
            type: "activity",
            title: activity,
            description: `Try ${activity.toLowerCase()} to support your emotional wellbeing`,
            priority: 3
          });
        });
        
        // Add videos
        resources.videos.slice(0, 2).forEach((video) => {
          recommendations.push({
            type: "video",
            title: video.title,
            description: video.description,
            url: video.url,
            priority: 4
          });
        });
        
        // Add blogs
        resources.blogs.slice(0, 1).forEach((blog) => {
          recommendations.push({
            type: "blog",
            title: blog.title,
            description: blog.description,
            url: blog.url,
            priority: 3
          });
        });
      }
    }

    res.json({
      success: true,
      recommendations: recommendations.slice(0, parseInt(limit)),
      dominantEmotion,
      avgMood,
      message: "Recommendations retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

