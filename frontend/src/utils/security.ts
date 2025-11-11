// utils/security.ts
// Security utilities for enhanced protection

export class SecurityUtils {
  // Validate input against common injection attacks
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number (Nigeria format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Validate transaction PIN
  static isValidPin(pin: string): boolean {
    return /^\d{6}$/.test(pin);
  }

  // Generate secure referral code
  static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Check password strength
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Include special characters');

    if (password.length >= 12) score++;

    return { score, feedback };
  }

  // Rate limiting helper
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map();

    return (key: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old entries
      for (const [k, timestamps] of attempts.entries()) {
        const validTimestamps = timestamps.filter((time: number) => time > windowStart);
        if (validTimestamps.length === 0) {
          attempts.delete(k);
        } else {
          attempts.set(k, validTimestamps);
        }
      }

      const userAttempts = attempts.get(key) || [];
      const recentAttempts = userAttempts.filter((time: number) => time > windowStart);

      if (recentAttempts.length >= maxAttempts) {
        return false;
      }

      recentAttempts.push(now);
      attempts.set(key, recentAttempts);
      return true;
    };
  }
}

// CSRF protection
export const CSRFProtection = {
  generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  validateToken(storedToken: string, receivedToken: string): boolean {
    return storedToken === receivedToken;
  }
};