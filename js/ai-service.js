async function aiLookup(brands) {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  const schema = `{
    name: string,
    owner: string (full legal owner with context),
    tier: 0-6 (0=PE-backed, 1=public corp, 2=recently acquired, 3=large private, 4=indie founder-owned, 5=indie+woman-led, 6=employee-owned/ESOP/co-op),
    pe: boolean,
    indie: boolean,
    esop: boolean (true if employee stock ownership plan or worker co-op),
    womenOwned: boolean (majority owned by a woman),
    womenFounded: boolean (founded by a woman),
    womanLed: boolean (current CEO/President/GM is a woman, even if not owner),
    womanLedName: string or null (her name if known),
    womanLedTitle: string or null (her title if known),
    confidence: 1-5 (how certain are you based on search results),
    note: string (plain-english summary of what you found and any caveats)
  }`;

  const prompt = `You are a brand ownership researcher for professional hair stylists. Use your web search tool to look up the current ownership structure for each of these brands: ${brands.join(', ')}.

For EACH brand, search for:
1. Who currently owns it (parent company, PE firm, public company, ESOP, etc.)
2. Whether it is employee-owned or has an ESOP
3. The current CEO/President — is it a woman?
4. Whether it was founded by a woman

Be specific and factual. Note if ownership changed recently. Do NOT guess — if you can't confirm something, say so in the note field and set confidence low.

Return ONLY a valid JSON array matching this schema for each brand — no markdown, no code fences, no preamble:
${schema}`;

  try {
    let resultArray;

    if (isLocal) {
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
          max_tokens: 2000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const text = data.content?.find(c => c.type === 'text')?.text || '[]';
      const clean = text.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
      resultArray = JSON.parse(clean);
    } else {
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
      esop: false,
      womenOwned: false,
      womenFounded: false,
      womanLed: false,
      womanLedName: null,
      womanLedTitle: null,
      confidence: 1,
      note: 'AI lookup unavailable. Treat as unverified.'
    }));
  }
}