/*
 * Bring! Icon Card for Home Assistant
 * Shows a to-do list (e.g. from the Bring! integration) as large tiles with
 * Bring! item pictures. Tap to check off, tap a recent item to add it again.
 *
 * Not affiliated with or endorsed by Bring! Labs AG.
 * License: MIT
 */
const VERSION = '1.0.0';

const STRINGS = {
  de: {
    add: 'Artikel hinzufügen …', addBtn: 'Hinzufügen', open: 'Zu kaufen',
    recent: 'Zuletzt verwendet · antippen zum Hinzufügen', loading: 'Liste wird geladen …',
    empty: 'Alles erledigt', check: 'abhaken', uncheck: 'wieder auf die Liste',
  },
  en: {
    add: 'Add item …', addBtn: 'Add', open: 'To buy',
    recent: 'Recently used · tap to add again', loading: 'Loading list …',
    empty: 'All done', check: 'check off', uncheck: 'add again',
  },
};

const DEFAULT_IMAGE_URL = 'https://web.getbring.com/assets/images/items/{key}.png';
const CACHE_KEY = 'bring-icon-card:images:v1';
const RETRY_MISSING_MS = 7 * 24 * 3600 * 1000;

/* ---------- picture lookup, shared by all cards on the page ---------- */

const ImageCache = {
  _mem: null,
  _pending: new Map(),

  _load() {
    if (this._mem) return this._mem;
    this._mem = {};
    try { this._mem = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) { /* storage blocked */ }
    return this._mem;
  },

  _save() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(this._mem)); } catch (e) { /* storage blocked */ }
  },

  key(name) {
    return String(name).trim().toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  },

  // Bring! names its pictures differently from what people type
  // ("Zwiebeln" vs "Zwiebel", "Reis" for "Sushi Reis"), so try a few variants.
  candidates(name) {
    const k = this.key(name);
    const out = [];
    const add = (s) => { if (s && s.length >= 3 && !out.includes(s)) out.push(s); };
    const forms = (s) => { add(s); add(s + 'n'); add(s + 'e'); add(s + 's'); add(s.replace(/(n|e|s)$/, '')); };
    forms(k);
    const words = k.split('_').filter(Boolean);
    if (words.length > 1) { forms(words[words.length - 1]); forms(words[0]); }
    const w = words[words.length - 1] || k;
    for (let i = 3; i <= w.length - 4 && out.length < 14; i++) forms(w.slice(i));
    return out.slice(0, 14);
  },

  // Returns the known result right away: a key string, null (no picture) or undefined (unknown).
  peek(name, template) {
    const e = this._load()[template + '|' + this.key(name)];
    if (!e) return undefined;
    if (e.k) return e.k;
    return Date.now() - e.t < RETRY_MISSING_MS ? null : undefined;
  },

  resolve(name, template) {
    const id = template + '|' + this.key(name);
    if (this._pending.has(id)) return this._pending.get(id);
    const known = this.peek(name, template);
    if (known !== undefined) return Promise.resolve(known);
    const list = this.candidates(name);
    const p = (async () => {
      for (const k of list) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img.naturalWidth > 0);
          img.onerror = () => res(false);
          img.src = template.replace('{key}', k);
        });
        if (ok) { this._load()[id] = { k, t: Date.now() }; this._save(); return k; }
      }
      this._load()[id] = { k: null, t: Date.now() };
      this._save();
      return null;
    })();
    this._pending.set(id, p);
    p.finally(() => this._pending.delete(id));
    return p;
  },
};

/* ---------- the card ---------- */

