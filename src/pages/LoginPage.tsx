import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Leaf,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ChevronRight,
  Shield,
  TreePine,
  Droplets,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  onLoginSuccess: () => void;
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Shield size={18} className="text-emerald-400" />,
    title: 'Climate Intelligence',
    description: 'Real-time risk modeling with AI-powered climate data insights.',
  },
  {
    icon: <Building2 size={18} className="text-emerald-400" />,
    title: 'Smart Infrastructure Planning',
    description: 'Optimize urban development with sustainability metrics.',
  },
  {
    icon: <TreePine size={18} className="text-emerald-400" />,
    title: 'Sustainable Urban Futures',
    description: 'Long-term ecological forecasting for responsible investment.',
  },
];

const DEMO_EMAIL = 'demo@ecopulse.ai';
const DEMO_PASSWORD = 'demo123';

const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const { login } = useApp();

  const [email, setEmail] = useState<string>(DEMO_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Invalid credentials. Use the demo credentials below.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#080F0C', color: '#F0FDF4' }}
    >
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background city image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80)',
          }}
        />

        {/* Dark green gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(8,15,12,0.92) 0%, rgba(16,56,32,0.80) 50%, rgba(8,15,12,0.95) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 48,
                height: 48,
                background: 'rgba(16,185,129,0.12)',
                border: '1.5px solid rgba(16,185,129,0.4)',
                boxShadow: '0 0 24px rgba(16,185,129,0.15)',
              }}
            >
              <Activity size={22} color="#34D399" />
              <Leaf size={12} color="#10B981" style={{ marginLeft: -4, marginTop: -8 }} />
            </div>
            <div>
              <div
                className="font-extrabold tracking-widest text-lg leading-none"
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ECO-PULSE
              </div>
              <div
                className="text-xs tracking-[0.3em] font-semibold"
                style={{ color: 'rgba(52,211,153,0.6)' }}
              >
                AI
              </div>
            </div>
          </motion.div>

          {/* Center tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <h1
              className="text-4xl font-bold leading-tight"
              style={{ color: '#F0FDF4' }}
            >
              Turning Climate Risk Into{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Smarter Urban Investment.
              </span>
            </h1>

            {/* Features */}
            <div className="flex flex-col gap-4 mt-2">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                  className="flex items-start gap-3 group"
                >
                  <div
                    className="flex items-center justify-center rounded-lg mt-0.5 shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.25)',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: '#F0FDF4' }}
                    >
                      {feature.title}
                    </div>
                    <div
                      className="text-xs mt-0.5 leading-relaxed"
                      style={{ color: 'rgba(240,253,244,0.55)' }}
                    >
                      {feature.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom decorative stat row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex gap-8"
          >
            {[
              { icon: <Droplets size={14} />, label: 'Water Risk', value: 'Modeled' },
              { icon: <TreePine size={14} />, label: 'Carbon Index', value: 'Live' },
              { icon: <Building2 size={14} />, label: 'Cities Tracked', value: '500+' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'rgba(52,211,153,0.6)' }}
                >
                  {stat.icon}
                  <span className="tracking-wider uppercase">{stat.label}</span>
                </div>
                <div
                  className="font-bold text-sm"
                  style={{ color: '#34D399' }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: '#080F0C' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Glass morphism card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(16,27,21,0.85)',
              border: '1px solid rgba(16,185,129,0.2)',
              backdropFilter: 'blur(20px)',
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.05) inset',
            }}
          >
            {/* Demo Access badge */}
            <div className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
                style={{
                  background: 'rgba(217,119,6,0.15)',
                  border: '1px solid rgba(217,119,6,0.4)',
                  color: '#FCD34D',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#FCD34D' }}
                />
                Demo Access · Not for production use
              </span>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ color: '#F0FDF4' }}
              >
                Sign In
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: 'rgba(240,253,244,0.45)' }}
              >
                Access the ECO-PULSE AI dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: 'rgba(52,211,153,0.7)' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgba(16,185,129,0.5)' }}
                  >
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(8,15,12,0.7)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      color: '#F0FDF4',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: 'rgba(52,211,153,0.7)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgba(16,185,129,0.5)' }}
                  >
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-11 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(8,15,12,0.7)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      color: '#F0FDF4',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color: 'rgba(52,211,153,0.5)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'rgba(52,211,153,0.9)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(52,211,153,0.5)')
                    }
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: '#10B981' }}
                />
                <label
                  htmlFor="remember"
                  className="text-xs cursor-pointer select-none"
                  style={{ color: 'rgba(240,253,244,0.5)' }}
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#FCA5A5',
                  }}
                >
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? 'rgba(16,185,129,0.4)'
                    : 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#F0FDF4',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.boxShadow = '0 6px 28px rgba(16,185,129,0.45)';
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.3)';
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.3"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials box */}
            <div
              className="mt-6 rounded-xl p-4"
              style={{
                background: 'rgba(8,15,12,0.6)',
                border: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'rgba(52,211,153,0.7)' }}
                >
                  Demo Credentials
                </span>
                <button
                  onClick={handleDemoFill}
                  className="text-xs rounded-lg px-2 py-1 font-medium transition-colors duration-150"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    color: '#34D399',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(16,185,129,0.2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')
                  }
                >
                  Auto-fill
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Mail size={12} style={{ color: 'rgba(52,211,153,0.5)' }} />
                  <span className="text-xs" style={{ color: 'rgba(240,253,244,0.5)' }}>
                    Email:
                  </span>
                  <code
                    className="text-xs rounded px-1.5 py-0.5"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      color: '#34D399',
                      fontFamily: 'monospace',
                    }}
                  >
                    {DEMO_EMAIL}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={12} style={{ color: 'rgba(52,211,153,0.5)' }} />
                  <span className="text-xs" style={{ color: 'rgba(240,253,244,0.5)' }}>
                    Password:
                  </span>
                  <code
                    className="text-xs rounded px-1.5 py-0.5"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      color: '#34D399',
                      fontFamily: 'monospace',
                    }}
                  >
                    {DEMO_PASSWORD}
                  </code>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p
              className="text-center text-xs mt-4"
              style={{ color: 'rgba(240,253,244,0.3)' }}
            >
              This is a demonstration application. No real data is processed.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
