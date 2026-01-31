import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'ZAX Research Initiative'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    position: 'relative',
                }}
            >
                {/* Abstract Background Noise */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '800px',
                    height: '800px',
                    background: '#e0efff',
                    borderRadius: '100%',
                    filter: 'blur(100px)',
                    opacity: 0.5,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background: '#f3e8ff',
                    borderRadius: '100%',
                    filter: 'blur(100px)',
                    opacity: 0.5,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Logo Mark */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#0f172a',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 900,
                    }}>
                        Z
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '64px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>ZAX</span>
                        <span style={{ fontSize: '24px', letterSpacing: '0.2em', color: '#64748b', textTransform: 'uppercase' }}>Research Initiative</span>
                    </div>
                </div>

                <div style={{ marginTop: '40px', fontSize: '32px', color: '#334155' }}>
                    Value-Based Connection Platform
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
