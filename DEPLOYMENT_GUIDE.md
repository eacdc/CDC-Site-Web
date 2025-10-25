# CDC Web App - Deployment Guide

This guide will help you deploy the CDC Process Management web application to various platforms.

## Quick Start (Local Testing)

### Option 1: Direct Browser Open
1. Navigate to the `CDC Web App` folder
2. Double-click `index.html`
3. The app will open in your default browser

**Note**: QR scanner may not work with `file://` protocol. Use a local server instead.

### Option 2: Local Web Server

#### Using Python (Recommended for Local Testing)
```bash
# Python 3
cd "CDC Web App"
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run from CDC Web App directory
cd "CDC Web App"
http-server -p 8000

# Then open: http://localhost:8000
```

#### Using PHP
```bash
cd "CDC Web App"
php -S localhost:8000

# Then open: http://localhost:8000
```

## Production Deployment

### 1. GitHub Pages (Free HTTPS)

**Steps:**
1. Create a new GitHub repository
2. Push the `CDC Web App` folder contents to the repository:
   ```bash
   cd "CDC Web App"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/cdc-web-app.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Source: Deploy from branch `main`
5. Folder: `/ (root)`
6. Click Save
7. Access your app at: `https://yourusername.github.io/cdc-web-app`

**Advantages:**
- ✅ Free
- ✅ Automatic HTTPS
- ✅ Easy updates (just push to Git)
- ✅ Custom domain support

### 2. Netlify (Easiest)

**Method A: Drag & Drop**
1. Go to https://app.netlify.com
2. Sign up/Login
3. Drag and drop the `CDC Web App` folder to Netlify
4. Your site is live with automatic HTTPS!

**Method B: Git Integration**
1. Push code to GitHub (see steps above)
2. Go to Netlify → New site from Git
3. Connect your GitHub repository
4. Click Deploy
5. Site is live at: `https://random-name.netlify.app`
6. Can customize to: `https://cdc-app.netlify.app`

**Advantages:**
- ✅ Fastest deployment
- ✅ Automatic HTTPS
- ✅ Free SSL certificates
- ✅ Continuous deployment
- ✅ Custom domains
- ✅ Built-in CI/CD

### 3. Vercel (Recommended for Best Performance)

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy:
   ```bash
   cd "CDC Web App"
   vercel
   ```
3. Follow the prompts
4. Your site is live with automatic HTTPS!

**Or use Vercel Web Interface:**
1. Go to https://vercel.com
2. Sign up/Login
3. New Project → Import Git repository
4. Deploy

**Advantages:**
- ✅ Lightning-fast CDN
- ✅ Automatic HTTPS
- ✅ Free tier available
- ✅ Excellent performance
- ✅ Git integration

### 4. Render Static Site

**Steps:**
1. Push code to GitHub
2. Go to https://render.com
3. Sign up/Login
4. New → Static Site
5. Connect GitHub repository
6. Settings:
   - Build Command: (leave empty)
   - Publish Directory: `.`
7. Click Create Static Site
8. Site is live with HTTPS!

**Advantages:**
- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Fast deployment
- ✅ Custom domains

### 5. Firebase Hosting

**Steps:**
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase in your project:
   ```bash
   cd "CDC Web App"
   firebase init hosting
   ```
   - Select/create a Firebase project
   - Public directory: `.`
   - Single-page app: `Yes`
   - Don't overwrite index.html: `No`
4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```
5. Site is live at: `https://your-project.web.app`

**Advantages:**
- ✅ Google infrastructure
- ✅ Automatic HTTPS
- ✅ Free tier
- ✅ CDN included
- ✅ Custom domains

### 6. Traditional Web Server (Apache/Nginx)

#### Apache
1. Copy files to web root:
   ```bash
   cp -r "CDC Web App"/* /var/www/html/cdc-app/
   ```
2. Create `.htaccess` file:
   ```apache
   # Enable CORS if needed
   Header set Access-Control-Allow-Origin "*"
   
   # Enable compression
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript
   </IfModule>
   
   # Cache static assets
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType text/html "access plus 0 seconds"
   </IfModule>
   ```
