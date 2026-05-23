# 🎓 Teacher's Aide - An AI-powered Teaching assitant

An intelligent AI-powered platform designed to help educators create, manage, and optimize lesson plans efficiently. Teacher's Aide AI leverages modern web technologies and artificial intelligence to streamline educational content creation and lesson delivery.

---

<!-- ## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Project Configuration](#project-configuration)
- [Usage Guide](#usage-guide)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [Contact & Support](#contact--support)
- [License](#license)

--->

## Project Overview

**Teacher's Aide AI** is a web application built to assist educators in generating comprehensive lesson plans and educational materials. The platform combines the power of artificial intelligence with an intuitive user interface to help teachers save time and create engaging, well-structured lessons for their students.

### Key Objectives

- Simplify lesson plan creation with AI-powered suggestions
- Provide an intuitive dashboard for managing lessons
- Enable file uploads for educational content
- Deliver a responsive, modern user experience
- Securely store and retrieve lesson data

---

## Features

✨ **Core Features:**

- **AI-Powered Lesson Generation**: Automatically generate comprehensive lesson plans
- **Lesson Dashboard**: View, edit, and manage all created lessons
- **File Upload Support**: Import educational materials and documents
- **Interactive UI**: Modern, responsive interface built with React and Tailwind CSS
- **Dark/Light Theme Support**: Toggle between light and dark modes
- **Toast Notifications**: Real-time feedback for user actions
- **PDF Export**: Download lesson plans as PDF documents
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices

---

## Repository Structure

```
teacher-s-aide-ai/
├── src/
│   ├── components/
│   │   ├── ui/                          # Reusable shadcn UI components
│   │   ├── FileUpload.tsx               # File upload component
│   │   ├── Footer.tsx                   # Application footer
│   │   ├── Header.tsx                   # Navigation header with theme toggle
│   │   ├── Hero.tsx                     # Landing page hero section
│   │   ├── LessonDashboard.tsx          # Main lesson management dashboard
│   │   ├── LessonGenerator.tsx          # AI-powered lesson generation interface
│   │   ├── NavLink.tsx                  # Navigation link component
│   │   └── StepIndicator.tsx            # Multi-step process indicator
│   ├── hooks/                           # Custom React hooks
│   ├── integrations/                    # External service integrations
│   ├── lib/                             # Utility functions and helpers
│   ├── pages/
│   │   ├── Index.tsx                    # Main page router
│   │   └── NotFound.tsx                 # 404 page
│   ├── types/                           # TypeScript type definitions
│   ├── App.tsx                          # Main App component with routing
│   ├── App.css                          # Application styles
│   ├── main.tsx                         # Application entry point
│   ├── index.css                        # Global styles
│   └── vite-env.d.ts                    # Vite environment types
├── public/                              # Static assets
├── supabase/                            # Supabase configuration and migrations
├── index.html                           # HTML template
├── package.json                         # Project dependencies
├── package-lock.json                    # Dependency lock file
├── bun.lock & bun.lockb                 # Bun package manager lock files
├── vite.config.ts                       # Vite build configuration
├── tsconfig.json                        # TypeScript configuration
├── tailwind.config.ts                   # Tailwind CSS configuration
├── postcss.config.js                    # PostCSS configuration
├── eslint.config.js                     # ESLint linting rules
├── components.json                      # shadcn component configuration
├── .env                                 # Environment variables (not committed)
├── .gitignore                           # Git ignore rules
└── README.md                            # This file
```

---

## Tech Stack

### Frontend Framework
- **React** (v18.3.1) - UI library
- **TypeScript** (v5.8.3) - Type-safe JavaScript
- **Vite** (v5.4.19) - Lightning-fast build tool and dev server

### UI & Styling
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### State Management & Data Fetching
- **TanStack Query** (React Query) (v5.83.0) - Server state management
- **Zod** (v3.25.76) - TypeScript-first schema validation

### Forms & Input Handling
- **React Hook Form** (v7.61.1) - Performant form handling
- **@hookform/resolvers** (v3.10.0) - Form validation resolvers

### Backend & Database
- **Supabase** (v2.89.0) - Open-source Firebase alternative
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication

### Routing
- **React Router DOM** (v6.30.1) - Client-side routing

### Utilities
- **Date-fns** (v3.6.0) - Date manipulation
- **jsPDF** (v3.0.4) - PDF generation
- **Recharts** (v2.15.4) - Data visualization library
- **Sonner** (v1.7.4) - Toast notifications
- **next-themes** (v0.3.0) - Theme management

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS transformation
- **Autoprefixer** - Cross-browser CSS support
- **Tailwind Typography** - Beautiful typography styling

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **A Supabase Account** - [Sign up free](https://supabase.com)

### Optional
- **Bun** - Modern JavaScript runtime (alternative to npm/yarn)

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/MoshoodSO/teacher-s-aide-ai.git
cd teacher-s-aide-ai
```

### Step 2: Install Dependencies

Using **npm**:
```bash
npm install
```

Using **yarn**:
```bash
yarn install
```

Using **bun**:
```bash
bun install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

Get these values from your Supabase project:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project ID, Anon Key, and Project URL

### Step 4: Verify Installation

```bash
npm run lint
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

The development server includes:
- **Hot Module Replacement (HMR)** - Instant code updates without page reload
- **Fast Refresh** - Preserves component state during edits
- **Source Maps** - Easy debugging in browser DevTools

### IDE Setup

**For VS Code:**
1. Install the ESLint extension
2. Install the Tailwind CSS IntelliSense extension
3. Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript and CSS
- Code splitting
- Asset optimization
- Source map generation (for debugging)

### Development Build

```bash
npm run build:dev
```

### Preview Production Build Locally

```bash
npm run preview
```

Access the preview at `http://localhost:4173`

### Deploy to Production

**Option 1: Lovable Platform** (Recommended for this project)
1. Go to [Lovable](https://lovable.dev)
2. Connect your GitHub repository
3. Click "Share → Publish"
4. Follow the deployment wizard

**Option 2: Manual Deployment**

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
1. Add to `vite.config.ts`: `base: '/teacher-s-aide-ai/'`
2. Build and push to GitHub
3. Enable GitHub Pages in repository settings

---

## Project Configuration

### Vite Configuration (`vite.config.ts`)
- React plugin with SWC for fast transpilation
- Optimized for development and production

### TypeScript Configuration (`tsconfig.json`)
- Strict mode enabled
- ES2020 target
- Module resolution configured for imports

### Tailwind CSS (`tailwind.config.ts`)
- Extended color palette
- Custom animations
- Responsive breakpoints

### ESLint (`eslint.config.js`)
- React and React Hooks rules
- TypeScript support
- Code quality standards

### shadcn Components (`components.json`)
- Pre-configured UI component settings
- Consistent component styling

---

## Usage Guide

### Getting Started

1. **Launch the Application**
   - Start dev server: `npm run dev`
   - Open browser to `http://localhost:5173`

2. **Navigate the Interface**
   - **Header**: Toggle between light/dark theme
   - **Hero Section**: Introduction and call-to-action
   - **Lesson Generator**: Create new lessons with AI assistance
   - **Dashboard**: Manage existing lessons
   - **Footer**: Additional information and links

### Creating a Lesson

1. Click on the **"Generate Lesson"** button
2. Enter lesson details:
   - Subject
   - Grade level
   - Duration
   - Learning objectives
3. Upload supporting materials (optional)
4. Click **"Generate with AI"**
5. Review and edit the generated content
6. Save the lesson to your dashboard
7. Export as PDF if needed

### Managing Lessons

1. Access the **Lesson Dashboard**
2. View all your created lessons
3. Search and filter lessons by subject or grade
4. Edit existing lessons
5. Download lessons as PDF
6. Delete lessons you no longer need

### File Upload

1. Use the **File Upload** component in the Lesson Generator
2. Supported formats: PDF, DOCX, TXT, images
3. Files are processed and content is extracted
4. Content is used to enhance lesson generation

---

## Available Scripts

### Development
```bash
npm run dev          # Start dev server with HMR
npm run dev:server   # Start dev server (if separate backend exists)
```

### Building
```bash
npm run build        # Production build
npm run build:dev    # Development mode build
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues automatically
```

### Type Checking
```bash
npm run type-check   # Check TypeScript types
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier | `xcmdifjsuydsnpgrhnvr` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anonymous API key for client-side access | `eyJhbGc...` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xcmdifjsuydsnpgrhnvr.supabase.co` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_TIMEOUT` | API request timeout in ms | `30000` |
| `VITE_LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |

⚠️ **Important**: Never commit `.env` to version control. Use `.env.example` for template.

---

## API Integration

### Supabase Integration

The application integrates with Supabase for:

**Database Operations:**
- Store lesson plans
- Manage user preferences
- Cache generated content

**Authentication:**
- User registration and login
- Session management
- Role-based access control

**Real-time Features:**
- Live lesson updates
- Collaborative editing (future feature)

### Example: Querying Lessons
```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .order('created_at', { ascending: false })
```

---

## Contributing

### Contribution Guidelines

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/teacher-s-aide-ai.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Use TypeScript for type safety
   - Write meaningful commit messages

4. **Run Tests & Linting**
   ```bash
   npm run lint
   npm run build
   ```

5. **Commit Your Changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Link any related issues
   - Request review from maintainers

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use functional components with hooks
- Keep components small and focused
- Add JSDoc comments for complex functions

---

## Contact & Support

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/MoshoodSO/teacher-s-aide-ai/issues)
- **Discussions**: [Join community discussions](https://github.com/MoshoodSO/teacher-s-aide-ai/discussions)

### Contact Information

| Role | Contact | Details |
|------|---------|---------|
| **Developer** | [@MoshoodSO](https://github.com/MoshoodSO) | Project Owner |
| **Repository** | teacher-s-aide-ai | GitHub Repository |
| **Email** | [Create issue for inquiry] | Use GitHub Issues |

### Support Channels

- 📧 **GitHub Issues**: Best for bug reports and feature requests
- 💬 **Discussions**: For questions and feature discussions
- 📖 **Documentation**: Check README and code comments

---

## Troubleshooting

### Common Issues

**Issue: Port 5173 already in use**
```bash
npm run dev -- --port 3000
```

**Issue: Supabase connection fails**
- Verify `.env` variables are correct
- Check Supabase project status
- Ensure network connectivity

**Issue: Build fails with TypeScript errors**
```bash
npm run lint:fix
npm run build
```

**Issue: Components not rendering**
- Clear browser cache (Ctrl+Shift+Del)
- Restart dev server
- Check browser console for errors

---

## Roadmap

### Planned Features (v2.0)
- [ ] Collaborative lesson planning
- [ ] Integration with Learning Management Systems (LMS)
- [ ] Advanced analytics and student progress tracking
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Real-time collaboration with other teachers
- [ ] Integration with content libraries
- [ ] AI-powered student assessments

---

## License

This project is open source. License details will be specified in a `LICENSE` file.

---

## Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Useful Links
- [Lovable Platform](https://lovable.dev)
- [GitHub Repository](https://github.com/MoshoodSO/teacher-s-aide-ai)
- [Supabase Dashboard](https://app.supabase.com)

---

## Version Information

| Component | Version |
|-----------|---------|
| Node.js | v16+ |
| React | 18.3.1 |
| TypeScript | 5.8.3 |
| Vite | 5.4.19 |
| Tailwind CSS | 3.4.17 |

<!-- **Last Updated**: April 23, 2026
**Repository**: MoshoodSO/teacher-s-aide-ai
**Status**: Active Development -->

---

**Happy teaching with Teacher's Aide AI! 🎓✨**
