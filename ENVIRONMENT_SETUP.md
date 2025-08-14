# Environment Setup Guide

This guide explains how to set up the Alliance Demo on a new machine with proper network configuration.

## Quick Setup (Recommended)

1. **Run the automatic setup script:**

   ```bash
   npm run setup
   ```

   This will automatically detect your machine's IP address and create the necessary `.env` files.

2. **Install dependencies:**

   ```bash
   npm run install-all
   ```

3. **Start the demo:**
   ```bash
   npm run dev
   ```

## Manual Setup

If you prefer to configure manually or the automatic setup doesn't work:

### 1. Find Your Machine's IP Address

**Windows:**

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter (usually something like `192.168.1.100`).

**Mac/Linux:**

```bash
ifconfig
```

Look for your network interface's inet address.

### 2. Create Server Environment File

Create `server/.env` with your IP address:

```env
# Server Configuration
PORT=5000

# Network Configuration - UPDATE THIS TO YOUR MACHINE'S IP
HOST_IP=192.168.1.100

# MongoDB Configuration (Optional - app runs in offline mode if unavailable)
MONGODB_URI=mongodb+srv://rjbulcher:BkfvbQmMeu2KGC3f@main.lurvagf.mongodb.net/alliance-demo?retryWrites=true&w=majority&appName=main

# Environment
NODE_ENV=development
```

### 3. Create Client Environment File

Create `client/.env` with the same IP address:

```env
# Server Connection - UPDATE THIS TO YOUR MACHINE'S IP
REACT_APP_SERVER_HOST_IP=192.168.1.100
REACT_APP_SERVER_PORT=5000

# Built server URL
REACT_APP_SERVER_URL=http://192.168.1.100:5000

# React App Configuration
REACT_APP_ENVIRONMENT=development
```

## Environment Files Explained

### Server Environment Variables

- **`PORT`**: Server port (default: 5000)
- **`HOST_IP`**: Your machine's IP address for network access
- **`MONGODB_URI`**: MongoDB connection string (optional - offline mode if unavailable)
- **`NODE_ENV`**: Environment type (development/production)

### Client Environment Variables

- **`REACT_APP_SERVER_HOST_IP`**: Server's IP address
- **`REACT_APP_SERVER_PORT`**: Server's port
- **`REACT_APP_SERVER_URL`**: Complete server URL
- **`REACT_APP_ENVIRONMENT`**: Environment type

## Offline Mode

The demo supports offline mode:

- If MongoDB is unavailable, the system automatically switches to offline mode
- All core demo functionality works without database connectivity
- Analytics are disabled in offline mode
- The admin panel will show "Offline Mode" indicators

## Network Access

Once configured, you can access the demo from any device on your local network:

- **Display View**: `http://YOUR_IP:5000/display`
- **Controller View**: `http://YOUR_IP:5000/controller`
- **Admin Panel**: `http://YOUR_IP:5000/admin`

## Troubleshooting

### Can't Access from Other Devices

1. Verify your IP address is correct in both `.env` files
2. Check Windows Firewall or antivirus blocking port 5000
3. Ensure all devices are on the same network
4. Try accessing `http://YOUR_IP:5000` directly in a browser

### Database Connection Issues

The demo will automatically fall back to offline mode if:

- No internet connection
- MongoDB is unavailable
- Invalid credentials

This is normal and expected in many demo environments.

### Port Conflicts

If port 5000 is in use:

1. Update `PORT` in `server/.env`
2. Update `REACT_APP_SERVER_PORT` and `REACT_APP_SERVER_URL` in `client/.env`
3. Restart the demo

## Template Files

Template files are provided as examples:

- `server/.env.template`
- `client/.env.template`

Copy these to `.env` files and update the IP addresses as needed.
