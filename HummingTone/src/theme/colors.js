export const colors = {
  // Primary Luxury Palette
  primary: '#0B0F19',        // Obsidian Night
  primaryDark: '#030712',    // True Deep Obsidian
  primaryLight: '#1E293B',   // Slate Charcoal
  
  // Accents & Metallics
  gold: '#D4AF37',           // Classic Champagne Gold
  goldLight: '#F3E5AB',      // Soft Champagne Gold
  goldMuted: '#C5A880',      // Warm Metallic Bronze
  goldDark: '#997B2C',       // Rich Antique Gold
  goldGlow: 'rgba(212, 175, 55, 0.18)',
  
  // Backgrounds & Glass
  background: '#F8F9FA',     // Crisp Luxury Off-White
  surface: '#FFFFFF',        // Pure White Surface
  cardBg: '#FFFFFF',         // Card Background
  cardBgElevated: '#FFFFFF',
  darkCardBg: '#111827',     // Dark Card Accent
  darkSurface: '#0F172A',
  
  // Text Colors
  textPrimary: '#0F172A',    // High Contrast Slate
  textSecondary: '#475569',  // Medium Slate
  textMuted: '#94A3B8',      // Muted Slate Caption
  textInverse: '#FFFFFF',    // White on Dark
  textGold: '#B8860B',       // Accent Gold Text
  
  // Borders & Dividers
  border: '#E2E8F0',         // Soft Border
  borderLight: '#F1F5F9',    // Ultra-light Divider
  borderDark: '#334155',     // Dark Border
  borderGold: 'rgba(212, 175, 55, 0.35)',
  
  // Functional & Feedback
  success: '#10B981',        // Emerald Green
  successLight: '#D1FAE5',
  error: '#EF4444',          // Rose Red Alert
  errorLight: '#FEE2E2',
  warning: '#F59E0B',        // Amber Warmth
  warningLight: '#FEF3C7',
  info: '#3B82F6',           // Royal Blue
  
  // Luxury Overlays & Glassmorphism
  overlayDark: 'rgba(0, 0, 0, 0.65)',
  overlayLight: 'rgba(255, 255, 255, 0.88)',
  glassDark: 'rgba(11, 15, 25, 0.94)',
  glassLight: 'rgba(255, 255, 255, 0.95)',
  glassCard: 'rgba(255, 255, 255, 0.85)',
};

export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  goldGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
};
