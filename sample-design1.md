# Sample Design 1: Daniel Cela Portfolio

**Source:** [danielcela.com](https://danielcela.com/)

## Overview

A modern, professional portfolio website for a Senior Full Stack Developer specializing in React, Next.js, and scalable web solutions. The design emphasizes clean aesthetics with smooth animations.

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | v16.x | React framework with App Router |
| **React** | v19.x | UI library |
| **TypeScript** | - | Type safety (60% of codebase) |
| **Vercel** | - | Deployment platform |

### Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | v4.x - Utility-first CSS framework |
| **PostCSS** | CSS processing |
| **@tailwindcss/forms** | Form styling utilities |
| **@tailwindcss/typography** | Prose styling |

### Animation
| Technology | Version | Purpose |
|------------|---------|---------|
| **motion** | v12.x | Modern animation library (formerly framer-motion) |

### Database & Backend
| Technology | Purpose |
|------------|---------|
| **Vercel Postgres** | PostgreSQL database |
| **Drizzle ORM** | Type-safe database ORM |
| **better-auth** | Authentication |

### Content Management
| Technology | Purpose |
|------------|---------|
| **MDX** | Markdown + JSX for blog content (~35% of codebase) |
| **next-mdx-remote** | MDX rendering |
| **gray-matter** | Front matter parsing |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| **@headlessui/react** | Accessible UI components |
| **next-intl** | Internationalization (multi-language support) |
| **next-themes** | Dark/light theme management |
| **lucide-react** | Icon library |
| **swr** | Data fetching & caching |
| **zod** | Schema validation |
| **clsx** | Conditional class names |
| **sharp** | Image optimization |
| **rss** | RSS feed generation |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── page.tsx       # Home page
│   │   ├── projects/      # Projects section
│   │   └── blog/          # Blog section
│   ├── api/               # API routes
│   ├── robots.tsx         # SEO robots
│   └── sitemap.tsx        # Sitemap generation
├── components/            # Reusable React components
├── content/               # MDX blog content
├── lib/                   # Utilities & external service integrations
├── styles/                # Global CSS (minimal, mostly Tailwind)
└── messages/              # i18n translation objects

public/                    # Static assets (fonts, images)

Configuration Files:
├── drizzle.config.ts      # Database ORM setup
├── tailwind.config.ts     # Tailwind customization
├── next.config.mjs        # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── .env.example           # Environment variables template
```

---

## Key Features

### 1. Projects Section
- Grid-based layout displaying portfolio projects
- Project cards with hover animations
- Technology tags/badges
- External links to live demos and GitHub repos
- Image previews with lazy loading

### 2. Animation Patterns (using motion library)
```typescript
// Example: Fade-in animation on scroll
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>

// Example: Staggered children animation
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      {item}
    </motion.li>
  ))}
</motion.ul>
```

### 3. Internationalization
- Multi-language support via `next-intl`
- Locale-based routing (`/en/`, `/de/`, etc.)
- Translation objects in `src/messages/`

### 4. Theme Support
- Dark/light mode toggle
- System preference detection
- Persistent theme storage

### 5. Blog System
- MDX-powered blog posts
- Syntax highlighting for code blocks
- Reading time estimation
- RSS feed generation

---

## Design Patterns

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Flexible grid layouts
- Optimized images with Next.js Image component

### Performance Optimizations
- Static site generation (SSG) where possible
- Image optimization with `sharp`
- Font optimization
- Code splitting via Next.js

### SEO
- Dynamic meta tags
- Open Graph images
- Sitemap generation
- Robots.txt configuration

---

## Related Projects by Same Developer

### 3Fiber-Horse-Rider
**Live:** [horse-rider.netlify.app](https://horse-rider.netlify.app)

A portfolio for a Portuguese equestrian champion featuring:
- **React Three Fiber** - 3D graphics in React
- **Three.js** - WebGL rendering
- **Vite** - Build tool
- Interactive 3D models
- Immersive 3D experience

This demonstrates the developer's capability with advanced 3D web technologies.

---

## Source Code Reference

| Repository | Description |
|------------|-------------|
| [CelaDaniel/Portfolio](https://github.com/CelaDaniel/Portfolio) | Fork of the portfolio template |
| [alex289/Portfolio](https://github.com/alex289/Portfolio) | Original template (MIT License) |
| [CelaDaniel/3Fiber-Horse-Rider](https://github.com/CelaDaniel/3Fiber-Horse-Rider) | 3D portfolio project |

---

## Implementation Notes

### Getting Started
```bash
# Clone the template
git clone https://github.com/alex289/Portfolio.git
cd Portfolio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
pnpm dev
```

### Required Environment Variables
- Database connection (Vercel Postgres)
- Authentication secrets
- API keys for external services

### Customization Points
1. **Content:** Update MDX files in `src/content/`
2. **Styling:** Modify `tailwind.config.ts`
3. **Components:** Customize components in `src/components/`
4. **i18n:** Add/modify translations in `src/messages/`

---

## Inspiration

The portfolio design is inspired by [Lee Robinson's portfolio](https://leerob.io/), a well-known developer advocate at Vercel known for elegant, performant portfolio designs.

---

## License

The original template is MIT licensed, allowing for free use with attribution. Personal information (resume, blog posts, images) should be removed before using.

---

*Document created: November 2025*
*For reference in future portfolio development*
