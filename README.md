# 💸 Monetra — Transparent Neo-Brutalist Crowdfunding Platform

<div align="center">

![Monetra Cover](public/images/donation11.jpg)

**A high-trust, neo-brutalist community crowdfunding platform built for verified medical and emergency giving.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](https://monetra-rho.vercel.app/) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Admin Verification](#-trust-desk--admin-verification) • [Setup Guide](#-getting-started)

</div>

---

## 🌟 Overview

**Monetra** is a production-grade, document-verified crowdfunding platform engineered to eliminate donor skepticism in online giving. Built with a bold **Neo-Brutalist aesthetic** (chunky borders, solid offset shadows, and editorial typography), Monetra pairs visual identity with strict **Trust Desk verification** — ensuring every rupee contributed reaches patients and families backed by hospital estimates and verified IDs.

---

## ✨ Features & Architecture

### 🌓 Modular Theme Engine (Light & Dark Mode)
* **Instant Light/Dark Switching**: Interactive neo-brutalist toggle button in the header with persistent `localStorage` synchronization across browser tabs.
* **Zero FOUC (Flash of Unstyled Content)**: Synchronous inline script evaluation in `<head>` ensures seamless, flash-free rendering on dark theme reloads.
* **Nordic Clean Mist Theme (`#f8fafc`)**: Custom modular background token paired with high-intensity emerald green accents (`#22c55e` / hover `#16a34a`) for maximum clarity and contrast.

### 🛡️ Trust Desk & Admin Verification
* **Dedicated Verification Portal (`/admin/verification`)**: Gatekept admin dashboard protected with passkey verification and role-based checks.
* **Document Inspector**: Admin lightbox viewer to review hospital cost estimates, doctor prescriptions, and identity proofs before campaigns go live.
* **Automated Status Workflow**:
  * `Pending Review` ⏳ — Campaign created, awaiting document vetting.
  * `Verified` 🛡️ — Verified by Trust Desk with green verification badge across listings.
  * `Action Needed / Rejected` ⚠️ — Organizers receive actionable notes to re-upload clear records.

### 🎨 Neo-Brutalist Visual Design System
* **Curated Typography**: Triple-font stack with **Fraunces** (editorial display), **Outfit** (headings), and **Plus Jakarta Sans** (UI body).
* **High-Impact Stage Hero**: Floating angled polaroid photo cards, tactile stickers, and bold calls-to-action.
* **Offset Solid Shadows**: Custom CSS shadows (`shadow-solid`, `shadow-solid-sm`, `shadow-solid-lg`) adapting dynamically between light and dark modes.

### 🎯 Comprehensive Campaign Management
* **Rich Campaign Creation (`/fundraise/create`)**: Multi-step fundraiser setup with patient diagnosis, hospital details, target goals, category pills, and multi-document upload.
* **Campaign Updates Timeline (`/api/fundraisers/:id/updates`)**: Organizers can post live medical progress updates and recovery milestones with images to keep donors informed.
* **Campaign Edit & Management (`/fundraiser/edit/:id`)**: Edit descriptions, upload new bills, or adjust targets.

### 💳 Secure Razorpay Payments & Webhook Verification
* **Cryptographic Signature Verification**: Validates payment authenticity using HMAC SHA256 signatures server-side.
* **Automated Progress Tracking**: Instantly updates current amounts, donor counts, and progress bars upon verified payment.
* **Anonymous Giving**: Optional donor privacy flags for anonymous public contributions.

### 👤 Creator & Donor Profile Dashboard (`/profile`)
* **Unified Overview**: Real-time stats cards (Total Raised, Total Donated, Active Campaigns).
* **Donation History**: Detailed receipts and breakdown of all past contributions.
* **Campaign Manager**: Direct links to view, edit, or delete personal fundraisers.
* **Sharable Profile Links**: One-click profile sharing for creators to build social proof.

### 🛡️ Production Scaling & Reliability
* **Zod Input Validation**: Robust schemas for all API payloads preventing malformed data and injection.
* **Sliding-Window Rate Limiting**: In-memory rate limiting across sensitive payment and campaign endpoints.
* **Next.js Auth Middleware**: Centralized route protection via `middleware.js`.
* **Cloudinary Direct Storage**: Replaced heavy base64 strings with secure, optimized Cloudinary image URLs.
* **Graceful Error Handling**: Custom `error.js`, `loading.js` skeletons, and `not-found.js` pages across all route segments.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19 |
| **Styling** | Tailwind CSS v4, Custom Modular Theme Tokens |
| **Typography** | Fraunces, Outfit, Plus Jakarta Sans (`next/font`) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | NextAuth.js (GitHub & Google OAuth) |
| **Payments** | Razorpay SDK, Server-Side Verification |
| **Media Storage** | Cloudinary API (Signed Uploads) |
| **Validation** | Zod (Runtime Schema Validation) |
| **Security** | Centralized Next.js Middleware, Rate Limiting, Passkey Gating |

---

## 📂 Project Structure

```text
monetra/
├── components/                 # Reusable UI Components
│   ├── Footer.js               # Global Neo-Brutalist Footer
│   ├── FundraiserCard.jsx      # Campaign Card with Progress Fill
│   ├── Navbar.js               # Floating Sticky Header & Navigation
│   ├── ProgressBar.jsx         # Accessible Animated Progress Bar
│   ├── SessionWrapper.jsx      # NextAuth Session Provider
│   └── ThemeToggle.jsx         # Light/Dark Theme Switcher
├── public/                     # Static Images & Assets
├── scripts/                    # Database Seed & Migration Scripts
│   ├── migrateVerificationStatus.mjs
│   ├── seedFundraisers.js
│   └── setAdmin.mjs
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── about/              # About Us & Platform FAQs
│   │   ├── admin/verification/ # Trust Desk Verification Dashboard
│   │   ├── api/                # REST API Endpoints
│   │   │   ├── admin/          # Moderation & Passkey APIs
│   │   │   ├── auth/           # NextAuth Handlers
│   │   │   ├── cloudinary/     # Upload Signature Generation
│   │   │   ├── donations/      # Donation Transactions & History
│   │   │   ├── fundraisers/    # CRUD Campaigns & Timeline Updates
│   │   │   ├── payment/        # Razorpay Orders & Webhooks
│   │   │   └── users/          # Profile Updates
│   │   ├── donate/             # Browse & Filter Causes
│   │   ├── fundraise/          # How It Works & Campaign Creator
│   │   ├── fundraiser/[id]/    # Campaign Detail & Donation Box
│   │   ├── login/              # OAuth Authentication Gateway
│   │   ├── profile/            # User Dashboard & Stats
│   │   ├── globals.css         # Theme System & Solid Shadow Tokens
│   │   ├── layout.js           # Root Layout with Anti-FOUC Head Script
│   │   └── page.js             # Neo-Brutalist Stage Landing Page
│   ├── lib/                    # Helpers, DB Client & Validations
│   │   ├── authOptions.js      # NextAuth Configuration
│   │   ├── constants.js        # Categories & Platform Constants
│   │   ├── env.js              # Environment Schema Validation
│   │   ├── imageUtils.js       # Cloudinary Upload Helpers
│   │   ├── rateLimit.js        # IP Rate Limiter
│   │   └── validations.js      # Zod Request Schemas
│   ├── middleware.js           # Route Protection Middleware
│   └── models/                 # Mongoose Data Models
│       ├── Donation.js         # Transactions & Donor Records
│       ├── Fundraiser.js       # Campaigns, Documents & Updates
│       └── User.js             # User Accounts & Roles
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Satishkumar683/Monetra.git
cd Monetra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:

```env
# Application URL
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_jwt_secret

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# OAuth Providers
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Cloudinary Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Trust Desk Passkey
ADMIN_PASSKEY=monetra-admin-secure-2026
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/fundraisers` | `GET` | List active fundraisers (supports search & pagination) | No |
| `/api/fundraisers` | `POST` | Create a new fundraising campaign with documents | Yes |
| `/api/fundraisers/:id` | `GET` | Retrieve campaign details, updates, and recent donors | No |
| `/api/fundraisers/:id` | `PUT` | Edit campaign details or targets | Yes (Owner) |
| `/api/fundraisers/:id` | `DELETE` | Delete campaign | Yes (Owner/Admin) |
| `/api/fundraisers/:id/updates` | `POST` | Post medical/treatment timeline update | Yes (Owner) |
| `/api/payment/create-order` | `POST` | Initialize Razorpay order with amount & currency | No |
| `/api/payment/verify` | `POST` | Verify Razorpay HMAC signature & record donation | No |
| `/api/admin/verification` | `GET` | List all fundraisers with verification statuses | Admin / Passkey |
| `/api/admin/verification/:id` | `PUT` | Update status (`verified`, `action_needed`, `rejected`) | Admin / Passkey |
| `/api/admin/verify-passkey` | `POST` | Validate Admin Trust Desk passkey | No |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for Transparent Giving • Monetra**

</div>
