# Arunganti Portfolio

A modern, responsive personal portfolio website featuring a glassmorphism design aesthetic and interactive AI-powered tools.

**Live Site:** [https://arunganti.dev](https://arunganti.dev)
**GitHub:** [arunhotra/arunganti](https://github.com/arunhotra/arunganti)

## Overview

This is a static HTML/CSS/JavaScript portfolio showcasing technical expertise, projects, and personal interests. The site features smooth scrolling navigation, responsive mobile design, and interactive elements including an AI-powered hashtag generator tool.

## Features

- **Glassmorphism Design**: Modern frosted glass aesthetic with backdrop blur effects
- **Fully Responsive**: Optimized for mobile (≤480px), tablet (481-768px), and desktop (>768px)
- **Mobile Navigation**: Hamburger menu with smooth slide-out sidebar on mobile devices
- **Interactive Phrases**: Rotating text elements for About Me and Hobbies sections
- **Twitterizer Tool**: AI-powered hashtag generator for Twitter posts with caching
- **F5 Projects Showcase**: Dedicated page showcasing F5 BIG-IP automation projects
- **Personal Projects Gallery**: Collection of side projects and tools
- **Test-Driven Development**: Comprehensive Jest test suite with 70%+ coverage
- **Accessibility First**: WCAG compliance with ARIA labels and semantic HTML

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Testing**: Jest, @testing-library/dom, jest-axe
- **Container Runtime**: Podman/Docker
- **Deployment**: Cloudflare Workers (API proxy)
- **CI/CD**: GitHub Actions
- **API Integration**: GROQ AI for hashtag generation

## Project Structure

```
arunganti/
├── index.html                 # Main landing page
├── f5-projects.html          # F5 BIG-IP projects showcase
├── personal-projects.html    # Personal projects gallery
├── twitterizer.html          # AI hashtag generator tool
├── styles.css                # Main stylesheet (glassmorphism)
├── shared-styles.css         # Shared styles for sub-pages
├── script.js                 # Mobile menu functionality
├── twitterizer.js            # Hashtag generator logic
├── worker.js                 # Cloudflare Workers proxy
├── __tests__/                # Jest test suites
│   ├── menu.test.js
│   ├── dom.test.js
│   ├── accessibility.test.js
│   ├── twitterizer.test.js
│   └── ... (5 more test files)
├── pics/                     # Image assets
│   ├── alternate-main.jpg    # Desktop background
│   ├── main-page.jpg         # Mobile background
│   └── ... (project images)
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup
├── wrangler.toml            # Cloudflare Workers config
├── docker-compose.yml        # Container orchestration
├── Dockerfile                # Test environment container
├── package.json              # Dependencies
├── CLAUDE.md                 # Project instructions
├── TESTING.md                # Testing guide
└── README.md                 # This file
```

## Getting Started

### Running the Website

This is a static site with no build process required:

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Start a local development server
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Running Tests

Tests run in containerized environment (Podman/Docker required):

```bash
# Run all tests once
./test.sh

# Run tests in watch mode (auto-rerun on file changes)
./test-watch.sh

# Run tests with coverage report
./test.sh --coverage

# Open interactive shell in test container
./shell.sh
```

## Pages Overview

### Index (Main Landing Page)
- Hero section with glassmorphic background
- Navigation bar with smooth scroll anchors
- Interactive About Me phrases: "techie", "creative thinker", "perpetual learner", "bon vivant"
- Projects section with links to F5 and Personal Projects
- Hobbies section with interactive phrases: "liverpool", "dancing", "improv", "volleyball"
- Mobile hamburger menu with sidebar navigation
- Resume section placeholder

**Features:**
- Fixed background image with parallax scrolling effect
- Mobile-responsive with hamburger menu
- Smooth scroll navigation between sections

### F5 Projects (`f5-projects.html`)
Showcase of F5 BIG-IP and Ansible automation projects:
- mcp-bigip: Model Context Protocol server for F5 BIG-IP
- Multiple automation and infrastructure projects
- Project descriptions with GitHub links
- Responsive card-based layout

### Personal Projects (`personal-projects.html`)
Gallery of side projects including:
- Twitterizer AI hashtag generator
- Future project tiles

### Twitterizer (`twitterizer.html`)
Interactive AI-powered hashtag generator for Twitter:
- 280-character input limit (Twitter standard)
- AI-generated hashtag suggestions
- Clipboard copy functionality
- Local storage for user preferences
- Free and Pro tier versions
- Cloudflare Workers backend for API requests

## Design System

### Glassmorphism Pattern
```css
/* Translucent background */
background: rgba(255, 255, 255, 0.1);

/* Frosted glass effect */
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);

/* Subtle border */
border: 1px solid rgba(255, 255, 255, 0.2);

/* Soft shadow */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
```

### Color Scheme
- **Text**: White with varying opacity (0.5 - 1.0)
- **Background**: Semi-transparent white overlays on background image
- **Primary**: White/Off-white tones
- **Accents**: Subtle opacity variations for depth

### Responsive Breakpoints
- **Mobile**: ≤480px (hamburger menu, optimized images)
- **Tablet**: 481px - 768px (adjusted spacing)
- **Desktop**: >768px (full navigation bar)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold)
- **Size Scaling**: Responsive typography that adjusts per breakpoint

## Testing & Quality Assurance

### Test Coverage
- **Minimum Coverage**: 70% (statements, branches, functions, lines)
- **Test Files**: 8 comprehensive test suites
- **Total Tests**: 50+ test cases

### Test Suites

| Test File | Coverage |
|-----------|----------|
| `menu.test.js` | Mobile hamburger menu, sidebar overlay interactions |
| `dom.test.js` | DOM structure, element IDs, class names |
| `accessibility.test.js` | WCAG compliance, ARIA labels, keyboard navigation |
| `about-me.test.js` | About section functionality |
| `hobbies.test.js` | Hobbies section content |
| `navigation-phrases.test.js` | Animated phrase elements |
| `personal-projects.test.js` | Personal projects grid and links |
| `twitterizer.test.js` | Hashtag generator with mocked APIs |

### TDD Workflow

The project follows Test-Driven Development (Red-Green-Refactor):

1. **RED**: Write a failing test that describes desired behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code while keeping tests green

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## Development Workflow

### Prerequisites
- Podman or Docker (for containerized testing)
- Node.js 18+ (for local npm commands)
- A code editor (VS Code recommended)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/arunhotra/arunganti.git
   cd arunganti
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start local server:
   ```bash
   python3 -m http.server 8000
   ```

4. Open browser:
   ```bash
   open http://localhost:8000
   ```

5. For TDD workflow, run tests in watch mode:
   ```bash
   ./test-watch.sh
   ```

### Adding New Features

1. Write a test first in `__tests__/` directory
2. Run tests in watch mode: `./test-watch.sh`
3. See the test fail (RED phase)
4. Implement the feature in appropriate file
5. See the test pass (GREEN phase)
6. Refactor if needed while keeping tests passing
7. Commit changes when tests are green

## Deployment

### Static Hosting
The site is a pure static website and can be deployed to any static hosting:
- **GitHub Pages** (free)
- **Netlify** (free with custom domain)
- **Vercel** (free with custom domain)
- **Cloudflare Pages** (free)

### Cloudflare Workers
Twitterizer tool uses Cloudflare Workers for API proxy:
- Configuration: `wrangler.toml`
- Deployment: `wrangler deploy`

## Dependencies

### Development
```json
{
  "jest": "^29.7.0",
  "@testing-library/dom": "^10.4.0",
  "@testing-library/jest-dom": "^6.6.3",
  "jest-axe": "^9.0.0",
  "jest-environment-jsdom": "^29.7.0"
}
```

### Runtime
- No runtime dependencies
- Pure HTML/CSS/JavaScript (client-side only)

## Architecture Notes

### Fixed Background Pattern
The `.hero-background` element uses `position: fixed` to create a parallax-like effect where the background image stays in place while content scrolls over it.

### Responsive Background Images
- **Desktop/Tablets**: `pics/alternate-main.jpg` (3.5MB)
- **Mobile**: `pics/main-page.jpg` (3.2MB)
- Both images are web-optimized JPG format

### Navigation
The `.top-nav` is fixed at the top and uses smooth scroll anchors to navigate between sections. Each section has `min-height: 100vh` to create full-page sections.

### Mobile Navigation
- **Desktop (>480px)**: Glassmorphism navigation bar visible
- **Mobile (≤480px)**: Hamburger menu visible, desktop nav hidden
- Sidebar menu slides in from right with overlay backdrop
- JavaScript handles open/close interactions

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD)
4. Make your changes
5. Ensure all tests pass (`./test.sh`)
6. Commit your changes
7. Push to the branch
8. Open a Pull Request

