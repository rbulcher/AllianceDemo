# Alliance Tradeshow Demo - Development Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install-all

# Or install individually
cd server && npm install
cd ../client && npm install
```

### 2. Start Development

```bash
# Start both server and client (from root directory)
npm run dev

# Or start individually
npm run server  # Starts server on port 5000
npm run client  # Starts client on port 3000
```

### 3. Access the Demo

- **Scenario Selection**: http://localhost:3000/
- **Display View (TV/Laptop)**: http://localhost:3000/display
- **Controller View (iPad)**: http://localhost:3000/controller
- **Admin Panel**: http://localhost:3000/admin

## Project Structure Overview

```
alliance-tradeshow-demo/
├── server/                 # Node.js backend
│   ├── server.js          # Main server file
│   └── package.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── data/          # Scenario data
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utilities and constants
│   └── package.json
└── package.json           # Root package for dev scripts
```

## Key Features Implemented

### ✅ Core Architecture

- Real-time communication via Socket.IO
- React PWA for offline capability
- Responsive design for iPad and laptop
- Error boundaries and recovery

### ✅ Scenario System

- 5 scenarios with customizable steps
- Step types: interaction, video, completion
- Progress tracking and navigation
- Dynamic content loading

### ✅ User Interface

- **Scenario Selector**: Choose from 5 demo scenarios
- **Controller View**: iPad interface with phone mockup
- **Display View**: TV/laptop display with video playback
- **Admin Panel**: Demo control and debugging

### ✅ Interactive Elements

- Touch-friendly buttons and hotspots
- Video synchronization between devices
- Step-by-step navigation
- Real-time state management

## Development Workflow

### Adding New Scenarios

1. Edit `client/src/data/scenarios.js`
2. Add scenario structure with steps
3. Include assets (videos, screenshots)
4. Test with admin panel

### Adding Assets

- Videos: `client/public/assets/videos/`
- Screenshots: `client/public/assets/screenshots/`
- Audio: `client/public/assets/sounds/`

### Customizing Styles

- Component styles in respective `.css` files
- Global styles in `client/src/App.css`
- Responsive design breakpoints included

## Network Setup for Tradeshow

### Hardware Requirements

- Laptop (Windows/Mac)
- iPad
- TV/Monitor with HDMI
- Offline Wi-Fi router
- HDMI cable

### Network Configuration

1. Set up offline router (no internet needed)
2. Connect laptop and iPad to router
3. Note laptop's IP address
4. Update iPad URLs to use laptop IP

### URLs for Tradeshow

- Replace `localhost` with laptop IP (e.g., `192.168.1.100`)
- Display: `http://192.168.1.100:3000/display`
- Controller: `http://192.168.1.100:3000/controller`

## Deployment Notes

### Building for Production

```bash
cd client && npm run build
```

### Running Production Server

```bash
cd server && npm start
```

### PWA Installation

- iPad can install as PWA for kiosk mode
- Enables fullscreen, offline operation
- Manifest configured for iOS

## Troubleshooting

### Common Issues

1. **Connection Issues**: Check firewall, ensure same network
2. **Video Not Playing**: Verify video file paths and formats
3. **iPad Display Issues**: Test responsive design, check viewport settings
4. **Socket Disconnection**: Implement reconnection logic

### Debug Tools

- Admin panel shows connection status
- Browser developer tools for debugging
- Server logs for backend issues
- Socket.IO debug mode available

## Next Steps

### Phase 1: Basic Demo (Complete)

- [x] Core architecture setup
- [x] Basic scenario system
- [x] Screenshot-based interactions
- [x] Admin controls

### Phase 2: Enhanced Features

- [ ] Add actual video assets
- [ ] Implement iPhone UI screenshots
- [ ] Add sound effects and feedback
- [ ] Optimize for performance

### Phase 3: Production Ready

- [ ] Error handling and recovery
- [ ] Offline asset caching
- [ ] Performance monitoring
- [ ] User analytics

## Asset Requirements

### Videos (MP4 format recommended)

- `scenario1/washing-process.mp4`
- `scenario1/efficiency-report.mp4`
- `scenario1/success-story.mp4`

### Screenshots (PNG format recommended)

- `scenario1/step1-welcome.png`
- `scenario1/step2-machine-select.png`
- `scenario1/step3-rapid-advance.png`
- etc.

## Contact & Support

For technical questions or issues:

- Check the admin panel for system status
- Review browser console for errors
- Test network connectivity between devices
- Verify asset file paths and availability
