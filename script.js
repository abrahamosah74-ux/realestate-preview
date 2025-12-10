// Simple SPA loader that fetches page fragments from /pages and manages history
const routes = {
  home: '/pages/home.html',
  rentals: '/pages/rentals.html',
  sales: '/pages/sales.html',
  land: '/pages/land.html',
  contact: '/pages/contact.html'
};

const app = document.getElementById('app');

async function loadRoute(name, push=true){
  // use absolute paths so fetch works from any URL (important for SPA on Vercel)
  const path = routes[name] || routes.home;
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error('Not found');
    const html = await res.text();
    app.innerHTML = html;
    if(push) history.pushState({page:name}, '', name === 'home' ? '/' : `/${name}`);
    // execute any route-specific initializer
    if(typeof routeInit === 'function') routeInit(name);
    window.scrollTo({top:0, behavior:'smooth'});
  }catch(e){
    app.innerHTML = `<div style="padding:40px"><h2>Page not found</h2><p>Try the home page.</p></div>`;
  }
}

// intercept nav clicks
document.addEventListener('click', e=>{
  const a = e.target.closest('a[data-link]');
  if(a){
    e.preventDefault();
    const link = a.getAttribute('data-link');
    loadRoute(link);
  }
});

// handle back/forward
window.addEventListener('popstate', e=>{
  const state = (e.state && e.state.page) ? e.state.page : 'home';
  loadRoute(state, false);
});

// initial load: determine route from path
function initialRouteFromPath(){
  const path = location.pathname.replace(/^\//,'').split('/')[0];
  return path === '' ? 'home' : (Object.keys(routes).includes(path) ? path : 'home');
}

// small helper: play fade-in animation for cards if present
function routeInit(routeName){
  // if properties exist, attach handlers or lazy load images etc.
  const cards = document.querySelectorAll('.card');
  if(cards.length){
    cards.forEach((c,i)=>{
      c.style.opacity = 0;
      setTimeout(()=> c.style.opacity = 1, i*120);
    });
  }
}

// boot
document.addEventListener('DOMContentLoaded', ()=> {
  const start = initialRouteFromPath();
  loadRoute(start, false);
});
