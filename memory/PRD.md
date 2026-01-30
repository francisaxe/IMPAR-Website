# IMPAR Survey Platform - PRD

## Original Problem Statement
Build a survey website branded "IMPAR" allowing owners to create/manage surveys and registered users to answer them. Features include content highlighting system, comprehensive user profile management, admin-only pages for user and suggestion management, and social sharing capabilities.

## User Choices
- **Authentication**: JWT-based custom auth (email/password)
- **Survey question types**: Basic (multiple choice, text, rating scale)
- **Content highlighting**: Featured surveys on homepage + important text/questions within surveys
- **Social sharing**: All platforms (Facebook, Twitter/X, LinkedIn, copy link, email)
- **Design**: Black & White brand colors (primary: #000000), Source Serif 4 for headings, Inter for body, clean professional design
- **Language**: Portuguese (Portugal) - All UI text translated to PT-PT

## Architecture

### Backend (FastAPI + MongoDB)
- **Auth**: JWT tokens with 7-day expiration, bcrypt password hashing
- **Models**: User, Survey, Question, Response, Suggestion
- **Roles**: owner (first user), admin (promoted by owner), user (default)

### Frontend (React + Tailwind + Shadcn UI)
- **Design System**: Swiss Editorial, monochrome palette, sharp edges
- **Pages**: Landing, Login, Register, Dashboard, Survey Builder, Take Survey, Results, Profile, Admin
- **Components**: Navbar, SurveyCard, ShareButtons, Question types

## User Personas
1. **Platform Owner**: Full control - create/manage surveys, manage users, view all suggestions, promote admins
2. **Admin**: Create/manage surveys, view suggestions, moderate content
3. **User**: Create surveys, respond to surveys, manage own profile

## Core Requirements (Static)
- [x] User registration/login with JWT
- [x] Survey CRUD with multiple question types
- [x] Survey publishing/unpublishing
- [x] Featured surveys on homepage
- [x] Question highlighting within surveys
- [x] Survey taking and response submission
- [x] Survey analytics and results
- [x] User profile management
- [x] Admin dashboard (user management)
- [x] Suggestion system
- [x] Social sharing (all platforms)

## What's Been Implemented
**Date: 2025-01-30**

### Backend
- JWT authentication with owner role assignment for first user
- Survey CRUD with all question types (multiple_choice, text, rating)
- Optional authentication for survey responses
- Admin endpoints for user/suggestion management
- Survey analytics aggregation

### Frontend
- Clean black/white Swiss design with Source Serif 4/Inter fonts
- Complete survey builder with question types
- Survey taking interface with progress tracking
- Dashboard with stats cards
- Admin panel with user management and suggestions
- Social sharing via dropdown menu
- Content highlighting (featured badge, highlighted questions)

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Basic auth flow
- [x] Survey creation and management
- [x] Survey taking

### P1 - Important
- [ ] Email notifications for new responses
- [ ] Export survey results to CSV
- [ ] Survey templates

### P2 - Nice to Have
- [ ] Dark mode toggle
- [ ] Survey scheduling (start/end dates)
- [ ] Response quotas
- [ ] Survey embedding (iframe code)

## Next Tasks
1. Add survey response export functionality
2. Implement survey templates for quick creation
3. Add email notifications for survey owners
