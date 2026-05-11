const TIERS = {
  0: { label: '🚩 Investor Owned', icon: '🚩', score: 0, color: '#d9534f', bar: '#dc3545' },
  1: { label: '🏢 Public Corp', icon: '🏢', score: 20, color: '#f0ad4e', bar: '#ff8c42' },
  2: { label: '⚠️ Recently Acquired', icon: '⚠️', score: 35, color: '#5bc0de', bar: '#5bc0de' },
  3: { label: '🔵 Large Private', icon: '🔵', score: 55, color: '#8b7355', bar: '#9d8b7e' },
  4: { label: '✅ Independent', icon: '✅', score: 80, color: '#2d6e45', bar: '#4caf50' },
  5: { label: '⭐ Indie + Woman-Led', icon: '⭐', score: 95, color: '#28a745', bar: '#1b5e20' },
  6: { label: '🤝 Employee Owned', icon: '🤝', score: 90, color: '#2c7a9e', bar: '#3a9cc4' }
};

const TIER_EXPLANATIONS = {
  0: 'Private equity investors control this brand. Returns to shareholders come before craft and clients. Cost-cutting is the priority.',
  1: 'This brand is owned by a publicly traded corporation. Quarterly earnings reports drive decisions. Innovation takes a backseat to shareholder returns.',
  2: 'This brand was recently acquired. It may have been independent when you fell in love with it. Check the owner now.',
  3: 'Held by a larger private company or founding family. More stability than PE, but not truly independent. May prioritize growth over quality.',
  4: 'No corporate parent or outside investors found. These brands reinvest in product quality and stylist support rather than shareholder returns.',
  5: 'Woman-led and independently owned. The people making decisions look like the people using the products. Every dollar supports independent ownership.',
  6: 'Employee-owned through an ESOP or co-op structure. The workers ARE the shareholders. No outside investors, no PE extraction — profit stays with the people doing the work.'
};