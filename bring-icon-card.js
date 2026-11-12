/*
 * Bring! Icon Card v2.0.0 for Home Assistant
 * Shows a to-do list (e.g. from the Bring! integration) as large tiles with
 * Bring! item pictures. Tap to check off, tap a recent item to add it again.
 *
 * Features: 8 languages, dark/light theme, categories, sorting, quantity badges.
 * Not affiliated with or endorsed by Bring! Labs AG.
 * License: MIT
 */
const VERSION = '2.0.0';

/* ══════════ i18n ══════════ */

const STRINGS = {
  de: {
    add: 'Artikel hinzufügen …', addBtn: 'Hinzufügen', open: 'Zu kaufen',
    recent: 'Zuletzt verwendet · antippen zum Hinzufügen', loading: 'Liste wird geladen …',
    empty: 'Alles erledigt', check: 'abhaken', uncheck: 'wieder auf die Liste',
    cat_all: 'Alle', cat_drinks: 'Getränke', cat_fruit_veg: 'Obst & Gemüse',
    cat_dairy: 'Milchprodukte', cat_meat_fish: 'Fleisch & Fisch', cat_bread: 'Brot & Gebäck',
    cat_frozen: 'Tiefkühl', cat_household: 'Haushalt', cat_snacks: 'Snacks & Süßes',
    cat_spices: 'Gewürze & Saucen', cat_breakfast: 'Frühstück', cat_care: 'Pflege',
    cat_other: 'Sonstiges',
  },
  en: {
    add: 'Add item …', addBtn: 'Add', open: 'To buy',
    recent: 'Recently used · tap to add again', loading: 'Loading list …',
    empty: 'All done', check: 'check off', uncheck: 'add again',
    cat_all: 'All', cat_drinks: 'Drinks', cat_fruit_veg: 'Fruit & Veg',
    cat_dairy: 'Dairy', cat_meat_fish: 'Meat & Fish', cat_bread: 'Bread & Bakery',
    cat_frozen: 'Frozen', cat_household: 'Household', cat_snacks: 'Snacks & Sweets',
    cat_spices: 'Spices & Sauces', cat_breakfast: 'Breakfast', cat_care: 'Personal Care',
    cat_other: 'Other',
  },
  fr: {
    add: 'Ajouter un article …', addBtn: 'Ajouter', open: 'À acheter',
    recent: 'Récemment utilisés · appuyer pour ajouter', loading: 'Chargement …',
    empty: 'Tout est fait', check: 'cocher', uncheck: 'remettre sur la liste',
    cat_all: 'Tout', cat_drinks: 'Boissons', cat_fruit_veg: 'Fruits & Légumes',
    cat_dairy: 'Produits laitiers', cat_meat_fish: 'Viande & Poisson', cat_bread: 'Pain & Pâtisserie',
    cat_frozen: 'Surgelés', cat_household: 'Ménage', cat_snacks: 'Snacks & Sucreries',
    cat_spices: 'Épices & Sauces', cat_breakfast: 'Petit-déjeuner', cat_care: 'Soins',
    cat_other: 'Autres',
  },
  es: {
    add: 'Añadir artículo …', addBtn: 'Añadir', open: 'Por comprar',
    recent: 'Usados recientemente · toca para añadir', loading: 'Cargando lista …',
    empty: 'Todo listo', check: 'marcar', uncheck: 'añadir de nuevo',
    cat_all: 'Todo', cat_drinks: 'Bebidas', cat_fruit_veg: 'Frutas y Verduras',
    cat_dairy: 'Lácteos', cat_meat_fish: 'Carne y Pescado', cat_bread: 'Pan y Bollería',
    cat_frozen: 'Congelados', cat_household: 'Hogar', cat_snacks: 'Snacks y Dulces',
    cat_spices: 'Especias y Salsas', cat_breakfast: 'Desayuno', cat_care: 'Cuidado personal',
    cat_other: 'Otros',
  },
  it: {
    add: 'Aggiungi articolo …', addBtn: 'Aggiungi', open: 'Da comprare',
    recent: 'Usati di recente · tocca per aggiungere', loading: 'Caricamento …',
    empty: 'Tutto fatto', check: 'spunta', uncheck: 'aggiungi di nuovo',
    cat_all: 'Tutto', cat_drinks: 'Bevande', cat_fruit_veg: 'Frutta e Verdura',
    cat_dairy: 'Latticini', cat_meat_fish: 'Carne e Pesce', cat_bread: 'Pane e Dolci',
    cat_frozen: 'Surgelati', cat_household: 'Casa', cat_snacks: 'Snack e Dolci',
    cat_spices: 'Spezie e Salse', cat_breakfast: 'Colazione', cat_care: 'Cura personale',
    cat_other: 'Altro',
  },
  nl: {
    add: 'Artikel toevoegen …', addBtn: 'Toevoegen', open: 'Te kopen',
    recent: 'Recent gebruikt · tik om toe te voegen', loading: 'Lijst laden …',
    empty: 'Alles gedaan', check: 'afvinken', uncheck: 'opnieuw toevoegen',
    cat_all: 'Alles', cat_drinks: 'Dranken', cat_fruit_veg: 'Groenten & Fruit',
    cat_dairy: 'Zuivel', cat_meat_fish: 'Vlees & Vis', cat_bread: 'Brood & Gebak',
    cat_frozen: 'Diepvries', cat_household: 'Huishouden', cat_snacks: 'Snacks & Snoep',
    cat_spices: 'Kruiden & Sauzen', cat_breakfast: 'Ontbijt', cat_care: 'Verzorging',
    cat_other: 'Overig',
  },
  pt: {
    add: 'Adicionar item …', addBtn: 'Adicionar', open: 'A comprar',
    recent: 'Usados recentemente · toque para adicionar', loading: 'Carregando …',
    empty: 'Tudo pronto', check: 'marcar', uncheck: 'adicionar novamente',
    cat_all: 'Tudo', cat_drinks: 'Bebidas', cat_fruit_veg: 'Frutas e Legumes',
    cat_dairy: 'Laticínios', cat_meat_fish: 'Carne e Peixe', cat_bread: 'Pão e Padaria',
    cat_frozen: 'Congelados', cat_household: 'Casa', cat_snacks: 'Snacks e Doces',
    cat_spices: 'Temperos e Molhos', cat_breakfast: 'Café da manhã', cat_care: 'Cuidado pessoal',
    cat_other: 'Outros',
  },
  pl: {
    add: 'Dodaj artykuł …', addBtn: 'Dodaj', open: 'Do kupienia',
    recent: 'Ostatnio używane · dotknij aby dodać', loading: 'Ładowanie listy …',
    empty: 'Wszystko zrobione', check: 'odznacz', uncheck: 'dodaj ponownie',
    cat_all: 'Wszystko', cat_drinks: 'Napoje', cat_fruit_veg: 'Owoce i Warzywa',
    cat_dairy: 'Nabiał', cat_meat_fish: 'Mięso i Ryby', cat_bread: 'Pieczywo',
    cat_frozen: 'Mrożonki', cat_household: 'Dom', cat_snacks: 'Przekąski i Słodycze',
    cat_spices: 'Przyprawy i Sosy', cat_breakfast: 'Śniadanie', cat_care: 'Higiena',
    cat_other: 'Inne',
  },
};

