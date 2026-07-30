// --- config ---
const POSTS_JSON_URL = 'blog/posts.json'; // ton fichier existant

// --- helpers ---
const $  = (s, r=document) => r.querySelector(s);

let allPosts = [];
let view = { q: '', sort: 'date-desc' }; // par défaut : plus récent d'abord

// normalisation simple pour la recherche (titre uniquement)
function norm(s){ return (s||'').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); }

// tri : date ou tag A->Z (on prend le premier tag si plusieurs)
function sortPosts(list){
  const byDate = (a,b)=> new Date(b.date) - new Date(a.date);       // desc
  const byDateAsc = (a,b)=> new Date(a.date) - new Date(b.date);     // asc
  const firstTag = p => (p.tags && p.tags.length ? p.tags[0] : '').toLowerCase();

  if(view.sort === 'date-asc')  return list.sort(byDateAsc);
  if(view.sort === 'tag-asc')   return list.sort((a,b)=> firstTag(a).localeCompare(firstTag(b)));
  return list.sort(byDate); // date-desc par défaut
}

// filtre par titre uniquement (contient)
function filterPosts(list){
  const q = norm(view.q);
  if(!q) return list;
  return list.filter(p => norm(p.title).includes(q));
}

function render(list){
  const host = $('#blog-list');
  if(!host) return;

  if(!list.length){
    host.innerHTML = `<p class="text-muted">Aucun article trouvé.</p>`;
    return;
  }

  // carte compacte & aérée
  host.innerHTML = list.map(p => `
    <article class="blog-card">
      ${p.hero_image ? `<img class="blog-card__cover" src="${p.hero_image}" alt="" loading="lazy">` : ``}
      <div class="blog-card__body">
        <div class="blog-card__meta">
          <span>${new Date(p.date).toLocaleDateString('fr-FR')}</span>
          ${(p.tags||[]).length ? `<span class="badge">${p.tags[0]}</span>` : ``}
        </div>
        <h3 class="blog-card__title">
          <a href="article.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a>
        </h3>
        ${p.description ? `<p class="blog-card__excerpt">${p.description}</p>` : `<p class="blog-card__excerpt">&nbsp;</p>`}
      </div>
    </article>
  `).join('');
}

function apply(){
  const filtered = filterPosts([...allPosts]);
  const sorted   = sortPosts(filtered);
  render(sorted);
}

async function init(){
  const host = $('#blog-list');
  try{
    const res = await fetch(POSTS_JSON_URL, { cache: 'no-store' });
    allPosts = await res.json();
  }catch(e){
    host.innerHTML = `<p class="text-muted">Impossible de charger les articles.</p>`;
    return;
  }
  apply();
}

function bindUI(){
  $('#apply').addEventListener('click', ()=>{
    view.q    = $('#q').value;
    view.sort = $('#sort').value;
    apply();
  });

  $('#reset').addEventListener('click', ()=>{
    $('#q').value = '';
    $('#sort').value = 'date-desc';
    view = { q:'', sort:'date-desc' };
    apply();
  });

  // recherche live (optionnelle, fluide)
  $('#q').addEventListener('input', ()=>{
    view.q = $('#q').value;
    apply();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  bindUI();
  init();
});
