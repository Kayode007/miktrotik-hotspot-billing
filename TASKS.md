# TASKS.md — Migration & Upgrade Progress Tracker

> Project: COLLOSPOT Hotspot Billing — copy of `Kayode007/miktrotik-hotspot-billing`
> Goals: React → Vue 3 (latest), M-Pesa → Paystack (Nigeria), unique custom CSS, fixes.

Legend: [ ] Pending · [~] In Progress · [x] Done · [!] Blocked

## 1. Migration: React → Vue 3

- [x] Review upstream repo & record baseline issues
- [x] Remove React sources (tsx, hooks, react deps, tailwind/postcss configs)
- [x] Scaffold Vue 3.5 + Vite 7 (TypeScript, `<script setup lang="ts">`)
- [x] Install vue-router@4, axios, lucide-vue-next (icons)
- [x] Port `src/types/index.ts` (updated for Paystack)
- [x] Port `src/services/api.ts` (Vue, updated endpoints)
- [x] Port `useAuth` hook → `src/composables/useAuth.ts`
- [x] New `src/composables/useToast.ts` (replaces react-hot-toast)
- [x] Port `App.tsx` → `App.vue` + `main.tsx` → `main.ts`
- [x] Port `pages/AdminLogin` → `AdminLogin.vue`
- [x] Port `pages/AdminDashboard` → `AdminDashboard.vue` (nested RouterView)
- [x] Port `pages/CustomerPortal` → `CustomerPortal.vue` (Paystack flow)
- [x] Port `components/DashboardOverview` → `DashboardOverview.vue`
- [x] Port `components/UsersManagement` → `UsersManagement.vue`
- [x] Port `components/PlansManagement` → `PlansManagement.vue`
- [x] Port `components/SessionsManagement` → `SessionsManagement.vue`
- [x] Port `components/PaymentsManagement` → `PaymentsManagement.vue`
- [x] Port `components/SettingsPage` → `SettingsPage.vue`

## 2. Remove M-Pesa → Add Paystack (Nigeria)

- [x] Delete `backend/src/services/mpesaService.ts`
- [x] Create `backend/src/services/paystackService.ts` (initialize/verify/webhook, dev mock)
- [x] Update `backend/src/routes/public.ts` (init payment, status, webhook route)
- [x] Update Prisma schema (`paystackReference`, `paymentMethod: PAYSTACK`)
- [x] Update `.env.example` (PAYSTACK_* keys)
- [x] Nigerian localization: ₦ NGN currency, +234 phones, en-NG locale
- [x] Remove africastalking/SMS Kenyan references where appropriate

## 3. Unique Custom CSS

- [x] Design tokens (CSS variables: colors, radii, shadows) — no Tailwind
- [x] Shared component classes (`.btn`, `.card`, `.input`, `.badge`, `.table`, `.modal`)
- [x] Animated aurora/mesh backgrounds, glassmorphism cards
- [x] Scoped per-component styles in each SFC
- [x] Dark mode support via `prefers-color-scheme` on admin pages
- [x] Custom animated toasts (slide/fade), spinners, pulse states

## 4. Fixes & Improvements

- [x] Fix payment polling loop (no runaway timers, cleanup on unmount)
- [x] Replace `checkoutRequestId` references with `paystackReference` end-to-end
- [x] Root scripts/dev tooling updated for Vue (ports, start-dev)
- [x] README updated (Vue + Paystack instructions)

## 5. Verification

- [x] Frontend `npm run build` passes
- [x] Backend TypeScript compiles
- [x] Both packages install cleanly

## 6. Release

- [x] Commit changes
- [x] Push to GitHub (`main`)
