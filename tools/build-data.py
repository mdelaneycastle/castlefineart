"""Build assets/js/data.js for the test site.

Inputs (raw downloads, kept outside the site folder):
  RAW/pages/p*.json   public castlefineart.com /products.json pages
  RAW/pages/c*.json   public /collections.json pages
  RAW/gal/*.html      the public /pages/gallery/<slug> pages
  BIOS                artist-bios.json (name, portrait, paragraphs per artist slug)

Usage: python3 tools/build-data.py RAW_DIR BIOS_JSON
"""
import glob, html, json, os, re, sys
from datetime import datetime, timezone, timedelta

RAW, BIOS = sys.argv[1], sys.argv[2]
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PER_ARTIST = 40
MAX_IMAGES = 6

def slug(s):
    s = s.lower().replace('é', 'e').replace('&', 'and')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def clean_body(h):
    if not h:
        return ''
    h = re.sub(r'(?is)<(script|style|iframe)[^>]*>.*?</\1>', '', h)
    h = re.sub(r'(?i)<(/?)(p|em|strong|b|i|br|ul|ol|li)(\s[^>]*)?>', r'<\1\2>', h)
    h = re.sub(r'(?i)<(?!/?(p|em|strong|b|i|br|ul|ol|li)>)[^>]+>', '', h)
    h = re.sub(r'<p>\s*(&nbsp;)?\s*</p>', '', h).strip()
    if '<p>' not in h:
        h = '<p>' + h + '</p>'
    # keep whole paragraphs up to ~1800 chars
    out, n = [], 0
    for para in re.findall(r'(?s)<p>.*?</p>|<ul>.*?</ul>', h):
        out.append(para); n += len(para)
        if n > 1800:
            break
    return ''.join(out) or h[:1800]

def text(h):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', h or '')).split())

# ---------- Products ----------
raw = []
for f in sorted(glob.glob(os.path.join(RAW, 'pages', 'p*.json')), key=lambda s: int(re.search(r'p(\d+)', os.path.basename(s)).group(1))):
    raw += json.load(open(f))['products']

now = datetime.now(timezone.utc)
products = []
for p in raw:
    if p['product_type'] in ('Gift Card', '') or 'feed-exclude' in p['tags'] or not p['images']:
        continue
    vs = [v for v in p['variants']]
    if not any(v['available'] for v in vs):
        continue
    body = p['body_html'] or ''
    t = text(body)
    ty = p['product_type']
    if ty == 'Unique':
        ty = 'Original'
    if ty in ('Open Edition', 'Time-Limited Edition'):
        ty = 'Limited Edition'
    if re.search(r'\bsculpture\b', p['title'] + ' ' + ' '.join(p['tags']), re.I) or re.match(r'.{0,120}\b(bronze|resin|sculpture)\b', t, re.I):
        ty = 'Sculpture'
    ed = re.search(r'edition (?:size )?of (\d[\d,]*)', t, re.I)
    first = text(re.search(r'(?s)<p>(.*?)</p>', body).group(1)) if re.search(r'(?s)<p>(.*?)</p>', body) else ''
    med = first if re.match(r'(hand[- ]signed|hand[- ]embellished|original|limited edition|giclee|giclée|mixed media|oil|acrylic)', first, re.I) and len(first) < 200 else ''
    med = re.sub(r'\s+by\s+[^.]+\.?$', '', med).rstrip('.')
    sizes = re.search(r'(\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\s*(?:cm|in|inches|"))', t, re.I)
    pub = p['published_at'] or p['created_at']
    variants = [{'n': v['title'], 'p': float(v['price']), 'c': float(v['compare_at_price'] or 0), 'av': v['available']} for v in vs]
    avail = [v for v in variants if v['av']] or variants
    price = min(v['p'] for v in avail)
    imgs = [i['src'] for i in p['images'][:MAX_IMAGES]]
    landscape = [i['src'] for i in p['images'][1:] if i.get('width') and i.get('height') and i['width'] > i['height'] * 1.25]
    summary = t[len(first):].strip() if med else t
    products.append({
        'h': p['handle'], 't': p['title'].strip(), 'a': p['vendor'].strip(), 'as': slug(p['vendor']),
        'ty': ty, 'p': price, 'c': max([v['c'] for v in avail] + [0]), 'av': True, 'vary': len({v['p'] for v in avail}) > 1,
        'v': variants, 'opt': p['options'][0]['name'] if p['options'] else 'Title',
        'img': imgs, 'd': clean_body(body), 'sum': (summary[:220].rsplit(' ', 1)[0] + '…') if len(summary) > 220 else summary,
        'ed': ed.group(1) if ed else '', 'med': med, 'size': sizes.group(1) if sizes else '',
        'sub': [tg for tg in p['tags'] if not tg.startswith('badge') and len(tg) < 80][:6],
        'isNew': 'badge: new' in p['tags'] or (pub and datetime.fromisoformat(pub) > now - timedelta(days=60)),
        'date': pub[:10], 'rank': len(imgs) * 1000 + int(pub[:10].replace('-', '')) / 1e5,
        '_land': landscape[:2],
    })

