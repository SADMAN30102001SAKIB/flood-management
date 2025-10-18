/**
 * Environment Variable Validation Utility
 * 
 * This module validates that all required environment variables are set
 * before the application starts. Helps catch configuration issues early.
 */

export function validateEnvironment() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check for default/example values that should be changed
  if (process.env.NEXTAUTH_SECRET === 'your-secret-key-change-in-production') {
    warnings.push('NEXTAUTH_SECRET is using the default example value. Please change it!');
  }

  // Report findings
  if (missing.length > 0) {
    console.error('\x1b[31m❌ Missing required environment variables:\x1b[0m');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n\x1b[33mℹ️  Copy .env.local.example to .env.local and fill in the values.\x1b[0m\n');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables in production!');
    }
  }

  if (warnings.length > 0) {
    console.warn('\x1b[33m⚠️  Environment warnings:\x1b[0m');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
    console.warn('');
  }

  if (missing.length === 0 && warnings.length === 0) {
    console.log('\x1b[32m✅ All environment variables are properly configured\x1b[0m');
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

// Auto-validate in development
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment();
}
