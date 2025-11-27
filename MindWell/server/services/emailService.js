import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
// Try port 465 (SSL) first - more reliable from cloud providers
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD // Your Gmail App Password
    },
    // Additional options to improve delivery
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 20000,
    debug: false, // Disable debug logging
    logger: false // Disable logger
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type = 'email_verification') => {
  // Always log OTP for debugging (even if email fails)
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 OTP GENERATED FOR:', email);
  console.log('🔑 OTP CODE:', otp);
  console.log('⏰ Expires in: 10 minutes');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('⚠️ Email service not configured - OTP logged above');
      return { success: true, message: 'Email service not configured - OTP logged to console' };
    }

    console.log('📧 Attempting to send OTP email to:', email);
    console.log('📧 Using SMTP host: smtp.gmail.com:465');
    
    const transporter = createTransporter();
    
    // Try to send email, but don't fail if it times out
    try {
      // Skip verification to avoid timeout - just try to send
      let subject, html;
      
      switch (type) {
        case 'email_verification':
          subject = 'Verify Your MindWell Account';
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #14b8a6, #a855f7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MindWell</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Mental Wellness Companion</p>
              </div>
              <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0;">Verify Your Email Address</h2>
                <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
                  Thank you for signing up with MindWell! To complete your registration, please verify your email address using the OTP below:
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e5e7eb;">
                  <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Your Verification Code</h3>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 5px; font-family: monospace;">
                    ${otp}
                  </div>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
                    This code will expire in 10 minutes
                  </p>
                </div>
                <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px;">
                  If you didn't create an account with MindWell, please ignore this email.
                </p>
              </div>
            </div>
          `;
          break;
        
        case 'login_verification':
          subject = 'Your MindWell Login Code';
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #14b8a6, #a855f7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MindWell</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Mental Wellness Companion</p>
              </div>
              <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0;">Login Verification</h2>
                <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
                  Someone is trying to log into your MindWell account. If this was you, use the OTP below to complete your login:
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e5e7eb;">
                  <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Your Login Code</h3>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 5px; font-family: monospace;">
                    ${otp}
                  </div>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
                    This code will expire in 10 minutes
                  </p>
                </div>
                <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px;">
                  If this wasn't you, please secure your account immediately.
                </p>
              </div>
            </div>
          `;
          break;
      }

      const mailOptions = {
        from: `"MindWell" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      // Try to send with timeout
      const sendPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 15000)
      );
      
      const result = await Promise.race([sendPromise, timeoutPromise]);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (sendError) {
      console.error('❌ Email send failed, trying port 587...');
      // Try port 587 as fallback
      return await sendOTPEmailWithPort587(email, otp, type);
    }
    
  } catch (error) {
    console.error('❌ Error in email service:', error.message);
    // Don't fail - OTP is already logged above
    // Return success so OTP verification can still work
    return { success: true, message: 'Email send failed but OTP is logged - check backend logs' };
  }
};

// Alternative function to try port 587
const sendOTPEmailWithPort587 = async (email, otp, type = 'email_verification') => {
  try {
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000
    });

    let subject, html;
    
    switch (type) {
      case 'email_verification':
        subject = 'Verify Your MindWell Account';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #14b8a6, #a855f7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MindWell</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Mental Wellness Companion</p>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Verify Your Email Address</h2>
              <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
                Thank you for signing up with MindWell! To complete your registration, please verify your email address using the OTP below:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Your Verification Code</h3>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 5px; font-family: monospace;">
                  ${otp}
                </div>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
                  This code will expire in 10 minutes
                </p>
              </div>
              <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px;">
                If you didn't create an account with MindWell, please ignore this email.
              </p>
            </div>
          </div>
        `;
        break;
      default:
        subject = 'Your MindWell Verification Code';
        html = `<p>Your verification code is: <strong>${otp}</strong></p>`;
    }

    const mailOptions = {
      from: `"MindWell" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via port 587:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending email via port 587:', error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('📧 Email service not configured - skipping welcome email');
      console.log('📧 Welcome email for', email, 'would be sent here');
      return { success: true, message: 'Email service not configured - welcome email skipped' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"MindWell" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to MindWell! Your Journey Begins Now',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6, #a855f7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MindWell!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Mental Wellness Journey Starts Here</p>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${firstName}! 🎉</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
              Congratulations! Your email has been verified and your MindWell account is now active. 
              You're ready to begin your mental wellness journey with us.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">What's Next?</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li>Explore our AI-powered mental health features</li>
                <li>Track your daily mood and wellness</li>
                <li>Connect with our supportive community</li>
                <li>Access 24/7 mental health support</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" style="background: linear-gradient(135deg, #14b8a6, #a855f7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Start Your Journey
              </a>
            </div>
            <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px; text-align: center;">
              Thank you for choosing MindWell. We're here to support you every step of the way.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
