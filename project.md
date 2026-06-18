# MTK Clothing Brand - Professional E-Commerce System Specification

---

# 1. PROJECT OVERVIEW

## What is MTK?

MTK is a modern, production-grade **e-commerce clothing brand website** designed for:

- Men’s clothing
- Women’s clothing
- Kids clothing
- Accessories (future expansion)

The platform is designed to function like a real-world online store (similar to Zara, H&M, or Shopify stores), with:

- Secure authentication system
- Product management system
- Shopping cart and checkout flow
- Admin dashboard for business control
- Scalable backend architecture

---

# 2. PROJECT GOAL

The main goal of MTK is to build a:

- Secure
- Scalable
- Fast
- Production-ready
- Mobile responsive

full-stack e-commerce platform with industry-level architecture and security.

---

# 3. TECH STACK

## Frontend

- Next.js (React Framework)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Axios (API requests)

## Backend

- Node.js
- Express.js
- REST API Architecture

## Database

- PostgreSQL (Recommended)
OR
- MongoDB (Alternative)

ORM:

- Prisma ORM (Preferred)

## Authentication

- JWT (JSON Web Tokens)
- bcrypt (Password Hashing)
- HttpOnly Cookies

## File Storage

- Cloudinary (Images)
OR
- Local Secure Storage (Development)

## Payment Gateway

- Stripe (International)
- JazzCash / EasyPaisa (Pakistan)

## Deployment

- Frontend: Vercel
- Backend: Render / Railway
- Database: Supabase / Neon PostgreSQL
- CDN & Security: Cloudflare

---

# 4. SYSTEM ARCHITECTURE

## High-Level Flow

User Browser  
→ HTTPS (SSL/TLS)  
→ Cloudflare (CDN + WAF + DDoS Protection)  
→ Next.js Frontend  
→ Express.js Backend API  
→ Authentication Middleware  
→ Prisma ORM  
→ PostgreSQL Database

---

# 5. CORE FEATURES

## User Features

- User registration & login
- Google authentication (optional)
- Browse products
- Product filtering (price, category, size, color)
- Product details page
- Add to cart
- Wishlist system
- Checkout system
- Order tracking
- User profile dashboard
- Review & ratings system

---

## Admin Features

- Add / edit / delete products
- Manage inventory
- Manage orders
- Manage users
- View analytics dashboard
- Manage coupons & discounts
- Upload product images

---

# 6. SECURITY REQUIREMENTS (OWASP + INDUSTRY LEVEL)

MTK must follow **enterprise-level security standards**.

---

## 6.1 SQL Injection Protection

- Use parameterized queries
- Use Prisma ORM
- Never trust raw SQL input

---

## 6.2 XSS Protection

- Sanitize all user inputs
- Use Helmet middleware
- Avoid dangerouslySetInnerHTML in React

---

## 6.3 CSRF Protection

- Use CSRF tokens
- Secure cookies (HttpOnly, SameSite)
- Validate request origins

---

## 6.4 Authentication Security

- Password hashing using bcrypt
- JWT-based authentication
- HttpOnly cookies (no localStorage storage)
- Session expiration handling

---

## 6.5 Access Control (RBAC)

- Role-based access:
  - User
  - Admin
- Protect admin routes

---

## 6.6 File Upload Security

- Allow only: jpg, png, webp
- Limit file size (max 5MB)
- Scan uploads for malicious content
- Store outside public execution path

---

## 6.7 API Security

- Rate limiting (express-rate-limit)
- Input validation (Zod)
- Request throttling

---

## 6.8 Password Attack Protection

- Login attempt limiting
- Strong password policy
- Optional 2FA (future upgrade)

---

## 6.9 Session Security

- HttpOnly cookies
- Secure cookies
- SameSite strict policy
- Auto logout after inactivity

---

## 6.10 Server Security

- Hide .env file
- Secure environment variables
- No secret exposure in frontend
- Proper .gitignore setup

---

## 6.11 DDoS Protection

- Cloudflare integration
- Bot filtering
- Traffic rate limiting
- CDN caching

---

## 6.12 Security Headers

Use Helmet:

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

---

## 6.13 Logging & Monitoring

- Log login attempts
- Track API usage
- Monitor errors
- Admin activity logs

---

# 7. DATABASE DESIGN (OVERVIEW)

## Users Table

- id
- name
- email
- password
- role
- address
- createdAt

## Products Table

- id
- name
- description
- price
- category
- images
- stock
- rating

## Orders Table

- id
- userId
- products
- totalPrice
- status
- paymentStatus
- createdAt

---

# 8. PERFORMANCE OPTIMIZATION

- Image optimization (Next.js Image component)
- Lazy loading
- CDN caching
- Server-side rendering (SSR)
- Code splitting

---

# 9. DEPLOYMENT STRATEGY

- Frontend → Vercel
- Backend → Render / Railway
- Database → Supabase / Neon
- CDN → Cloudflare

---

# 10. AI BUILD PROMPT (FOR CLAUDE CODE / GPT / ANY AI BUILDER)

Use this prompt to generate the full MTK system:

---

## MASTER AI PROMPT

```text
You are a Senior Full-Stack Software Architect and Cybersecurity Engineer.

Your task is to build a production-level e-commerce clothing brand website called MTK.

---

PROJECT DESCRIPTION:

MTK is a modern online clothing brand for:
- Men
- Women
- Kids

It must look like a real-world commercial platform (Zara / H&M level).

---

TECH STACK:

Frontend:
- Next.js (React)
- Tailwind CSS
- Framer Motion

Backend:
- Node.js
- Express.js

Database:
- PostgreSQL with Prisma ORM

Authentication:
- JWT authentication
- bcrypt password hashing
- HttpOnly cookies

Storage:
- Cloudinary or secure file storage

Deployment:
- Vercel (frontend)
- Render/Railway (backend)
- Cloudflare (CDN + security)

---

FEATURES:

User Side:
- Authentication (register/login/logout)
- Product browsing
- Filters (price, category, size, color)
- Cart system
- Wishlist system
- Checkout system
- Order tracking
- Profile page
- Reviews and ratings

Admin Side:
- Product management (CRUD)
- Order management
- User management
- Analytics dashboard
- Coupon system

---

SECURITY REQUIREMENTS (MANDATORY):

You MUST implement:

- Protection against SQL Injection (use Prisma or parameterized queries)
- Protection against XSS (sanitize inputs, avoid unsafe rendering)
- CSRF protection using tokens
- JWT authentication with HttpOnly cookies
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Rate limiting for APIs
- Input validation using Zod
- Secure file upload system (restrict file types and size)
- Security headers using Helmet
- DDoS protection via Cloudflare
- Environment variable security (.env must never be exposed)

---

ARCHITECTURE REQUIREMENT:

Follow this flow:

User → HTTPS → Cloudflare → Next.js → Express API → Prisma ORM → PostgreSQL

---

DEVELOPMENT RULES:

- Build the project step-by-step
- Do not generate everything at once
- Start from project setup
- Then authentication
- Then product system
- Then cart/checkout
- Then admin dashboard
- Ensure production-level code quality

---

FINAL GOAL:

A fully functional, secure, scalable e-commerce clothing brand platform named MTK.