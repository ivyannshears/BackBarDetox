export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { brands } = await req.json();
    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return new Response(JSON.stringify({ error: 'brands array required' }), { status: 400 });
    }

    const prompt = `Analyze brand ownership for: ${brands.join(', ')}. Return ONLY a valid JSON array — no markdown, no code fences, no preamble. Schema per item: {name, owner, tier (0-5), pe, indie, womenOwned, womenFounded, note}. Tiers: 0=PE-backed, 1=public corp, 2=recently acquired, 3=large private, 4=indie founder-owned, 5=indie+woman-owned or B-Corp. For unknown brands, reason through likelihood. CRITICAL: Never invent facts — if uncertain, use tier 3 and note uncertainty.`;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return new Response(JSON.stringify({ error: `Anthropic error: ${upstream.status}`, detail: err }), { status: 502 });
    }

    const data = await upstream.json();
    const text = data.content?.find(c => c.type === 'text')?.text || '[]';
    const clean = text.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();

    return new Response(clean, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
