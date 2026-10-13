
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-network';
  Object.assign(canvas.style, {
    position:'fixed', inset:'0', width:'100%', height:'100%',
    pointerEvents:'none', zIndex:'0', opacity:'0.55'
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let w,h,parts=[];
  function resize(){
    w=canvas.width=window.innerWidth;
    h=canvas.height=Math.max(window.innerHeight, document.body.scrollHeight);
    parts=Array.from({length:120},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4}));
  }
  resize(); window.addEventListener('resize',resize);

  function frame(){
    ctx.clearRect(0,0,w,h);
    for(const p of parts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
    }
    for(let i=0;i<parts.length;i++){
      for(let j=i+1;j<parts.length;j++){
        const a=parts[i], b=parts[j];
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<140){
          ctx.strokeStyle=`rgba(126,183,255,${(1-d/140)*0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();

  document.querySelectorAll('.card').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`perspective(900px) rotateX(${-(e.clientY-r.top-r.height/2)/25}deg) rotateY(${(e.clientX-r.left-r.width/2)/25}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('reveal-in');
        obs.unobserve(e.target);
      }
    });
  },{threshold:.12});
  document.querySelectorAll('.card,.intro,.hero-copy').forEach(el=>obs.observe(el));

  // Footer social icons: hidden only once JS is running, then popped in one by one
  document.querySelectorAll('.footer-social').forEach(el=>{
    el.classList.add('social-ready');
    obs.observe(el);
  });
});
