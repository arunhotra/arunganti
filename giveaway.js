/**
 * Giveaway Gallery - Client-side functionality
 * Handles image upload, compression, and gallery display
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    workerUrl: 'https://giveaway-worker.arunhotra.workers.dev',
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxImageDimension: 1920, // Max width/height in pixels
    imageQuality: 0.85, // JPEG compression quality
    descriptionMaxLength: 280,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
};

// ============================================================================
// DOM Elements
// ============================================================================

let elements = {};

// Initialize DOM elements
function initElements() {
    elements = {
        // Upload form
        imageInput: document.getElementById('imageInput'),
        imagePreview: document.getElementById('imagePreview'),
        descriptionInput: document.getElementById('descriptionInput'),
        charCount: document.getElementById('descCharCount'),
        uploadBtn: document.getElementById('uploadBtn'),

        // State containers
        loadingState: document.getElementById('loadingState'),
        errorState: document.getElementById('errorState'),
        errorMessage: document.getElementById('errorMessage'),
        retryBtn: document.getElementById('retryBtn'),
        successState: document.getElementById('successState'),

        // Gallery
        gallerySection: document.getElementById('gallerySection'),
        galleryGrid: document.getElementById('galleryGrid'),
        galleryLoading: document.getElementById('galleryLoading'),
        galleryEmpty: document.getElementById('galleryEmpty'),

        // Modal
        imageModal: document.getElementById('imageModal'),
        modalBackdrop: document.getElementById('modalBackdrop'),
        modalClose: document.getElementById('modalClose'),
        modalImage: document.getElementById('modalImage'),
        modalDescription: document.getElementById('modalDescription'),
        modalTimestamp: document.getElementById('modalTimestamp')
    };
}

// ============================================================================
// State Management
// ============================================================================

const state = {
    selectedFile: null,
    compressedBlob: null,
    isUploading: false,
    items: []
};

// ============================================================================
// Image Compression
// ============================================================================

/**
 * Compress image using Canvas API
 * @param {File} file - Original image file
 * @returns {Promise<Blob>} - Compressed image blob
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > CONFIG.maxImageDimension || height > CONFIG.maxImageDimension) {
                    if (width > height) {
                        height = (height / width) * CONFIG.maxImageDimension;
                        width = CONFIG.maxImageDimension;
                    } else {
                        width = (width / height) * CONFIG.maxImageDimension;
                        height = CONFIG.maxImageDimension;
                    }
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    CONFIG.imageQuality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// ============================================================================
// Upload Functionality
// ============================================================================

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Validate file type
    if (!CONFIG.supportedFormats.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
    }

    // Validate file size
    if (file.size > CONFIG.maxImageSize) {
        showError('Image is too large. Please select an image under 10MB.');
        return;
    }

    state.selectedFile = file;

    // Show preview
    showImagePreview(file);

    // Compress image in background
    compressImage(file)
        .then(blob => {
            state.compressedBlob = blob;
            console.log(`Compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
            updateUploadButton();
        })
        .catch(error => {
            console.error('Compression error:', error);
            showError('Failed to process image. Please try another image.');
        });
}

/**
 * Show image preview
 */
function showImagePreview(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        elements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview of selected image" />`;
        elements.imagePreview.style.display = 'block';
    };

    reader.readAsDataURL(file);
}

/**
 * Handle description input
 */
function handleDescriptionInput() {
    const length = elements.descriptionInput.value.length;
    elements.charCount.textContent = length;

    // Update character counter styling
    if (length > 260) {
        elements.charCount.parentElement.classList.add('error');
        elements.charCount.parentElement.classList.remove('warning');
    } else if (length > 220) {
        elements.charCount.parentElement.classList.add('warning');
        elements.charCount.parentElement.classList.remove('error');
    } else {
        elements.charCount.parentElement.classList.remove('error', 'warning');
    }

    updateUploadButton();
}

/**
 * Update upload button state
 */
function updateUploadButton() {
    const hasImage = state.compressedBlob !== null;
    const hasDescription = elements.descriptionInput.value.trim().length > 0;
    const notUploading = !state.isUploading;

    elements.uploadBtn.disabled = !(hasImage && hasDescription && notUploading);
}

/**
 * Handle upload
 */
async function handleUpload() {
    if (state.isUploading || !state.compressedBlob) {
        return;
    }

    state.isUploading = true;
    updateUploadButton();

    // Show loading state
    hideAllStates();
    elements.loadingState.style.display = 'block';

    try {
        // Create form data
        const formData = new FormData();
        formData.append('image', state.compressedBlob, 'upload.jpg');
        formData.append('description', elements.descriptionInput.value.trim());

        // Upload to worker
        const response = await fetch(`${CONFIG.workerUrl}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Show success
        hideAllStates();
        elements.successState.style.display = 'block';

        // Reset form
        resetUploadForm();

        // Reload gallery
        setTimeout(() => {
            elements.successState.style.display = 'none';
            loadGalleryItems();
        }, 2000);

    } catch (error) {
        console.error('Upload error:', error);
        showError(error.message || 'Failed to upload. Please try again.');
    } finally {
        state.isUploading = false;
        updateUploadButton();
    }
}

/**
 * Reset upload form
 */
function resetUploadForm() {
    elements.imageInput.value = '';
    elements.descriptionInput.value = '';
    elements.charCount.textContent = '0';
    elements.charCount.parentElement.classList.remove('error', 'warning');
    elements.imagePreview.style.display = 'none';
    elements.imagePreview.innerHTML = '';
    state.selectedFile = null;
    state.compressedBlob = null;
    updateUploadButton();
}

/**
 * Handle retry button
 */
function handleRetry() {
    hideAllStates();
    if (state.compressedBlob) {
        handleUpload();
    }
}

// ============================================================================
// Delete Item
// ============================================================================

/**
 * Delete an item from the gallery
 */
async function deleteItem(itemId) {
    // Confirm deletion
    const confirmed = confirm('Are you sure you want to delete this item?');
    if (!confirmed) return;

    // Prompt for deletion password
    const password = prompt('Enter deletion password:');
    if (!password) return;

    try {
        const response = await fetch(`${CONFIG.workerUrl}/delete/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete item');
        }

        // Remove item from DOM
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.remove();
        }

        showSuccess('Item deleted successfully!');

        // Reload gallery after a short delay
        setTimeout(() => {
            loadGalleryItems();
        }, 1500);

    } catch (error) {
        console.error('Delete error:', error);
        showError(error.message || 'Failed to delete item. Please try again.');
    }
}

