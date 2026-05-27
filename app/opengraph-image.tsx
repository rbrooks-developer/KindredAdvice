import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KindredAdvice — Real Advice from Real People'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 70%, #9333ea 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '40%', right: '15%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(244,63,94,0.15)', display: 'flex' }} />

        {/* Heart icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 24,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Brand name */}
        <div style={{
          fontSize: 72, fontWeight: 800, color: 'white',
          letterSpacing: '-2px', marginBottom: 20,
          textShadow: '0 2px 16px rgba(0,0,0,0.2)',
        }}>
          KindredAdvice
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 30, color: 'rgba(255,255,255,0.75)',
          fontWeight: 400, letterSpacing: '0.5px',
          marginBottom: 56,
        }}>
          Real advice from real people
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['Romantic', 'Family', 'Friendship', 'General'].map((cat) => (
            <div key={cat} style={{
              padding: '10px 24px', borderRadius: 999,
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 18, fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {cat}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
