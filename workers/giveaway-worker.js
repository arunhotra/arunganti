/**
 * Giveaway Worker - Cloudflare Worker with Google Drive integration
 * Handles image uploads and gallery for giveaway items
 *
 * Environment Variables (set via wrangler secret put):
 * - GOOGLE_CLIENT_ID: OAuth client ID
 * - GOOGLE_CLIENT_SECRET: OAuth client secret
 * - GOOGLE_REFRESH_TOKEN: OAuth refresh token
 * - GOOGLE_DRIVE_FOLDER_ID: Google Drive folder ID for "Giveaway Items"
 *
 * KV Namespace: RATE_LIMIT_KV (for rate limiting)
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDescriptionLength: 280,
    maxFolderSize: 10 * 1024 * 1024 * 1024, // 10GB storage limit
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    metadataFileName: 'metadata.json',
    corsOrigins: ['https://arunhotra.com', 'http://localhost:8000'], // Update with your domains
    rateLimit: {
        maxUploads: 10,
        windowMinutes: 60
    }
};

// ============================================================================
// Main Request Handler
// ============================================================================

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            let response;

            // Route requests
            if (path === '/upload' && request.method === 'POST') {
                response = await handleUpload(request, env);
            } else if (path === '/items' && request.method === 'GET') {
                response = await handleGetItems(request, env);
            } else if (path.startsWith('/image/') && request.method === 'GET') {
                // Proxy images from Google Drive
                response = await handleGetImage(path, env);
            } else if (path.startsWith('/delete/') && request.method === 'DELETE') {
                response = await handleDelete(request, path, env);
            } else {
                response = new Response('Not Found', { status: 404 });
            }

            // Add CORS headers
            return addCORSHeaders(response);

        } catch (error) {
            console.error('Worker error:', error);
            return addCORSHeaders(
                new Response(
                    JSON.stringify({ error: error.message || 'Internal server error' }),
                    {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            );
        }
    }
};

// ============================================================================
// Google Drive API Integration
// ============================================================================

/**
 * Get fresh access token from refresh token
 */
async function getAccessToken(env) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: env.GOOGLE_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Upload file to Google Drive
 */
async function uploadToGoogleDrive(accessToken, folderId, fileName, fileData, mimeType) {
    // Create file metadata
    const metadata = {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType
    };

    // Create multipart upload boundary
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    // Build multipart body
    const multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n` +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        arrayBufferToBase64(fileData) +
        closeDelimiter;

    // Upload to Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload to Google Drive: ${error}`);
    }

    return await response.json();
}

/**
 * Get file from Google Drive
 */
async function getFileFromGoogleDrive(accessToken, fileId) {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch file from Google Drive: ${response.statusText}`);
    }

    return await response.arrayBuffer();
}

/**
 * Make a file publicly accessible (anyone with link can view)
 */
async function makeFilePublic(accessToken, fileId) {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'reader',
                type: 'anyone'
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to set file permissions: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * List files in folder (find metadata file)
 */
async function listFilesInFolder(accessToken, folderId, fileName) {
    const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
}

/**
 * Update existing file in Google Drive
 */
async function updateFileInGoogleDrive(accessToken, fileId, fileData, mimeType) {
    const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': mimeType
            },
            body: fileData
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to update file: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Get total storage used in folder
 */
async function getFolderStorageUsed(accessToken, folderId) {
    try {
        // Query all files in the folder
        const query = `'${folderId}' in parents and trashed=false`;
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(size)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to query folder: ${response.statusText}`);
        }

        const data = await response.json();

        // Sum up all file sizes
        let totalSize = 0;
        if (data.files) {
            for (const file of data.files) {
                totalSize += parseInt(file.size || 0);
            }
        }

        return totalSize;
    } catch (error) {
        console.error('Error calculating folder size:', error);
        return 0; // Return 0 on error to allow upload (fail open)
    }
}

// ============================================================================
// Upload Handler
// ============================================================================

