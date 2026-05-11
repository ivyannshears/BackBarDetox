async function aiLookup(brands) {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  try {
    let resultArray;

    if (isLocal) {
      // Local dev: call Anthropic directly (set window.ANTHROPIC_API_KEY in a local config)
      const prompt = `Analyze brand ownership for: ${brands.join(', ')}. Return ONLY a valid JSON array — no markdown, no code fences, no preamble. Schema per item: {name, owner, tier (0-5), pe, indie, womenOwned, womenFounded, note}. Tiers: 0=PE-backed, 1=public corp, 2=recently acquired, 3=large private, 4=indie founder-owned, 5=indie+woman-owned or B-Corp. For unknown brands, reason through likelihood. CRITICAL: Never invent facts — if uncertain, use tier 3 and note uncertainty.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.ANTHROPIC_API_KEY || '',
          'anthropic-dangerous-direct-browser-access': 'true',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const text = data.content?.find(c => c.type === 'text')?.text || '[]';
      const clean = text.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
      resultArray = JSON.parse(clean);
    } else {
      // Production: route through secure Vercel Edge Function (key stays server-side)
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brands })
      });
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      resultArray = await res.json();
    }

    return Array.isArray(resultArray) ? resultArray : [];
  } catch (e) {
    console.error('AI lookup failed:', e);
    return brands.map(name => ({
      name,
      owner: 'Could not verify — check independently',
      tier: 3,
      pe: false,
      indie: false,
      womenOwned: false,
      womenFounded: false,
      note: 'AI lookup unavailable. Treat as unverified.'
    }));
  }
}