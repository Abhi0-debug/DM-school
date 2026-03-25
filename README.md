# DM Public School Website

Production-ready school website built with **Next.js App Router + Tailwind CSS**.

## Features

- Modern, responsive UI for **DM Public School**
- Sticky navbar with scroll effect and smooth section navigation
- Hero slideshow with dynamic image fetching
- Gallery grid with image modal + slideshow behavior
- Events and exam schedule with month filter
- Notice board with type filters and highlighted alerts
- Staff cards with hover animations
- Contact form with frontend/backend validation + math CAPTCHA
- Email sending via SMTP (Nodemailer)
- Newsletter subscription endpoint
- Download section for PDF notices
- WhatsApp floating contact button
- Google Maps embed section
- Basic admin panel for:
  - adding events
  - adding notices
  - adding/uploading images
- Admin write protection using `ADMIN_SECRET`
- Cloud image integration via Cloudinary (fallback to local JSON)
- Vercel deployment ready

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Framer Motion
- Next.js API Routes (`app/api/*`)
- Optional SMTP + Cloudinary integrations

## Folder Structure

```txt
app/
components/
lib/
public/
styles/
api/
data/
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Use `.env.example` as reference.

Key variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_GOOGLE_MAPS_EMBED`
- `IMAGE_PROVIDER` (`local` or `cloudinary`)
- `CLOUDINARY_*`
- `SMTP_*`
- `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
- `ADMIN_SECRET`
- `STORE_MESSAGES_LOCALLY`

## Admin Panel

Visit `/admin` and enter `ADMIN_SECRET`.

Admin can:

- Add event cards (including exam type)
- Add notices (daily/holiday/alert)
- Add gallery image by URL
- Upload image file (Cloudinary mode)

## Dynamic Content Sources

- Local fallback JSON:
  - `data/events.json`
  - `data/notices.json`
  - `data/gallery.json`
- Cloud mode (optional): Cloudinary resources

## Logo Replacement

Edit `lib/site-config.ts`:

- Set `logo.mode = "image"`
- Set `logo.imagePath` to your file inside `public/` (example: `/logo.svg` or `/logo.png`)

## Deployment (Vercel)

1. Push project to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Notes

- Local JSON writes are suitable for demo/local usage. For persistent production content, connect Firebase/MongoDB/CMS.
- Placeholder PDF files are included in `public/downloads/` and should be replaced with final files.
