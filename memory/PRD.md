# IMPAR Survey Platform - PRD

## Original Problem Statement
Build a survey website branded "IMPAR" allowing owners to create/manage surveys and registered users to answer them. Features include content highlighting system, comprehensive user profile management, admin-only pages for user and suggestion management, and social sharing capabilities.

## User Choices
- **Authentication**: JWT-based custom auth (email/password)
- **Survey question types**: Multiple choice, text, rating, yes/no, checkbox (multiple selections)
- **Content highlighting**: Featured surveys on homepage + important text/questions within surveys
- **Social sharing**: All platforms (Facebook, Twitter/X, LinkedIn, copy link, email)
- **Design**: Black & White brand colors (primary: #000000), Source Serif 4 for headings, Inter for body, clean professional design
- **Language**: Portuguese (Portugal) - All UI text translated to PT-PT

## Architecture

### Backend (FastAPI + MongoDB)
- **Auth**: JWT tokens with 7-day expiration, bcrypt password hashing
- **Models**: User, Survey, Question, Response, Suggestion, TeamApplication, PasswordRecovery
- **Roles**: owner (first user), admin (promoted by owner), user (default)

### Frontend (React + Tailwind + Shadcn UI)
- **Design System**: Swiss Editorial, monochrome palette, sharp edges
- **Pages**: Landing, Login, Register, ForgotPassword, Dashboard, Survey Builder, Take Survey, Results, Profile, Admin
- **Components**: Navbar, SurveyCard, ShareButtons, Question types

## User Personas
1. **Platform Owner**: Full control - create/manage surveys, manage users, view all suggestions, promote admins, reset user passwords
2. **Admin**: Create/manage surveys, view suggestions, moderate content, see password recovery requests
3. **User**: Answer surveys, suggest new surveys, manage own profile, change password

## Core Requirements
- [x] User registration/login with JWT
- [x] Survey CRUD with all question types (multiple_choice, text, rating, yes_no, checkbox)
- [x] Survey publishing/unpublishing
- [x] Featured surveys on homepage
- [x] Question highlighting within surveys
- [x] Survey taking and response submission
- [x] Survey analytics and results
- [x] User profile management with password change
- [x] Admin dashboard (user management, surveys, suggestions)
- [x] Suggestion system (structured with questions)
- [x] Social sharing (all platforms)
- [x] Password recovery via admin-provided codes
- [x] Route protection (login required for most pages)
- [x] Admin CSV export of all users
- [x] Team application system
- [x] One response per user per survey (updates existing)

## What's Been Implemented

**Date: 2025-02-02**

### Password Change Fix
- Fixed bug where password change from profile page was failing
- Switched from `fetch` to `axios` for proper error handling
- Endpoint: `/api/auth/change-password` (PUT)

### Password Recovery System (NEW)
- User requests recovery on `/forgot-password` page by entering email
- System generates 8-character alphanumeric code (valid 24 hours)
- Admin sees pending requests in Admin Panel -> "Recuperação" tab
- Admin provides code to user (via phone, message, etc.)
- User enters code on `/forgot-password` step 2 to reset password
- Endpoints:
  - `POST /api/auth/request-recovery` - User requests recovery
  - `POST /api/auth/reset-with-code` - User resets with code
  - `GET /api/admin/password-recovery-requests` - Admin sees requests
  - `DELETE /api/admin/password-recovery-requests/{id}` - Admin deletes request

### Previous Implementations
- JWT authentication with owner role assignment
- Survey CRUD with 5 question types
- Admin panel with user management, surveys, suggestions, team applications
- User profile editing with personal data
- Protected routes requiring authentication
- Public results page (percentages only, counts for admins)
- Survey numbering and chronological ordering
- Dynamic registration form with district/council/parish

## Test Credentials
- **Owner**: owner@test.com / password123
- **User**: testuser@test.com / recovered123

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Basic auth flow
- [x] Survey creation and management
- [x] Survey taking
- [x] Password change from profile
- [x] Password recovery system

### P1 - Important
- [ ] Email notifications for new responses
- [ ] Survey response export to CSV
- [ ] Survey templates

### P2 - Nice to Have
- [ ] Dark mode toggle
- [ ] Email-based password recovery (requires email service integration)
- [ ] Response quotas
- [ ] Survey embedding (iframe code)
- [ ] Advanced filtering and sorting for survey lists

## Next Tasks
1. Email invitation system to invite users to surveys
2. Survey response export to CSV
3. Notification system for new survey responses
