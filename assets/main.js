(function(){
  // Simple typing + cursor handled with CSS; small stagger for flair
  const heading = document.querySelector('.typing');
  const phrases = ['Systems Engineer','DevOps Learner','Self-hosted enthusiast','Bitcoin node operator'];
  let idx = 0, pos = 0, forward = true;
  function type(){
    const text = phrases[idx];
    heading.firstChild && (heading.firstChild.textContent = text.slice(0,pos));
    if(forward){ pos++; if(pos>text.length){ forward=false; setTimeout(type,900); return }} else { pos--; if(pos===0){ forward=true; idx=(idx+1)%phrases.length }}
    setTimeout(type, 80);
  }
  // start small delay
  setTimeout(type, 700);

  // IntersectionObserver for skill bars
  const fills = document.querySelectorAll('.skill-fill');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const t = Number(e.target.dataset.target)||0; e.target.style.width = t + '%';
          const parent = e.target.closest('[role="progressbar"]'); if(parent) parent.setAttribute('aria-valuenow', String(t));
          obs.unobserve(e.target);
        }
      })
    },{threshold:0.25});
    fills.forEach(f=>{f.style.width='0%'; io.observe(f)});
  } else { fills.forEach(f=>{f.style.width = (f.dataset.target||0) + '%'}); }

  // Theme toggle (simple)
  const themeBtn = document.getElementById('themeToggle');
  themeBtn && themeBtn.addEventListener('click', ()=>{
    const html = document.documentElement;
    const cur = html.getAttribute('data-bs-theme')||'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', next);
    themeBtn.setAttribute('aria-pressed', String(next==='light'));
  });

  // Fetch public GitHub repos for projects
  const grid = document.getElementById('projectsGrid');
  if(grid){
    fetch('https://api.github.com/users/devredakun/repos?per_page=6&sort=updated')
      .then(r=>r.json())
      .then(list=>{
        if(!Array.isArray(list)) return;
        list.forEach(repo=>{
          const col = document.createElement('div'); col.className='col-md-4';
          const card = document.createElement('div'); card.className='project-card';
          const title = document.createElement('div'); title.className='project-title'; title.textContent = repo.name;
          const desc = document.createElement('div'); desc.className='project-desc'; desc.textContent = repo.description || 'No description';
          const meta = document.createElement('div'); meta.className='small text-muted mt-2'; meta.textContent = `${repo.language||'—'} • ★ ${repo.stargazers_count}`;
          const link = document.createElement('a'); link.href = repo.html_url; link.target='_blank'; link.rel='noopener noreferrer'; link.className='stretched-link'; link.setAttribute('aria-label','Open '+repo.name+' on GitHub');
          card.appendChild(title); card.appendChild(desc); card.appendChild(meta); card.appendChild(link);
          col.appendChild(card); grid.appendChild(col);
        })
      }).catch(()=>{ /* ignore */ });
  }

  // Canvas background: lightweight moving dots
  const canvas = document.getElementById('bg');
  if(canvas && canvas.getContext){
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    function resize(){ w = canvas.width = canvas.clientWidth; h = canvas.height = canvas.clientHeight; initParticles(); }
    function rand(min,max){return Math.random()*(max-min)+min}
    function initParticles(){ particles = []; const count = Math.max(30, Math.floor(w*h/30000)); for(let i=0;i<count;i++){ particles.push({x:rand(0,w), y:rand(0,h), vx:rand(-0.2,0.2), vy:rand(-0.2,0.2), r:rand(0.6,1.6)}) }}
    function step(){ ctx.clearRect(0,0,w,h); ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for(let p of particles){ p.x += p.vx; p.y += p.vy; if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
      // connect
      ctx.strokeStyle = 'rgba(107,255,242,0.06)'; ctx.lineWidth = 1;
      for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const a=particles[i], b=particles[j];const dx=a.x-b.x, dy=a.y-b.y; const d=dx*dx+dy*dy; if(d<25000){ctx.globalAlpha = 1 - d/25000; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();}}
      ctx.globalAlpha = 1; requestAnimationFrame(step);
    }
    window.addEventListener('resize', resize); resize(); step();
  }
})();