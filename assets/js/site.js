/* Castle Fine Art — test site. Shared chrome + helpers.
   Data comes from assets/js/data.js (window.CFA), built by tools/build-data.py. */
(function () {
  const D = window.CFA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  // Shopify CDN resizes on the fly — ask for the width we need
  const img = (src, w) => src ? src + (src.includes('?') ? '&' : '?') + 'width=' + w : '';
  const param = k => new URLSearchParams(location.search).get(k);

  const byHandle = new Map(D.products.map(p => [p.h, p]));
  const bySlug = new Map(D.artists.map(a => [a.s, a]));

  const ICON = {
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    zoom: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M8 10.5h5M10.5 8v5"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    frame: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18"/><rect x="7" y="7" width="10" height="10"/></svg>',
    card: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 10h20"/></svg>',
    cert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 8 5-3 5 3-1.5-8"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 4h16v12H8l-4 4z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/></svg>',
    gallery: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>',
  };

  /* ---------- Chrome ---------- */
  const page = document.body.dataset.page;
  const NAV = [
    ['shop.html', 'Shop', 'shop'], ['shop.html?type=Original', 'Originals', 'orig'],
    ['artists.html', 'Artists', 'artists'], ['galleries.html', 'Galleries', 'galleries'],
    ['about.html', 'About', 'about'], ['contact.html', 'Contact', 'contact'],
  ];
  const navHtml = NAV.map(([h, t, k]) => `<a href="${h}"${(k === page && !(k === 'shop' && param('type') === 'Original')) || (k === 'orig' && page === 'shop' && param('type') === 'Original') ? ' aria-current="page"' : ''}>${t}</a>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip" href="#main">Skip to content</a>
    <div class="demo-note">Concept demo — not the official Castle Fine Art website<span class="hide-sm"> · <a href="https://www.castlefineart.com" rel="nofollow">castlefineart.com</a></span></div>
    <div class="announce" aria-live="polite"><span class="on">Free UK delivery on all artwork &amp; sculpture</span></div>
    <header class="header" id="hdr">
      <div class="wrap header__in">
        <nav class="nav" aria-label="Main">${navHtml.split('</a>').slice(0, 4).join('</a>')}</a></nav>
        <button class="burger" aria-label="Open menu" id="burger">${ICON.menu}</button>
        <a class="logo" href="index.html" aria-label="Castle Fine Art — home"><img src="assets/img/cfa-logo-black.svg" alt="Castle Fine Art"></a>
        <div class="tools">
          <a class="hide-sm" href="about.html">About</a>
          <a class="hide-sm" href="contact.html">Contact</a>
          <button aria-label="Search" id="openSearch">${ICON.search}</button>
          <button aria-label="Basket" id="openBag" style="position:relative">${ICON.bag}<span class="bag-count" id="bagCount">0</span></button>
        </div>
      </div>
    </header>
    <div class="menu" id="menu" aria-hidden="true">
      <button class="menu__close" id="menuClose">Close</button>
      ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    </div>
    <div class="search" id="search" aria-hidden="true">
      <div class="wrap">
        <div class="search__bar">${ICON.search}<input id="q" type="search" placeholder="Search artists, artworks, galleries…" autocomplete="off" aria-label="Search"><button class="link-arrow" id="closeSearch">Close</button></div>
        <div class="search__results" id="sres"></div>
      </div>
    </div>
    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="bag" aria-label="Basket">
      <div class="drawer__head"><span>Your basket</span><button id="closeBag">Close</button></div>
      <div class="drawer__body" id="bagBody"></div>
      <div class="drawer__foot" id="bagFoot"></div>
    </aside>
    <div class="modal" id="qv" role="dialog" aria-modal="true"></div>
    <div class="toast" id="toast"></div>`);

  const main = $('#main');
  if (main) main.classList.add('page-fade');

  document.body.insertAdjacentHTML('beforeend', `
    <section class="section section--ink">
      <div class="wrap newsletter">
        <div>
          <p class="eyebrow">Newsletter</p>
          <h2 class="display">Be first to new releases</h2>
          <p class="lede" style="margin-top:14px">Join our mailing list and unlock 5% off your first purchase, a birthday treat and early access to artist events.</p>
        </div>
        <form id="nl" novalidate><input type="email" placeholder="Your email address" aria-label="Email address" required><button>Subscribe</button></form>
      </div>
    </section>
    <footer class="footer">
      <div class="wrap">
        <div class="footer__grid">
          <div>
            <img class="footer__logo" src="assets/img/cfa-logo-reversed.svg" alt="Castle Fine Art">
            <p>Castle Fine Art Head Office<br>Unit 29-31, Level 2, The Mailbox<br>Wharfside, Birmingham B1 1RD</p>
            <p><a href="tel:+441213843007">+44 (0)121 384 3007</a><br><a href="mailto:hello@castlefineart.com">hello@castlefineart.com</a></p>
          </div>
          <div><h5>Shop</h5><ul>
            <li><a href="shop.html?sort=new">New arrivals</a></li><li><a href="shop.html?type=Limited%20Edition">Limited editions</a></li>
            <li><a href="shop.html?type=Original">Originals</a></li><li><a href="shop.html?type=Sculpture">Sculpture</a></li><li><a href="artists.html">All artists</a></li></ul></div>
          <div><h5>Help</h5><ul>
            <li><a href="contact.html">Make an enquiry</a></li><li><a href="contact.html?topic=consultant">Talk to an art consultant</a></li>
            <li><a href="galleries.html">Find your local gallery</a></li><li><a href="about.html#finance">Payment &amp; finance</a></li><li><a href="about.html#delivery">Delivery &amp; returns</a></li></ul></div>
          <div><h5>About</h5><ul>
            <li><a href="about.html">Our story</a></li><li><a href="galleries.html">${D.galleries.length} galleries</a></li><li><a href="contact.html?topic=submit">Submit your art</a></li><li><a href="contact.html?topic=press">Press enquiries</a></li></ul></div>
        </div>
        <div class="footer__base">
          <span>© ${new Date().getFullYear()} Castle Fine Art · Part of the Halcyon Group · Your World, Our Art®</span>
          <div class="colour-bar" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
      </div>
    </footer>`);

  // Announcement rotator
  (() => {
    const msgs = ['Free UK delivery on all artwork &amp; sculpture', 'Interest-free finance available', `Visit us in ${D.galleries.length} galleries nationwide`, 'Every piece mounted, glazed or framed by hand'];
    const el = $('.announce span'); let i = 0;
    setInterval(() => { el.classList.remove('on'); setTimeout(() => { i = (i + 1) % msgs.length; el.innerHTML = msgs[i]; el.classList.add('on'); }, 600); }, 4500);
  })();

  // Header: hide on scroll down, show on scroll up; transparent over hero
  const hdr = $('#hdr'); const overHero = !!$('.hero');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('scrolled', y > 10);
    hdr.classList.toggle('hide', y > 400 && y > lastY && !document.body.classList.contains('locked'));
    if (overHero) hdr.classList.toggle('over', y < innerHeight * .75);
    const az = $('.az'); if (az) az.style.top = hdr.classList.contains('hide') ? '0px' : '';
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Overlays
  const scrim = $('#scrim');
  const lock = on => { document.body.classList.toggle('locked', on); document.body.style.overflow = on ? 'hidden' : ''; };
  const closeAll = () => { $$('.drawer.open, .search.open, .menu.open, .modal.open, .filters.open').forEach(e => e.classList.remove('open')); scrim.classList.remove('on'); lock(false); };
  scrim.onclick = closeAll;
  addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); } });
  $('#burger').onclick = () => { $('#menu').classList.add('open'); lock(true); };
  $('#menuClose').onclick = closeAll;

  /* ---------- Search ---------- */
  const openSearch = () => { closeAll(); $('#search').classList.add('open'); scrim.classList.add('on'); lock(true); setTimeout(() => $('#q').focus(), 350); renderSearch(''); };
  $('#openSearch').onclick = openSearch;
  $('#closeSearch').onclick = closeAll;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function renderSearch(q) {
    const t = norm(q.trim());
    let arts, prods, gals;
    if (!t) {
      arts = D.artists.filter(a => a.featured).slice(0, 8);
      prods = D.products.filter(p => p.isNew).slice(0, 8);
      gals = [];
    } else {
      const words = t.split(/\s+/);
      const hit = s => words.every(w => norm(s).includes(w));
      arts = D.artists.filter(a => hit(a.n)).slice(0, 8);
      prods = D.products.filter(p => hit(p.t + ' ' + p.a + ' ' + p.ty + ' ' + (p.sub || []).join(' '))).slice(0, 12);
      gals = D.galleries.filter(g => hit(g.n + ' ' + g.addr)).slice(0, 5);
    }
    $('#sres').innerHTML = `
      <div>
        <h6>${t ? 'Artists' : 'Popular artists'}</h6>
        <ul>${arts.map(a => `<li><a href="artist.html?a=${a.s}">${esc(a.n)}</a></li>`).join('') || '<li class="muted">No artists</li>'}</ul>
        ${gals.length ? `<h6 style="margin-top:28px">Galleries</h6><ul>${gals.map(g => `<li><a href="gallery.html?g=${g.s}">${esc(g.n)}</a></li>`).join('')}</ul>` : ''}
      </div>
      <div>
        <h6>${t ? `Artworks (${prods.length}${prods.length === 12 ? '+' : ''})` : 'New arrivals'}</h6>
        <div class="sgrid">${prods.map(p => cardHtml(p, { small: true })).join('') || '<p class="muted">Nothing found — try an artist name or a subject like “beach” or “dogs”.</p>'}</div>
        ${t && prods.length ? `<p style="margin-top:24px"><a class="link-arrow" href="shop.html?q=${encodeURIComponent(q)}">See all results →</a></p>` : ''}
      </div>`;
  }
  let st; $('#q').addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => renderSearch(e.target.value), 120); });
  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') location.href = 'shop.html?q=' + encodeURIComponent(e.target.value); });

  /* ---------- Basket (local only) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('cfa-bag') || '[]'); } catch { return []; } },
    set(v) { try { localStorage.setItem('cfa-bag', JSON.stringify(v)); } catch { } },
  };
  function renderBag() {
    const items = store.get().filter(i => byHandle.has(i.h));
    const n = items.length;
    $('#bagCount').textContent = n; $('#bagCount').classList.toggle('on', n > 0);
    if (!n) {
      $('#bagBody').innerHTML = `<div class="success" style="padding:60px 0"><p class="display" style="font-size:1.6rem">Your basket is empty</p><p class="muted">Start with our newest releases.</p></div>`;
      $('#bagFoot').innerHTML = `<a class="btn" href="shop.html?sort=new">Explore new arrivals</a>`;
      return;
    }
    let total = 0;
    $('#bagBody').innerHTML = items.map((i, ix) => {
      const p = byHandle.get(i.h); const v = p.v.find(v => v.n === i.v) || p.v[0]; total += v.p;
      return `<div class="line"><div class="line__img"><img src="${img(p.img[0], 200)}" alt=""></div><div>
        <div class="card__artist">${esc(p.a)}</div><h5>${esc(p.t)}</h5>${p.v.length > 1 ? `<div class="muted">${esc(v.n)}</div>` : ''}
        <div class="line__row"><span>${money(v.p)}</span><button data-rm="${ix}">Remove</button></div></div></div>`;
    }).join('');
    $('#bagFoot').innerHTML = `<div class="total"><span>Subtotal</span><b>${money(total)}</b></div>
      <p class="muted" style="margin:0;font-size:.8rem">Free UK delivery. Interest-free finance available at checkout.</p>
      <button class="btn" onclick="CFAUI.toast('This is a test site — checkout is switched off.')">Checkout</button>
      <a class="btn btn--ghost" href="contact.html?topic=consultant">Ask a consultant first</a>`;
    $$('[data-rm]').forEach(b => b.onclick = () => { const all = store.get(); all.splice(+b.dataset.rm, 1); store.set(all); renderBag(); });
  }
  const openBag = () => { closeAll(); renderBag(); $('#bag').classList.add('open'); scrim.classList.add('on'); lock(true); };
  $('#openBag').onclick = openBag; $('#closeBag').onclick = closeAll;
  function addToBag(h, v) {
    const all = store.get(); all.push({ h, v }); store.set(all); renderBag();
    const p = byHandle.get(h);
    toast(`<span><b>${esc(p.t)}</b> added to your basket</span><a href="#" onclick="event.preventDefault();CFAUI.openBag()">View</a>`);
  }
  renderBag();

  let tt; function toast(html) { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3600); }

  /* ---------- Product card ---------- */
  function cardHtml(p, o = {}) {
    const alt = p.img[1];
    const badge = !p.av ? '<span class="card__badge">Sold out</span>' : p.isNew ? '<span class="card__badge card__badge--new">New</span>' : p.c > p.p ? '<span class="card__badge">Offer</span>' : '';
    const w = o.small ? 300 : 600;
    return `<article class="card${o.enter ? ' enter' : ''}"${o.delay != null ? ` style="animation-delay:${o.delay}ms"` : ''}>
      <div class="card__mwrap"><a href="product.html?p=${p.h}" aria-label="${esc(p.t)} by ${esc(p.a)}">
        <div class="card__media">${o.small ? '' : badge}
          <img class="main" loading="lazy" src="${img(p.img[0], w)}" alt="">
          ${alt && !o.small ? `<img class="alt" loading="lazy" src="${img(alt, w)}" alt="">` : ''}
        </div>
      </a>
      ${o.small ? '' : `<button class="card__quick" data-qv="${p.h}">Quick view</button>`}</div>
      <a class="card__body" href="product.html?p=${p.h}" tabindex="-1">
        <div class="card__artist">${esc(p.a)}</div>
        <h3 class="card__title">${esc(p.t)}</h3>
        ${o.small ? '' : `<div class="card__type">${esc(p.ty)}${p.ed ? ' · Edition of ' + p.ed : ''}</div>`}
        <div class="card__price">${p.vary ? 'From ' : ''}${money(p.p)}${p.c > p.p ? `<s>${money(p.c)}</s>` : ''}</div>
      </a>
    </article>`;
  }

  /* ---------- Quick view ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-qv]'); if (!b) return;
    e.preventDefault(); const p = byHandle.get(b.dataset.qv); if (!p) return;
    const m = $('#qv');
    m.innerHTML = `<div class="qv">
      <div class="qv__img"><img src="${img(p.img[0], 900)}" alt="${esc(p.t)}"></div>
      <div class="qv__info"><button class="qv__close" id="qvClose">Close</button>
        <div class="card__artist"><a href="artist.html?a=${p.as}">${esc(p.a)}</a></div>
        <h2 class="display" style="font-size:2rem;margin:8px 0 14px">${esc(p.t)}</h2>
        <div class="price">${money(p.p)}</div>
        <p class="muted" style="font-size:.9rem">${esc(p.ty)}${p.ed ? ' · Edition of ' + p.ed : ''}${p.size ? '<br>' + esc(p.size) : ''}</p>
        <p style="font-size:.95rem;color:#3d3d3d">${esc(p.sum)}</p>
        <div class="buy" style="margin-top:24px">
          ${p.av ? `<button class="btn" data-add="${p.h}">Add to basket</button>` : `<a class="btn" href="contact.html?topic=consultant&p=${p.h}">Ask about availability</a>`}
          <a class="btn btn--ghost" href="product.html?p=${p.h}">View full details</a>
        </div></div></div>`;
    m.classList.add('open'); scrim.classList.add('on'); lock(true);
    $('#qvClose').onclick = closeAll;
    m.onclick = ev => { if (ev.target === m) closeAll(); };
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    const p = byHandle.get(b.dataset.add);
    addToBag(p.h, b.dataset.v || p.v[0].n); if ($('#qv').classList.contains('open')) closeAll();
  });

  // Newsletter
  $('#nl').addEventListener('submit', e => {
    e.preventDefault(); const i = e.target.querySelector('input');
    if (!/^\S+@\S+\.\S+$/.test(i.value)) { toast('Please enter a valid email address.'); i.focus(); return; }
    e.target.outerHTML = `<p class="display" style="font-size:1.6rem;animation:cardIn .6s">Thank you — welcome to the collection.</p>`;
  });

  /* ---------- Motion ---------- */
  function splitWords(el) {
    if (el.dataset.split) return; el.dataset.split = 1;
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="transition-delay:${i * 70}ms">${esc(w)}</span></span>`).join(' ');
  }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const t = en.target;
    if (t.classList.contains('stagger')) [...t.children].forEach((c, i) => c.style.transitionDelay = Math.min(i, 12) * 70 + 'ms');
    t.classList.add('in'); io.unobserve(t);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  function observe(root = document) {
    $$('.split', root).forEach(splitWords);
    $$('.reveal, .reveal-img, .stagger, .split', root).forEach(e => io.observe(e));
  }

  // Drag-to-scroll rails with arrow buttons
  function rails(root = document) {
    $$('.rail', root).forEach(r => {
      if (r.dataset.bound) return; r.dataset.bound = 1;
      let down = false, sx = 0, sl = 0, moved = false;
      r.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = r.scrollLeft; });
      addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; r.classList.add('drag'); } r.scrollLeft = sl - dx; });
      addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => r.classList.remove('drag'), 0); });
      const nav = r.dataset.nav && $(r.dataset.nav);
      if (nav) {
        const step = () => r.clientWidth * .8;
        nav.querySelector('[data-dir="-1"]').onclick = () => r.scrollBy({ left: -step(), behavior: 'smooth' });
        nav.querySelector('[data-dir="1"]').onclick = () => r.scrollBy({ left: step(), behavior: 'smooth' });
      }
    });
  }

  // Gallery opening hours: hours[0] = Monday … hours[6] = Sunday, as "10AM-6PM"
  function openState(g, now = new Date()) {
    const day = (now.getDay() + 6) % 7; const h = g.hours?.[day];
    if (!h || /closed/i.test(h)) return { open: false, label: 'Closed today' };
    const m = h.match(/(\d+)(?:[:.](\d+))?\s*(AM|PM)\s*-\s*(\d+)(?:[:.](\d+))?\s*(AM|PM)/i);
    if (!m) return { open: null, label: h };
    const t = (hh, mm, ap) => ((+hh % 12) + (/pm/i.test(ap) ? 12 : 0)) * 60 + (+mm || 0);
    const o = t(m[1], m[2], m[3]), c = t(m[4], m[5], m[6]), n = now.getHours() * 60 + now.getMinutes();
    if (n >= o && n < c) return { open: true, label: `Open now · until ${m[4]}${m[5] ? ':' + m[5] : ''}${m[6].toLowerCase()}` };
    return { open: false, label: n < o ? `Opens today at ${m[1]}${m[2] ? ':' + m[2] : ''}${m[3].toLowerCase()}` : 'Closed now' };
  }

    // Spread a list so no artist dominates: at most `max` per artist, in original order
  const spread = (list, n, max = 2) => { const c = {}; return list.filter(p => (c[p.as] = (c[p.as] || 0) + 1) <= max).slice(0, n); };

  window.CFAUI = { spread, $, $$, esc, money, img, param, byHandle, bySlug, ICON, cardHtml, observe, rails, toast, openBag, addToBag, closeAll, lock, scrim, openState };
  document.addEventListener('DOMContentLoaded', () => { observe(); rails(); });
})();
