const S = { results: [], votes: {}, filter: 'all', currentCategory: null };

function startSearch(brands, queryLabel, category = null) {
  if (!brands || !brands.length) { alert('Please enter at least one brand name'); return; }
  S.currentCategory = category;
  S.results = [];
  S.votes = {};
  S.filter = 'all';
  document.getElementById('setup').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('loading').style.display = 'block';
  document.getElementById('cards').innerHTML = '';
  const normalizedBrands = Array.isArray(brands) ? brands : brands.split(',').map(b => b.trim()).filter(Boolean);
  runLookup(normalizedBrands);
}

async function runLookup(brands) {
  const found = [];
  const toAI = [];
  for (const b of brands) {
    const data = lookupBrand(b);
    if (data) {
      found.push({ name: b, ...data, fromDB: true });
    } else {
      toAI.push(b);
    }
  }
  let aiResults = [];
  if (toAI.length > 0) {
    document.getElementById('loading-sub').innerHTML = `Researching ${toAI.join(', ')}<br>via AI brand intelligence...`;
    aiResults = await aiLookup(toAI);
  }
  S.results = [...found, ...aiResults.filter(r => r && r.tier !== undefined)];
  document.getElementById('loading').style.display = 'none';
  document.querySelectorAll('.fpill').forEach((p, i) => {
    p.classList.toggle('on', i === 0);
    p.classList.toggle('off', i !== 0);
  });
  S.filter = 'all';
  renderResults();
}

function getFiltered() {
  return S.results.filter(r => {
    if (S.filter === 'all') return true;
    if (S.filter === 'pe') return r.tier === 0;
    if (S.filter === 'corp') return r.tier <= 1;
    if (S.filter === 'indie') return r.tier >= 4;
    if (S.filter === 'women') return r.womenOwned || r.womenFounded;
    return true;
  });
}

function setFilter(f, el) {
  S.filter = f;
  document.querySelectorAll('.fpill').forEach(p => { p.classList.remove('on'); p.classList.add('off'); });
  el.classList.remove('off');
  el.classList.add('on');
  renderResults();
}

function renderResults() {
  const filtered = getFiltered();
  const cards = document.getElementById('cards');
  document.getElementById('indie-count').textContent = S.results.filter(r => r.tier >= 4).length;
  if (!filtered.length) { cards.innerHTML = '<div style="text-align:center;padding:50px 20px;color:#9a8a70;font-size:13px">No brands match this filter.</div>'; return; }
  const peCount = S.results.filter(r => r.tier <= 1).length;
  const total = S.results.length;
  let bIcon, bTitle, bSub;
  if (peCount === 0) {
    bIcon = '🌿'; bTitle = 'No corporate ownership detected.'; bSub = `All ${total} brand${total > 1 ? 's' : ''} checked appear to be independent.`;
  } else if (peCount === total) {
    bIcon = '⚠️'; bTitle = `All ${total} brand${total > 1 ? 's' : ''} are corporately owned.`; bSub = 'Every brand checked is owned by a corporation or outside investors.';
  } else {
    bIcon = '✂️'; bTitle = `${peCount} of ${total} brand${total > 1 ? 's' : ''} ${peCount > 1 ? 'are' : 'is'} corporately owned.`; bSub = 'Mixed ownership found.';
  }
  let html = `<div class="summary-banner"><div class="sb-icon">${bIcon}</div><div><div class="sb-title">${bTitle}</div><div class="sb-sub">${bSub}</div></div></div>`;
  filtered.forEach((r, i) => html += buildCard(r, i));
  const indieBrands = getRelevantIndieBrands();
  if (indieBrands.length) {
    html += `<div class="indie-section"><div class="indie-header"><div class="indie-header-left"></div><div class="indie-header-text">✂️ &nbsp;Shop Indie&nbsp; ✂️</div><div class="indie-header-line"></div></div>`;
    indieBrands.forEach((b, i) => html += buildIndieCard(b, i));
    html += `</div>`;
  }
  cards.innerHTML = html;
}

