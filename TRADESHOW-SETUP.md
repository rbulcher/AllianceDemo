# 🚀 Alliance Demo - Tradeshow Setup

## Quick Start (One-Click Setup)

**For tradeshow demonstrations, just double-click:**
```
🚀 START TRADESHOW DEMO.bat
```

That's it! The script will automatically:
- ✅ Pull latest code from GitHub
- ✅ Detect your local IP address  
- ✅ Configure the app for your network
- ✅ Install any missing dependencies
- ✅ Start both server and client
- ✅ Open the display in Chrome
- ✅ Show controller URLs for iPad/mobile

## What the Script Does

### 1. **Git Pull** 
Updates to the latest version from GitHub

### 2. **IP Detection**
Automatically finds your computer's local network IP address using `ipconfig`

### 3. **Configuration**
Creates/updates these files with your IP:
- `server/.env` - Server configuration
- `client/.env` - Client configuration  

### 4. **Dependencies**
Installs npm packages if needed:
- Root dependencies
- Client dependencies (React app)
- Server dependencies (Node.js server)

### 5. **Launch**
- Starts both server (port 5000) and client (port 3000)
- Opens `http://YOUR-IP:3000/display` in Chrome
- Shows connection URLs in console

### 6. **Display Connection Info**
Shows URLs for:
- **Display**: `http://YOUR-IP:3000/display` (auto-opened)
- **Controller**: `http://YOUR-IP:3000/controller` (for iPad/mobile)
- **Admin**: `http://YOUR-IP:3000/admin` (password: 7913)

## Manual Setup (if needed)

If the automatic script doesn't work, you can run manually:

1. **Get your IP**: `ipconfig` (look for IPv4 Address)
2. **Update .env files** with your IP
3. **Install dependencies**: `npm install`
4. **Start the app**: `npm run dev`
5. **Open browser**: Go to `http://YOUR-IP:3000/display`

## Troubleshooting

### Script Won't Run
- Right-click the `.bat` file → "Run as administrator"
- Make sure you're connected to the network
- Check that Git is installed and accessible

### Can't Detect IP
- Make sure you're connected to WiFi/network
- Run `ipconfig` manually to see available IPs
- Update the .env files manually with your IP

### Dependencies Fail
- Make sure Node.js is installed
- Run `npm install` manually in each folder
- Check internet connection for npm downloads

### Browser Won't Open
- Manually open Chrome and go to `http://YOUR-IP:3000/display`
- Replace `YOUR-IP` with the IP shown in the console

## Network Setup

### For iPad/Mobile Connection:
1. Make sure iPad/phone is on the **same WiFi network**
2. Open Safari on iPad/phone
3. Go to `http://YOUR-IP:3000/controller` (IP shown in script output)
4. Bookmark it for easy access

### Firewall Issues:
If devices can't connect:
- Windows Firewall might be blocking Node.js
- Allow Node.js through Windows Firewall
- Or temporarily disable Windows Firewall for testing

## File Structure

```
AllianceDemo/
├── 🚀 START TRADESHOW DEMO.bat    ← Double-click this!
├── start-tradeshow.ps1             ← PowerShell version
├── start-tradeshow.bat             ← Batch version  
├── TRADESHOW-SETUP.md              ← This file
├── package.json                    ← Root config
├── client/                         ← React app
│   ├── .env                        ← Auto-generated config
│   └── package.json
└── server/                         ← Node.js server
    ├── .env                        ← Auto-generated config
    └── package.json
```

## Support

If you encounter issues:
1. Check the console output for error messages
2. Try the manual setup steps
3. Verify network connectivity
4. Contact technical support with console logs