products.sort(key=lambda p: p['date'], reverse=True)
kept, per = [], {}
for p in products:
    per[p['as']] = per.get(p['as'], 0) + 1
    if per[p['as']] <= PER_ARTIST:
        kept.append(p)
products = kept

# ---------- Artists ----------
bios = json.load(open(BIOS))
cols = []
for f in glob.glob(os.path.join(RAW, 'pages', 'c*.json')):
    cols += json.load(open(f))['collections']
col_by_handle = {c['handle']: c for c in cols}

artists = {}
for p in products:
    a = artists.setdefault(p['as'], {'s': p['as'], 'n': p['a'], 'count': 0})
    a['count'] += 1
for s, b in bios.items():
    if s not in artists:
        artists[s] = {'s': s, 'n': b['name'], 'count': 0}
portrait_dir = os.path.join(SITE, 'assets', 'portraits')
for a in artists.values():
    b = bios.get(a['s'])
    a['bio'] = [x.strip() for x in (b['paragraphs'] if b else []) if x.strip()]
    a['portrait'] = f"assets/portraits/{a['s']}.jpg" if os.path.exists(os.path.join(portrait_dir, a['s'] + '.jpg')) else ''
    c = col_by_handle.get(a['s'])
    a['img'] = (c.get('image') or {}).get('src', '') if c else ''
    if not a['img']:
        first = next((p for p in products if p['as'] == a['s']), None)
        a['img'] = first['img'][0] if first else ''
    if not a['bio'] and c and c.get('description'):
        a['bio'] = [x.strip() for x in text(c['description']).split('  ') if x.strip()][:4]
    a['featured'] = bool(a['portrait'] and a['bio'] and a['count'])
    a['sort'] = a['n'].lower()
artists = sorted(artists.values(), key=lambda a: (-a['featured'], -a['count']))

# ---------- Galleries ----------
REGION = {
    'london-covent-garden': 'London', 'london-south-molton-street': 'London', 'london-st-christophers-place': 'London',
    'edinburgh': 'Scotland', 'glasgow': 'Scotland', 'cardiff': 'Wales',
    'york': 'North', 'leeds': 'North', 'newcastle': 'North', 'manchester': 'North', 'sheffield-meadowhall': 'North', 'chester': 'North',
    'birmingham-icc': 'Midlands', 'birmingham-mailbox': 'Midlands', 'derby': 'Midlands', 'nottingham': 'Midlands', 'leamington-spa': 'Midlands',
    'stratford-upon-avon': 'Midlands', 'stamford': 'Midlands', 'milton-keynes': 'South East', 'norwich': 'East', 'cambridge': 'East',
    'bath': 'South West', 'exeter': 'South West', 'cheltenham': 'South West',
    'brighton': 'South East', 'canterbury': 'South East', 'kent-bluewater': 'South East', 'guildford': 'South East', 'tunbridge-wells': 'South East',
    'oxford': 'South East', 'marlow': 'South East', 'windsor': 'South East', 'winchester': 'South East',
}
NAME = {'birmingham-icc': 'Birmingham ICC', 'birmingham-mailbox': 'Birmingham Mailbox', 'kent-bluewater': 'Kent Bluewater',
        'sheffield-meadowhall': 'Sheffield Meadowhall', 'london-covent-garden': 'London Covent Garden',
        'london-south-molton-street': 'London South Molton Street', 'london-st-christophers-place': "London St Christopher's Place",
        'stratford-upon-avon': 'Stratford-upon-Avon', 'leamington-spa': 'Leamington Spa', 'milton-keynes': 'Milton Keynes',
        'tunbridge-wells': 'Tunbridge Wells'}
DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
PC = re.compile(r'^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$')

