// Realistic portrait images corresponding to members from the design mockup
export const MOCK_AVATARS: Record<string, string> = {
  // Ali Raza (Owner & Member #G001)
  'Ali Raza': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  // Ayesha Khan (#G002)
  'Ayesha Khan': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  // Hassan Ahmed (#G003)
  'Hassan Ahmed': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  // Fatima Noor (#G004)
  'Fatima Noor': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  // Usman Tariq (#G005)
  'Usman Tariq': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  // Sara Ali / Sara Khan (#G006 / #G017)
  'Sara Ali': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'Sara Khan': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  // Kamran Ali (#G030)
  'Kamran Ali': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  // Nimra Shah (#G025)
  'Nimra Shah': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  // Zeeshan / Zeeshan Malik (#G031)
  'Zeeshan': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'Zeeshan Malik': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  // Additional fallback members
  'Hina Baig': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Bilal Chaudhry': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'Sana Qureshi': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'Tariq Mehmood': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
};

export const OWNER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

export const ATHLETE_BANNER_IMAGE = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80';

export const SPLASH_BG_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';

export const getMemberAvatar = (name: string, photoUri?: string | null): string => {
  if (photoUri) return photoUri;
  if (MOCK_AVATARS[name]) return MOCK_AVATARS[name];
  // Stable hash to pick an avatar if name unknown
  const keys = Object.keys(MOCK_AVATARS);
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % keys.length;
  return MOCK_AVATARS[keys[index]];
};
