# Netlify Deployment Guide

This guide explains how to deploy this application independently on Netlify without any Lovable AI dependencies.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Netlify account (free tier works)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment Options

### Option 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 3: Manual Deploy (Drag & Drop)

1. Run `npm run build` locally
2. Go to [Netlify](https://app.netlify.com)
3. Drag the `dist` folder to the deploy zone

## Configuration Files

The project includes:

- `netlify.toml` - Netlify build and redirect configuration
- `vite.config.ts` - Vite build configuration

## Features Summary

This is a **fully static/client-side application** with:

- ✅ No backend dependencies
- ✅ No external API calls required
- ✅ All data stored in localStorage
- ✅ PDF generation via jsPDF (client-side)
- ✅ Works offline after initial load

## Data Persistence

All data is stored in the browser's localStorage:
- Candidates, Jobs, Properties, Tenants
- Placements and Transactions
- Agency settings and branding

**Note**: Data is browser-specific and will be lost if the user clears their browser data.

## For Production Use

If you need persistent data storage across devices/browsers, you'll need to:

1. Set up a backend database (e.g., Supabase, Firebase, PostgreSQL)
2. Create API endpoints for CRUD operations
3. Replace localStorage calls with API calls

The codebase is structured to make this migration straightforward.

## Troubleshooting

### Build fails
- Ensure Node.js 18+ is installed
- Run `npm install` to update dependencies
- Check for TypeScript errors with `npm run build`

### Routes not working on refresh
- The `netlify.toml` includes redirect rules for SPA routing
- If manually configuring, add: `/* /index.html 200`

### Images not loading
- Property images are stored as base64 in localStorage
- Large images may exceed localStorage limits (~5MB per domain)

## Support

This application was built with:
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- jsPDF for PDF generation
- Vite for building
