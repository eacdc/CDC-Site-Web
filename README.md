# CDC Process Management - Web Application

A responsive web application for CDC process management system with a dark modern UI, supporting both mobile and desktop layouts.

## Features

### 🎨 Design
- **Dark Theme**: Modern dark UI inspired by the GRN web app
- **Responsive Layout**: Optimized for both mobile and desktop devices
- **Smooth Transitions**: Professional animations and interactions

### 🔐 Authentication
- Username-based login
- Database selection (KOL/AHM)
- Session management with logout functionality

### 🏭 Machine Management
- View and select available machines
- Beautiful card-based machine selection interface
- Machine status display

### 📱 Job Card Search
- **QR Code Scanner**: Scan job card QR codes using device camera
- **Manual Entry**: Type job card content number manually
- Tab-based interface for easy switching between modes

### 📋 Process Management
- View pending and running processes
- Detailed process information display:
  - Client, Job Name, Component
  - PWO Number, Form Number
  - Schedule and Production quantities
- **Running Processes**: Orange-highlighted section showing active processes
- **Pending Processes**: Blue section showing waiting processes
- **Load More**: Pagination for large process lists (10 at a time)

### ⚙️ Process Operations
- **Start Process**: Begin production with one click
- **View Running Process**: Monitor active processes with real-time timer
- **Complete Process**: Submit production and wastage quantities
- **Cancel Process**: Stop running processes with confirmation
- **Production Timer**: Real-time elapsed time display (HH:MM:SS)

### 📊 Process Details
- Paper issuance status check
- Color-coded process cards:
  - Green: In Queue
  - Orange: Running/Part Complete
  - Grey: Paper Not Issued
- Process status indicators

## Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and flexbox/grid
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **html5-qrcode**: QR code scanning library
- **API Integration**: RESTful API communication with the backend

## File Structure

```
CDC Web App/
├── index.html          # Main HTML structure
├── styles.css          # Dark theme styles with responsive design
├── script.js           # Application logic and API integration
└── README.md           # This file
```

## Setup & Deployment

### Local Development

1. Simply open `index.html` in a modern web browser
2. The app will connect to the production backend: `https://cdcapi.onrender.com/api`

### Camera Permissions

For QR code scanning to work, the application needs camera access:
- **HTTPS Required**: Modern browsers require HTTPS for camera access (except localhost)
- **Local Testing**: Works on `localhost` or `127.0.0.1`
- **Production**: Must be served over HTTPS

### Deployment Options

#### Option 1: Static Hosting (GitHub Pages, Netlify, Vercel)

1. **GitHub Pages**:
   - Create a repository
   - Push the files to the repository
   - Enable GitHub Pages in repository settings
   - Access via `https://yourusername.github.io/repository-name`

2. **Netlify**:
   - Drag and drop the folder to Netlify
   - Automatic HTTPS provisioning
   - Custom domain support

3. **Vercel**:
   - Import the project
   - Auto-deployment on push
   - Free HTTPS included

#### Option 2: Web Server (Apache, Nginx)

1. Copy files to web server directory
2. Ensure HTTPS is configured
3. Set appropriate CORS headers if needed

#### Option 3: Render Static Site

1. Create a new Static Site on Render
2. Connect your Git repository
3. Set publish directory to root
4. Deploy with automatic HTTPS

## API Configuration

The app connects to the production backend by default. To change the API URL, modify the `API_BASE_URL` constant in `script.js`:

```javascript
const API_BASE_URL = 'https://cdcapi.onrender.com/api';
```

For local development:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Features Comparison with Mobile App

| Feature | Mobile App | Web App |
|---------|-----------|---------|
| Login with Database Selection | ✅ | ✅ |
| Machine Selection | ✅ | ✅ |
| QR Code Scanning | ✅ | ✅ |
| Manual Entry | ✅ | ✅ |
| Process List View | ✅ | ✅ |
| Start Process | ✅ | ✅ |
| Running Process View | ✅ | ✅ |
| Production Timer | ✅ | ✅ |
| Complete Process | ✅ | ✅ |
| Cancel Process | ✅ | ✅ |
| Paper Issuance Check | ✅ | ✅ |
| Status Warnings | ✅ | ✅ |
| Responsive Design | ✅ | ✅ |
| Dark Theme | ❌ | ✅ |
| Process Pagination | ❌ | ✅ |
| Real-time Updates | ❌ | ⚠️ Manual Refresh |

## Usage Guide

### 1. Login
- Enter your username
- Select database (KOL or AHM)
- Click "Sign In"

### 2. Select Machine
- Choose a machine from the list
- Click on the machine card

### 3. Search Job Card
**Using QR Scanner:**
- Position QR code in camera view
- Scanner will automatically detect and search

**Using Manual Entry:**
- Click "Manual Entry" tab
- Type job card content number
- Click "Search"

### 4. View Processes
- **Running Processes**: Shows currently active processes
- **Pending Processes**: Shows processes waiting to start
- Click "Load More" to see additional pending processes

### 5. Start a Process
- Click "Start" button on a pending process
- Process will move to "Running Processes" section

### 6. Monitor Running Process
- Click "View Status" on a running process
- See real-time production timer
- View all process details

### 7. Complete Process
- Click "Complete" button
- Enter Production Qty and Wastage Qty
- Click "Submit"

### 8. Cancel Process
- Click "Cancel" button
- Confirm cancellation
- Process will be stopped

## Responsive Breakpoints

- **Mobile**: < 768px (Single column layout)
- **Tablet**: 769px - 1024px (Two column grid)
- **Desktop**: > 1025px (Multi-column grid)

## Color Scheme

- **Background**: Dark blue gradient (#0f172a to #0b1220)
- **Cards**: Slate (#1e293b)
- **Primary**: Indigo (#6366f1)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Danger**: Red (#ef4444)
- **Text**: Light slate (#e2e8f0)

## Known Limitations

1. **Camera Access**: Requires HTTPS in production (works on localhost for testing)
2. **Real-time Updates**: Manual refresh needed to see changes from other users
3. **Offline Support**: Requires internet connection
4. **Browser Storage**: Uses memory only, no persistent session

## Future Enhancements

- [ ] Real-time process updates using WebSockets
- [ ] Offline support with Service Workers
- [ ] Push notifications for process status
- [ ] Export process reports
- [ ] Advanced filtering and search
- [ ] Process history view
- [ ] Multi-language support

## Support

For issues or questions, please contact the CDC development team.

## License

© 2024 CDC. All rights reserved.

