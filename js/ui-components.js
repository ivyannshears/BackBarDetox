function buildLogo(size = 'lg') {
  const sizes = {
    sm: { mark: '9px', dx: '11px' },
    md: { mark: '26px', dx: '23px' },
    lg: { mark: '28px', dx: '28px' }
  };
  const s = sizes[size] || sizes.lg;
  return `<span class="Dx" style="font-size:${s.dx};color:#fff"><span class="d">D</span><span class="x">x</span></span>`;
}

function initializeLogos() {
  const logoElements = [
    { id: 'setup-logo', parent: '.slogo-mark', size: 'md' },
    { id: 'loading-logo', parent: '.loading-mark', size: 'lg' },
    { id: 'about-logo', parent: '.about-mark', size: 'md' },
    { id: 'footer-logo', parent: '.footer-mark', size: 'sm' }
  ];
  
  logoElements.forEach(el => {
    const elem = document.querySelector(el.parent);
    if (elem) elem.innerHTML = buildLogo(el.size);
  });
}

window.addEventListener('DOMContentLoaded', initializeLogos);