/* ══════════ categories ══════════ */

const CAT_ORDER = [
  'all', 'drinks', 'fruit_veg', 'dairy', 'meat_fish', 'bread',
  'frozen', 'household', 'snacks', 'spices', 'breakfast', 'care', 'other',
];

const ITEM_CAT = (() => {
  const m = {};
  const add = (cat, words) => words.split(',').forEach((w) => { m[w.trim()] = cat; });
  add('drinks',
    'wasser,mineralwasser,sprudel,bier,wein,rotwein,weisswein,saft,orangensaft,apfelsaft,'
    + 'cola,limo,limonade,fanta,sprite,eistee,kaffee,tee,kakao,prosecco,sekt,whisky,rum,vodka,gin,'
    + 'hafermilch,mandelmilch,sojamilch,energy_drink,smoothie,radler,water,juice,beer,wine,coffee,'
    + 'tea,soda,lemonade,ice_tea,coconut_water');
  add('fruit_veg',
    'apfel,aepfel,banane,bananen,orange,orangen,zitrone,zitronen,limette,limetten,erdbeeren,'
    + 'himbeeren,blaubeeren,trauben,birne,birnen,mango,ananas,kiwi,melone,wassermelone,pfirsich,'
    + 'nektarine,pflaume,kirsche,kirschen,avocado,tomate,tomaten,gurke,gurken,paprika,zwiebel,'
    + 'zwiebeln,knoblauch,kartoffel,kartoffeln,karotte,karotten,moehre,moehren,salat,kopfsalat,'
    + 'spinat,brokkoli,blumenkohl,zucchini,aubergine,pilze,champignons,lauch,sellerie,radieschen,'
    + 'mais,bohnen,erbsen,ingwer,kohlrabi,kuerbis,fruehlingszwiebeln,petersilie,schnittlauch,dill,'
    + 'rosmarin,thymian,minze,koriander,apple,banana,tomato,potato,onion,garlic,carrot,lettuce,'
    + 'cucumber,pepper,broccoli,mushrooms,lemon,lime,grapes,strawberries,blueberries,pineapple,'
    + 'watermelon,spinach,corn,peas,beans,ginger,celery,eggplant,peach,pear,'
    + 'cherry,plum,raspberry,melon');
  add('dairy',
    'milch,butter,kaese,joghurt,sahne,schmand,quark,frischkaese,mozzarella,parmesan,gouda,'
    + 'emmentaler,cheddar,mascarpone,ricotta,eier,ei,creme_fraiche,schlagsahne,buttermilch,skyr,'
    + 'feta,camembert,brie,huettenkaese,saure_sahne,cheese,yogurt,cream,eggs,sour_cream,'
    + 'cottage_cheese,milk,cream_cheese,whipped_cream');
  add('meat_fish',
    'fleisch,hackfleisch,haehnchen,huhn,haehnchenbrustfilet,haehnchenbrust,rind,rindfleisch,'
    + 'schwein,schweinefleisch,steak,wurst,schinken,salami,speck,bacon,lachs,thunfisch,garnelen,'
    + 'fisch,bratwurst,wiener,leberkaese,pute,putenbrust,lamm,kalb,wuerstchen,leberwurst,mettwurst,'
    + 'chicken,beef,pork,salmon,tuna,shrimp,fish,sausage,ham,turkey,lamb,ground_beef');
  add('bread',
    'brot,broetchen,toast,toastbrot,baguette,croissant,laugenstange,brezel,laugenbrezel,kuchen,'
    + 'tortenboden,mehl,hefe,vollkornbrot,ciabatta,knackebrot,pumpernickel,bread,rolls,flour,yeast,'
    + 'cake,bun,pretzel,sourdough,pita,tortilla,wraps');
  add('frozen',
    'tiefkuehlpizza,pizza,eis,eiscreme,tiefkuehlgemuese,fischstaebchen,pommes,pommes_frites,'
    + 'tiefkuehlbeeren,blaetterteig,frozen_pizza,ice_cream,frozen_vegetables,fish_sticks,fries,'
    + 'frozen_fruit,puff_pastry');
  add('household',
    'toilettenpapier,kuechentuecher,kuechenrolle,spuelmittel,waschmittel,muellbeutel,schwamm,'
    + 'alufolie,frischhaltefolie,backpapier,kerzen,batterien,gluehbirne,weichspueler,allzweckreiniger,'
    + 'glasreiniger,badreiniger,handseife,spueltabs,toilet_paper,paper_towels,dish_soap,'
    + 'laundry_detergent,trash_bags,sponge,aluminum_foil,plastic_wrap,parchment_paper,candles,'
    + 'batteries,light_bulb,cleaning_spray,fabric_softener');
  add('snacks',
    'chips,schokolade,gummibaerchen,kekse,cookies,popcorn,nuesse,erdnuesse,mandeln,cashews,cracker,'
    + 'salzstangen,studentenfutter,reiswaffeln,muesli_riegel,fruchtgummi,lakritz,waffeln,chocolate,'
    + 'candy,gummy_bears,nuts,peanuts,almonds,pretzels,granola_bar,trail_mix,rice_cakes');
  add('spices',
    'salz,pfeffer,zucker,olivenoel,oel,sonnenblumenoel,rapsoel,essig,senf,ketchup,mayonnaise,'
    + 'sojasauce,tomatenmark,passierte_tomaten,bruehe,gemuesebruehe,huehnerbruehe,oregano,'
    + 'basilikum,paprikapulver,zimt,curry,muskat,kuemmel,lorbeer,vanillezucker,backpulver,staerke,'
    + 'speisestaerke,gelatine,kokosmilch,sambal,tabasco,pesto,salt,pepper,sugar,olive_oil,'
    + 'oil,vinegar,mustard,soy_sauce,tomato_paste,broth,cinnamon,curry_powder,baking_powder,starch,'
    + 'coconut_milk,hot_sauce,bbq_sauce');
  add('breakfast',
    'muesli,cornflakes,haferflocken,marmelade,konfituere,nutella,honig,cerealien,'
    + 'pancakes,pfannkuchen,ahornsirup,erdnussbutter,cereal,oatmeal,jam,honey,granola,pancake_mix,'
    + 'maple_syrup,peanut_butter');
  add('care',
    'zahnpasta,zahnbuerste,shampoo,duschgel,seife,deo,deodorant,rasierer,rasierschaum,bodylotion,'
    + 'handcreme,sonnencreme,pflaster,taschentuecher,wattepads,haarspray,conditioner,mundspuelung,'
    + 'kontaktlinsen,abschminktuecher,toothpaste,toothbrush,soap,shower_gel,body_lotion,sunscreen,'
    + 'razor,tissues,band_aids,shaving_cream,mouthwash,cotton_pads,lip_balm');
  return m;
})();

