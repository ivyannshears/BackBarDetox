async function aiLookup(brands) {
  const prompt = `Analyze brand ownership for: ${brands.join(', ')}. Return ONLY valid JSON array with {name, owner, tier (0-5), pe, indie, womenOwned, note}. Tiers: 0=PE-backed, 1=public corp, 2=recently acquired, 3=large private, 4=indie founder-owned, 5=indie+woman-owned or B-Corp. For unknown brands, reason through likelihood. CRITICAL: Never invent facts — if uncertain, use tier 3 and note uncertainty.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const text = data.content?.find(c => c.type === 'text')?.text || '[]';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('AI lookup failed:', e);
    return brands.map(name => ({
      name,
      owner: 'Could not verify — check independently',
      tier: 3,
      pe: false,
      indie: false,
      note: 'AI lookup unavailable. Treat as unverified.'
    }));
  }
}