// ============================================================================
// Gallery Display
// ============================================================================

/**
 * Load gallery items from API
 */
async function loadGalleryItems() {
    elements.galleryLoading.style.display = 'block';
    elements.galleryGrid.innerHTML = '';
    elements.galleryEmpty.style.display = 'none';

    try {
        const response = await fetch(`${CONFIG.workerUrl}/items`);

        if (!response.ok) {
            throw new Error('Failed to load items');
        }

        const data = await response.json();
        state.items = data.items || [];

        elements.galleryLoading.style.display = 'none';

        if (state.items.length === 0) {
            elements.galleryEmpty.style.display = 'block';
        } else {
            renderGalleryItems();
        }

    } catch (error) {
        console.error('Gallery load error:', error);
        elements.galleryLoading.style.display = 'none';
        elements.galleryEmpty.style.display = 'block';
        elements.galleryEmpty.innerHTML = '<p>Failed to load items. Please refresh the page.</p>';
    }
}

/**
 * Render gallery items
 */
function renderGalleryItems() {
    elements.galleryGrid.innerHTML = '';

    state.items.forEach(item => {
        const itemElement = createGalleryItem(item);
        elements.galleryGrid.appendChild(itemElement);
    });

    // Setup lazy loading for images
    setupLazyLoading();
}

/**
 * Create gallery item element
 */
function createGalleryItem(item) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.setAttribute('data-item-id', item.id);

    const thumbnailUrl = item.thumbnailUrl || item.imageUrl;
    const fullUrl = item.imageUrl;

    div.innerHTML = `
        <button class="gallery-item-delete" data-item-id="${item.id}" aria-label="Delete item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        </button>
        <img
            class="gallery-item-image"
            data-src="${CONFIG.workerUrl}${thumbnailUrl}"
            alt="${item.description || 'Giveaway item'}"
            loading="lazy"
        />
        <div class="gallery-item-info">
            <p class="gallery-item-description">${escapeHtml(item.description || 'No description')}</p>
            <p class="gallery-item-timestamp">${formatTimestamp(item.timestamp)}</p>
        </div>
    `;

    // Add click handler to open modal
    div.addEventListener('click', (e) => {
        // Don't open modal if clicking delete button
        if (!e.target.closest('.gallery-item-delete')) {
            openImageModal(item);
        }
    });

    // Add delete button handler
    const deleteBtn = div.querySelector('.gallery-item-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteItem(item.id);
    });

    return div;
}

/**
 * Setup lazy loading for images using Intersection Observer
 */
function setupLazyLoading() {
    const images = elements.galleryGrid.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => observer.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// Modal Functionality
// ============================================================================

/**
 * Open image modal with full-size view
 */
function openImageModal(item) {
    elements.modalImage.src = `${CONFIG.workerUrl}${item.imageUrl}`;
    elements.modalImage.alt = item.description || 'Giveaway item';
    elements.modalDescription.textContent = item.description || 'No description';
    elements.modalTimestamp.textContent = `Shared ${formatTimestamp(item.timestamp)}`;

    elements.imageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Close image modal
 */
function closeImageModal() {
    elements.imageModal.style.display = 'none';
    document.body.style.overflow = '';
}

// ============================================================================
// UI State Management
// ============================================================================

/**
 * Hide all state containers
 */
function hideAllStates() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.successState.style.display = 'none';
}

/**
 * Show error message
 */
function showError(message) {
    hideAllStates();
    elements.errorMessage.textContent = message;
    elements.errorState.style.display = 'block';
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
    // File input
    if (elements.imageInput) {
        elements.imageInput.addEventListener('change', handleFileSelect);
    }

    // Description input
    if (elements.descriptionInput) {
        elements.descriptionInput.addEventListener('input', handleDescriptionInput);
    }

    // Upload button
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', handleUpload);
    }

    // Retry button
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', handleRetry);
    }

    // Modal close
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeImageModal);
    }
    if (elements.modalBackdrop) {
        elements.modalBackdrop.addEventListener('click', closeImageModal);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape' && elements.imageModal.style.display === 'flex') {
            closeImageModal();
        }
    });
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application
 */
function init() {
    // Initialize DOM elements
    initElements();

    // Setup event listeners
    setupEventListeners();

    // Load gallery items
    loadGalleryItems();

    // Initial button state
    updateUploadButton();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        compressImage,
        formatTimestamp,
        escapeHtml,
        CONFIG
    };
}
