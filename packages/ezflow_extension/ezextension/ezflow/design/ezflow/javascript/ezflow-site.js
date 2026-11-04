/*
 * ezflow site design: the page's behavior, one ES module, no inline code (loaded by page_head_script.tpl through
 * the packer as <script type="module">). Every part works on markup that is complete without it:
 *   - [data-fx-menu-toggle]   the menu button of narrow screens (aria-expanded, Escape closes, focus returns)
 *   - [data-fx-theme-toggle]  automatic / light / dark, remembered in localStorage (html[data-theme])
 *   - [data-fx-lightbox]      gallery links open the larger image in a native <dialog>, arrow keys move on
 *   - [data-fx-carousel]      previous / next buttons of a scroll-snap track
 *   - [data-fx-reveal]        elements fade in as they scroll into view (none with prefers-reduced-motion)
 *   - [data-fx-online]        the online users count, refreshed through ezjscore (ezflow::onlineusers)
 */
const doc = document;
const root = doc.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { if (value === null) { window.localStorage.removeItem(key); } else { window.localStorage.setItem(key, value); } } catch (e) { /* private mode */ } }
};

root.classList.remove('fx-no-js');
root.classList.add('fx-js');

/* theme ------------------------------------------------------------------------------------------------ */
const THEMES = ['auto', 'light', 'dark'];
function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') { root.setAttribute('data-theme', theme); } else { root.removeAttribute('data-theme'); }
    doc.querySelectorAll('[data-fx-theme-toggle]').forEach((button) => {
        const label = button.getAttribute('data-label-' + theme) || theme;
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
        const text = button.querySelector('[data-fx-theme-label]');
        if (text) { text.textContent = label; }
    });
}
applyTheme(store.get('fx-theme') || 'auto');
doc.addEventListener('click', (event) => {
    const button = event.target.closest('[data-fx-theme-toggle]');
    if (!button) { return; }
    const current = store.get('fx-theme') || 'auto';
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    store.set('fx-theme', next === 'auto' ? null : next);
    applyTheme(next);
});

/* menu ------------------------------------------------------------------------------------------------- */
function setMenu(button, open) {
    const nav = doc.getElementById(button.getAttribute('aria-controls'));
    if (!nav) { return; }
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (open) {
        const first = nav.querySelector('a, input, button');
        if (first) { first.focus(); }
    }
}
doc.querySelectorAll('[data-fx-menu-toggle]').forEach((button) => {
    button.addEventListener('click', () => setMenu(button, button.getAttribute('aria-expanded') !== 'true'));
});
doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') { return; }
    doc.querySelectorAll('[data-fx-menu-toggle][aria-expanded="true"]').forEach((button) => { setMenu(button, false); button.focus(); });
});
window.matchMedia('(min-width: 1081px)').addEventListener('change', (query) => {
    if (query.matches) { doc.querySelectorAll('[data-fx-menu-toggle]').forEach((button) => setMenu(button, false)); }
});

/* lightbox --------------------------------------------------------------------------------------------- */
let lightbox = null;
let group = [];
let index = 0;
function buildLightbox() {
    const dialog = doc.createElement('dialog');
    dialog.className = 'fx-lightbox';
    dialog.setAttribute('aria-label', doc.documentElement.lang && root.dataset.fxLightboxLabel ? root.dataset.fxLightboxLabel : 'Image');
    const img = doc.createElement('img');
    img.className = 'fx-lightbox__img';
    img.alt = '';
    const bar = doc.createElement('div');
    bar.className = 'fx-lightbox__bar';
    const caption = doc.createElement('p');
    caption.className = 'fx-lightbox__caption';
    const button = (name, path, handler) => {
        const b = doc.createElement('button');
        b.type = 'button';
        b.className = 'fx-iconbtn';
        b.setAttribute('aria-label', name);
        b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="' + path + '"/></svg>';
        b.addEventListener('click', handler);
        return b;
    };
    bar.append(caption,
        button('Previous', 'M15 18l-6-6 6-6', () => show(index - 1)),
        button('Next', 'M9 18l6-6-6-6', () => show(index + 1)),
        button('Close', 'M6 6l12 12M18 6L6 18', () => dialog.close()));
    dialog.append(img, bar);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) { dialog.close(); } });
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { show(index + 1); }
        if (event.key === 'ArrowLeft') { show(index - 1); }
    });
    doc.body.append(dialog);
    return dialog;
}
function show(i) {
    if (!group.length) { return; }
    index = (i + group.length) % group.length;
    const link = group[index];
    const img = lightbox.querySelector('.fx-lightbox__img');
    img.src = link.getAttribute('data-fx-large') || link.href;
    img.alt = link.getAttribute('data-fx-alt') || '';
    lightbox.querySelector('.fx-lightbox__caption').textContent = link.getAttribute('data-fx-caption') || img.alt;
}
doc.addEventListener('click', (event) => {
    const link = event.target.closest('[data-fx-lightbox] a[data-fx-large]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || typeof HTMLDialogElement !== 'function') { return; }
    event.preventDefault();
    lightbox = lightbox || buildLightbox();
    group = Array.from(link.closest('[data-fx-lightbox]').querySelectorAll('a[data-fx-large]'));
    show(group.indexOf(link));
    lightbox.showModal();
});

/* carousel --------------------------------------------------------------------------------------------- */
doc.querySelectorAll('[data-fx-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-fx-track]');
    if (!track) { return; }
    const step = (dir) => {
        const item = track.firstElementChild;
        const width = item ? item.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
        track.scrollBy({ left: dir * width, behavior: reduced.matches ? 'auto' : 'smooth' });
    };
    carousel.querySelectorAll('[data-fx-prev]').forEach((b) => b.addEventListener('click', () => step(-1)));
    carousel.querySelectorAll('[data-fx-next]').forEach((b) => b.addEventListener('click', () => step(1)));
    track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { step(1); }
        if (event.key === 'ArrowLeft') { step(-1); }
    });
});