3. Ensure HTTPS is configured with SSL certificate (Let's Encrypt)
4. Access at: `https://yourdomain.com/cdc-app`

#### Nginx
1. Copy files to web root:
   ```bash
   cp -r "CDC Web App"/* /var/www/cdc-app/
   ```
2. Create Nginx config:
   ```nginx
   server {
     listen 443 ssl http2;
     server_name cdc.yourdomain.com;
     
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
     
     root /var/www/cdc-app;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     # Enable compression
     gzip on;
     gzip_types text/css application/javascript text/html;
     
     # Cache static assets
     location ~* \.(css|js)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```
3. Reload Nginx: `sudo nginx -s reload`
4. Access at: `https://cdc.yourdomain.com`

## Custom Domain Setup

### Netlify
1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Add your domain (e.g., `cdc.yourdomain.com`)
4. Update DNS records as instructed
5. Enable HTTPS (automatic)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. HTTPS is automatic

### GitHub Pages
1. Go to repository Settings → Pages
2. Custom domain: Enter your domain
3. Add CNAME record in your DNS:
   ```
   cdc  CNAME  yourusername.github.io
   ```
4. Enable "Enforce HTTPS"

## Environment Configuration

### API URL
The app uses the production API by default: `https://cdcapi.onrender.com/api`

To change it, edit `script.js`:
```javascript
// Line 5-6
const API_BASE_URL = 'https://your-api-url.com/api';
```

### For Different Environments

Create separate files for different environments:

**script.prod.js** (Production):
```javascript
const API_BASE_URL = 'https://cdcapi.onrender.com/api';
```

**script.dev.js** (Development):
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

Then update `index.html`:
```html
<!-- Production -->
<script src="script.prod.js" defer></script>

<!-- Development -->
<script src="script.dev.js" defer></script>
```

## Performance Optimization

### 1. Enable Compression
Most hosting platforms enable this by default. For custom servers, ensure gzip is enabled.

### 2. CDN (Content Delivery Network)
Use Cloudflare for additional speed:
1. Sign up at https://cloudflare.com
2. Add your domain
3. Update nameservers
4. Enable "Always Use HTTPS"
5. Enable "Auto Minify" for HTML, CSS, JS

### 3. Image Optimization
If adding images later, use WebP format and lazy loading.

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Content Security Policy**: Add CSP headers if using custom server
3. **CORS**: Configure CORS properly on the backend
4. **Rate Limiting**: Implement on backend to prevent abuse
5. **Regular Updates**: Keep dependencies updated

## Monitoring & Analytics

### Google Analytics
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking (Sentry)
Add to `script.js`:
```javascript
// At the top of script.js
if (typeof Sentry !== 'undefined') {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production'
  });
}
```

## Troubleshooting

### QR Scanner Not Working
- **Issue**: Camera access denied
- **Solution**: Ensure HTTPS is enabled (required for camera access)
- **Local Testing**: Use `localhost` or `127.0.0.1`

### API Connection Errors
- **Issue**: CORS errors
- **Solution**: Ensure backend allows requests from your domain
- **Check**: Backend CORS configuration

### Mobile Layout Issues
- **Issue**: Layout breaks on mobile
- **Solution**: Clear browser cache and test in incognito mode
- **Check**: Viewport meta tag is present in HTML

### White Screen
- **Issue**: JavaScript errors
- **Solution**: Check browser console for errors
- **Check**: Ensure all files are uploaded correctly

## Recommended Setup for Production

1. **Hosting**: Netlify or Vercel (easiest with best features)
2. **Domain**: Custom domain with HTTPS
3. **Monitoring**: Google Analytics + Error tracking
4. **CDN**: Built-in with Netlify/Vercel, or add Cloudflare
5. **Backup**: Git repository on GitHub/GitLab

## Cost Comparison

| Platform | Free Tier | Bandwidth | Custom Domain | HTTPS |
|----------|-----------|-----------|---------------|-------|
| Netlify | ✅ 100GB/month | 100GB | ✅ Free | ✅ Free |
| Vercel | ✅ 100GB/month | 100GB | ✅ Free | ✅ Free |
| GitHub Pages | ✅ Unlimited | 100GB | ✅ Free | ✅ Free |
| Firebase | ✅ 10GB/month | 10GB | ✅ Free | ✅ Free |
| Render | ✅ 100GB/month | 100GB | ✅ Free | ✅ Free |

## Quick Deploy Commands

### Netlify
```bash
npm install -g netlify-cli
cd "CDC Web App"
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
cd "CDC Web App"
vercel --prod
```

### Firebase
```bash
npm install -g firebase-tools
firebase login
cd "CDC Web App"
firebase init hosting
firebase deploy --only hosting
```

## Support

For deployment issues, contact the CDC development team or refer to the platform-specific documentation:
- Netlify: https://docs.netlify.com
- Vercel: https://vercel.com/docs
- GitHub Pages: https://docs.github.com/pages
- Firebase: https://firebase.google.com/docs/hosting

---

**Last Updated**: October 2024
**Maintained By**: CDC Development Team

