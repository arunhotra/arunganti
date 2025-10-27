// Mobile menu toggle functionality

// Get DOM elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeBtn = document.getElementById('closeBtn');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Open sidebar
function openSidebar() {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
}

// Close sidebar
function closeSidebar() {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Event listeners
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openSidebar);
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

// Close sidebar when clicking a link
sidebarLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
});

// About Me interactive phrases toggle
const aboutMePhrases = document.querySelector('.about-me-phrases');
const aboutMeLinks = document.querySelectorAll('a[href="#about"]');

function toggleAboutMePhrases(event) {
    // Toggle the visibility of phrases
    aboutMePhrases.classList.toggle('active');

    // Prevent default scroll behavior when toggling
    event.preventDefault();
}

// Add click listeners to all About Me links (desktop and mobile)
aboutMeLinks.forEach(link => {
    link.addEventListener('click', toggleAboutMePhrases);
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openSidebar,
        closeSidebar,
        toggleAboutMePhrases
    };
}
