/**
 * OAuth Helper Script - Get Google Drive Refresh Token
 *
 * This script helps you obtain a refresh token for Google Drive API access.
 *
 * Usage:
 * 1. Download your OAuth credentials JSON from Google Cloud Console
 * 2. Update the CLIENT_ID and CLIENT_SECRET below
 * 3. Run: node get-refresh-token.js
 * 4. Follow the prompts to authenticate
 * 5. Copy the refresh token to use in Cloudflare Worker secrets
 */

const http = require('http');
const url = require('url');
let open;
try {
    open = require('open');
} catch (e) {
    open = null; // Will fail gracefully if module not found
}

// OAuth credentials from Google Cloud Console
const CLIENT_ID = '83891759464-pqsd9c0di5to9tu1mbqt2vkc5bg0mhvu.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Start the OAuth flow
async function getRefreshToken() {
    console.log('\n📝 Google Drive OAuth Flow - Get Refresh Token\n');
    console.log('=' .repeat(60));

    if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
        console.error('\n❌ Error: Please update CLIENT_ID and CLIENT_SECRET in this file first!');
        console.log('\nSteps:');
        console.log('1. Go to https://console.cloud.google.com/apis/credentials');
        console.log('2. Create OAuth 2.0 Client ID (Desktop app)');
        console.log('3. Download the JSON and copy the client_id and client_secret');
        console.log('4. Update this file with those values');
        process.exit(1);
    }

    // Create a local server to receive the OAuth callback
    const server = http.createServer(async (req, res) => {
        const queryParams = url.parse(req.url, true).query;

        if (req.url.startsWith('/oauth2callback')) {
            const code = queryParams.code;

            if (!code) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>❌ Error: No authorization code received</h1>');
                server.close();
                return;
            }

            try {
                // Exchange authorization code for tokens
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        code,
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        redirect_uri: REDIRECT_URI,
                        grant_type: 'authorization_code',
                    }),
                });

                const tokens = await tokenResponse.json();

                if (tokens.error) {
                    throw new Error(tokens.error_description || tokens.error);
                }

                // Display the refresh token
                console.log('\n' + '='.repeat(60));
                console.log('✅ SUCCESS! Here is your refresh token:');
                console.log('='.repeat(60));
                console.log('\n' + tokens.refresh_token + '\n');
                console.log('='.repeat(60));
                console.log('\n📋 Next steps:');
                console.log('1. Copy the refresh token above');
                console.log('2. Run: wrangler secret put GOOGLE_REFRESH_TOKEN');
                console.log('3. Paste the refresh token when prompted');
                console.log('\nAlso set these secrets:');
                console.log('- wrangler secret put GOOGLE_CLIENT_ID');
                console.log('- wrangler secret put GOOGLE_CLIENT_SECRET');
                console.log('- wrangler secret put GOOGLE_DRIVE_FOLDER_ID');
                console.log('='.repeat(60) + '\n');

                // Send success response to browser
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>OAuth Success</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            }
                            .container {
                                background: white;
                                padding: 40px;
                                border-radius: 10px;
                                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                                text-align: center;
                                max-width: 500px;
                            }
                            h1 { color: #4CAF50; margin-top: 0; }
                            code {
                                background: #f5f5f5;
                                padding: 10px;
                                border-radius: 5px;
                                display: block;
                                margin: 20px 0;
                                word-break: break-all;
                                font-size: 12px;
                            }
                            p { color: #666; line-height: 1.6; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>✅ Authentication Successful!</h1>
                            <p>Your refresh token has been generated.</p>
                            <p><strong>Check your terminal</strong> for the refresh token and next steps.</p>
                            <p style="margin-top: 30px; font-size: 14px;">You can close this window now.</p>
                        </div>
                    </body>
                    </html>
                `);

                // Close the server after a delay
                setTimeout(() => {
                    server.close();
                    process.exit(0);
                }, 1000);

            } catch (error) {
                console.error('\n❌ Error exchanging code for tokens:', error.message);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>❌ Error: ${error.message}</h1>`);
                server.close();
                process.exit(1);
            }
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    });

    // Start the local server
    server.listen(3000, () => {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: SCOPES.join(' '),
            access_type: 'offline',
            prompt: 'consent',
        })}`;

        console.log('\n🌐 Opening browser for authentication...');
        console.log('\nIf the browser does not open automatically, visit this URL:');
        console.log('\n' + authUrl + '\n');
        console.log('=' + '='.repeat(60));
        console.log('\n⏳ Waiting for authentication...\n');

        // Open the browser
        if (open && typeof open === 'function') {
            open(authUrl).catch(() => {
                console.log('Could not open browser automatically. Please open the URL manually.');
            });
        }
    });

    // Handle server errors
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('\n❌ Error: Port 3000 is already in use.');
            console.log('Please close any other applications using port 3000 and try again.\n');
        } else {
            console.error('\n❌ Server error:', err.message);
        }
        process.exit(1);
    });
}

// Check if node version supports fetch
if (!global.fetch) {
    console.error('\n❌ Error: This script requires Node.js 18 or higher (for native fetch support)');
    console.log('Please upgrade your Node.js version or use node-fetch package.\n');
    process.exit(1);
}

// Run the script
getRefreshToken().catch((error) => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});
