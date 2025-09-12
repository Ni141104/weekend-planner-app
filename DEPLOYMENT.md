# Deployment Guide

This guide covers deploying Weekendly to various platforms.

## Vercel (Recommended)

Vercel is the recommended platform for deploying Weekendly as it's built by the creators of Next.js.

### Automatic Deployment

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your Weekendly repository

3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in ~2 minutes
   - Automatic deployments on every push to main

### Manual Deployment

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Follow the prompts
# Your app will be deployed and you'll get a URL
\`\`\`

## Netlify

### Via Git Integration

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `out`
   - Add environment variable: `NETLIFY=true`

3. **Configure Next.js for Static Export**
   
   Add to `next.config.mjs`:
   \`\`\`javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   
   export default nextConfig
   \`\`\`

### Manual Deployment

\`\`\`bash
# Build for static export
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=out
\`\`\`

## AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New app" > "Host web app"
   - Connect your GitHub repository

2. **Build Settings**
   \`\`\`yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   \`\`\`

## Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Deploy from GitHub repo

2. **Configuration**
   - Railway auto-detects Next.js
   - No additional configuration needed
   - Automatic deployments on push

## Docker Deployment

### Dockerfile

\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

### Docker Compose

\`\`\`yaml
version: '3.8'
services:
  weekendly:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
\`\`\`

### Build and Run

\`\`\`bash
# Build image
docker build -t weekendly .

# Run container
docker run -p 3000:3000 weekendly
\`\`\`

## Environment Variables

Weekendly runs entirely client-side and doesn't require server-side environment variables. All data is stored in localStorage.

### Optional Configuration

If you want to add analytics or other services:

\`\`\`bash
# Vercel Analytics (already included)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Custom domain
NEXT_PUBLIC_DOMAIN=your-domain.com
\`\`\`

## Performance Optimization

### Build Optimization

1. **Bundle Analysis**
   \`\`\`bash
   npm install --save-dev @next/bundle-analyzer
   \`\`\`

   Add to `next.config.mjs`:
   \`\`\`javascript
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   })
   
   module.exports = withBundleAnalyzer(nextConfig)
   \`\`\`

   Run analysis:
   \`\`\`bash
   ANALYZE=true npm run build
   \`\`\`

2. **Image Optimization**
   - Images are already optimized with Next.js Image component
   - Consider using WebP format for better compression

3. **Code Splitting**
   - Components are automatically code-split
   - Use dynamic imports for heavy components:
   \`\`\`javascript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'))
   \`\`\`

### CDN Configuration

For static assets, configure your CDN:

\`\`\`javascript
// next.config.mjs
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourdomain.com' 
    : '',
}
\`\`\`

## Monitoring and Analytics

### Built-in Analytics

Weekendly includes Vercel Analytics by default. No additional configuration needed.

### Custom Analytics

Add Google Analytics or other services:

\`\`\`javascript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
      </body>
    </html>
  )
}
\`\`\`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

2. **Static Export Issues**
   - Ensure no server-side features are used
   - Check for dynamic routes
   - Verify image optimization settings

3. **Performance Issues**
   - Enable compression in your hosting platform
   - Use CDN for static assets
   - Optimize images and fonts

### Debug Mode

Enable debug logging:

\`\`\`bash
DEBUG=* npm run build
\`\`\`

## Security Considerations

1. **Content Security Policy**
   \`\`\`javascript
   // next.config.mjs
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'Content-Security-Policy',
               value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
             }
           ]
         }
       ]
     }
   }
   \`\`\`

2. **HTTPS Only**
   - Always deploy with HTTPS enabled
   - Most platforms enable this by default

3. **Data Privacy**
   - All data is stored locally in the browser
   - No server-side data collection
   - Consider adding privacy policy

---

Your Weekendly app is now ready for production! 🚀
