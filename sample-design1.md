# Sample Design 1: Project Cards Component

**Source:** [danielcela.com/#projects](https://danielcela.com/#projects)
**Original Repo:** [alex289/Portfolio](https://github.com/alex289/Portfolio)

---

## Quick Start Dependencies

```bash
npm install lucide-react
# or
pnpm add lucide-react
```

**Required:** Tailwind CSS configured in your project.

---

## TypeScript Interface

```typescript
// types.ts
export interface Project {
  name: string;
  url: string;
  homepage: string;
  description: string;
  stargazerCount: number;
  language: {
    name: string;
    color: string;
  };
}
```

---

## Complete Project Card Component

```tsx
// components/ProjectCard.tsx
import { Github, Home, StarIcon } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  projects: Project[] | null;
}

const ProjectCard = ({ projects }: ProjectCardProps) => {
  return (
    <>
      {projects &&
        projects.length > 0 &&
        projects.map((project: Project, index: number) => (
          <div
            key={index}
            id={project.name}
            className="my-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500"
          >
            {/* Header: Name + Action Buttons */}
            <div className="flex justify-between">
              <div className="flex items-center text-lg font-semibold tracking-tight">
                {project.name}
              </div>

              <div className="gap-4 flex">
                {/* Homepage Link (conditional) */}
                {project.homepage && project.homepage !== '' && (
                  <a
                    href={project.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="homepage"
                  >
                    <Home
                      strokeWidth={1.5}
                      className="relative inline-flex h-10 w-10 justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white sm:w-10"
                    />
                  </a>
                )}

                {/* GitHub Link */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github
                    className="relative inline-flex h-10 w-10 justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white sm:w-10"
                  />
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="mt-1 text-balance">{project.description}</div>

            {/* Footer: Language + Stars */}
            <div className="flex gap-10 mt-3">
              {/* Language with color dot */}
              <div className="flex items-center">
                {project.language.color !== '' && (
                  <div
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: project.language.color }}
                  />
                )}
                {project.language.name}
              </div>

              {/* Star count */}
              {project.stargazerCount > 0 && (
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  {project.stargazerCount}
                </div>
              )}
            </div>
          </div>
        ))}
    </>
  );
};

export default ProjectCard;
```

---

## Usage Example

```tsx
// app/projects/page.tsx
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types';

// Sample data
const projects: Project[] = [
  {
    name: 'My Awesome Project',
    url: 'https://github.com/username/project',
    homepage: 'https://project.example.com',
    description: 'A brief description of what this project does and why it matters.',
    stargazerCount: 42,
    language: {
      name: 'TypeScript',
      color: '#3178c6'
    }
  },
  {
    name: 'Another Project',
    url: 'https://github.com/username/another',
    homepage: '',
    description: 'This one has no homepage link.',
    stargazerCount: 0,
    language: {
      name: 'JavaScript',
      color: '#f1e05a'
    }
  }
];

export default function ProjectsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <ProjectCard projects={projects} />
    </div>
  );
}
```

---

## Key Styling Breakdown

### Card Container
```css
/* Base card styles */
.card {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;           /* rounded-lg */
  border: 1px solid #e5e7eb;       /* border-gray-200 */
  background-color: white;
  padding: 1.5rem;                 /* p-6 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* shadow-sm */
}

/* Hover effect - border turns indigo */
.card:hover {
  border-color: #6366f1;           /* hover:border-indigo-500 */
}

/* Dark mode */
.dark .card {
  border-color: #374151;           /* dark:border-gray-700 */
  background-color: #1f2937;       /* dark:bg-gray-800 */
}
```

### Icon Buttons
```css
/* Icon button base */
.icon-btn {
  display: inline-flex;
  justify-content: center;
  height: 2.5rem;                  /* h-10 */
  width: 2.5rem;                   /* w-10 */
  border-radius: 0.5rem;           /* rounded-lg */
  border: 1px solid #e5e7eb;
  background-color: white;
  padding: 0.5rem 0.75rem;
  color: #9ca3af;                  /* text-gray-400 */
  transition: all 150ms;
}

.icon-btn:hover {
  background-color: #f9fafb;       /* hover:bg-gray-50 */
  color: #374151;                  /* hover:text-gray-700 */
}
```

### Language Color Dot
```css
.language-dot {
  display: inline-block;
  width: 0.75rem;                  /* w-3 */
  height: 0.75rem;                 /* h-3 */
  border-radius: 9999px;           /* rounded-full */
  margin-right: 0.5rem;            /* mr-2 */
  /* backgroundColor set dynamically via style prop */
}
```

---

## Common Language Colors

```typescript
const languageColors: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Rust': '#dea584',
  'Go': '#00ADD8',
  'Java': '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Vue': '#41b883',
  'Svelte': '#ff3e00',
};
```

---

## Vanilla HTML/CSS Version

For static sites without React:

```html
<!-- Project Card -->
<div class="project-card">
  <div class="project-header">
    <h3 class="project-name">Project Name</h3>
    <div class="project-links">
      <a href="#" class="icon-btn" aria-label="Homepage">
        <!-- Home icon SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </a>
      <a href="#" class="icon-btn" aria-label="GitHub">
        <!-- GitHub icon SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
          <path d="M9 18c-4.51 2-5-2-7-2"/>
        </svg>
      </a>
    </div>
  </div>
  <p class="project-description">A brief description of the project.</p>
  <div class="project-footer">
    <div class="project-language">
      <span class="language-dot" style="background-color: #3178c6;"></span>
      TypeScript
    </div>
    <div class="project-stars">
      <!-- Star icon SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="star-icon">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      42
    </div>
  </div>
</div>

<style>
.project-card {
  margin: 0.75rem 0;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: border-color 150ms ease;
}

.project-card:hover {
  border-color: #6366f1;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  margin: 0;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.icon-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #9ca3af;
  text-decoration: none;
  transition: all 150ms ease;
}

.icon-btn:hover {
  background-color: #f9fafb;
  color: #374151;
}

.project-description {
  margin-top: 0.25rem;
  text-wrap: balance;
}

.project-footer {
  display: flex;
  gap: 2.5rem;
  margin-top: 0.75rem;
}

.project-language,
.project-stars {
  display: flex;
  align-items: center;
}

.language-dot {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.star-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  color: #6366f1;
}

/* Dark mode (add class="dark" to body or parent) */
.dark .project-card {
  border-color: #374151;
  background-color: #1f2937;
  color: white;
}

.dark .icon-btn {
  border-color: #6b7280;
  background-color: #1f2937;
}

.dark .icon-btn:hover {
  background-color: #374151;
  color: white;
}
</style>
```

---

## Design Characteristics

| Feature | Implementation |
|---------|---------------|
| **Card hover** | Border changes to indigo-500 (`#6366f1`) |
| **Icon buttons** | 40x40px, rounded, bordered, gray icons that darken on hover |
| **Language indicator** | Colored dot matching GitHub's language colors |
| **Star count** | Only shown if > 0, with indigo star icon |
| **Dark mode** | Full support with `dark:` Tailwind variants |
| **Typography** | `text-balance` for description, `tracking-tight` for name |
| **Spacing** | `p-6` card padding, `gap-4` for icon buttons, `gap-10` for footer items |

---

## Source Reference

- [alex289/Portfolio - projects.tsx](https://github.com/alex289/Portfolio/blob/main/src/components/projects.tsx)
- [alex289/Portfolio - types.ts](https://github.com/alex289/Portfolio/blob/main/src/lib/types.ts)
- License: MIT

---

*Document created: November 2025*
