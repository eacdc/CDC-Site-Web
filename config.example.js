// CDC Web App Configuration
// Copy this file to config.js and update with your settings

const CONFIG = {
  // API Configuration
  api: {
    // Production API URL
    baseUrl: 'https://cdcapi.onrender.com/api',
    
    // Alternative URLs for different environments
    // Uncomment the one you want to use:
    
    // Local Development
    // baseUrl: 'http://localhost:3001/api',
    
    // Staging
    // baseUrl: 'https://staging-api.yourdomain.com/api',
    
    // API timeout (milliseconds)
    timeout: 30000,
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000,
  },
  
  // App Settings
  app: {
    // App title
    title: 'CDC Process Management',
    
    // Pagination
    processesPerPage: 10,
    
    // QR Scanner settings
    qrScanner: {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    },
    
    // Timer update interval (milliseconds)
    timerUpdateInterval: 1000,
    
    // Auto-refresh interval for process list (milliseconds)
    // Set to 0 to disable auto-refresh
    autoRefreshInterval: 0, // 30000 for 30 seconds
  },
  
  // Feature Flags
  features: {
    // Enable/disable QR scanner
    qrScanner: true,
    
    // Enable/disable manual entry
    manualEntry: true,
    
    // Enable/disable auto-refresh
    autoRefresh: false,
    
    // Enable/disable process timer
    processTimer: true,
    
    // Enable/disable load more pagination
    pagination: true,
  },
  
  // UI Settings
  ui: {
    // Theme
    theme: 'dark', // 'dark' or 'light' (light theme not implemented yet)
    
    // Animation duration (milliseconds)
    animationDuration: 200,
    
    // Toast notification duration (milliseconds)
    toastDuration: 3000,
  },
  
  // Database options
  databases: [
    { value: 'KOL', label: 'KOL' },
    { value: 'AHM', label: 'AHM' },
    // Add more databases as needed
  ],
  
  // Logging
  logging: {
    // Enable console logging
    enabled: true,
    
    // Log level: 'debug', 'info', 'warn', 'error'
    level: 'info',
  },
  
  // Analytics (optional)
  analytics: {
    // Google Analytics Measurement ID
    gaId: '', // 'G-XXXXXXXXXX'
    
    // Enable analytics
    enabled: false,
  },
  
  // Error Tracking (optional)
  errorTracking: {
    // Sentry DSN
    sentryDsn: '',
    
    // Enable error tracking
    enabled: false,
    
    // Environment
    environment: 'production', // 'development', 'staging', 'production'
  },
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

