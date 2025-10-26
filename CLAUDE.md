# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML/CSS portfolio website featuring a single-page design with a glassmorphism aesthetic. The site includes sections for About Me, Projects, Hobbies, and Resume, with smooth scrolling navigation.

## File Structure

- `index.html` - Main HTML file containing the page structure and all content sections
- `styles.css` - All styling including glassmorphism effects, responsive design, and animations
- `pics/` - Image assets directory
  - Background images are referenced as `pics/alternate-main.jpg` in the CSS
  - Currently contains HEIC files that need conversion to web formats (JPG/PNG/WebP)

## Development

This is a static website with no build process. To develop:

1. Open `index.html` directly in a browser, or
2. Use a local server: `python3 -m http.server 8000` (then visit http://localhost:8000)

## Design System

**Glassmorphism Pattern:**
- Translucent backgrounds use `rgba(255, 255, 255, 0.1-0.15)`
- Backdrop blur: `backdrop-filter: blur(10px)` and `-webkit-backdrop-filter: blur(10px)`
- Borders: `1px solid rgba(255, 255, 255, 0.2-0.3)`
- Box shadows: `0 8px 32px 0 rgba(0, 0, 0, 0.2-0.3)`

**Color Scheme:**
- Text: White with varying opacity (0.5-1.0)
- Backgrounds: Semi-transparent white overlays on background image

**Responsive Breakpoints:**
- `768px` - Tablet adjustments
- `480px` - Mobile adjustments (hides nav separators)

## Architecture Notes

**Fixed Background Pattern:**
The `.hero-background` element uses `position: fixed` to create a parallax-like effect where the background image stays in place while content scrolls over it.

**Navigation:**
The `.top-nav` is fixed at the top and uses smooth scroll anchors to navigate between sections. Each section has `min-height: 100vh` to create full-page sections.

**First Section Behavior:**
The `#about` section has special styling where the `.content-card` is hidden (`display: none`) to allow the background image to display without obstruction on the hero/landing view.

## Image Format Issue

The `pics/` directory contains HEIC files (Apple's image format) which are not web-compatible. The CSS references `pics/alternate-main.jpg` but this file doesn't exist yet. Images need to be converted from HEIC to JPG/PNG/WebP format for web display.