## Performance Optimization

### Image Optimization
- Background images: Optimized JPG format (~3.2-3.5MB each)
- Project screenshots: PNG format for transparency where needed
- Lazy loading for off-screen images

### CSS Optimization
- ~2,500 lines of optimized CSS
- Mobile-first responsive design
- Minimal animations for performance
- Hardware-accelerated transforms

### JavaScript Optimization
- Vanilla JavaScript (no frameworks)
- Event delegation for menu interactions
- Local storage caching for user preferences
- API calls mocked in tests

## Accessibility

This project is built with accessibility in mind:

- **Semantic HTML**: Proper use of semantic elements
- **ARIA Labels**: Labels for interactive elements
- **Keyboard Navigation**: Fully keyboard accessible
- **WCAG 2.1 Compliance**: AA level compliance
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Clear focus indicators

## License

ISC License - See package.json for details

## Contact & Links

- **GitHub**: [arunhotra](https://github.com/arunhotra)
- **Issues**: [GitHub Issues](https://github.com/arunhotra/arunganti/issues)
- **Portfolio**: [arunganti.dev](https://arunganti.dev)

## Recent Updates

- Added cache busting to Twitterizer script tag
- Triggered Cloudflare deployment with version bump
- Fixed DOM initialization timing issue in Twitterizer
- Added Free and Pro versions to Twitterizer hashtag generator
- Removed placeholder tiles and centered Twitterizer project

---

**Built with ❤️ using modern web technologies and Test-Driven Development practices.**
