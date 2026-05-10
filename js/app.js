// ── APPLICATION STATE ───────────────────────────────────
const S = {
  results: [],
  votes: {},
  filter: 'all',
  currentCategory: null,
};

// ── SEARCH FUNCTIONS ────────────────────────────────────

function catSearch(btn, cat) {
  btn.classList.add('on');
  document.querySelectorAll('.cat-btn').forEach(b => {
    if (b !== btn) b.classList.remove('on');
  });
  S.currentCategory = cat;
  const brands = CAT_BRANDS[cat] || [];
  startSearch(brands, `Category: ${cat}`, cat);
}

function fillExample(text) {
  document.getElementById('brand-input').value = text;
}

function doLookup() {
  const input = document.getElementById('brand-input').value.trim();
  if (!input) {
    alert('Please enter at least one brand name');
    return;
  }
  const brands = input.split(',').map(b => b.trim()).filter(Boolean);
  startSearch(brands, input);
}

function doHdrSearch() {
  const input = document.getElementById('hdr-brand-input').value.trim();
  if (!input) return;
  const brands = input.split(',').map(b => b.trim()).filter(Boolean);
  document.getElementById('hdr-brand-input').value = '';
  startSearch(brands, input);
}

function goSetup() {
  document.getElementById('setup').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('brand-input').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('on'));
  S.currentCategory = null;
}

// ── MAIN SEARCH ENGINE ──────────────────────────────────

async function startSearch(brands, queryLabel, category = null) {
  if (!brands || !brands.length) {
    alert('Please enter at least one brand name');
    return;
  }

  S.currentCategory = category;
  S.results = [];
  S.votes = {};
  S.filter = 'all';

  document.getElementById('setup').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('loading').style.display = 'block';
  document.getElementById('cards').innerHTML = '';

  const normalizedBrands = Array.isArray(brands) ? brands : brands.split(',').map(b => b.trim()).filter(Boolean);
  await runLookup(normalizedBrands);
}

async function runLookup(brands) {
  const found = [];
  const toAI = [];

  // Fast database lookup
  for (const b of brands) {
    const data = lookupBrand(b);
    if (data) {
      found.push({ name: b, ...data, fromDB: true });
    } else {
      toAI.push(b);
    }
  }

  // AI fallback for unknown brands
  let aiResults = [];
  if (toAI.length > 0) {
    document.getElementById('loading-sub').innerHTML = `Researching ${toAI.join(', ')}<br>via AI...`;
    aiResults = await aiLookup(toAI);
  }

  S.results = [...found, ...aiResults.filter(r => r && r.tier !== undefined)];
  document.getElementById('loading').style.display = 'none';

  // Reset filters to 'all'
  document.querySelectorAll('.fpill').forEach((p, i) => {
    p.classList.toggle('on', i === 0);
    p.classList.toggle('off', i !== 0);
  });
  S.filter = 'all';

  renderResults();
}

// ── FILTER & RENDER ────────────────────────────────────

function setFilter(f, el) {
  S.filter = f;
  document.querySelectorAll('.fpill').forEach(p => {
    p.classList.remove('on');
    p.classList.add('off');
  });
  el.classList.remove('off');
  el.classList.add('on');
  renderResults();
}

function getFiltered() {
  return S.results.filter(r => {
    if (S.filter === 'all') return true;
    if (S.filter === 'pe') return r.tier <= 1;
    if (S.filter === 'corp') return r.tier === 1;
    if (S.filter === 'indie') return r.tier >= 4;
    if (S.filter === 'women') return r.womenOwned || r.womenFounded;
    return true;
  });
}

function renderResults() {
  const filtered = getFiltered();
  const cards = document.getElementById('cards');
  document.getElementById('indie-count').textContent = S.results.filter(r => r.tier >= 4).length;

  if (!filtered.length) {
    cards.innerHTML = `<div style="text-align:center;padding:50px 20px;color:#9a8a70;font-size:13px">No brands match this filter.</div>`;
    return;
  }

  const peCount = S.results.filter(r => r.tier <= 1).length;
  const total = S.results.length;

  let bIcon, bTitle, bSub;
  if (peCount === 0) {
    bIcon = '🌿';
    bTitle = 'All brands are independent!';
    bSub = `${total} brand${total > 1 ? 's' : ''} checked — no corporate ownership detected.`;
  } else if (peCount === total) {
    bIcon = '⚠️';
    bTitle = `All ${total} brand${total > 1 ? 's' : ''} are corporate-owned.`;
    bSub = 'Every result is owned by a corporation or PE firm. See indie alternatives below.';
  } else {
    bIcon = '✂️';
    bTitle = `${peCount}/${total} brand${total > 1 ? 's' : ''} ${peCount > 1 ? 'are' : 'is'} corporate.`;
    bSub = 'Mixed ownership found. Check details below.';
  }

  let html = `<div class="summary-banner"><div class="sb-icon">${bIcon}</div><div><div class="sb-title">${bTitle}</div><div class="sb-sub">${bSub}</div></div></div>`;

  filtered.forEach((r, i) => {
    html += buildCard(r, i);
  });

  // Add indie recommendations
  const recBrands = getIndieBrands();
  if (recBrands.length) {
    html += `<div class="indie-section"><div class="indie-header"><div class="indie-header-left"></div><div class="indie-header-text">✂️ INDIE ALTERNATIVES ✂️</div><div class="indie-header-line"></div></div>`;
    recBrands.forEach(b => html += renderIndieCard(b));
    html += `</div>`;
  }

  cards.innerHTML = html;
}