function getRelevantIndieBrands() {
  const searchNames = S.results.map(r => r.name.toLowerCase()).join(' ');
  const cat = S.currentCategory;
  const allBrands = [...SPONSORED, ...INDIE_DIR];
  const seen = new Set();
  let relevant = [];
  allBrands.forEach(b => {
    if (seen.has(b.id)) return;
    const isAlreadyResult = S.results.some(r => r.name.toLowerCase() === b.name.toLowerCase());
    if (isAlreadyResult) return;
    const catMatch = cat && b.categories.includes(cat);
    const kwMatch = b.tags && b.tags.some(k => searchNames.includes(k.toLowerCase()));
    if (catMatch || kwMatch) { seen.add(b.id); relevant.push(b); }
  });
  if (!relevant.length) {
    allBrands.forEach(b => {
      if (!seen.has(b.id)) { seen.add(b.id); relevant.push(b); }
    });
  }
  if (cat === 'tools') {
    const ivyAnn = relevant.filter(b => b.id === 'ivy-ann-shears');
    const others = relevant.filter(b => b.id !== 'ivy-ann-shears');
    relevant = [...ivyAnn, ...others];
  }
  return relevant.slice(0, 7);
}

function getCardPhoto(r) {
  const cats = CAT_PHOTOS[S.currentCategory] || CAT_PHOTOS.default;
  const idx = Math.abs(r.name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % cats.length;
  return cats[idx];
}

function buildCard(r, i) {
  const tc = TIERS[r.tier ?? 3];
  const photo = getCardPhoto(r);
  const wBadge = r.womenOwned ? ' · 👩 Woman-Owned' : (r.womenFounded ? ' · 👩 Women-Founded' : '');
  const sub = (r.owner || 'Unknown ownership').slice(0, 60) + ((r.owner || '').length > 60 ? '…' : '');
  const conf = Array.from({length: 5}, (_, j) => `<div style="width:7px;height:7px;border-radius:50%;background:${j < (r.confidence || 3) ? '#c8a96e' : '#e8dece'}"></div>`).join('');
  return `<div class="card" style="animation-delay:${i * 0.07}s">
    <div class="card-photo">
      <img src="${photo}" alt="${r.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85'"/>
      <div class="card-photo-overlay"></div>
      <div class="card-tier-badge">${tc.icon} ${tc.label}</div>
    </div>
    <div class="card-body">
      <div class="brand-name">${r.name}</div>
      <div class="brand-sub">${sub}${wBadge}</div>
      <div class="score-bar-wrap">
        <div class="score-bar-label">
          <span class="sleft" style="color:${tc.color}">${tc.icon} ${tc.label}</span>
          <span class="sright">Independence: ${tc.score}/100</span>
        </div>
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${tc.score}%;background:${tc.bar}"></div></div>
      </div>
      <div class="analysis-grid">
        <div class="ag-cell"><div class="ag-label">Corporate Owned</div><div class="ag-val ${r.tier <= 1 ? 'bad' : 'good'}">${r.tier <= 1 ? '✗ Yes' : '✓ No'}</div></div>
        <div class="ag-cell"><div class="ag-label">Woman-Owned</div><div class="ag-val ${r.womenOwned ? 'good' : r.womenFounded ? 'warn' : 'bad'}">${r.womenOwned ? '✓ Yes' : r.womenFounded ? '~ Women-Founded' : '✗ Not confirmed'}</div></div>
        <div class="ag-cell"><div class="ag-label">Independent</div><div class="ag-val ${r.indie ? 'good' : 'bad'}">${r.indie ? '✓ Yes' : '✗ No'}</div></div>
        <div class="ag-cell"><div class="ag-label">Confidence</div><div style="display:flex;gap:3px;margin-top:3px">${conf}</div></div>
      </div>
      <div class="vote-row">
        <button class="vbtn vc" onclick="doVote('${r.name}', 'confirm', ${i})">${S.votes[r.name] === 'confirm' ? '✓ Confirmed!' : '✅ Confirm Rating'}</button>
        <button class="vbtn vf" onclick="doVote('${r.name}', 'flag', ${i})">${S.votes[r.name] === 'flag' ? '⚑ Flagged!' : '🚩 Flag Inaccurate'}</button>
      </div>
    </div>
    <button class="expand-btn" onclick="toggleDetail(${i})" id="exbtn-${i}">▼ Full analysis</button>
    <div class="card-detail" id="det-${i}">
      ${r.note ? `<div class="detail-row"><div class="detail-icon">ℹ️</div><div class="detail-text">${r.note}</div></div>` : ''}
      <div class="detail-row"><div class="detail-icon">🏛️</div><div class="detail-text"><strong>Full owner:</strong> ${r.owner || 'Not verified'}</div></div>
      <div class="detail-row"><div class="detail-icon">🎯</div><div class="detail-text">${TIER_EXPLANATIONS[r.tier ?? 3]}</div></div>
    </div>
  </div>`;
}

function buildIndieCard(b, i) {
  const delay = i * 0.09 + 0.1;
  const wb = b.womenOwned ? `<span class="ibadge-pill women">👩 Woman-Owned</span>` : (b.womenFounded ? `<span class="ibadge-pill women">👩 Women-Founded</span>` : '');
  const bc = b.bcorp ? `<span class="ibadge-pill bcorp">🌿 B-Corp</span>` : '';
  const tags = b.tags.map(t => `<span class="icard-tag">${t}</span>`).join('');
  const sp = b.sponsored ? `<div class="sponsored-tag">Sponsored</div>` : '';
  return `<div class="icard ${b.sponsored ? 'sponsored' : ''}" style="animation-delay:${delay}s">
    ${sp}
    <div class="icard-photo" onclick="window.open('${b.website}','_blank')">
      <img src="${b.photo}" alt="${b.name}" loading="lazy" onerror="this.style.display='none'"/>
      <div class="icard-photo-overlay"></div>
      <div class="icard-photo-badges"><span class="ibadge-pill indie">✅ Indie</span>${wb}${bc}</div>
      <div class="icard-photo-name">
        <h3>${b.name}</h3>
        <div class="icard-owner">${b.owner}</div>
      </div>
    </div>
    <div class="icard-body">
      <p class="icard-desc">${b.desc}</p>
      <div class="icard-tags">${tags}</div>
      <div class="icard-actions">
        <a href="${b.website}" target="_blank" class="icard-btn primary">🌐 Visit Website</a>
        <button class="icard-btn secondary" onclick="toggleMore('${b.id}')">More Info ▾</button>
      </div>
      <div class="icard-more" id="imore-${b.id}">
        <div class="icard-more-inner">
          <div class="icard-more-row"><div class="icard-more-icon">💡</div><div>${b.more}</div></div>
        </div>
      </div>
    </div>
  </div>`;
}

function toggleDetail(i) {
  const el = document.getElementById('det-' + i);
  const btn = document.getElementById('exbtn-' + i);
  const open = el.style.display === 'block';
  el.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '▼ Full analysis' : '▲ Close';
}

function toggleMore(id) {
  const el = document.getElementById('imore-' + id);
  el.classList.toggle('open');
  const btn = el.closest('.icard-body').querySelector('.icard-btn.secondary');
  if (btn) btn.textContent = el.classList.contains('open') ? 'Less Info ▴' : 'More Info ▾';
}

function doVote(name, type, idx) {
  if (S.votes[name]) return;
  S.votes[name] = type;
  const card = document.querySelectorAll('.card')[idx];
  if (!card) return;
  const [btn1, btn2] = card.querySelectorAll('.vbtn');
  btn1.disabled = btn2.disabled = true;
  if (type === 'confirm') {
    btn1.classList.add('on');
    btn1.textContent = '✓ Confirmed!';
  } else {
    btn2.classList.add('on');
    btn2.textContent = '⚑ Flagged!';
  }
}

function doLookup() {
  const brands = document.getElementById('brand-input').value.split(',').map(b => b.trim()).filter(b => b.length > 0);
  if (!brands.length) return;
  startSearch(brands, document.getElementById('brand-input').value);
}

function doHdrSearch() {
  const input = document.getElementById('hdr-brand-input').value.trim();
  if (!input) return;
  const brands = input.split(',').map(b => b.trim()).filter(Boolean);
  document.getElementById('hdr-brand-input').value = '';
  startSearch(brands, input);
}

function catSearch(btn, cat) {
  const brands = CAT_BRANDS[cat] || [];
  if (!brands.length) return;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  startSearch(brands, `Category: ${cat}`, cat);
}

function fillExample(text) {
  document.getElementById('brand-input').value = text;
}

function goSetup() {
  document.getElementById('setup').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('brand-input').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('on'));
  S.currentCategory = null;
}

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