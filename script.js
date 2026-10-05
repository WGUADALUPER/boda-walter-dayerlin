const weddingDate = new Date('2027-01-09T14:00:00-05:00');
function tick(){const now=new Date();let d=Math.max(0,weddingDate-now);const days=Math.floor(d/86400000);d%=86400000;const hours=Math.floor(d/3600000);d%=3600000;const minutes=Math.floor(d/60000);const seconds=Math.floor((d%60000)/1000);[['days',days],['hours',hours],['minutes',minutes],['seconds',seconds]].forEach(([id,v])=>document.getElementById(id).textContent=String(v).padStart(2,'0'));}
tick();setInterval(tick,1000);

const menuBtn=document.querySelector('.menu-btn'),menu=document.querySelector('.menu');menuBtn.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open)});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Datos DEMO. En la siguiente fase se sustituyen por la base de datos real.
const invites={
  'WD-DEMO1':{name:'Invitación individual',capacity:1},
  'WD-DEMO2':{name:'Invitación para pareja',capacity:2},
  'WD-FAMILIA':{name:'Familia de demostración',capacity:4}
};
const code=document.getElementById('inviteCode'),lookup=document.getElementById('lookupBtn'),panel=document.getElementById('invitePanel'),nameEl=document.getElementById('inviteName'),capEl=document.getElementById('inviteCapacity'),count=document.getElementById('guestCount'),attendance=document.getElementById('attendance'),countWrap=document.getElementById('guestCountWrap'),status=document.getElementById('formStatus');let activeInvite=null;
lookup.addEventListener('click',()=>{const key=code.value.trim().toUpperCase();activeInvite=invites[key];status.textContent='';if(!activeInvite){panel.hidden=true;status.textContent='Código no encontrado. Para probar usa WD-DEMO1, WD-DEMO2 o WD-FAMILIA.';return}nameEl.textContent=activeInvite.name;capEl.textContent=`Esta invitación tiene ${activeInvite.capacity} ${activeInvite.capacity===1?'lugar reservado':'lugares reservados'}.`;count.innerHTML='';for(let i=1;i<=activeInvite.capacity;i++){count.add(new Option(i,i))}panel.hidden=false;});
attendance.addEventListener('change',()=>countWrap.hidden=attendance.value==='no');
document.getElementById('rsvpForm').addEventListener('submit',e=>{e.preventDefault();if(!activeInvite)return;const payload={code:code.value.trim().toUpperCase(),attendance:attendance.value,guests:attendance.value==='yes'?Number(count.value):0,message:document.getElementById('message').value.trim(),savedAt:new Date().toISOString()};localStorage.setItem('wd-rsvp-'+payload.code,JSON.stringify(payload));status.textContent='✓ Confirmación guardada en esta demostración. En la siguiente fase quedará registrada en la base de datos.';});

// Si la URL incluye ?i=CODIGO, precarga el código de invitación.
const urlCode=new URLSearchParams(location.search).get('i');if(urlCode){code.value=urlCode.toUpperCase();}
