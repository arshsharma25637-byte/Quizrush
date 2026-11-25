# QuizRush — Trivia & Voucher Rewards Web App (PWA)

QuizRush is a modern, mobile-first Progressive Web App (PWA) built with **React 19, TypeScript, Tailwind CSS v4, Vite, and Firebase (Authentication + Firestore)**. Players sign in with Google, compete in bilingual trivia quizzes (English & Hindi), earn coins through streaks, daily check-ins, lucky spins, referrals, and sponsor reward breaks, and redeem verified gift vouchers fulfilled through a built-in Admin Desk.

---

## Key Features

- **Bilingual Trivia Engine (English & Hindi)**: Multi-category quiz rounds (General Knowledge, Cricket & Sports, Science & Tech, Brain & Math, Mega Mix) with countdown timers, lifelines, streak multipliers, and sound effects.
- **Google Sign-In + Cloud Sync**: Firebase Authentication with automatic mobile/PWA redirect support and real-time Firestore wallet sync.
- **Anti-Tamper Firestore Security Rules**: Server-side rules enforcing coin gain caps per write, verified user checks, single-use referral claims, and strict admin-only voucher inventory protection.
- **Real Voucher Wallet & Fulfillment Workflow**: Players submit redemption requests for ₹10, ₹25, ₹50, and ₹100 tiers; admins upload real voucher codes and fulfill or reject (auto-refund) requests with one click.
- **Monetization Ready**: Built-in 320×50 Adsterra banner slot (configured via `.env`) plus a live Admin-controlled **Sponsor / Smartlink Reward Break** modal.
- **Complete Admin Panel**:
  - Live Economy & Daily Round Limit Editor
  - Voucher Stock Manager & Redemption Queue
  - Player Coin Manager (adjust, cut, or reset balances)
  - Live Sponsor / Smartlink Ad Manager
  - Built-in **9:16 Viral Reel Video Studio** for Instagram Reels & Facebook Reels marketing
- **Installable PWA**: Works offline-ready on Android & iOS home screens with Web App Manifest and service worker caching.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / Database**: Firebase Authentication (Google) & Cloud Firestore
- **Hosting Ready**: Pre-configured for **Vercel** (`vercel.json`), **Netlify** (`public/_redirects`), and **Firebase Hosting** (`firebase.json`)

---

## 1. Quick Start (Local Development)