async function handleUpload(request, env) {
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `ratelimit:${clientIP}`;

    if (env.RATE_LIMIT_KV) {
        const isRateLimited = await checkRateLimit(rateLimitKey, env.RATE_LIMIT_KV);
        if (isRateLimited) {
            return new Response(
                JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
                {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // Check storage limit (10GB)
    const accessToken = await getAccessToken(env);
    const currentStorageUsed = await getFolderStorageUsed(accessToken, env.GOOGLE_DRIVE_FOLDER_ID);

    if (currentStorageUsed >= CONFIG.maxFolderSize) {
        return new Response(
            JSON.stringify({
                error: 'Storage limit reached (10GB). No more uploads accepted.',
                currentUsage: `${(currentStorageUsed / 1024 / 1024 / 1024).toFixed(2)} GB`
            }),
            {
                status: 507, // Insufficient Storage
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const description = formData.get('description');

    // Validation
    if (!imageFile || !description) {
        return new Response(
            JSON.stringify({ error: 'Missing image or description' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Validate file size
    if (imageFile.size > CONFIG.maxFileSize) {
        return new Response(
            JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
            { status: 413, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Validate file type
    if (!CONFIG.supportedTypes.includes(imageFile.type)) {
        return new Response(
            JSON.stringify({ error: 'Unsupported file type. Please use JPEG, PNG, or WebP.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Validate description length
    if (description.length > CONFIG.maxDescriptionLength) {
        return new Response(
            JSON.stringify({ error: 'Description too long. Maximum 280 characters.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Generate unique ID
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split('-')[0];
    const id = `${timestamp}-${randomId}`;

    // Access token already obtained for storage check above

    // Convert to buffer
    const imageBuffer = await imageFile.arrayBuffer();

    // Upload image to Google Drive (in 'images' subfolder)
    // Note: You'll need to get the subfolder IDs or create them if they don't exist
    const imagePath = `${id}.jpg`;
    const imageUploadResult = await uploadToGoogleDrive(
        accessToken,
        env.GOOGLE_DRIVE_FOLDER_ID, // Using main folder for now
        imagePath,
        imageBuffer,
        'image/jpeg'
    );

    // Make the uploaded file publicly viewable
    await makeFilePublic(accessToken, imageUploadResult.id);

    // Create image URLs using worker proxy (not direct Google Drive links)
    const imageUrl = `/image/${imageUploadResult.id}`;
    const thumbnailUrl = `/image/${imageUploadResult.id}`;

    // Update metadata
    const item = {
        id,
        imageUrl,
        thumbnailUrl,
        driveFileId: imageUploadResult.id,
        description: description.trim(),
        timestamp,
        uploadedAt: new Date().toISOString()
    };

    await addItemToMetadata(accessToken, env.GOOGLE_DRIVE_FOLDER_ID, item);

    // Update rate limit
    if (env.RATE_LIMIT_KV) {
        await incrementRateLimit(rateLimitKey, env.RATE_LIMIT_KV);
    }

    return new Response(
        JSON.stringify({
            success: true,
            item
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// ============================================================================
// Get Items Handler
// ============================================================================

async function handleGetItems(request, env) {
    try {
        const accessToken = await getAccessToken(env);

        // Find metadata file in Google Drive
        const metadataFile = await listFilesInFolder(
            accessToken,
            env.GOOGLE_DRIVE_FOLDER_ID,
            CONFIG.metadataFileName
        );

        if (!metadataFile) {
            // No metadata file yet, return empty array
            return new Response(
                JSON.stringify({ items: [] }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, max-age=300' // 5 minutes
                    }
                }
            );
        }

        // Fetch metadata content
        const metadataBuffer = await getFileFromGoogleDrive(accessToken, metadataFile.id);
        const metadataText = new TextDecoder().decode(metadataBuffer);
        const metadata = JSON.parse(metadataText);

        return new Response(
            JSON.stringify(metadata),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=300'
                }
            }
        );

    } catch (error) {
        console.error('Error fetching items:', error);
        return new Response(
            JSON.stringify({ items: [] }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// ============================================================================
// Get Image Handler (Proxy from Google Drive)
// ============================================================================

async function handleGetImage(path, env) {
    try {
        // Extract file ID from path
        const parts = path.split('/');
        const driveFileId = parts[parts.length - 1];

        const accessToken = await getAccessToken(env);
        const imageBuffer = await getFileFromGoogleDrive(accessToken, driveFileId);

        return new Response(imageBuffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000' // 1 year
            }
        });

    } catch (error) {
        console.error('Error fetching image:', error);
        return new Response('Image not found', { status: 404 });
    }
}

// ============================================================================
// Delete Handler
// ============================================================================

async function handleDelete(request, path, env) {
    try {
        // Extract item ID from path
        const itemId = path.split('/').pop();

        // Parse request body for password
        const body = await request.json();
        const { password } = body;

        // Verify deletion password
        if (!password || password !== env.DELETION_SECRET) {
            return new Response(
                JSON.stringify({ error: 'Invalid deletion password' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const accessToken = await getAccessToken(env);

        // Get metadata to find the item
        const metadataFile = await listFilesInFolder(
            accessToken,
            env.GOOGLE_DRIVE_FOLDER_ID,
            CONFIG.metadataFileName
        );

        if (!metadataFile) {
            return new Response(
                JSON.stringify({ error: 'Metadata not found' }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Fetch metadata
        const metadataBuffer = await getFileFromGoogleDrive(accessToken, metadataFile.id);
        const metadataText = new TextDecoder().decode(metadataBuffer);
        const metadata = JSON.parse(metadataText);

        // Find the item to delete
        const item = metadata.items.find(i => i.id === itemId);
        if (!item) {
            return new Response(
                JSON.stringify({ error: 'Item not found' }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Delete the image file from Google Drive
        if (item.driveFileId) {
            await deleteFileFromGoogleDrive(accessToken, item.driveFileId);
        }

        // Remove item from metadata
        metadata.items = metadata.items.filter(i => i.id !== itemId);
        metadata.lastUpdated = Date.now();

        // Update metadata file
        const updatedMetadata = JSON.stringify(metadata, null, 2);
        await updateFileInGoogleDrive(
            accessToken,
            metadataFile.id,
            new TextEncoder().encode(updatedMetadata),
            'application/json'
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Item deleted successfully'
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error deleting item:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to delete item' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Delete file from Google Drive
 */
async function deleteFileFromGoogleDrive(accessToken, fileId) {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete file from Google Drive: ${response.statusText}`);
    }
}

// ============================================================================
// Metadata Management
// ============================================================================

async function addItemToMetadata(accessToken, folderId, newItem) {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            // Find existing metadata file
            const metadataFile = await listFilesInFolder(
                accessToken,
                folderId,
                CONFIG.metadataFileName
            );

            let metadata = { items: [] };

            if (metadataFile) {
                // Fetch existing metadata
                const buffer = await getFileFromGoogleDrive(accessToken, metadataFile.id);
                const text = new TextDecoder().decode(buffer);
                metadata = JSON.parse(text);
            }

            // Add new item to the beginning (newest first)
            metadata.items.unshift(newItem);
            metadata.lastUpdated = Date.now();

            // Convert to JSON string
            const metadataJson = JSON.stringify(metadata, null, 2);
            const metadataBuffer = new TextEncoder().encode(metadataJson);

            if (metadataFile) {
                // Update existing file
                await updateFileInGoogleDrive(
                    accessToken,
                    metadataFile.id,
                    metadataBuffer,
                    'application/json'
                );
            } else {
                // Create new file
                await uploadToGoogleDrive(
                    accessToken,
                    folderId,
                    CONFIG.metadataFileName,
                    metadataBuffer,
                    'application/json'
                );
            }

            return; // Success

        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                throw new Error('Failed to update metadata after retries');
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retries)));
        }
    }
}

// ============================================================================
// Rate Limiting
// ============================================================================

async function checkRateLimit(key, kv) {
    try {
        const data = await kv.get(key);
        if (!data) {
            return false;
        }

        const { count, expiry } = JSON.parse(data);
        const now = Date.now();

        if (now > expiry) {
            // Window expired
            await kv.delete(key);
            return false;
        }

        return count >= CONFIG.rateLimit.maxUploads;

    } catch (error) {
        console.error('Rate limit check error:', error);
        return false; // Allow on error
    }
}

async function incrementRateLimit(key, kv) {
    try {
        const data = await kv.get(key);
        const now = Date.now();
        const windowMs = CONFIG.rateLimit.windowMinutes * 60 * 1000;

        let count = 1;
        let expiry = now + windowMs;

        if (data) {
            const existing = JSON.parse(data);
            if (now < existing.expiry) {
                count = existing.count + 1;
                expiry = existing.expiry;
            }
        }

        await kv.put(
            key,
            JSON.stringify({ count, expiry }),
            { expirationTtl: CONFIG.rateLimit.windowMinutes * 60 }
        );

    } catch (error) {
        console.error('Rate limit increment error:', error);
    }
}

// ============================================================================
// CORS Handling
// ============================================================================

function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}

function addCORSHeaders(response) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return newResponse;
}

// ============================================================================
// Helper Functions
// ============================================================================

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
