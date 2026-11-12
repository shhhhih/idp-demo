/* IDP Platform - DEMO BACKEND (browser only)
   This file replaces the Spring Boot API with sample data stored in the browser, so the
   front-end pages can be opened from a plain link (e.g. GitHub Pages) without Java or MySQL.
   Nothing here is sent to a server. Changes are kept in this browser's localStorage. */
(function () {
  'use strict';
  const KEY = 'idp_demo_db_v1', USER_KEY = 'idp_demo_user_v1';
  const realFetch = window.fetch.bind(window);

  /* ---------- small helpers ---------- */
  const iso = (daysAgo, h = 10) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  const hue = (n) => (n * 47) % 360;
  function svg(label, n, w = 800, h = 600) {
    const a = `hsl(${hue(n)},28%,78%)`, b = `hsl(${hue(n) + 30},30%,58%)`;
    const t = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
      `<rect x="${w * .12}" y="${h * .58}" width="${w * .5}" height="${h * .18}" rx="14" fill="rgba(255,255,255,.55)"/>` +
      `<rect x="${w * .66}" y="${h * .3}" width="${w * .2}" height="${h * .46}" rx="8" fill="rgba(255,255,255,.35)"/>` +
      `<text x="50%" y="${h * .18}" text-anchor="middle" font-family="Georgia,serif" font-size="${w * .05}" fill="#27332c">${label}</text>` +
      `<text x="50%" y="${h * .93}" text-anchor="middle" font-family="Arial" font-size="${w * .028}" fill="#27332c" opacity=".7">Sample photo (demo)</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(t);
  }
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  const err = (status, message) => json({ message }, status);

  /* ---------- seed data ---------- */
  function seed() {
    const categories = [
      ['Kitchen', 'Kitchen makeovers, cabinets and countertops'],
      ['Bathroom', 'Bathroom renovation and waterproofing'],
      ['Living Room', 'Living and dining space design'],
      ['Bedroom', 'Master and guest bedroom design'],
      ['Outdoor & Garden', 'Balcony, terrace and garden spaces'],
      ['Full Home', 'Whole-home renovation packages']
    ].map((c, i) => ({ categoryID: i + 1, categoryName: c[0], description: c[1], createdAt: iso(120 - i * 5) }));
    const companies = [
      { companyId: 1, companyName: 'Willow & Oak Interiors', description: 'Warm, natural-material interiors for HDB and condominium homes.', address: '12 Orchard Road, Singapore 238888', email: 'hello@willowoak.example', phone: '+65 6123 4567', website: 'https://example.com/willow-oak', logoPath: null },
      { companyId: 2, companyName: 'Studio Lumen', description: 'Modern minimalist design with a focus on light and space.', address: '88 Tampines Ave 4, Singapore 529000', email: 'studio@lumen.example', phone: '+65 6234 5678', website: 'https://example.com/lumen', logoPath: null }
    ];
    const rows = [
      ['Scandinavian Kitchen Refresh', 1, 'HDB', 28000, 'Completed', 1, 'Bright cabinetry, quartz countertops and a built-in breakfast nook for a 4-room HDB.'],
      ['Compact Galley Kitchen', 1, 'HDB', 18500, 'Completed', 2, 'Space-saving galley layout with full-height storage and under-cabinet lighting.'],
      ['Spa-Style Master Bathroom', 2, 'Condo', 22000, 'Completed', 1, 'Rain shower, floating vanity and large-format porcelain tiles.'],
      ['Small Bathroom, Big Impression', 2, 'HDB', 9800, 'Ongoing', 2, 'Waterproofing and a bold tile pattern that makes a 3 sqm bathroom feel bigger.'],
      ['Open-Plan Living & Dining', 3, 'Condo', 46000, 'Completed', 2, 'Removed a partition wall, added a feature wall and warm cove lighting.'],
      ['Japandi Living Room', 3, 'HDB', 32000, 'Completed', 1, 'Light oak, linen textures and low-profile furniture for a calm living space.'],
      ['Cosy Master Bedroom Suite', 4, 'Landed', 35000, 'Ongoing', 1, 'Walk-in wardrobe, upholstered headboard wall and blackout curtains.'],
      ['Kids Bedroom with Study Corner', 4, 'HDB', 14500, 'Completed', 2, 'Loft bed with a built-in study desk and plenty of toy storage.'],
      ['Rooftop Garden Terrace', 5, 'Landed', 52000, 'Completed', 2, 'Timber decking, planters and a shaded dining pergola.'],
      ['Balcony Herb Garden', 5, 'Condo', 6500, 'Completed', 1, 'Vertical planters and a bench with hidden storage on a small balcony.'],
      ['Whole-Home Modern Minimalist', 6, 'Condo', 120000, 'Ongoing', 2, 'Complete renovation of a 3-bedroom condo in a neutral, minimalist palette.'],
      ['Shophouse Office Fit-Out', 6, 'Commercial', 85000, 'Completed', 2, 'Open workspace with heritage details preserved and modern lighting.']
    ];
    const idps = rows.map((r, i) => {
      const id = i + 1;
      return {
        idpId: id, title: r[0], categoryId: r[1], categoryName: categories[r[1] - 1].categoryName, propertyType: r[2], budget: r[3],
        projectStatus: r[4], companyId: r[5], companyName: companies[r[5] - 1].companyName, description: r[6],
        viewCount: 20 + ((id * 37) % 90), shortlistCount: 3 + ((id * 11) % 25), updatedAt: iso(id * 3), createdAt: iso(60 - id * 3),
        images: [1, 2, 3, 4].map((k, j) => ({ imageID: id * 10 + j, imageUrl: svg(r[0], id * 5 + k), cover: j === 0 })),
      };
    });
    const users = [
      { username: 'customer1', email: 'customer1@example.com', role: 'Customer', accountStatus: 'ACTIVE', createdAt: iso(70) },
      { username: 'designer1', email: 'designer1@example.com', role: 'Interior Designer', accountStatus: 'ACTIVE', createdAt: iso(90), companyId: 1 },
      { username: 'admin1', email: 'admin1@example.com', role: 'User Admin', accountStatus: 'ACTIVE', createdAt: iso(100) },
      { username: 'platform1', email: 'platform1@example.com', role: 'Platform Manager', accountStatus: 'ACTIVE', createdAt: iso(100) }
    ];
    const profiles = [
      ['Customer', 'Browses projects, saves favourites and rates designs'], ['Interior Designer', 'Manages company information and project portfolio'],
      ['User Admin', 'Manages user roles and profile descriptions'], ['Platform Manager', 'Manages categories and views platform reports']
    ].map((p, i) => ({ profileId: i + 1, profileName: p[0], description: p[1], profileStatus: 'ACTIVE', createdAt: iso(110) }));
    const ratings = [
      { idpId: 1, stars: 5, comment: 'Love the bright cabinetry. Very practical layout!', ratedAt: iso(5), username: 'customer2' },
      { idpId: 1, stars: 4, comment: 'Great use of space.', ratedAt: iso(9), username: 'customer3' },
      { idpId: 6, stars: 5, comment: 'Calm and elegant.', ratedAt: iso(4), username: 'customer4' },
      { idpId: 3, stars: 4, comment: '', ratedAt: iso(12), username: 'customer5' }
    ];
    return { categories, companies, idps, users, profiles, ratings, favourites: [{ username: 'customer1', idpId: 6, favouriteId: 1, savedAt: iso(3) }], nextIds: { idp: 13, category: 7, profile: 5, favourite: 2, image: 1000 } };
  }

  let memory = null;
  function load() {
    if (memory) return memory;
    try { const raw = localStorage.getItem(KEY); if (raw) { memory = JSON.parse(raw); return memory; } } catch (e) { /* storage blocked */ }
    memory = seed();
    return memory;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) { /* storage full or blocked: keep in memory */ } }
  function currentUser() {
    try { const u = sessionStorage.getItem(USER_KEY); if (u) { const name = JSON.parse(u); return load().users.find(x => x.username === name) || null; } } catch (e) { /* ignore */ }
    return window.__idpUser ? load().users.find(x => x.username === window.__idpUser) || null : null;
  }
  function setUser(name) { window.__idpUser = name; try { name ? sessionStorage.setItem(USER_KEY, JSON.stringify(name)) : sessionStorage.removeItem(USER_KEY); } catch (e) { /* ignore */ } }

  const HOME = { 'Customer': 'customer-home.html', 'Interior Designer': 'designer-home.html', 'User Admin': 'admin-home.html', 'Platform Manager': 'platform-home.html' };
  const publicIdp = (p, full) => {
    const o = { ...p, coverImage: p.images[0] ? p.images[0].imageUrl : null, images: p.images };
    if (!full) { o.images = undefined; }
    return o;
  };
  function filterIdps(list, q) {
    const kw = (q.get('keyword') || '').toLowerCase(), cat = q.get('categoryId'), type = q.get('propertyType');
    const min = q.get('minBudget'), max = q.get('maxBudget');
    return list.filter(p => (!kw || (p.title + ' ' + p.description + ' ' + p.categoryName).toLowerCase().includes(kw)) &&
      (!cat || String(p.categoryId) === cat) && (!type || p.propertyType === type) &&
      (!min || p.budget >= Number(min)) && (!max || p.budget <= Number(max)));
  }
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

  /* ---------- chatbot (scripted) ---------- */
  function chatbot(message, ctx) {
    const db = load(), m = message.toLowerCase();
    const topics = { kitchen: 'Kitchen', bathroom: 'Bathroom', 'guest room': 'Bedroom', bedroom: 'Bedroom', garden: 'Outdoor & Garden', balcony: 'Outdoor & Garden', living: 'Living Room' };
    ctx = ctx || {};
    if (/start over|reset/.test(m)) return { reply: 'No problem, let us start again! 💚 What would you like to renovate?', context: {}, projects: [], quickReplies: ['Kitchen', 'Bathroom', 'Guest room', 'Garden', 'Find projects'] };
    const key = Object.keys(topics).find(k => m.includes(k));
    if (key) {
      const cat = db.categories.find(c => c.categoryName === topics[key]);
      const list = db.idps.filter(p => p.categoryId === cat.categoryID).slice(0, 3);
      return { reply: `Great choice! Here are some ${cat.categoryName.toLowerCase()} projects from our designers. 🏡\nWhat is your rough budget?`, context: { topic: cat.categoryName }, projects: list, quickReplies: ['Under S$10,000', 'S$10,000 - S$30,000', 'Above S$30,000', 'Start over'] };
    }
    if (/under|below|10,000|30,000|above|budget|\$/.test(m)) {
      let lo = 0, hi = 1e9;
      if (/under|below/.test(m)) hi = 10000; else if (/above/.test(m)) lo = 30000; else if (/10,000/.test(m)) { lo = 10000; hi = 30000; }
      let list = db.idps.filter(p => p.budget >= lo && p.budget <= hi && (!ctx.topic || p.categoryName === ctx.topic));
      if (!list.length) list = db.idps.filter(p => p.budget >= lo && p.budget <= hi);
      return { reply: list.length ? 'These projects match your budget. 💚' : 'I could not find a match, but you can browse all projects above.', context: ctx, projects: list.slice(0, 3), quickReplies: ['Kitchen', 'Bathroom', 'Start over'] };
    }
    if (/find|project|show/.test(m)) return { reply: 'Here are some popular projects to get you started. ✨', context: {}, projects: db.idps.slice().sort((a, b) => b.viewCount - a.viewCount).slice(0, 3), quickReplies: ['Kitchen', 'Bathroom', 'Garden', 'Start over'] };
    return { reply: "I'm a demo assistant, so I only know a few topics. Try Kitchen, Bathroom, Guest room, Garden, or ask me to find projects. 💚", context: ctx, projects: [], quickReplies: ['Kitchen', 'Bathroom', 'Guest room', 'Garden', 'Find projects'] };
  }

  /* ---------- router ---------- */
  async function route(path, q, method, body, isForm, formData) {
    const db = load(), user = currentUser();
    const need = (...roles) => { if (!user) return err(401, 'Not logged in'); if (roles.length && !roles.includes(user.role)) return err(403, 'You do not have permission to do this'); return null; };
    let m;

    if (path === '/api/hello') return json({ message: 'Hello from the IDP demo' });

    /* auth */
    if (path === '/api/auth/login' && method === 'POST') {
      const id = String(body.usernameOrEmail || '').trim().toLowerCase();
      const u = db.users.find(x => x.username.toLowerCase() === id || x.email.toLowerCase() === id);
      if (!u || !body.password) return err(401, 'Invalid username or password');
      if (u.accountStatus !== 'ACTIVE') return err(403, 'This account is suspended');
      setUser(u.username);
      return json({ message: 'Login successful', username: u.username, role: u.role, profileName: u.role, redirectUrl: HOME[u.role] });
    }
    if (path === '/api/auth/logout') { setUser(null); return json({ message: 'Logged out' }); }
    if (path === '/api/auth/me') { const e = need(); return e || json({ username: user.username, profileName: user.role, role: user.role }); }
    if (path === '/api/auth/register' && method === 'POST') {
      const { username, email, password, confirmPassword } = body;
      if (!username || !email || !password) return err(400, 'All fields are required');
      if (password !== confirmPassword) return err(400, 'Passwords do not match');
      if (db.users.some(x => x.username.toLowerCase() === String(username).toLowerCase())) return err(409, 'Username already taken');
      if (db.users.some(x => x.email.toLowerCase() === String(email).toLowerCase())) return err(409, 'Email already registered');
      db.users.push({ username, email, role: 'Customer', accountStatus: 'ACTIVE', createdAt: new Date().toISOString() });
      save();
      return json({ message: 'Account created successfully! Please log in.' }, 201);
    }

    /* profile */
    if (path === '/api/profile') {
      const e = need(); if (e) return e;
      if (method === 'PUT') {
        if (!body.username || !body.email) return err(400, 'Username and email are required');
        if (db.users.some(x => x !== user && x.username.toLowerCase() === body.username.toLowerCase())) return err(409, 'Username already taken');
        user.username = body.username; user.email = body.email; setUser(user.username); save();
      }
      return json({ username: user.username, email: user.email, role: user.role, accountStatus: user.accountStatus, createdAt: user.createdAt });
    }

    /* categories */
    if (path === '/api/categories' && method === 'GET') {
      const s = (q.get('search') || '').toLowerCase();
      return json(db.categories.filter(c => !s || c.categoryName.toLowerCase().includes(s)));
    }
    if (path === '/api/categories' && method === 'POST') {
      const e = need('Platform Manager'); if (e) return e;
      const name = (body.categoryName || '').trim(); if (!name) return err(400, 'Category name is required');
      if (db.categories.some(c => c.categoryName.toLowerCase() === name.toLowerCase())) return err(400, 'Category name already exists');
      const c = { categoryID: db.nextIds.category++, categoryName: name, description: body.description || '', createdAt: new Date().toISOString() };
      db.categories.push(c); save(); return json(c, 201);
    }
    if ((m = path.match(/^\/api\/categories\/(\d+)$/))) {
      const c = db.categories.find(x => x.categoryID === +m[1]); if (!c) return err(404, 'Category not found');
      if (method === 'GET') return json(c);
      const e = need('Platform Manager'); if (e) return e;
      if (method === 'PUT') {
        const name = (body.categoryName || '').trim(); if (!name) return err(400, 'Category name is required');
        if (db.categories.some(x => x !== c && x.categoryName.toLowerCase() === name.toLowerCase())) return err(400, 'Category name already exists');
        c.categoryName = name; c.description = body.description || ''; db.idps.forEach(p => { if (p.categoryId === c.categoryID) p.categoryName = name; }); save(); return json(c);
      }
      if (method === 'DELETE') {
        if (db.idps.some(p => p.categoryId === c.categoryID)) return err(400, 'This category is used by existing projects and cannot be deleted');
        db.categories = db.categories.filter(x => x !== c); save(); return json({ message: 'Deleted' });
      }
    }

    /* companies */
    if (path === '/api/companies/me' && method === 'GET') { const e = need('Interior Designer'); if (e) return e; return json(db.companies.find(c => c.companyId === user.companyId)); }
    if (path === '/api/companies/me' && method === 'PUT') {
      const e = need('Interior Designer'); if (e) return e;
      const c = db.companies.find(x => x.companyId === user.companyId); Object.assign(c, { companyName: body.companyName, email: body.email, phone: body.phone, address: body.address, description: body.description, website: body.website });
      db.idps.forEach(p => { if (p.companyId === c.companyId) p.companyName = c.companyName; }); save(); return json(c);
    }
    if (path === '/api/companies/me/logo') { const e = need('Interior Designer'); return e || json({ message: 'Logo upload is not stored in the demo' }); }
    if ((m = path.match(/^\/api\/companies\/(\d+)$/))) { const e = need(); if (e) return e; const c = db.companies.find(x => x.companyId === +m[1]); return c ? json(c) : err(404, 'Company not found'); }

    /* IDPs: guest + customer */
    if (path === '/api/guest/idps') return json(filterIdps(db.idps, q).map(p => publicIdp(p, false)));
    if (path === '/api/idps') { const e = need(); return e || json(filterIdps(db.idps, q).map(p => publicIdp(p, false))); }
    if ((m = path.match(/^\/api\/idps\/(\d+)$/))) {
      const e = need(); if (e) return e;
      const p = db.idps.find(x => x.idpId === +m[1]); if (!p) return err(404, 'Project not found');
      if (user.role === 'Customer') { p.viewCount++; db.views = db.views || []; db.views.push({ idpId: p.idpId, at: new Date().toISOString() }); save(); }
      return json(publicIdp(p, true));
    }

    /* favourites */
    if (path === '/api/favourites') {
      const e = need('Customer'); if (e) return e;
      if (method === 'GET') return json(db.favourites.filter(f => f.username === user.username).map(f => ({ favouriteId: f.favouriteId, savedAt: f.savedAt, idp: publicIdp(db.idps.find(p => p.idpId === f.idpId), false) })).filter(f => f.idp));
      if (method === 'POST') {
        if (!db.idps.some(p => p.idpId === body.idpId)) return err(404, 'Project not found');
        if (db.favourites.some(f => f.username === user.username && f.idpId === body.idpId)) return err(409, 'Project already saved');
        db.favourites.push({ username: user.username, idpId: body.idpId, favouriteId: db.nextIds.favourite++, savedAt: new Date().toISOString() });
        db.idps.find(p => p.idpId === body.idpId).shortlistCount++; save(); return json({ message: 'Saved' }, 201);
      }
    }
    if ((m = path.match(/^\/api\/favourites\/(\d+)$/)) && method === 'DELETE') {
      const e = need('Customer'); if (e) return e;
      const before = db.favourites.length; db.favourites = db.favourites.filter(f => !(f.username === user.username && f.idpId === +m[1]));
      if (db.favourites.length === before) return err(404, 'Favourite not found');
      const p = db.idps.find(x => x.idpId === +m[1]); if (p) p.shortlistCount = Math.max(0, p.shortlistCount - 1); save(); return json({ message: 'Removed' });
    }

    /* ratings */
    if ((m = path.match(/^\/api\/ratings\/idp\/(\d+)$/))) {
      const e = need(); if (e) return e;
      const list = db.ratings.filter(r => r.idpId === +m[1]).sort((a, b) => b.ratedAt.localeCompare(a.ratedAt));
      const avg = list.length ? list.reduce((s, r) => s + r.stars, 0) / list.length : 0;
      return json({ idpId: +m[1], ratingCount: list.length, averageStars: avg, ratings: list.map(r => ({ stars: r.stars, comment: r.comment, ratedAt: r.ratedAt })) });
    }
    if (path === '/api/ratings' && method === 'POST') {
      const e = need('Customer'); if (e) return e;
      if (!(body.stars >= 1 && body.stars <= 5)) return err(400, 'Stars must be between 1 and 5');
      const existing = db.ratings.find(r => r.idpId === body.idpId && r.username === user.username);
      if (existing) { existing.stars = body.stars; existing.comment = body.comment || ''; existing.ratedAt = new Date().toISOString(); }
      else db.ratings.push({ idpId: body.idpId, stars: body.stars, comment: body.comment || '', ratedAt: new Date().toISOString(), username: user.username });
      save(); return json({ message: 'Rating saved' });
    }

    /* designer IDPs */
    if (path === '/api/designer/idps' || path.startsWith('/api/designer/idps/')) {
      const e = need('Interior Designer'); if (e) return e;
      const own = db.idps.filter(p => p.companyId === user.companyId);
      if (path === '/api/designer/idps' && method === 'GET') return json(own.map(p => publicIdp(p, false)));
      if (path === '/api/designer/idps' && method === 'POST') {
        const cat = db.categories.find(c => c.categoryID === body.categoryId); if (!cat) return err(400, 'Please choose a category');
        if (!body.title || !body.description || !(body.budget > 0)) return err(400, 'Title, description and a positive budget are required');
        const c = db.companies.find(x => x.companyId === user.companyId);
        const p = { idpId: db.nextIds.idp++, title: body.title, categoryId: cat.categoryID, categoryName: cat.categoryName, propertyType: body.propertyType, budget: body.budget, projectStatus: body.projectStatus || 'Ongoing', companyId: c.companyId, companyName: c.companyName, description: body.description, viewCount: 0, shortlistCount: 0, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(), images: [] };
        db.idps.push(p); save(); return json(publicIdp(p, true), 201);
      }
      if ((m = path.match(/^\/api\/designer\/idps\/(\d+)(\/images(?:\/(\d+)(\/cover)?)?)?$/))) {
        const p = own.find(x => x.idpId === +m[1]); if (!p) return err(404, 'Project not found');
        if (!m[2]) {
          if (method === 'GET') return json(publicIdp(p, true));
          if (method === 'PUT') {
            const cat = db.categories.find(c => c.categoryID === body.categoryId); if (!cat) return err(400, 'Please choose a category');
            Object.assign(p, { title: body.title, categoryId: cat.categoryID, categoryName: cat.categoryName, propertyType: body.propertyType, budget: body.budget, projectStatus: body.projectStatus, description: body.description, updatedAt: new Date().toISOString() }); save(); return json(publicIdp(p, true));
          }
          if (method === 'DELETE') { db.idps = db.idps.filter(x => x !== p); db.favourites = db.favourites.filter(f => f.idpId !== p.idpId); save(); return json({ message: 'Deleted' }); }
        } else if (!m[3]) {
          if (method === 'GET') return json(p.images.map(i => ({ imageID: i.imageID, imageUrl: i.imageUrl, cover: !!i.cover })));
          if (method === 'POST') {
            const files = formData ? formData.getAll('images') : [];
            if (p.images.length + files.length > 10) return err(400, 'A project can have at most 10 photos');
            for (const f of files) {
              if (f.size > 5 * 1024 * 1024) return err(400, 'Each photo must be 5 MB or smaller');
              const url = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(svg(p.title, p.idpId)); r.readAsDataURL(f); });
              p.images.push({ imageID: db.nextIds.image++, imageUrl: url, cover: p.images.length === 0 });
            }
            save(); return json({ message: 'Uploaded' }, 201);
          }
        } else if (!m[4] && method === 'DELETE') {
          const i = p.images.findIndex(x => x.imageID === +m[3]); if (i < 0) return err(404, 'Photo not found');
          const wasCover = p.images[i].cover; p.images.splice(i, 1); if (wasCover && p.images[0]) p.images[0].cover = true; save(); return json({ message: 'Removed' });
        } else if (m[4] && method === 'PUT') {
          p.images.forEach(x => { x.cover = x.imageID === +m[3]; }); p.images.sort((a, b) => (b.cover ? 1 : 0) - (a.cover ? 1 : 0)); save(); return json({ message: 'Cover updated' });
        }
      }
    }

    /* admin profiles */
    if (path === '/api/admin/profiles' || path.startsWith('/api/admin/profiles/')) {
      const e = need('User Admin'); if (e) return e;
      if (path === '/api/admin/profiles' && method === 'GET') { const k = (q.get('keyword') || '').toLowerCase(); return json(db.profiles.filter(p => !k || p.profileName.toLowerCase().includes(k) || (p.description || '').toLowerCase().includes(k))); }
      if (path === '/api/admin/profiles' && method === 'POST') {
        const name = (body.profileName || '').trim(); if (!name) return err(400, 'Profile name is required');
        if (db.profiles.some(p => p.profileName.toLowerCase() === name.toLowerCase())) return err(409, 'A profile with this name already exists');
        const p = { profileId: db.nextIds.profile++, profileName: name, description: body.description || '', profileStatus: 'ACTIVE', createdAt: new Date().toISOString() }; db.profiles.push(p); save(); return json(p, 201);
      }
      if ((m = path.match(/^\/api\/admin\/profiles\/(\d+)(\/status)?$/))) {
        const p = db.profiles.find(x => x.profileId === +m[1]); if (!p) return err(404, 'Profile not found');
        if (!m[2] && method === 'GET') return json(p);
        if (!m[2] && method === 'PUT') { const name = (body.profileName || '').trim(); if (!name) return err(400, 'Profile name is required'); p.profileName = name; p.description = body.description || ''; save(); return json(p); }
        if (m[2] && method === 'PUT') { p.profileStatus = body.profileStatus; save(); return json(p); }
      }
    }

    /* reports */
    if (path === '/api/reports/overview') {
      const e = need('Platform Manager'); if (e) return e;
      return json({ totalUsers: db.users.length, totalCustomers: db.users.filter(u => u.role === 'Customer').length, totalDesigners: db.users.filter(u => u.role === 'Interior Designer').length, totalIdps: db.idps.length, totalViews: db.idps.reduce((s, p) => s + p.viewCount, 0), totalShortlists: db.idps.reduce((s, p) => s + p.shortlistCount, 0) });
    }
    if (path === '/api/reports/insights') {
      const e = need('Platform Manager'); if (e) return e;
      const from = q.get('from'), to = q.get('to'); if (!from || !to || from > to) return err(400, 'Please select a valid date range.');
      const span = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1), f = Math.min(1, span / 30);
      const top = (key) => db.idps.slice().sort((a, b) => b[key] - a[key]).slice(0, 10).map(p => ({ idpId: p.idpId, title: p.title, count: Math.max(1, Math.round(p[key] * f)) }));
      const reg = [['Customer', 14], ['Interior Designer', 3], ['User Admin', 0], ['Platform Manager', 0]].map(r => ({ role: r[0], count: Math.round(r[1] * f) }));
      const cats = db.categories.map(c => ({ categoryName: c.categoryName, count: db.idps.filter(p => p.categoryId === c.categoryID).length }));
      return json({ mostViewed: top('viewCount'), mostShortlisted: top('shortlistCount'), registrations: reg, totalRegistrations: reg.reduce((s, r) => s + r.count, 0), categories: cats });
    }
    if (path === '/api/reports/daily') {
      const e = need('Platform Manager'); if (e) return e;
      const date = q.get('date'); if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return err(400, 'Invalid date');
      const h = hash(date), top = db.idps.slice().sort((a, b) => ((hash(date + a.idpId)) % 17) - ((hash(date + b.idpId)) % 17)).slice(0, 5).map(p => ({ idpId: p.idpId, title: p.title, views: 1 + (hash(date + p.title) % 12) }));
      return json({ date, newUsers: h % 4, newIdps: h % 3, totalViews: top.reduce((s, p) => s + p.views, 0), totalShortlists: h % 6, topIdps: top });
    }

    /* chatbot */
    if (path === '/api/chatbot/message' && method === 'POST') { const e = need(); if (e) return e; return json(chatbot(body.message || '', body.context)); }

    return err(404, 'Demo API: endpoint not available (' + method + ' ' + path + ')');
  }

  window.fetch = async function (input, init) {
    const raw = typeof input === 'string' ? input : (input && input.url) || String(input);
    let url; try { url = new URL(raw, location.href); } catch (e) { return realFetch(input, init); }
    if (!/\/api\//.test(url.pathname) || (url.origin !== location.origin && !/^\//.test(raw))) return realFetch(input, init);
    const path = url.pathname.slice(url.pathname.indexOf('/api/') > -1 ? url.pathname.indexOf('/api/') : 0).replace(/\/+$/, '') || '/';
    const method = ((init && init.method) || 'GET').toUpperCase();
    let body = {}, formData = null;
    const b = init && init.body;
    if (b instanceof FormData) formData = b; else if (typeof b === 'string' && b) { try { body = JSON.parse(b); } catch (e) { body = {}; } }
    await new Promise(r => setTimeout(r, 60));
    try { return await route(path, url.searchParams, method, body, !!formData, formData); }
    catch (e) { console.error('Demo API error', e); return err(500, 'Demo API error: ' + e.message); }
  };

  /* ---------- demo banner ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('idp-demo-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'idp-demo-banner';
    bar.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;max-width:340px;background:#27332c;color:#fff;font:12px/1.5 "Segoe UI",Arial,sans-serif;padding:10px 34px 10px 14px;border-radius:12px;box-shadow:0 6px 22px rgba(0,0,0,.25)';
    bar.innerHTML = '<strong>Online demo</strong> · sample data, runs in your browser.<br>Log in with <b>customer1</b>, <b>designer1</b>, <b>admin1</b> or <b>platform1</b> (any password).' +
      '<button type="button" aria-label="Close" style="position:absolute;top:6px;right:8px;background:none;border:0;color:#fff;font-size:18px;cursor:pointer">×</button>' +
      '<br><a href="#" id="idp-demo-reset" style="color:#b9d6bf">Reset demo data</a>';
    bar.querySelector('button').onclick = () => bar.remove();
    bar.querySelector('#idp-demo-reset').onclick = (e) => { e.preventDefault(); try { localStorage.removeItem(KEY); sessionStorage.removeItem(USER_KEY); } catch (x) { /* ignore */ } location.href = 'guest-home.html'; };
    document.body.appendChild(bar);
  });
})();