function categorize(name) {
  const k = ImageCache.key(name);
  if (ITEM_CAT[k]) return ITEM_CAT[k];
  for (const item in ITEM_CAT) {
    if (k.length >= 3 && (k.includes(item) || item.includes(k))) return ITEM_CAT[item];
  }
  return 'other';
}

/* ══════════ image cache ══════════ */

const DEFAULT_IMAGE_URL = 'https://web.getbring.com/assets/images/items/{key}.png';
const CACHE_KEY = 'bring-icon-card:images:v1';
const RETRY_MISSING_MS = 7 * 24 * 3600 * 1000;

const ImageCache = {
  _mem: null,
  _pending: new Map(),

  _load() {
    if (this._mem) return this._mem;
    this._mem = {};
    try { this._mem = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) { /* */ }
    return this._mem;
  },

  _save() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(this._mem)); } catch (e) { /* */ }
  },

  key(name) {
    return String(name).trim().toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  },

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

/* ══════════ the card ══════════ */

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
        { name: 'show_categories', selector: { boolean: {} } },
        {
          name: 'sort', selector: {
            select: {
              options: [
                { value: 'none', label: 'Default' },
                { value: 'alpha', label: 'Alphabetical (A–Z)' },
              ],
              mode: 'dropdown',
            },
          },
        },
      ],
      computeLabel: (s) => ({
        entity: 'List', title: 'Title', columns: 'Tiles per row',
        recent: 'Recently used items', images: 'Show Bring! pictures',
        show_categories: 'Category filters', sort: 'Sort order',
      })[s.name],
    };
  }

  setConfig(config) {
    if (!config || !config.entity || !String(config.entity).startsWith('todo.')) {
      throw new Error('Please set "entity" to a todo entity, e.g. todo.home');
    }
    const next = Object.assign(
      { recent: 12, columns: 4, images: true, image_url: DEFAULT_IMAGE_URL,
        title: '', show_categories: false, sort: 'none' },
      config,
    );
    const entityChanged = this._config && this._config.entity !== next.entity;
    this._config = next;
    if (entityChanged) { this._unsubscribe(); this._items = null; }
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._tiles = this._tiles || new Map();
    this._activeCat = this._activeCat || 'all';
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

  /* --- theme detection --- */
  _detectTheme() {
    try {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-background-color').trim();
      if (!bg) return;
      let r, g, b;
      if (bg.startsWith('#')) {
        const h = bg.length === 4 ? bg[1]+bg[1]+bg[2]+bg[2]+bg[3]+bg[3] : bg.slice(1);
        r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16);
      } else {
        const m = bg.match(/(\d+)/g);
        if (m) { r = +m[0]; g = +m[1]; b = +m[2]; }
      }
      if (r !== undefined) {
        this._light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
      }
    } catch (e) { /* */ }
  }

  /* --- DOM build --- */
  _build() {
    const t = this._t;
    this._detectTheme();
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block;
          --bic-accent: #FFD60A;
          --bic-open-from: ${this._light ? 'rgba(255,105,97,.20)' : 'rgba(255,105,97,.42)'};
          --bic-open-to: ${this._light ? 'rgba(238,82,79,.12)' : 'rgba(238,82,79,.26)'};
          --bic-open-border: ${this._light ? 'rgba(220,80,70,.30)' : 'rgba(255,140,130,.45)'};
          --bic-open-text: ${this._light ? 'var(--primary-text-color)' : '#fff'};
          --bic-done-bg: rgba(127,127,127,${this._light ? '.07' : '.12'});
          --bic-done-border: rgba(127,127,127,${this._light ? '.18' : '.25'});
          --bic-letter-bg: ${this._light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.18)'};
          --bic-letter-color: ${this._light ? 'var(--primary-text-color)' : '#fff'};
          --bic-image-filter: ${this._light ? 'none' : 'brightness(0) invert(1)'};
        }
        ha-card { padding: 12px; }
        .title { margin: 0 0 12px; font-size: 20px; font-weight: 700; }
        /* --- add bar --- */
        .add { display: flex; gap: 10px; margin-bottom: 14px; }
        input { flex: 1; min-width: 0; height: 48px; box-sizing: border-box; border-radius: 16px;
          border: 1px solid rgba(127,127,127,.3); background: rgba(127,127,127,.12);
          color: var(--primary-text-color); padding: 0 16px; font: inherit; font-size: 16px; outline: none; }
        input:focus { border-color: var(--bic-accent); }
        input::placeholder { color: var(--secondary-text-color); }
        .plus { all: unset; cursor: pointer; width: 48px; height: 48px; border-radius: 16px;
          background: var(--bic-accent); color: #1C1C1E; font-size: 28px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .plus:focus-visible, .tile:focus-visible { outline: 3px solid var(--primary-color); outline-offset: 2px; }
        /* --- category chips --- */
        .cats { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; padding: 2px 0 14px; }
        .cats::-webkit-scrollbar { display: none; }
        .cats[hidden] { display: none; }
        .chip { all: unset; cursor: pointer; white-space: nowrap; padding: 6px 14px; border-radius: 20px;
          font-size: 13px; font-weight: 600; background: var(--bic-done-bg);
          border: 1px solid var(--bic-done-border); color: var(--secondary-text-color);
          transition: background .15s, color .15s; }
        .chip.active { background: var(--bic-accent); color: #1C1C1E; border-color: transparent; }
        .chip .cnt { font-weight: 400; opacity: .7; margin-left: 4px; }
        /* --- headings + grid --- */
        h3 { margin: 0 0 10px; font-size: 13px; font-weight: 600; letter-spacing: .4px;
          text-transform: uppercase; color: var(--secondary-text-color); }
        .grid { display: grid; grid-template-columns: repeat(var(--bic-columns, 4), minmax(0, 1fr));
          gap: 10px; margin-bottom: 20px; }
        .grid:empty { display: none; }
        [hidden] { display: none !important; }
        /* --- tiles --- */
        .tile { all: unset; box-sizing: border-box; cursor: pointer; min-height: 118px; border-radius: 18px;
          padding: 12px 8px 10px; display: flex; flex-direction: column; align-items: center; gap: 4px;
          text-align: center; background: linear-gradient(160deg, var(--bic-open-from), var(--bic-open-to));
          border: 1px solid var(--bic-open-border); box-shadow: inset 0 1px 0 rgba(255,255,255,.22);
          -webkit-tap-highlight-color: transparent; transition: transform .12s ease, opacity .2s ease;
          position: relative; }
        .tile:active { transform: scale(.96); }
        .tile.done { background: var(--bic-done-bg); border-color: var(--bic-done-border); box-shadow: none; }
        .tile.done .pic { opacity: .55; }
        .tile.done .name { color: var(--secondary-text-color); }
        /* --- picture --- */
        .pic { position: relative; width: 56px; height: 56px; }
        .pic img, .pic .letter { position: absolute; inset: 0; margin: auto; transition: opacity .25s ease; }
        .pic img { width: 56px; height: 56px; object-fit: contain; opacity: 0;
          filter: var(--bic-image-filter); }
        .pic.has-img img { opacity: 1; }
        .letter { width: 52px; height: 52px; border-radius: 50%; background: var(--bic-letter-bg);
          display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700;
          color: var(--bic-letter-color); opacity: 0; }
        .pic.has-letter .letter { opacity: 1; }
        .pic.loading .letter { opacity: .35; color: transparent; }
        .tile.done .letter { color: var(--primary-text-color); background: rgba(127,127,127,.2); }
        .tile.done .pic.loading .letter { color: transparent; }
        /* --- name + quantity badge --- */
        .name { font-size: 14px; font-weight: 600; line-height: 17px; color: var(--bic-open-text);
          word-break: break-word; }
        .tile.done .name { color: var(--secondary-text-color); }
        .qty { display: inline-block; font-size: 11px; line-height: 13px; font-weight: 600;
          padding: 2px 8px; border-radius: 10px; margin-top: 2px;
          background: rgba(255,255,255,.18); color: var(--bic-open-text); white-space: nowrap; }
        .tile.done .qty { background: rgba(127,127,127,.15); color: var(--secondary-text-color); }
        .qty:empty { display: none; }
        .empty { padding: 14px 4px 22px; color: var(--secondary-text-color); font-size: 14px; }
      </style>
      <ha-card>
        <h2 class="title" hidden></h2>
        <div class="add">
          <input type="text" enterkeyhint="done" list="bic-recent" autocomplete="off">
          <datalist id="bic-recent"></datalist>
          <button class="plus">+</button>
        </div>
        <div class="cats" hidden></div>
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
    $('.cats').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      this._activeCat = chip.dataset.cat;
      this._render();
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
      tile.innerHTML = '<span class="pic"><span class="letter"></span></span>'
        + '<span class="name"></span><span class="qty"></span>';
      this._tiles.set(item.uid, tile);
    }
    const t = this._t;
    tile.classList.toggle('done', done);
    tile.setAttribute('aria-label', item.summary + ', ' + (done ? t.uncheck : t.check));
    const nameEl = tile.querySelector('.name');
    if (nameEl.textContent !== item.summary) nameEl.textContent = item.summary;
    const qty = tile.querySelector('.qty');
    qty.textContent = item.description || '';
    this._pic(tile, item.summary);
    return tile;
  }

  _sync(grid, tiles) {
    tiles.forEach((tile, i) => { if (grid.children[i] !== tile) grid.insertBefore(tile, grid.children[i] || null); });
    while (grid.children.length > tiles.length) grid.lastElementChild.remove();
  }

  _sortItems(items) {
    if (this._config.sort === 'alpha') {
      return [...items].sort((a, b) => a.summary.localeCompare(b.summary, undefined, { sensitivity: 'base' }));
    }
    return items;
  }

  _renderCats(open) {
    const catsEl = this.shadowRoot.querySelector('.cats');
    if (!this._config.show_categories) { catsEl.hidden = true; return; }
    catsEl.hidden = false;
    const t = this._t;
    const counts = {};
    const total = open.length;
    for (const item of open) {
      const cat = categorize(item.summary);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    const visible = ['all', ...CAT_ORDER.filter((c) => c !== 'all' && counts[c])];
    const html = visible.map((cat) => {
      const active = this._activeCat === cat ? ' active' : '';
      const label = t['cat_' + cat] || cat;
      const n = cat === 'all' ? total : (counts[cat] || 0);
      return `<button class="chip${active}" data-cat="${cat}">${label}<span class="cnt">${n}</span></button>`;
    }).join('');
    if (catsEl.innerHTML !== html) catsEl.innerHTML = html;
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
      if (this._config.show_categories) $('.cats').hidden = true;
      return;
    }
    let open = this._items.filter((i) => i.status !== 'completed');
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

    this._renderCats(open);

    let filtered = open;
    if (this._config.show_categories && this._activeCat !== 'all') {
      filtered = open.filter((i) => categorize(i.summary) === this._activeCat);
    }

    filtered = this._sortItems(filtered);
    const sortedDone = this._sortItems(done);

    $('.h-open').textContent = t.open + ' · ' + filtered.length;
    $('.h-open').hidden = false;
    msg.textContent = t.empty;
    msg.hidden = filtered.length > 0;
    $('.h-recent').textContent = t.recent;
    $('.h-recent').hidden = sortedDone.length === 0;
    const keep = new Set([...open, ...done].map((i) => i.uid));
    for (const uid of [...this._tiles.keys()]) if (!keep.has(uid)) this._tiles.delete(uid);
    this._sync($('.g-open'), filtered.map((i) => this._tile(i, false)));
    this._sync($('.g-recent'), sortedDone.map((i) => this._tile(i, true)));
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
  preview: true,
  documentationURL: 'https://github.com/crankstyles90-hash/bring-icon-card',
});
console.info('%c BRING-ICON-CARD %c ' + VERSION + ' ', 'color:#1C1C1E;background:#FFD60A;font-weight:700', 'color:#fff;background:#333');
