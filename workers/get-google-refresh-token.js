/**
 * Helper script to get Google OAuth refresh token
 * Run with: node get-google-refresh-token.js
 */

const readline = require('readline');

// Load credentials from environment variables or update these with your values
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

console.log('='.repeat(80));
console.log('Google OAuth Refresh Token Generator');
console.log('='.repeat(80));
console.log('\nStep 1: Visit this URL to authorize the application:\n');

const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=code&access_type=offline&prompt=consent`;

console.log(authUrl);
console.log('\n' + '='.repeat(80));
console.log('Step 2: After authorizing, you will be redirected to a URL like:');
console.log('http://localhost/?code=AUTHORIZATION_CODE&scope=...');
console.log('\nCopy the AUTHORIZATION_CODE from the URL');
console.log('='.repeat(80) + '\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the authorization code: ', async (code) => {
    rl.close();

    console.log('\nExchanging authorization code for refresh token...\n');

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: code.trim(),
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Error:', data.error);
            console.error('Description:', data.error_description);
            process.exit(1);
        }

        console.log('='.repeat(80));
        console.log('SUCCESS! Here are your tokens:');
        console.log('='.repeat(80));
        console.log('\nRefresh Token (SAVE THIS):');
        console.log(data.refresh_token);
        console.log('\nAccess Token (temporary):');
        console.log(data.access_token);
        console.log('\nExpires in:', data.expires_in, 'seconds');
        console.log('\n' + '='.repeat(80));
        console.log('\nNow run the setup script with this refresh token!');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('Failed to get tokens:', error.message);
        process.exit(1);
    }
});
