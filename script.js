const header=document.querySelector('.site-header');
const backToTop=document.querySelector('.back-to-top');
const menuToggle=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-nav');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const splitHeading=document.querySelector('[data-split]');
if(splitHeading){const words=splitHeading.textContent.trim().split(/\s+/);splitHeading.innerHTML=words.map((word,index)=>`<span class="word" style="--word-index:${index}">${word}</span>`).join(' ')}
const updateChrome=()=>{header.classList.toggle('scrolled',window.scrollY>60);backToTop.classList.toggle('visible',window.scrollY>400)};
updateChrome();
window.addEventListener('scroll',updateChrome,{passive:true});
menuToggle.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');menuToggle.innerHTML=open?'<i class="bi bi-x-lg"></i>':'<i class="bi bi-list"></i>';document.body.classList.toggle('menu-open',open)});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobileMenu.classList.remove('open');document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.innerHTML='<i class="bi bi-list"></i>'}));
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
const revealSections=document.querySelectorAll('.reveal-y,.reveal-clip,.reveal-x,.reveal-scale');
revealSections.forEach(section=>section.querySelectorAll('.reveal-child').forEach((child,index)=>child.style.transitionDelay=`${index*80}ms`));
if(reduced){revealSections.forEach(section=>section.classList.add('is-visible'))}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);if(entry.target.classList.contains('stat-band'))startCounters(entry.target)}})},{threshold:.2});revealSections.forEach(section=>observer.observe(section))}
let countersStarted=false;
function startCounters(root){if(countersStarted||reduced)return;countersStarted=true;root.querySelectorAll('[data-count]').forEach(node=>{const target=Number(node.dataset.count);const suffix=node.dataset.suffix||'';const start=performance.now();const duration=1200;const tick=now=>{const progress=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-progress,3);node.textContent=`${Math.floor(target*eased).toLocaleString()}${suffix}`;if(progress<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)})}
if(reduced){document.querySelectorAll('[data-count]').forEach(node=>node.textContent=`${Number(node.dataset.count).toLocaleString()}${node.dataset.suffix||''}`)}
const canFollow=window.matchMedia('(hover: hover) and (pointer: fine)').matches&&!reduced;
if(canFollow){const follower=document.querySelector('.cursor-follower');let targetX=innerWidth/2,targetY=innerHeight/2,currentX=targetX,currentY=targetY,last=performance.now();window.addEventListener('mousemove',event=>{targetX=event.clientX;targetY=event.clientY},{passive:true});const animate=now=>{const dt=now-last;last=now;const factor=1-Math.exp(-dt/70);currentX+=(targetX-currentX)*factor;currentY+=(targetY-currentY)*factor;follower.style.transform=`translate(${currentX}px,${currentY}px) translate(-50%,-50%)`;requestAnimationFrame(animate)};requestAnimationFrame(animate);document.querySelectorAll('a,button,.deal-card,.hover-target').forEach(target=>{target.addEventListener('mouseenter',()=>follower.classList.add('grow'));target.addEventListener('mouseleave',()=>follower.classList.remove('grow'))})}

document.addEventListener('DOMContentLoaded', function(){
  const NAMESPACE = "Daraz";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  if(!launcher || !panel || !form || !input || !messages){ return; }

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  if(closeBtn){ closeBtn.addEventListener('click', function(){ setOpen(false); }); }

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
});