class BringIconCard extends HTMLElement {
  static getStubConfig(hass) {
    const todo = Object.keys(hass.states).find((e) => e.startsWith('todo.'));
    return { entity: todo || 'todo.shopping_list' };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { domain: 'todo' } } },
        { name: 'title', selector: { text: {} } },
        {
          type: 'grid', name: '', schema: [
            { name: 'columns', selector: { number: { min: 2, max: 8, mode: 'box' } } },
            { name: 'recent', selector: { number: { min: 0, max: 40, mode: 'box' } } },
          ],
        },
        { name: 'images', selector: { boolean: {} } },
      ],
      computeLabel: (s) => ({
        entity: 'List', title: 'Title', columns: 'Tiles per row',
        recent: 'Recently used items', images: 'Show Bring! pictures',
      })[s.name],
    };
  }

  setConfig(config) {
    if (!config || !config.entity || !String(config.entity).startsWith('todo.')) {
      throw new Error('Please set "entity" to a todo entity, e.g. todo.home');
    }
    const next = Object.assign(
      { recent: 12, columns: 4, images: true, image_url: DEFAULT_IMAGE_URL, title: '' },
      config,
    );
    const entityChanged = this._config && this._config.entity !== next.entity;
    this._config = next;
    if (entityChanged) { this._unsubscribe(); this._items = null; }
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._tiles = this._tiles || new Map();
    this._built = false;
    this._render();
    if (this._hass && !this._unsub) this._subscribe();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first || !this._unsub) this._subscribe();
  }

  getCardSize() { return 6; }

  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  connectedCallback() { if (this._hass && !this._unsub) this._subscribe(); }

  disconnectedCallback() { this._unsubscribe(); }

  get _t() {
    const lang = (this._hass && (this._hass.locale?.language || this._hass.language)) || 'en';
    return STRINGS[lang.slice(0, 2)] || STRINGS.en;
  }

  _subscribe() {
    if (!this._hass || this._unsub || !this._config) return;
    this._unsub = this._hass.connection
      .subscribeMessage((msg) => { this._items = msg.items || []; this._render(); },
        { type: 'todo/item/subscribe', entity_id: this._config.entity })
      .catch(() => { this._unsub = null; });
  }

  _unsubscribe() {
    if (this._unsub) {
      this._unsub.then((u) => u && u()).catch(() => {});
      this._unsub = null;
    }
  }

  _call(service, data) {
    return this._hass.callService('todo', service, data, { entity_id: this._config.entity });
  }

  _toggle(item) {
    const status = item.status === 'completed' ? 'needs_action' : 'completed';
    // Optimistic: move the tile right away, the subscription confirms it.
    item.status = status;
    this._render();
    this._call('update_item', { item: item.uid, status }).catch(() => {});
  }

  _add() {
    const input = this.shadowRoot.querySelector('input');
    const value = (input.value || '').trim();
    if (!value) return;
    input.value = '';
    const again = (this._items || []).find(
      (i) => i.status === 'completed' && i.summary.trim().toLowerCase() === value.toLowerCase(),
    );
    if (again) this._toggle(again);
    else this._call('add_item', { item: value }).catch(() => {});
  }

  _build() {
    const t = this._t;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; --bic-open-from: rgba(255,105,97,.42); --bic-open-to: rgba(238,82,79,.26);
          --bic-open-border: rgba(255,140,130,.45); --bic-accent: #FFD60A; }
        ha-card { padding: 12px; }
        .title { margin: 0 0 12px; font-size: 20px; font-weight: 700; }
        .add { display: flex; gap: 10px; margin-bottom: 18px; }
        input { flex: 1; min-width: 0; height: 48px; box-sizing: border-box; border-radius: 16px;
          border: 1px solid rgba(127,127,127,.3); background: rgba(127,127,127,.12);
          color: var(--primary-text-color); padding: 0 16px; font: inherit; font-size: 16px; outline: none; }
        input:focus { border-color: var(--bic-accent); }
        input::placeholder { color: var(--secondary-text-color); }
        .plus { all: unset; cursor: pointer; width: 48px; height: 48px; border-radius: 16px;
          background: var(--bic-accent); color: #1C1C1E; font-size: 28px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; }
        .plus:focus-visible, .tile:focus-visible { outline: 3px solid var(--primary-color); outline-offset: 2px; }
        h3 { margin: 0 0 10px; font-size: 13px; font-weight: 600; letter-spacing: .4px;
          text-transform: uppercase; color: var(--secondary-text-color); }
        .grid { display: grid; grid-template-columns: repeat(var(--bic-columns, 4), minmax(0, 1fr));
          gap: 10px; margin-bottom: 20px; }
        .grid:empty { display: none; }
        [hidden] { display: none !important; }
        .tile { all: unset; box-sizing: border-box; cursor: pointer; min-height: 118px; border-radius: 18px;
          padding: 12px 8px 10px; display: flex; flex-direction: column; align-items: center; gap: 6px;
          text-align: center; background: linear-gradient(160deg, var(--bic-open-from), var(--bic-open-to));
          border: 1px solid var(--bic-open-border); box-shadow: inset 0 1px 0 rgba(255,255,255,.22);
          -webkit-tap-highlight-color: transparent; transition: transform .12s ease, opacity .2s ease; }
        .tile:active { transform: scale(.96); }
        .tile.done { background: rgba(127,127,127,.12); border-color: rgba(127,127,127,.25); box-shadow: none; }
        .tile.done .pic { opacity: .55; }
        .tile.done .name { color: var(--secondary-text-color); }
        .pic { position: relative; width: 56px; height: 56px; }
        .pic img, .pic .letter { position: absolute; inset: 0; margin: auto; transition: opacity .25s ease; }
        .pic img { width: 56px; height: 56px; object-fit: contain; opacity: 0;
          filter: var(--bic-image-filter, brightness(0) invert(1)); }
        .pic.has-img img { opacity: 1; }
        .letter { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,.18);
          display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700;
          color: #fff; opacity: 0; }
        .pic.has-letter .letter { opacity: 1; }
        .pic.loading .letter { opacity: .35; color: transparent; }
        .tile.done .letter { color: var(--primary-text-color); background: rgba(127,127,127,.2); }
        .tile.done .pic.loading .letter { color: transparent; }
        .name { font-size: 14px; font-weight: 600; line-height: 17px; color: #fff; word-break: break-word; }
        .spec { font-size: 11px; line-height: 13px; opacity: .8; color: #fff; }
        .tile.done .spec { color: var(--secondary-text-color); }
        .empty { padding: 14px 4px 22px; color: var(--secondary-text-color); font-size: 14px; }
      </style>
      <ha-card>
        <h2 class="title" hidden></h2>
        <div class="add">
          <input type="text" enterkeyhint="done" list="bic-recent" autocomplete="off">
          <datalist id="bic-recent"></datalist>
          <button class="plus">+</button>
        </div>
        <div class="msg empty"></div>
        <h3 class="h-open"></h3>
        <div class="grid g-open"></div>
        <h3 class="h-recent"></h3>
        <div class="grid g-recent"></div>
      </ha-card>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    const input = $('input');
    input.placeholder = t.add;
    input.setAttribute('aria-label', t.add);
    $('.plus').setAttribute('aria-label', t.addBtn);
    $('.plus').addEventListener('click', (e) => { e.stopPropagation(); this._add(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this._add(); } });
    this.shadowRoot.querySelector('ha-card').addEventListener('click', (e) => {
      const b = e.target.closest('.tile');
      if (!b || !this._items) return;
      e.stopPropagation();
      const item = this._items.find((x) => x.uid === b.dataset.u);
      if (item) this._toggle(item);
    });
    this._tiles = new Map();
    this._built = true;
  }

  _pic(tile, name) {
    const pic = tile.querySelector('.pic');
    if (pic.dataset.name === name && pic.dataset.state) return;
    pic.dataset.name = name;
    const letter = pic.querySelector('.letter');
    letter.textContent = String(name).trim().charAt(0).toUpperCase();
    let img = pic.querySelector('img');
    const show = (key) => {
      if (pic.dataset.name !== name) return;
      if (key) {
        if (!img) { img = document.createElement('img'); img.alt = ''; pic.appendChild(img); }
        const url = this._config.image_url.replace('{key}', key);
        const done = () => { if (pic.dataset.name === name) { pic.className = 'pic has-img'; pic.dataset.state = 'img'; } };
        if (img.getAttribute('src') === url && img.complete) done();
        else { img.onload = done; img.onerror = () => show(null); img.src = url; }
      } else {
        if (img) { img.remove(); img = null; }
        pic.className = 'pic has-letter';
        pic.dataset.state = 'letter';
      }
    };
    if (!this._config.images) { show(null); return; }
    const tpl = this._config.image_url;
    const known = ImageCache.peek(name, tpl);
    if (known !== undefined) { show(known); return; }
    pic.className = 'pic loading';
    ImageCache.resolve(name, tpl).then(show);
  }

  _tile(item, done) {
    let tile = this._tiles.get(item.uid);
    if (!tile) {
      tile = document.createElement('button');
      tile.className = 'tile';
      tile.dataset.u = item.uid;
      tile.innerHTML = '<span class="pic"><span class="letter"></span></span><span class="name"></span><span class="spec"></span>';
      this._tiles.set(item.uid, tile);
    }
    const t = this._t;
    tile.classList.toggle('done', done);
    tile.setAttribute('aria-label', item.summary + ', ' + (done ? t.uncheck : t.check));
    const nameEl = tile.querySelector('.name');
    if (nameEl.textContent !== item.summary) nameEl.textContent = item.summary;
    const spec = tile.querySelector('.spec');
    spec.textContent = item.description || '';
    spec.hidden = !item.description;
    this._pic(tile, item.summary);
    return tile;
  }

  _sync(grid, tiles) {
    tiles.forEach((tile, i) => { if (grid.children[i] !== tile) grid.insertBefore(tile, grid.children[i] || null); });
    while (grid.children.length > tiles.length) grid.lastElementChild.remove();
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    if (!this._built) this._build();
    const t = this._t;
    const $ = (s) => this.shadowRoot.querySelector(s);
    const title = $('.title');
    title.textContent = this._config.title || '';
    title.hidden = !this._config.title;
    this.style.setProperty('--bic-columns', String(this._config.columns));
    const msg = $('.msg');
    if (!this._items) {
      msg.textContent = t.loading; msg.hidden = false;
      $('.h-open').hidden = true; $('.h-recent').hidden = true;
      return;
    }
    const open = this._items.filter((i) => i.status !== 'completed');
    const seen = new Set(open.map((i) => i.summary.trim().toLowerCase()));
    const done = [];
    for (const i of this._items) {
      if (i.status !== 'completed') continue;
      const k = i.summary.trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      done.push(i);
      if (done.length >= this._config.recent) break;
    }
    $('.h-open').textContent = t.open + ' · ' + open.length;
    $('.h-open').hidden = false;
    msg.textContent = t.empty;
    msg.hidden = open.length > 0;
    $('.h-recent').textContent = t.recent;
    $('.h-recent').hidden = done.length === 0;
    const keep = new Set([...open, ...done].map((i) => i.uid));
    for (const uid of [...this._tiles.keys()]) if (!keep.has(uid)) this._tiles.delete(uid);
    this._sync($('.g-open'), open.map((i) => this._tile(i, false)));
    this._sync($('.g-recent'), done.map((i) => this._tile(i, true)));
    const dl = $('#bic-recent');
    const opts = done.map((i) => i.summary).join('\n');
    if (dl.dataset.v !== opts) {
      dl.dataset.v = opts;
      dl.innerHTML = '';
      done.forEach((i) => { const o = document.createElement('option'); o.value = i.summary; dl.appendChild(o); });
    }
  }
}

if (!customElements.get('bring-icon-card')) customElements.define('bring-icon-card', BringIconCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'bring-icon-card',
  name: 'Bring! Icon Card',
  description: 'Shopping list as large tiles with Bring! item pictures',
  preview: false,
  documentationURL: 'https://github.com/crankstyles90-hash/bring-icon-card',
});
console.info('%c BRING-ICON-CARD %c ' + VERSION + ' ', 'color:#1C1C1E;background:#FFD60A;font-weight:700', 'color:#fff;background:#333');