/* reveal ----------------------------------------------------------------------------------------------- */
const reveal = doc.querySelectorAll('[data-fx-reveal]');
if (reduced.matches || !('IntersectionObserver' in window)) {
    reveal.forEach((el) => el.classList.add('is-in'));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveal.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { observer.observe(el); }
    });
}

/* online users ----------------------------------------------------------------------------------------- */
doc.querySelectorAll('[data-fx-online][data-fx-url]').forEach((el) => {
    const refresh = () => {
        fetch(el.getAttribute('data-fx-url'), { headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }, credentials: 'same-origin' })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data && data.content !== undefined && data.content !== null) {
                    const out = el.querySelector('[data-fx-online-count]');
                    if (out) { out.textContent = String(data.content.logged_in_count !== undefined ? data.content.logged_in_count : data.content); }
                }
            })
            .catch(() => { /* the number on the page stays */ });
    };
    window.setInterval(refresh, 60000);
});

/* quick search (block/search.tpl) ---------------------------------------------------------------------- */
function token() {
    const el = doc.getElementById('ezxform_token_js');
    return el ? (el.getAttribute('title') || el.textContent || '') : '';
}
doc.querySelectorAll('form[data-fx-quicksearch]').forEach((form) => {
    const results = form.parentElement.querySelector('[data-fx-quicksearch-results]');
    const input = form.querySelector('input[name="SearchText"]');
    if (!results || !input) { return; }
    form.addEventListener('submit', (event) => {
        const text = input.value.trim();
        if (!text) { return; }
        event.preventDefault();
        const body = new URLSearchParams({
            ezjscServer_function_arguments: 'ezjsc::search', SearchStr: text,
            SearchLimit: form.getAttribute('data-fx-limit') || '6', SearchOffset: '0', EncodingFormatDate: 'shortdate'
        });
        if (token()) { body.append('ezxform_token', token()); }
        results.setAttribute('aria-busy', 'true');
        fetch(form.getAttribute('data-fx-call'), {
            method: 'POST', body, credentials: 'same-origin',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((data) => {
            const list = data && data.content && Array.isArray(data.content.SearchResult) ? data.content.SearchResult : [];
            results.replaceChildren();
            if (!list.length) {
                const p = doc.createElement('p');
                p.className = 'fx-empty';
                p.textContent = (form.getAttribute('data-fx-none') || '') + ' “' + text + '”';
                results.append(p);
                return;
            }
            const ul = doc.createElement('ul');
            ul.className = 'fx-list';
            const base = (form.getAttribute('data-fx-base') || '/').replace(/\/$/, '');
            list.forEach((item) => {
                const li = doc.createElement('li');
                const a = doc.createElement('a');
                a.className = 'fx-list__link';
                a.href = base + '/' + String(item.url_alias || ('content/view/full/' + item.node_id)).replace(/^\//, '');
                const title = doc.createElement('span');
                title.className = 'fx-list__title';
                title.textContent = item.name || '';
                const meta = doc.createElement('span');
                meta.className = 'fx-list__meta';
                meta.textContent = item.class_name || '';
                a.append(title, meta);
                li.append(a);
                ul.append(li);
            });
            results.append(ul);
        }).catch(() => { form.submit(); }).finally(() => results.removeAttribute('aria-busy'));
    });
});