galleries = []
for f in sorted(glob.glob(os.path.join(RAW, 'gal', '*.html'))):
    s = os.path.basename(f)[:-5]
    h = open(f, encoding='utf-8').read()
    m = re.search(r'(?s)<main.*?</main>', h)
    main = m.group(0) if m else h
    cut = main.find('More galleries')
    own = main[:cut] if cut > 0 else main
    imgs = re.findall(r'//www\.castlefineart\.com/cdn/shop/files/([^"?\s]+\.(?:jpg|jpeg|png|webp))', own)
    body = re.sub(r'(?s)<(script|style|svg|noscript)[^>]*>.*?</\1>', '', own)
    lines = [l.strip() for l in html.unescape(re.sub(r'<[^>]+>', '\n', body)).split('\n') if l.strip()]
    g = {'s': s, 'n': NAME.get(s, s.replace('-', ' ').title()), 'region': REGION.get(s, 'Other'),
         'manager': '', 'addr': '', 'pc': '', 'email': '', 'phone': '', 'hours': [], 'parking': '', 'desc': [],
         'img': f'https://www.castlefineart.com/cdn/shop/files/{imgs[0]}' if imgs else ''}
    try:
        i = next(k for k, l in enumerate(lines) if l.startswith('Gallery Manager'))
        g['manager'] = lines[i].split(':', 1)[1].strip()
        addr = []
        for l in lines[i + 2:]:
            if l.startswith('──') or l.startswith('E:'):
                break
            addr.append(l)
        g['addr'] = ', '.join(a.strip().rstrip(',').strip() for a in addr if a.strip(', '))
        g['pc'] = next((x for x in reversed(addr) if PC.match(x.upper())), '').upper()
    except StopIteration:
        pass
    for k, l in enumerate(lines):
        if l == 'E:' and k + 1 < len(lines): g['email'] = lines[k + 1]
        if l == 'T:' and k + 1 < len(lines): g['phone'] = lines[k + 1]
        if l.startswith('Closest Car Park') and k + 1 < len(lines): g['parking'] = lines[k + 1]
        if l == 'Gallery:' and k + 1 < len(lines):
            g['desc'] = [x for x in lines[k + 1:k + 4] if len(x) > 80][:2]
    hrs = {}
    for l in lines:
        mm = re.match(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.+)$', l)
        if mm and mm.group(1) not in hrs:
            hrs[mm.group(1)] = mm.group(2).strip()
    g['hours'] = [hrs.get(d, '') for d in DAYS] if len(hrs) == 7 else []
    galleries.append(g)
galleries.sort(key=lambda g: g['n'])

# ---------- Home page picks ----------
headline = ['raphael-mazzucco', 'bob-dylan', 'scarlett-raven', 'james-francis-gill', 'richard-rowan', 'robert-oxley', 'nic-joly', 'jon-jones', 'peter-smith', 'johnny-depp', 'lawrence-coulson', 'paulo-ferreira']
print('landscape by artist:', {s: sum(1 for p in products if p['as'] == s and p['_land']) for s in headline})
hero, used = [], set()
for s in headline:
    p = next((p for p in products if p['as'] == s and p['_land']), None)
    if p and s not in used:
        hero.append({'src': p['_land'][0], 'h': p['h'], 'title': p['t'], 'artist': p['a']}); used.add(s)
    if len(hero) == 6:
        break

def tile_img(ty):
    p = next((p for p in products if p['ty'] == ty and len(p['img']) > 2 and p['as'] in headline), None) or next((p for p in products if p['ty'] == ty), None)
    return (p['_land'] or p['img'][1:2] or p['img'])[0] if p else ''
tiles = [{'label': 'Original artworks', 'href': 'shop.html?type=Original', 'src': tile_img('Original')},
         {'label': 'Limited editions', 'href': 'shop.html?type=Limited%20Edition', 'src': tile_img('Limited Edition')},
         {'label': 'Sculpture', 'href': 'shop.html?type=Sculpture', 'src': tile_img('Sculpture')}]

for p in products:
    p.pop('_land', None)

data = {'products': products, 'artists': artists, 'galleries': galleries, 'hero': hero, 'tiles': tiles,
        'galleryHero': 'https://www.castlefineart.com/cdn/shop/files/Mailbox_Gallery_Hero_Banner.jpg',
        'built': now.strftime('%Y-%m-%d')}
out = os.path.join(SITE, 'assets', 'js', 'data.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('/* Generated by tools/build-data.py — do not edit by hand. */\nwindow.CFA = ')
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    f.write(';\n')
from collections import Counter
print(f"{len(products)} products, {len(artists)} artists ({sum(a['featured'] for a in artists)} featured), {len(galleries)} galleries, {len(hero)} hero slides")
print(Counter(p['ty'] for p in products))
print(f"{os.path.getsize(out) / 1e6:.1f} MB -> {out}")
