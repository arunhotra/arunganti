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
    // Hide hobbies phrases first to prevent overlap
    hobbiesPhrases.classList.remove('active');

    // Toggle the visibility of phrases
    aboutMePhrases.classList.toggle('active');

    // Prevent default scroll behavior when toggling
    event.preventDefault();
}

// Add click listeners to all About Me links (desktop and mobile)
aboutMeLinks.forEach(link => {
    link.addEventListener('click', toggleAboutMePhrases);
});

// Hobbies interactive phrases toggle
const hobbiesPhrases = document.querySelector('.hobbies-phrases');
const hobbiesLinks = document.querySelectorAll('a[href="#hobbies"]');

function toggleHobbiesPhrases(event) {
    // Hide about me phrases first to prevent overlap
    aboutMePhrases.classList.remove('active');

    // Toggle the visibility of phrases
    hobbiesPhrases.classList.toggle('active');

    // Prevent default scroll behavior when toggling
    event.preventDefault();
}

// Add click listeners to all Hobbies links (desktop and mobile)
hobbiesLinks.forEach(link => {
    link.addEventListener('click', toggleHobbiesPhrases);
});

// Projects interactive phrases toggle
const projectsPhrases = document.querySelector('.projects-phrases');
const projectsLinks = document.querySelectorAll('a[href="#projects"]');

function toggleProjectsPhrases(event) {
    // Hide about me and hobbies phrases first to prevent overlap
    aboutMePhrases.classList.remove('active');
    hobbiesPhrases.classList.remove('active');

    // Toggle the visibility of phrases
    projectsPhrases.classList.toggle('active');

    // Prevent default scroll behavior when toggling
    event.preventDefault();
}

// Add click listeners to all Projects links (desktop and mobile)
projectsLinks.forEach(link => {
    link.addEventListener('click', toggleProjectsPhrases);
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openSidebar,
        closeSidebar,
        toggleAboutMePhrases,
        toggleHobbiesPhrases,
        toggleProjectsPhrases
    };
}
