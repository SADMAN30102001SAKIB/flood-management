/**
 * Validation utilities for user inputs
 */

export function validateEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

export function validatePassword(password) {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export function validatePhone(phone) {
  if (!phone) return { valid: true }; // Phone is optional
  // Bangladesh phone format: 11 digits starting with 01
  const re = /^01[0-9]{9}$/;
  if (!re.test(phone)) {
    return { valid: false, message: 'Phone must be 11 digits starting with 01' };
  }
  return { valid: true };
}

export function validateNID(nid) {
  if (!nid) return { valid: true }; // NID is optional
  // Bangladesh NID: 10, 13, or 17 digits
  const re = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/;
  if (!re.test(nid)) {
    return { valid: false, message: 'NID must be 10, 13, or 17 digits' };
  }
  return { valid: true };
}

export function validateAddress(address) {
  if (!address || typeof address !== 'object') {
    return { valid: false, message: 'Address is required' };
  }
  
  const requiredFields = ['city', 'district', 'division'];
  for (const field of requiredFields) {
    if (!address[field] || address[field].trim() === '') {
      return { valid: false, message: `Address ${field} is required` };
    }
  }
  
  return { valid: true };
}

export function sanitizeString(str, maxLength = 500) {
  if (!str) return '';
  return str.trim().slice(0, maxLength);
}

export function validateRequestData(data) {
  const errors = [];
  
  const validTypes = ['rescue', 'medical', 'food', 'clothes', 'shelter', 'other'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.push('Valid request type is required');
  }
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  const addressValidation = validateAddress(data.address);
  if (!addressValidation.valid) {
    errors.push(addressValidation.message);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Log with timestamp and color-coded levels
 */
export function logWithTimestamp(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const timeStr = `\x1b[90m[${timestamp}]\x1b[0m`; // Gray timestamp
  
  // Color-coded log levels
  const levelColors = {
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    debug: '\x1b[35m'    // Magenta
  };
  
  const color = levelColors[level] || levelColors.info;
  const reset = '\x1b[0m';
  const levelStr = `${color}[${level.toUpperCase()}]${reset}`;
  const logMessage = `${timeStr} ${levelStr} ${message}`;
  
  if (level === 'error') {
    console.error(logMessage);
  } else if (level === 'warn') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
}
