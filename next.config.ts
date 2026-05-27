import type { NextConfig } from 'next'

const securityHeaders = [
  // Force HTTPS for 2 years, include subdomains, allow preload submission
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Block the page from being embedded in iframes (clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Stop browsers guessing MIME types from content
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Legacy XSS filter — block the page if an attack is detected
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Only send origin (no path) on cross-origin requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Disable browser features this site doesn't use
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  // Allow DNS prefetching for performance
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Content Security Policy
  // - script-src: 'unsafe-inline' required by Next.js hydration inline scripts
  // - style-src: 'unsafe-inline' required by Tailwind + inline style attributes
  // - img-src: allow Supabase storage + OAuth provider avatars + data/blob for previews
  // - connect-src: allow Supabase REST + realtime WebSocket
  // - frame-ancestors: stronger than X-Frame-Options for modern browsers
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Security headers on every route
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Auth and utility pages — indexed would waste crawl budget
      {
        source: '/(login|signup|requests/new)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      // Admin — never index, never follow
      {
        source: '/admin(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