function getIndieBrands() {
  const allBrands = [...SPONSORED, ...INDIE_DIR];
  const seen = new Set();
  const relevant = [];

  // Filter out brands already in results
  allBrands.forEach(b => {
    const inResults = S.results.some(r => r.name.toLowerCase() === b.name.toLowerCase());
    if (!inResults) {
      seen.add(b.id);
      relevant.push(b);
    }
  });

  return relevant.slice(0, 6);
}

// ── CARD RENDERING ────────────────────────────────────

function buildCard(r, idx) {
  const tc = TIERS[r.tier ?? 3];
  const photo = getCardPhoto(r, S.currentCategory);
  const sub = (r.owner || 'Unknown').slice(0, 50) + ((r.owner || '').length > 50 ? '…' : '');
  const logo = `https://logo.clearbit.com/${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  return `<div class="card" style="animation-delay:${idx * 0.05}s">
    <div class="card-photo">
      <img src="${photo}" alt="${r.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22140%22><rect fill=%22%23f0e8d8%22 width=%22300%22 height=%22140%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23ccc%22>${r.name}</text></svg>'"/>
      <div class="card-photo-overlay"></div>
      ${renderTierBadge(r.tier)}
      <div class="card-brand-logo">
        <img src="${logo}" alt="${r.name}" onerror="this.parentElement.innerHTML='${r.name[0]}'"/>
      </div>
    </div>
    <div class="card-body">
      <div class="brand-name">${r.name}</div>
      <div class="brand-sub">${sub}</div>
      ${renderScoreBar(TIERS[r.tier].score, r.tier)}
      ${renderAnalysis(r)}
      ${renderVoteButtons(r.name)}
    </div>
    <button class="expand-btn" onclick="toggleDetail(this)">▼ Full details</button>
    <div class="card-detail">
      ${r.note ? `<div class="detail-row"><div class="detail-icon">ℹ️</div><div class="detail-text">${r.note}</div></div>` : ''}
      <div class="detail-row"><div class="detail-icon">🏛️</div><div class="detail-text"><strong>Owner:</strong> ${r.owner || 'Not verified'}</div></div>
      <div class="detail-row"><div class="detail-icon">📊</div><div class="detail-text">${TIER_EXPLANATIONS[r.tier ?? 3]}</div></div>
    </div>
  </div>`;
}

function toggleDetail(btn) {
  const detail = btn.closest('.card').querySelector('.card-detail');
  const isOpen = detail.style.display === 'block';
  detail.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '▼ Full details' : '▲ Hide details';
}

// ── VOTING ──────────────────────────────────────────────

function castVote(name, type, btn) {
  if (S.votes[name]) return;
  S.votes[name] = type;
  btn.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
  btn.classList.add('on');
  btn.textContent = type === 'correct' ? '✓ Thank you!' : '🚩 Thank you!';
}

// ── ABOUT PANEL ────────────────────────────────────────

function openAbout() {
  document.getElementById('about-overlay').style.display = 'block';
  document.getElementById('about-panel').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeAbout() {
  document.getElementById('about-overlay').style.display = 'none';
  document.getElementById('about-panel').style.display = 'none';
  document.body.style.overflow = '';
}

// ── INITIALIZATION ──────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  // Pre-populate example tags with first 5 categories
  const examples = [
    { text: 'Wella, Redken, Matrix', label: 'Wella, Redken' },
    { text: 'Olaplex, K18, Briogeo', label: 'Olaplex, K18' },
    { text: 'Tomb45, Danger Jones', label: 'Tomb45' },
    { text: 'Davines, Paul Mitchell', label: 'Davines' },
    { text: 'Ivy Ann Shears', label: 'Ivy Ann ✂️' },
  ];
  // Already populated in HTML
});
