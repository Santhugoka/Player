// UTILS
const gdUrl = (id) => `https://drive.google.com/file/d/${id}/preview`;
const $ = (id) => document.getElementById(id);

const cleanTitle = (str) => str.replace(/\s\(\d{4}\)/g, '').trim();

let currentHeroIdx = 0;
let heroInterval;

// NAVIGATION
window.showView = (viewId) => {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  const target = $(`view-${viewId}`);
  if (target) target.classList.remove('hidden');
  
  // Stop video if navigating away from player
  if (viewId !== 'player') {
    const player = $('mainPlayer');
    if (player) player.src = '';
  }
  
  const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(l => l.textContent.toLowerCase().includes(viewId));
  if (activeLink) activeLink.classList.add('active');
  
  window.scrollTo(0, 0);
};

// DATA RENDERING
function renderCards(containerId, items, type) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const itemType = item.type; // Use item's inherent type
    const name = cleanTitle(itemType === 'series' ? item.category : item.title);
    const meta = itemType === 'series' ? `${item.seasonCount} Seasons • ${item.videos.length} Episodes` : `${item.duration} • ${item.year}`;
    
    card.innerHTML = `
      <div class="card-img">
        <img src="${item.poster}" alt="${name}">
        <div class="card-overlay">
          <div class="play-btn-circle"><i class="ti ti-player-play-filled"></i></div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-name">${name}</div>
        <div class="card-meta">${meta}</div>
      </div>
    `;
    card.style.animationDelay = `${(items.indexOf(item) % 12) * 0.05}s`;
    card.onclick = () => openDetail(item, itemType);
    container.appendChild(card);
  });
}

function openDetail(item, type) {
  showView('detail');
  const hero = $('detail-hero');
  const name = cleanTitle(type === 'series' ? item.category : item.title);
  
  hero.innerHTML = `
    <div class="hero-bg"><img src="${item.banner || item.poster}" alt=""></div>
    <div class="hero-grad"></div>
    <div class="hero-content">
      <div class="hero-meta">
        <span style="font-weight:700; color:var(--gold)">${item.year}</span>
        ${type === 'movie' ? `<span style="font-weight:700; color:var(--text-muted)">${item.duration}</span>` : ''}
      </div>
      <h1 class="hero-title">${name}</h1>
      <p class="hero-desc">${item.description}</p>
      <div style="display:flex; gap:15px;">
        <button class="btn btn-primary" id="detail-play-btn"><i class="ti ti-player-play-filled"></i> Watch Now</button>
      </div>
    </div>
  `;

  if (type === 'movie') {
    $('detail-episodes-section').classList.add('hidden');
    $('detail-play-btn').onclick = () => openPlayer(item.id_vid, name, item.description);
  } else {
    $('detail-episodes-section').classList.remove('hidden');
    renderEpisodes(item);
    $('detail-play-btn').onclick = () => {
      const firstEp = item.videos[0];
      openPlayer(firstEp.id, firstEp.title, item.description);
    };
  }
}

function renderEpisodes(series) {
  const grid = $('episode-grid');
  grid.innerHTML = '';
  series.videos.forEach((ep, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img">
        <img src="${ep.thumb || series.poster}" alt="">
        <div class="card-overlay">
          <div class="play-btn-circle"><i class="ti ti-player-play-filled"></i></div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-name">${ep.title}</div>
        <div class="card-meta">${ep.dur}</div>
      </div>
    `;
    card.onclick = () => openPlayer(ep.id, ep.title, series.description);
    grid.appendChild(card);
  });
}

window.openPlayer = (id, title, desc) => {
  showView('player');
  $('mainPlayer').src = gdUrl(id);
  $('player-title').textContent = title;
  $('player-desc').textContent = desc;
  
  // Reset enhancer on new load
  document.querySelector('.video-player').className = 'video-player';
  document.querySelectorAll('.btn-enhancer').forEach(b => b.classList.remove('active'));
};

window.toggleEnhancer = (mode) => {
  const vp = document.querySelector('.video-player');
  const btn = $(`btn-${mode}`);
  const isActive = btn.classList.contains('active');
  
  // Clear all
  vp.className = 'video-player';
  document.querySelectorAll('.btn-enhancer').forEach(b => b.classList.remove('active'));
  
  if (!isActive) {
    vp.classList.add(mode);
    btn.classList.add('active');
  }
};

// HERO SYSTEM
function initHero() {
  const series = videoData.filter(d => d.type === 'series');
  const movies = videoData.filter(d => d.type === 'movie');
  const heroPool = [...series, ...movies];
  
  function updateHero() {
    const item = heroPool[currentHeroIdx];
    const section = $('hero-section');
    const name = cleanTitle(item.type === 'series' ? item.category : item.title);
    
    section.innerHTML = `
      <div class="hero-bg"><img src="${item.banner || item.poster}" alt=""></div>
      <div class="hero-grad"></div>
      <div class="hero-content">
        <div class="hero-meta">
          <span style="font-weight:800; font-size:12px; letter-spacing:2px; color:var(--gold)">PREMIUM FEATURED</span>
        </div>
        <h1 class="hero-title">${name}</h1>
        <p class="hero-desc">${item.description}</p>
        <div style="display:flex; gap:20px;">
          <button class="btn btn-primary" id="hero-watch-btn"><i class="ti ti-player-play-filled"></i> Watch Now</button>
          <button class="btn btn-secondary" id="hero-detail-btn">View Details</button>
        </div>
      </div>
    `;
    
    $('hero-watch-btn').onclick = () => {
       if(item.type === 'movie') openPlayer(item.id_vid, name, item.description);
       else openPlayer(item.videos[0].id, item.videos[0].title, item.description);
    };
    $('hero-detail-btn').onclick = () => openDetail(item, item.type);
    
    currentHeroIdx = (currentHeroIdx + 1) % heroPool.length;
  }
  
  updateHero();
  setInterval(updateHero, 8000);
}

// SEARCH
window.handleSearch = () => {
  const query = $('searchInput').value.toLowerCase();
  if (query.length < 2) {
    if ($('view-search').classList.contains('hidden') === false) showView('home');
    return;
  }
  
  showView('search');
  const results = videoData.filter(item => {
    const name = cleanTitle(item.type === 'series' ? item.category : item.title);
    return name.toLowerCase().includes(query);
  });
  
  renderCards('search-grid', results);
};

// THEME TOGGLE
window.toggleTheme = () => {
  const body = document.body;
  const icon = document.getElementById('theme-icon');
  
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    if(icon) icon.className = 'ti ti-moon';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-mode');
    if(icon) icon.className = 'ti ti-sun';
    localStorage.setItem('theme', 'dark');
  }
};

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
  // Load Theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('theme-icon');
    if(icon) icon.className = 'ti ti-sun';
  }
  
  initHero();
  renderCards('home-movies-grid', videoData.filter(d => d.type === 'movie'), 'movie');
  renderCards('home-series-grid', videoData.filter(d => d.type === 'series'), 'series');
  
  renderCards('all-movies-grid', videoData.filter(d => d.type === 'movie'), 'movie');
  renderCards('all-series-grid', videoData.filter(d => d.type === 'series'), 'series');
  
  showView('home');
});
