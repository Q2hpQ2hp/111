/**
 * Order of Triumph - Local Server
 * 
 * Instructions:
 * 1. Ensure Node.js is installed.
 * 2. Run `npm install express`
 * 3. Run `node server.js`
 * 
 * Domain Setup (Optional):
 * To use a custom domain like 'www.orderoftriumph.local':
 * 1. Edit your hosts file:
 *    - Windows: C:\Windows\System32\drivers\etc\hosts
 *    - Mac/Linux: /etc/hosts
 * 2. Add the line:
 *    127.0.0.1 www.orderoftriumph.local
 * 3. Access the site at http://www.orderoftriumph.local:3000
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the current directory
// In a production build, this would point to the 'build' or 'dist' folder
app.use(express.static(__dirname));

// Handle SPA routing - return index.html for all 404 routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
    ============================================
    ⚔️  ORDER OF TRIUMPH SERVER ONLINE ⚔️
    ============================================
    
    Local Access: http://localhost:${PORT}
    
    If you configured your hosts file:
    Custom Domain: http://www.orderoftriumph.local:${PORT}
    
    Press Ctrl+C to stop the server.
    `);
});
