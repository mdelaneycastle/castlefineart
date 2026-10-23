(function () {
  const D = window.CFA, U = window.CFAUI, { $, esc, img, money, ICON } = U;

  /* Hero: slow crossfade + Ken Burns over the curated lifestyle shots */
  const slides = D.hero;
  $('#slides').innerHTML = slides.map((s, i) => `<div class="hero__slide${i ? '' : ' on'}"><img src="${img(s.src, 2000)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`).join('');
  $('#dots').innerHTML = slides.map((_, i) => `<button aria-label="Show slide ${i + 1}"><i></i></button>`).join('');
  const dots = [...$('#dots').children], els = [...$('#slides').children];
  let cur = 0, timer;
  function show(i) {
    els[cur].classList.remove('on');
    cur = (i + slides.length) % slides.length;
    els[cur].classList.add('on');
    // restart the Ken Burns on the incoming slide
    const im = els[cur].querySelector('img'); im.style.animation = 'none'; im.offsetHeight; im.style.animation = '';
    dots.forEach((d, k) => { d.classList.toggle('on', k === cur); d.classList.toggle('done', k < cur); const b = d.querySelector('i'); b.style.animation = 'none'; b.offsetHeight; b.style.animation = ''; });
    const s = slides[cur], cap = $('#caption');
    cap.style.opacity = 0;
    setTimeout(() => { cap.innerHTML = `<b>${esc(s.artist)}</b>${esc(s.title)} →`; cap.href = 'product.html?p=' + s.h; cap.style.opacity = 1; }, 400);
    clearTimeout(timer); timer = setTimeout(() => show(cur + 1), 7000);
  }
  dots.forEach((d, i) => d.onclick = () => show(i));
  show(0);
  requestAnimationFrame(() => document.querySelector('.hero .split').classList.add('in'));

  $('#values').innerHTML = [
    [ICON.truck, 'Free UK delivery', 'On all artwork and sculpture orders.'],
    [ICON.frame, 'Framed by hand', 'Mounted, glazed and framed in our own studio.'],
    [ICON.card, 'Interest-free finance', 'Spread the cost, 0% APR, no deposit.'],
    [ICON.cert, 'Certificate of authenticity', 'With every limited edition and original.'],
  ].map(([i, h, p]) => `<div>${i}<h4>${h}</h4><p>${p}</p></div>`).join('');

  $('#newNav').children[0].innerHTML = ICON.arrowL; $('#newNav').children[1].innerHTML = ICON.arrowR;
  $('#newRail').innerHTML = U.spread(D.products.filter(p => p.isNew && p.av), 14, 2).map(p => U.cardHtml(p)).join('');

  const tile = (href, label, p) => `<a class="tile reveal" href="${href}"><img loading="lazy" src="${img(p, 1200)}" alt=""><div class="tile__label"><span class="display">${label}</span><span class="link-arrow">Shop</span></div></a>`;
  $('#tiles').innerHTML = D.tiles.map(t => tile(t.href, t.label, t.src)).join('');

  /* Artist spotlight — a different featured artist each visit */
  const feat = D.artists.filter(a => a.featured && a.portrait && a.bio.length);
  const a = feat[Math.floor(Math.random() * feat.length)];
  if (a) {
    const quote = a.bio.find(p => /^['"‘“]/.test(p.trim()));
    const intro = a.bio.find(p => !/^['"‘“]/.test(p.trim()) && p.length > 120) || a.bio[0];
    const works = D.products.filter(p => p.as === a.s && p.av).slice(0, 3);
    $('#spotlight').innerHTML = `
      <div class="feature__img reveal-img"><img src="${a.portrait}" alt="${esc(a.n)}" style="object-position:50% 20%"></div>
      <div class="reveal">
        <p class="eyebrow">Artist spotlight</p>
        <h2 class="display">${esc(a.n)}</h2>
        ${quote ? `<p class="feature__quote">${esc(quote.replace(/^['"‘“]|['"’”]$/g, ''))}</p>` : ''}
        <p class="lede">${esc(intro.length > 360 ? intro.slice(0, intro.lastIndexOf(' ', 340)) + '…' : intro)}</p>
        ${works.length ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:32px 0">${works.map(p => `<a href="product.html?p=${p.h}" class="card__media" style="aspect-ratio:1" title="${esc(p.t)}"><img class="main" src="${img(p.img[0], 300)}" alt="${esc(p.t)}" style="inset:12%;width:76%;height:76%"></a>`).join('')}</div>` : ''}
        <a class="btn" href="artist.html?a=${a.s}">Discover ${esc(a.n.split(' ')[0])}'s work</a>
      </div>`;
  }

  const names = D.artists.filter(a => a.count > 0).map(a => `<a href="artist.html?a=${a.s}">${esc(a.n)}</a><span class="dot">·</span>`).join('');
  $('#marquee').innerHTML = names + names;

  $('#origGrid').innerHTML = U.spread(D.products.filter(p => p.ty === 'Original' && p.av && p.img[1]).filter(p => p.p >= 1500), 8, 1).map(p => U.cardHtml(p)).join('');

  $('#galImg').src = img(D.galleryHero, 1400);
  $('#galCount').textContent = D.galleries.length;
  $('#artCount').textContent = D.artists.filter(a => a.count > 0).length;

  U.observe(); U.rails();
})();