### Prerequisites
- **Node.js 20+** and **npm** installed
- A free **Firebase** account ([console.firebase.google.com](https://console.firebase.google.com))

### Install & Run
```bash
# 1. Install dependencies
npm install

# 2. Copy the environment variable template
cp .env.example .env

# 3. Edit `.env` with your own Firebase, Admin, and Ad credentials (see Steps 2–4 below)

# 4. Start the local dev server (http://localhost:3000)
npm run dev
```

---

## 2. Firebase Setup (Database, Auth & Security Rules)

### Step A: Create a Firebase Project & Web App
1. Go to the [Firebase Console](https://console.firebase.google.com) and click **Add project**.
2. In your new project, click the **Web (`</>`)** icon to register a web app and copy the generated config values (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
3. Paste those values into your `.env` file (or `firebase-applet-config.json` if deploying without env vars):
   ```env
   VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY_HERE"
   VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
   VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
   VITE_FIREBASE_DATABASE_ID="(default)"
   ```

### Step B: Enable Google Sign-In
1. In Firebase Console, open **Build → Authentication → Sign-in method**.
2. Enable the **Google** provider, select a support email, and click **Save**.
3. Go to **Authentication → Settings → Authorized domains** and add your live domain (for example `your-app.vercel.app` or `yourdomain.com`).

### Step C: Create Firestore Database & Deploy Security Rules
1. Open **Build → Firestore Database → Create database** (choose **Production mode** and your preferred region).
2. Open `firestore.rules` in this project and replace `YOUR_ADMIN_EMAIL@example.com` on line 43 with **your own verified Google email address**:
   ```rules
   (hasVerifiedEmail() && request.auth.token.email == 'yourname@gmail.com')
   ```
3. Publish the rules using either method:
   - **Option 1 (Firebase Console — easiest)**: Go to **Firestore Database → Rules**, paste the full contents of `firestore.rules`, and click **Publish**.
   - **Option 2 (Firebase CLI)**:
     1. Update `.firebaserc` with your Firebase `projectId`.
     2. Run:
        ```bash
        npm install -g firebase-tools
        firebase login
        firebase deploy --only firestore:rules
        ```

---

## 3. Configure Your Admin Account

QuizRush uses **verified Google Authentication + Firestore Security Rules** rather than a weak hardcoded frontend password (which anyone could inspect in browser source code).

1. Set your Google email in `.env`:
   ```env
   VITE_ADMIN_EMAIL="yourname@gmail.com"
   ```
2. Set the **exact same email** in `firestore.rules` (Step 2C above) and publish the rules.
3. Sign in to your live app using that Google account — the **Admin Desk** tab will automatically appear in the top navigation bar.
4. *(Optional)* To add additional team admins later without editing `firestore.rules`, create a document inside the Firestore `admins` collection with Document ID = `<their Firebase Auth UID>` and fields `{ email, addedBy, createdAt }`.

---

## 4. Add Your Own Ad Network IDs (Adsterra / Smartlink)

### A. 320×50 Display Banner (Adsterra)
1. Create a **320×50 Banner** unit in your Adsterra Publisher Dashboard and copy your banner `key` and script `src` URL.
2. Add them to `.env` (or Vercel Environment Variables):
   ```env
   VITE_ADSTERRA_BANNER_KEY="your_320x50_banner_key"
   VITE_ADSTERRA_BANNER_SCRIPT_URL="https://your-ad-domain.com/path/your_key/invoke.js"
   ```
3. If left blank or as placeholders, QuizRush automatically renders a clean placeholder slot without loading any external ad script.

### B. Live Sponsor / Smartlink Reward Break (No Redeploy Needed)
1. Sign in as Admin and open **Admin Desk**.
2. Scroll to **Live Sponsor / Smartlink Ad Config**.
3. Enter your Adsterra Direct Link / Smartlink (must start with `https://`), set the headline/CTA label, toggle **Active**, and click **Save**. Changes update in real time for all players.

---

## 5. Hosting & Deployment Guide

### Option 1: Deploy on Vercel (Recommended — Free & Fast)
1. Push your project folder to a **private** GitHub repository (`.gitignore` already excludes `.env`).
2. Log in to [vercel.com](https://vercel.com) → **Add New Project** → Import your repository.
3. Keep default Vite settings (`Build Command: npm run build`, `Output Directory: dist`).
4. Expand **Environment Variables** and add all variables from `.env.example` with your real values.
5. Click **Deploy**.
6. Copy your live `*.vercel.app` domain and add it to **Firebase Console → Authentication → Settings → Authorized domains**.

### Option 2: Deploy on Netlify
1. Run `npm run build` locally (or connect your GitHub repo in Netlify).
2. Set `Build command` to `npm run build` and `Publish directory` to `dist` (`public/_redirects` is already configured for SPA routing).
3. Add all `VITE_*` keys under **Site configuration → Environment variables** and deploy.
4. Add your `*.netlify.app` domain to Firebase **Authorized domains**.

### Option 3: Deploy on Firebase Hosting
1. Set your `projectId` in `.firebaserc` and ensure `.env` contains your production values.
2. Run:
   ```bash
   npm run build
   firebase deploy
   ```

---

## 6. Using the Admin Panel & Managing Quizzes

### Adding or Editing Quiz Questions
- Open `src/data/questions.ts`.
- Each question supports both **English** and **Hindi** (`en` and `hi` fields), 4 answer options, the `correctIndex` (`0`–`3`), `category` (`'gk' | 'cricket' | 'tech' | 'brain'`), and a short `explanation`.
- You can also customize voucher tiers (`VOUCHER_TIERS`) and default coin rates (`DEFAULT_ECONOMY`) in `src/data/questions.ts`.
- Note: If you change voucher tier amounts or coin costs in `VOUCHER_TIERS`, update `isValidTierMatch` and the deduction list in `firestore.rules` to match.

### Adding Redeem Codes & Fulfilling Withdrawals
1. Open **Admin Desk** in the app.
2. Under **Voucher Stock Manager**, select a tier (`₹10`, `₹25`, `₹50`, `₹100`), paste real Google Play / gift voucher codes (one per line or individually), and click **Add to Stock**.
   - Voucher codes are stored in the Admin-only `voucherStock` collection — regular users cannot read unused codes.
3. Under **Pending Redemption Requests**:
   - Click **Approve & Assign Stock** to atomically assign an available code from your stock (or enter a code manually) and deliver it directly to the player's Wallet.
   - Click **Reject & Refund** to decline an invalid request and automatically refund the player's coins.

### Live Economy, Player Coins & Viral Reel Studio
- **Economy & Daily Limits**: Adjust coins per right answer, streak bonus, speed bonus, daily check-in, reward ad payout, and daily round cap live without redeploying.
- **Player Coin Manager**: Search players and adjust balances (`-100`, `-500`, `50% Cut`, `Reset 0`, or custom amount) directly from Admin Desk.
- **Viral Reel Studio**: Generate 15-second 9:16 HD promotional videos and Story cards with built-in audio and copy-paste captions for Instagram & Facebook marketing.

---

## Security Architecture Notes

- **Firebase Client Keys**: In Firebase web apps, `VITE_FIREBASE_API_KEY` and `projectId` identify your Firebase project to browsers and are public by design. Actual data security is enforced server-side by `firestore.rules` and verified Google Auth tokens.
- **Zero Hardcoded Secrets**: Never commit your `.env` file or real gift card codes into Git. Keep `.env` local and use your hosting provider's encrypted Environment Variables panel.
- **Anti-Cheat Enforcement**: `firestore.rules` enforces maximum coin gains per update, validates voucher tier costs, prevents negative balances, blocks unauthorized reads of `voucherStock`, and enforces single-use referral claims.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite development server on port 3000 |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type check (`tsc --noEmit`) |
