import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const PARTICLE_COUNT = 30;
const BG_COLOR = '#080F0C';
const EMERALD = '#10B981';
const BRIGHT = '#34D399';

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    speedX: (Math.random() - 0.5) * 0.03,
    speedY: (Math.random() - 0.5) * 0.03,
    opacity: Math.random() * 0.7 + 0.3,
  }));
}

const ParticleField: React.FC<{ visible: boolean }> = ({ visible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>(generateParticles());
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.map((p) => {
      let nx = p.x + p.speedX;
      let ny = p.y + p.speedY;
      if (nx < 0) nx = 100;
      if (nx > 100) nx = 0;
      if (ny < 0) ny = 100;
      if (ny > 100) ny = 0;
      return { ...p, x: nx, y: ny };
    });

    particlesRef.current.forEach((p) => {
      const px = (p.x / 100) * canvas.width;
      const py = (p.y / 100) * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
      ctx.fill();

      // Soft glow
      const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
      grad.addColorStop(0, `rgba(52, 211, 153, 0.15)`);
      grad.addColorStop(1, `rgba(52, 211, 153, 0)`);
      ctx.beginPath();
      ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (visible) {
      animFrameRef.current = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [visible, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

const PulseRing: React.FC = () => (
  <motion.div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}
  >
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 6, opacity: 0 }}
        transition={{
          duration: 1.2,
          delay: i * 0.3,
          ease: 'easeOut',
        }}
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: `2px solid ${EMERALD}`,
        }}
      />
    ))}
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${BRIGHT}33 0%, ${EMERALD}11 70%, transparent 100%)`,
        border: `2px solid ${BRIGHT}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12h3l3-7 4 14 3-7h7"
          stroke={BRIGHT}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  </motion.div>
);

const LoadingBar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 240,
    }}
  >
    <div
      style={{
        height: 2,
        background: `${EMERALD}22`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${EMERALD}, ${BRIGHT})`,
          borderRadius: 2,
        }}
      />
    </div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      style={{
        marginTop: 8,
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.15em',
        color: BRIGHT,
        fontFamily: 'monospace',
      }}
    >
      INITIALIZING SYSTEM...
    </motion.p>
  </div>
);

type Scene = 'particles' | 'city' | 'pulse' | 'logo' | 'tagline' | 'loading' | 'done';

const SCENE_TIMELINE: { scene: Scene; at: number }[] = [
  { scene: 'particles', at: 0 },
  { scene: 'city', at: 800 },
  { scene: 'pulse', at: 2000 },
  { scene: 'logo', at: 3000 },
  { scene: 'tagline', at: 4000 },
  { scene: 'loading', at: 4500 },
  { scene: 'done', at: 5200 },
];

const IntroAnimation: React.FC<Props> = ({ onComplete }) => {
  const [scene, setScene] = useState<Scene>('particles');
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    SCENE_TIMELINE.forEach(({ scene: s, at }) => {
      if (s === 'done') {
        timers.push(
          setTimeout(() => {
            setExiting(true);
            setTimeout(onComplete, 600);
          }, at)
        );
      } else {
        timers.push(setTimeout(() => setScene(s), at));
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const showParticles = ['particles', 'city', 'pulse', 'logo', 'tagline', 'loading'].includes(scene);
  const showCity = ['city', 'pulse', 'logo', 'tagline', 'loading'].includes(scene);
  const showPulse = ['pulse', 'logo', 'tagline', 'loading'].includes(scene);
  const showLogo = ['logo', 'tagline', 'loading'].includes(scene);
  const showTagline = ['tagline', 'loading'].includes(scene);
  const showLoading = scene === 'loading';

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: BG_COLOR,
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Particle canvas */}
          <ParticleField visible={showParticles} />

          {/* City image */}
          <AnimatePresence>
            {showCity && (
              <motion.div
                key="city"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, rgba(8,15,12,0.85) 0%, rgba(16,56,32,0.75) 50%, rgba(8,15,12,0.90) 100%)`,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          <AnimatePresence>
            {showPulse && (
              <motion.div
                key="pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <PulseRing />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Logo */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  key="logo"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Icon badge */}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      background: `linear-gradient(135deg, ${EMERALD}22, ${BRIGHT}11)`,
                      border: `1.5px solid ${EMERALD}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 40px ${EMERALD}33`,
                    }}
                  >
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 12h3l3-7 4 14 3-7h7"
                        stroke={BRIGHT}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Wordmark */}
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        background: `linear-gradient(90deg, ${EMERALD}, ${BRIGHT})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: 1,
                      }}
                    >
                      ECO-PULSE
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: '0.4em',
                        color: `${BRIGHT}99`,
                        marginTop: 4,
                        fontFamily: 'monospace',
                      }}
                    >
                      A I
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence>
              {showTagline && (
                <motion.p
                  key="tagline"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    fontSize: 15,
                    color: `${BRIGHT}bb`,
                    letterSpacing: '0.05em',
                    fontStyle: 'italic',
                    fontFamily: 'Georgia, serif',
                    textAlign: 'center',
                  }}
                >
                  Intelligence for a greener tomorrow.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Loading bar */}
          <AnimatePresence>
            {showLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <LoadingBar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(8,15,12,0.6) 100%)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
