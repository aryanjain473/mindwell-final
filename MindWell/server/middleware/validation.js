/**
 * Validation middleware for user registration
 */
export const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  // First Name validation
  if (!firstName || firstName.trim().length === 0) {
    errors.push('First name is required');
  } else if (firstName.trim().length > 50) {
    errors.push('First name cannot be more than 50 characters');
  }

  // Last Name validation
  if (!lastName || lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else if (lastName.trim().length > 50) {
    errors.push('Last name cannot be more than 50 characters');
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
      errors.push('Password cannot be more than 128 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for user login
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Password validation
  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for contact form
 */
export const validateContactForm = (req, res, next) => {
  const { name, email, subject, message, type } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name cannot be more than 100 characters');
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Subject validation
  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (subject.trim().length > 200) {
    errors.push('Subject cannot be more than 200 characters');
  }

  // Message validation
  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  } else if (message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  } else if (message.trim().length > 2000) {
    errors.push('Message cannot be more than 2000 characters');
  }

  // Type validation (optional)
  if (type && !['general', 'support', 'billing', 'partnership', 'press'].includes(type)) {
    errors.push('Invalid message type');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Sanitize input to prevent XSS and other attacks
 */
export const sanitizeInput = (req, res, next) => {
  // Basic sanitization - in production, use a library like DOMPurify
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove < and > characters
      .trim();
  };

  // Sanitize request body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }

  next();
};

/**
 * Rate limiting validation (basic implementation)
 */
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log for this IP
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const requestTimes = requests.get(ip);
    
    // Remove old requests outside the window
    const recentRequests = requestTimes.filter(time => time > windowStart);
    
    // Check if rate limit exceeded
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request time
    recentRequests.push(now);
    requests.set(ip, recentRequests);

    next();
  };
};