/* ============================================================
   DEPI INFOGRAPH GENERATOR — Canvas Renderer & UI Logic
   ============================================================ */

'use strict';

// ── Constants ────────────────────────────────────────────────
const TRACKS = [
  { id: 'ai-ds',      icon: '🧠', name: 'AI & Data Science' },
  { id: 'data-eng',   icon: '🗄️', name: 'Data Engineering' },
  { id: 'fullstack-net', icon: '⚙️', name: 'Full Stack .NET' },
  { id: 'fullstack-py',  icon: '🐍', name: 'Full Stack Python' },
  { id: 'frontend',   icon: '🎨', name: 'Front-End Development' },
  { id: 'devops',     icon: '🔁', name: 'DevOps' },
  { id: 'cloud',      icon: '☁️', name: 'Cloud Computing' },
  { id: 'cyber',      icon: '🔐', name: 'Cybersecurity' },
  { id: 'embedded',   icon: '🔌', name: 'Embedded Systems' },
  { id: 'mobile',     icon: '📱', name: 'Mobile Development' },
];

const ALL_TECH = [
  'Python','JavaScript','TypeScript','Java','C#','C++','Kotlin','Swift','Go','Rust',
  'React','Angular','Vue','Next.js','Nuxt','Svelte','Flutter','React Native',
  'Node.js','FastAPI','Flask','Django','ASP.NET','Spring Boot','Express',
  'PostgreSQL','MySQL','MongoDB','Redis','SQLite','Cassandra','Firebase',
  'Docker','Kubernetes','GitHub Actions','Jenkins','Terraform','Ansible',
  'AWS','Azure','GCP','Vercel','Netlify',
  'LangChain','LangGraph','CrewAI','AutoGen','OpenAI','Gemini','Claude','Groq','Llama',
  'PyTorch','TensorFlow','scikit-learn','Pandas','NumPy','Plotly','Streamlit',
  'FAISS','Pinecone','Weaviate','Chroma',
  'GraphQL','REST API','gRPC','WebSocket',
];

const PHASES = [
  'Planning','Research','Design','Development','Testing','Deployment','Maintenance',
  'Analysis','Implementation','Integration','Documentation','Review',
];

const COLOR_THEMES = {
  blue:   { bg1:'#07090f', bg2:'#0c1422', accent:'#2563eb', accent2:'#6d28d9', cyan:'#00d4ff', text:'#e8eeff', muted:'#8899c0', card:'rgba(14,20,45,0.9)', cardBorder:'rgba(100,140,255,0.25)' },
  teal:   { bg1:'#060e0d', bg2:'#081918', accent:'#0d9488', accent2:'#0891b2', cyan:'#2dd4bf', text:'#e8fff8', muted:'#80b0a8', card:'rgba(8,25,24,0.9)', cardBorder:'rgba(45,212,191,0.25)' },
  violet: { bg1:'#090710', bg2:'#100a20', accent:'#7c3aed', accent2:'#db2777', cyan:'#c084fc', text:'#f0eeff', muted:'#a090c0', card:'rgba(16,10,32,0.9)', cardBorder:'rgba(192,132,252,0.25)' },
  orange: { bg1:'#0f0906', bg2:'#1c1008', accent:'#ea580c', accent2:'#d97706', cyan:'#fb923c', text:'#fff3ed', muted:'#c0906a', card:'rgba(28,16,8,0.9)', cardBorder:'rgba(251,146,60,0.25)' },
};

// ── State ────────────────────────────────────────────────────
let state = {
  track: null,
  theme: 'blue',
  form: {},
  selectedTech: new Set(),
  selectedPhases: new Set(['Planning','Development','Testing','Deployment']),
};

// ── Particles ────────────────────────────────────────────────
function initParticles() {
  const container = document.querySelector('.particles');
  const colors = ['rgba(37,99,235,0.5)','rgba(124,58,237,0.4)','rgba(0,212,255,0.4)','rgba(249,115,22,0.3)'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*20+12}s;
      animation-delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
}

// ── Track Grid ───────────────────────────────────────────────
function renderTrackGrid() {
  const grid = document.getElementById('track-grid');
  grid.innerHTML = TRACKS.map(t => `
    <div class="track-card ${state.track===t.id?'selected':''}" 
         data-id="${t.id}" 
         onclick="selectTrack('${t.id}')"
         id="track-${t.id}">
      <div class="t-icon">${t.icon}</div>
      <div class="t-name">${t.name}</div>
    </div>
  `).join('');
}

function selectTrack(id) {
  state.track = id;
  document.querySelectorAll('.track-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('track-'+id)?.classList.add('selected');
  markStep(1, 'done');
  markStep(2, 'active');
}

// ── Tech Chips ───────────────────────────────────────────────
function renderTechChips(filter = '') {
  const wrap = document.getElementById('tech-chips');
  const filtered = filter
    ? ALL_TECH.filter(t => t.toLowerCase().includes(filter.toLowerCase()))
    : ALL_TECH;
  wrap.innerHTML = filtered.map(t => `
    <div class="chip tech-chip ${state.selectedTech.has(t)?'selected':''}" 
         onclick="toggleTech('${t}')">${t}</div>
  `).join('');
}

function toggleTech(tech) {
  if (state.selectedTech.has(tech)) state.selectedTech.delete(tech);
  else state.selectedTech.add(tech);
  renderTechChips(document.getElementById('tech-search')?.value || '');
  scheduleRender();
}

// ── Phase Chips ──────────────────────────────────────────────
function renderPhaseChips() {
  const wrap = document.getElementById('phase-chips');
  wrap.innerHTML = PHASES.map(p => `
    <div class="chip phase-chip ${state.selectedPhases.has(p)?'selected':''}" 
         onclick="togglePhase('${p}')">${p}</div>
  `).join('');
}

function togglePhase(phase) {
  if (state.selectedPhases.has(phase)) state.selectedPhases.delete(phase);
  else state.selectedPhases.add(phase);
  renderPhaseChips();
  scheduleRender();
}

// ── Steps progress ───────────────────────────────────────────
function markStep(num, state) {
  const item = document.querySelector(`.step-item[data-step="${num}"]`);
  if (!item) return;
  item.className = `step-item ${state}`;
}

// ── Document Parser ──────────────────────────────────────────
function parseDocument(text) {
  if (!text || text.length < 50) return null;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = text.toLowerCase();

  const extract = (patterns, maxWords = 12) => {
    for (const pat of patterns) {
      const rx = new RegExp(pat + '[:\\-\\s]+([^\\n]{4,120})', 'i');
      const m = text.match(rx);
      if (m) {
        return m[1].trim().replace(/\*+/g,'').replace(/#+/g,'').substring(0,200);
      }
    }
    return '';
  };

  // Title: look for heading patterns or first meaningful line
  let title = extract(['project title','project name','title','#\\s+']);
  if (!title) title = lines.find(l => l.length > 8 && l.length < 80 && !l.includes(':')) || '';

  const summary = extract(['abstract','summary','overview','introduction','project overview','about']);
  const problem = extract(['problem','challenge','issue','pain point','business problem','problem statement']);
  const solution = extract(['solution','proposed solution','approach','methodology','our solution','system solution']);
  const users = extract(['target user','user','audience','stakeholder','client','customer','end user']);
  const deployment = extract(['deploy','hosting','infrastructure','cloud','environment','server','production']);

  // Features - look for bullet lists after "features" keyword
  let features = [];
  const featIdx = lines.findIndex(l => /feature|function|capabilit|module/i.test(l));
  if (featIdx >= 0) {
    for (let i = featIdx+1; i < Math.min(featIdx+10, lines.length); i++) {
      const l = lines[i].replace(/^[-•*✓✔\d\.]\s*/,'').trim();
      if (l.length > 5 && l.length < 100 && !/^#/.test(l)) features.push(l);
      if (features.length >= 5) break;
    }
  }

  // Architecture
  let arch = extract(['architecture','system design','system architecture','technical architecture','design']);

  // AI components
  const aiKeywords = ['llm','gpt','gemini','claude','langchain','langgraph','rag','embedding','model','neural','deep learning','machine learning','ai','nlp','transformer','bert','openai'];
  const aiFound = aiKeywords.filter(k => fullText.includes(k));
  let aiComponents = '';
  if (aiFound.length > 0) {
    aiComponents = extract(['ai component','ai module','ai model','model','llm','intelligence','ml pipeline']);
    if (!aiComponents) aiComponents = 'AI/ML Pipeline, ' + aiFound.slice(0,3).map(k=>k.toUpperCase()).join(', ');
  }

  // Tech detection
  const detectedTech = new Set(state.selectedTech);
  ALL_TECH.forEach(t => {
    if (fullText.includes(t.toLowerCase())) detectedTech.add(t);
  });

  // Deliverables
  let deliverables = [];
  const delPats = [/working\s+system/i,/dashboard/i,/(?:rest\s+)?api/i,/documentation/i,/source\s+code/i,/web\s+application/i,/mobile\s+app/i,/model/i,/report/i,/deployment/i];
  delPats.forEach(rx => { if (rx.test(text)) deliverables.push(rx.source.replace(/\\s\+/g,' ').replace(/[()\\?i]/g,'').trim()); });

  // Phases - detect from timeline/phases section
  const phaseKeywords = PHASES.map(p=>p.toLowerCase());
  const detectedPhases = new Set(state.selectedPhases);
  phaseKeywords.forEach(p => { if (fullText.includes(p)) detectedPhases.add(p.charAt(0).toUpperCase()+p.slice(1)); });

  return {
    title: title.substring(0,80),
    summary: summary.substring(0,200),
    problem: problem.substring(0,200),
    solution: solution.substring(0,200),
    users: users.substring(0,150),
    features: features.slice(0,5),
    arch: arch.substring(0,200),
    aiComponents,
    detectedTech,
    deliverables,
    detectedPhases,
    deployment: deployment.substring(0,150),
  };
}

function applyParsed(parsed) {
  if (!parsed) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };

  set('f-title', parsed.title);
  set('f-summary', parsed.summary);
  set('f-problem', parsed.problem);
  set('f-solution', parsed.solution);
  set('f-users', parsed.users);
  set('f-features', parsed.features.join('\n'));
  set('f-arch', parsed.arch);
  set('f-ai', parsed.aiComponents);
  set('f-delivery', parsed.deliverables.join(', '));
  set('f-deploy', parsed.deployment);

  if (parsed.detectedTech.size > 0) {
    state.selectedTech = parsed.detectedTech;
    renderTechChips();
  }
  if (parsed.detectedPhases.size > 0) {
    state.selectedPhases = parsed.detectedPhases;
    renderPhaseChips();
  }
}

// ── Parse action ─────────────────────────────────────────────
function parseAndFill() {
  const text = document.getElementById('f-doc-text').value.trim();
  if (!text) {
    showParseStatus('Please paste your project document text first.', 'err');
    return;
  }
  const result = parseDocument(text);
  if (result) {
    applyParsed(result);
    showParseStatus(`✓ Successfully extracted content — review & edit the fields below then click Generate.`, 'ok');
    markStep(2,'done');
    markStep(3,'active');
    document.getElementById('fields-section').scrollIntoView({ behavior:'smooth', block:'start' });
  } else {
    showParseStatus('Document is too short or unrecognized — please fill in the fields manually.', 'err');
  }
}

function showParseStatus(msg, type) {
  const el = document.getElementById('parse-status');
  el.textContent = msg;
  el.className = `parse-status show ${type}`;
  if (type === 'ok') setTimeout(()=> el.classList.remove('show'), 8000);
}

// ── File upload ──────────────────────────────────────────────
function initUpload() {
  const zone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) readFile(file);
  });
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('f-doc-text').value = e.target.result;
    showParseStatus(`✓ File "${file.name}" loaded (${(file.size/1024).toFixed(1)} KB). Click "Auto-Extract" to parse.`, 'ok');
  };
  reader.readAsText(file);
}

// ── Form listeners ───────────────────────────────────────────
function collectForm() {
  const g = id => (document.getElementById(id)||{}).value || '';
  return {
    title:    g('f-title'),
    summary:  g('f-summary'),
    problem:  g('f-problem'),
    solution: g('f-solution'),
    users:    g('f-users'),
    features: g('f-features').split('\n').map(l=>l.replace(/^[-•*]\s*/,'').trim()).filter(Boolean),
    arch:     g('f-arch'),
    ai:       g('f-ai'),
    delivery: g('f-delivery'),
    deploy:   g('f-deploy'),
    future:   g('f-future'),
    teamSize: g('f-team'),
    duration: g('f-duration'),
  };
}

function initFormListeners() {
  const ids = ['f-title','f-summary','f-problem','f-solution','f-users','f-features','f-arch','f-ai','f-delivery','f-deploy','f-future','f-team','f-duration'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', scheduleRender);
  });
}

// ── Render scheduling ─────────────────────────────────────────
let renderTimer = null;
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderCanvas, 120);
}

// ── Canvas renderer ───────────────────────────────────────────
function getTheme() { return COLOR_THEMES[state.theme] || COLOR_THEMES.blue; }
function getTrackName() {
  const t = TRACKS.find(t => t.id === state.track);
  return t ? t.name : 'DEPI Track';
}
function getTrackIcon() {
  const t = TRACKS.find(t => t.id === state.track);
  return t ? t.icon : '🎓';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines) { if (words.indexOf(word) < words.length-1) ctx.fillText(line+'…', x, y); return y+lineHeight; }
    } else { line = test; }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

function drawGlow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0, color);
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
}

function renderCanvas() {
  const canvas = document.getElementById('infograph-canvas');
  if (!canvas) return;
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const T = getTheme();
  const form = collectForm();
  const trackName = getTrackName();
  const trackIcon = getTrackIcon();

  // ── Background ──────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0,0,W,H);
  bgGrad.addColorStop(0, T.bg1);
  bgGrad.addColorStop(0.5, T.bg2);
  bgGrad.addColorStop(1, T.bg1);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0,0,W,H);

  // Ambient glows
  drawGlow(ctx, W*0.1, H*0.2, 250, `${T.accent}22`);
  drawGlow(ctx, W*0.85, H*0.75, 220, `${T.accent2}20`);
  drawGlow(ctx, W*0.5, H*0.1, 180, `${T.cyan}15`);

  // ── Subtle grid pattern ─────────────────────────────────────
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();

  // ── Header bar ──────────────────────────────────────────────
  const hH = H * 0.13;
  const hGrad = ctx.createLinearGradient(0,0,W,hH);
  hGrad.addColorStop(0, `${T.accent}33`);
  hGrad.addColorStop(0.5, `${T.accent2}22`);
  hGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, W, hH);

  // Thin top accent line
  const lineGrad = ctx.createLinearGradient(0,0,W,0);
  lineGrad.addColorStop(0,'rgba(0,0,0,0)');
  lineGrad.addColorStop(0.3, T.cyan);
  lineGrad.addColorStop(0.7, T.accent);
  lineGrad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0,0,W,3);

  // ── DEPI Wordmark (left) ────────────────────────────────────
  const logoX = 36, logoY = 20;
  
  // DEPI pill background
  roundRect(ctx, logoX-10, logoY-2, 82, 36, 8);
  ctx.fillStyle = `${T.accent}22`;
  ctx.fill();
  ctx.strokeStyle = `${T.cyan}55`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 18px Outfit, sans-serif';
  ctx.fillStyle = T.cyan;
  ctx.fillText('DEPI', logoX+2, logoY+22);

  ctx.font = '600 8px Inter, sans-serif';
  ctx.fillStyle = T.muted;
  ctx.fillText('Digital Egypt Pioneers Initiative', logoX-10, logoY+44);

  // Track pill
  const tPillX = logoX-10, tPillY = logoY+52;
  roundRect(ctx, tPillX, tPillY, Math.min(trackName.length*7.5+28, 210), 22, 6);
  ctx.fillStyle = `${T.accent2}22`;
  ctx.fill();
  ctx.strokeStyle = `${T.accent2}44`;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.font = `600 9px Inter, sans-serif`;
  ctx.fillStyle = '#c084fc';
  ctx.fillText(`${trackIcon} ${trackName}`, tPillX+8, tPillY+15);

  // ── Project Title (center) ───────────────────────────────────
  const titleText = form.title || 'Your Project Title';
  const centerX = W / 2;
  const titleY = hH * 0.42;

  ctx.font = `800 ${Math.min(W/26, 32)}px Outfit, sans-serif`;
  ctx.textAlign = 'center';
  // Gradient text simulation via shadow
  ctx.shadowColor = T.cyan;
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  // Truncate title
  const maxTitleW = W * 0.55;
  let titleStr = titleText;
  while (ctx.measureText(titleStr).width > maxTitleW && titleStr.length > 10) titleStr = titleStr.slice(0,-1);
  if (titleStr !== titleText) titleStr += '…';
  ctx.fillText(titleStr, centerX, titleY);
  ctx.shadowBlur = 0;

  // Summary line
  if (form.summary) {
    ctx.font = `400 ${Math.min(W/70, 13)}px Inter, sans-serif`;
    ctx.fillStyle = T.muted;
    let sumStr = form.summary;
    if (ctx.measureText(sumStr).width > W*0.5) sumStr = sumStr.substring(0,80)+'…';
    ctx.fillText(sumStr, centerX, titleY + 26);
  }

  ctx.textAlign = 'left';

  // ── Top right: Team / Duration ───────────────────────────────
  if (form.teamSize || form.duration) {
    const rx = W - 180;
    const ry = 22;
    roundRect(ctx, rx, ry, 160, 60, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();
    ctx.strokeStyle = T.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '600 9px Inter, sans-serif';
    ctx.fillStyle = T.muted;
    if (form.teamSize) { ctx.fillText('👥 Team: ' + form.teamSize, rx+12, ry+20); }
    if (form.duration) { ctx.fillText('⏱ Duration: ' + form.duration, rx+12, ry+40); }
  }

  // ── Section layout ───────────────────────────────────────────
  const sections = [];
  if (form.problem)  sections.push({ title:'Problem',  icon:'⚠️',  color:T.accent,  text: form.problem });
  if (form.solution) sections.push({ title:'Solution', icon:'💡',  color:T.cyan,    text: form.solution });
  if (form.users)    sections.push({ title:'Users',    icon:'👤',  color:'#34d399',  text: form.users });
  if (form.deploy)   sections.push({ title:'Deploy',   icon:'🚀',  color:T.accent2,  text: form.deploy });

  const features = form.features.slice(0,5);
  const phases   = [...state.selectedPhases].slice(0,7);
  const techs    = [...state.selectedTech].slice(0,16);
  const deliverables = form.delivery ? form.delivery.split(',').map(s=>s.trim()).filter(Boolean).slice(0,6) : [];

  // ── Row 1: Info cards (problem/solution/users/deploy) ────────
  const r1Y = hH + 12;
  const cardH = H * 0.16;
  const cardGap = 12;
  const r1Count = Math.min(sections.length, 4);
  const r1W = (W - 24 - cardGap*(r1Count-1)) / r1Count;

  sections.slice(0,4).forEach((sec, i) => {
    const cx = 12 + i*(r1W+cardGap);
    
    roundRect(ctx, cx, r1Y, r1W, cardH, 10);
    const cg = ctx.createLinearGradient(cx,r1Y,cx,r1Y+cardH);
    cg.addColorStop(0, `${sec.color}18`);
    cg.addColorStop(1,'rgba(0,0,0,0.1)');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = `${sec.color}40`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left accent bar
    roundRect(ctx, cx, r1Y, 3, cardH, 2);
    ctx.fillStyle = sec.color;
    ctx.fill();

    // Icon + title
    ctx.font = '14px sans-serif';
    ctx.fillText(sec.icon, cx+12, r1Y+22);
    ctx.font = `700 ${Math.min(r1W/10,11)}px Outfit, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText(sec.title.toUpperCase(), cx+30, r1Y+22);

    // Separator
    ctx.strokeStyle = `${sec.color}30`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx+8, r1Y+30);
    ctx.lineTo(cx+r1W-8, r1Y+30);
    ctx.stroke();

    // Body text
    ctx.font = `400 ${Math.min(r1W/13,10)}px Inter, sans-serif`;
    ctx.fillStyle = T.muted;
    wrapText(ctx, sec.text, cx+10, r1Y+44, r1W-20, 14, 3);
  });

  // ── Row 2: Features | Architecture | AI ─────────────────────
  const r2Y = r1Y + cardH + 10;
  const r2H = H * 0.16;

  // Features block (left)
  const featW = W * 0.26;
  if (features.length > 0) {
    roundRect(ctx, 12, r2Y, featW, r2H, 10);
    ctx.fillStyle = 'rgba(0,212,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = `${T.cyan}35`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `700 10px Outfit, sans-serif`;
    ctx.fillStyle = T.cyan;
    ctx.fillText('✦ CORE FEATURES', 20, r2Y+18);

    features.forEach((f, i) => {
      const fy = r2Y + 34 + i*20;
      if (fy > r2Y+r2H-8) return;
      // Dot
      ctx.beginPath();
      ctx.arc(22, fy-3, 3, 0, Math.PI*2);
      ctx.fillStyle = T.cyan;
      ctx.fill();
      ctx.font = `400 9px Inter, sans-serif`;
      ctx.fillStyle = T.text;
      let fStr = f;
      while (ctx.measureText(fStr).width > featW-36) fStr = fStr.slice(0,-1);
      if (fStr !== f) fStr += '…';
      ctx.fillText(fStr, 30, fy);
    });
  }

  // Architecture block (center)
  const archX = 12 + featW + 10;
  const archW = W * 0.44;
  if (form.arch || form.ai) {
    roundRect(ctx, archX, r2Y, archW, r2H, 10);
    ctx.fillStyle = `${T.accent2}08`;
    ctx.fill();
    ctx.strokeStyle = `${T.accent2}35`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `700 10px Outfit, sans-serif`;
    ctx.fillStyle = '#c084fc';
    ctx.fillText('⚡ SYSTEM ARCHITECTURE', archX+12, r2Y+18);

    // Architecture flow diagram (compact)
    const archLayers = ['User Interface','Backend API','AI / ML Core','Data Layer'].filter((_,i)=>i<4);
    const layerW = (archW-24)/archLayers.length;
    const layerY = r2Y+32;
    const layerH = r2H-44;

    archLayers.forEach((layer,i) => {
      const lx = archX+12 + i*(layerW+4);
      const lh = layerH - (i%2)*10; // staggered
      const ly = layerY + (i%2)*5;
      
      roundRect(ctx, lx, ly, layerW-4, lh, 7);
      const lg2 = ctx.createLinearGradient(lx,ly,lx,ly+lh);
      lg2.addColorStop(0, `${T.accent2}28`);
      lg2.addColorStop(1, `${T.accent}15`);
      ctx.fillStyle = lg2;
      ctx.fill();
      ctx.strokeStyle = `${T.accent2}50`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.font = `600 8.5px Inter, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(layer, lx + (layerW-4)/2, ly + lh/2 + 3);
      ctx.textAlign = 'left';

      // Arrow
      if (i < archLayers.length-1) {
        const ax = lx + layerW - 4;
        const ay = ly + lh/2;
        ctx.fillStyle = `${T.accent}80`;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('→', ax+4, ay+4);
        ctx.textAlign = 'left';
      }
    });

    if (form.ai) {
      ctx.font = `400 8.5px Inter, sans-serif`;
      ctx.fillStyle = '#c084fc';
      let aiStr = '🤖 ' + form.ai;
      if (ctx.measureText(aiStr).width > archW-20) aiStr = aiStr.substring(0, 45)+'…';
      ctx.fillText(aiStr, archX+12, r2Y+r2H-10);
    }
  }

  // Tech stack block (right)
  const techX = archX + archW + 10;
  const techW = W - techX - 12;
  if (techs.length > 0 || features.length === 0) {
    roundRect(ctx, techX, r2Y, techW, r2H, 10);
    ctx.fillStyle = `${T.accent}06`;
    ctx.fill();
    ctx.strokeStyle = `${T.accent}35`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `700 10px Outfit, sans-serif`;
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('⚙️ TECH STACK', techX+12, r2Y+18);

    // Tech badges
    let bx = techX+10, by = r2Y+32;
    const bPad = 8, bGap = 5;
    ctx.font = `600 8px Inter, sans-serif`;
    techs.forEach((t) => {
      const bw = ctx.measureText(t).width + bPad*2;
      if (bx + bw > techX+techW-8) { bx = techX+10; by += 18; }
      if (by > r2Y+r2H-10) return;
      roundRect(ctx, bx, by-10, bw, 14, 4);
      ctx.fillStyle = `${T.accent}22`;
      ctx.fill();
      ctx.strokeStyle = `${T.accent}44`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#93c5fd';
      ctx.fillText(t, bx+bPad, by);
      bx += bw+bGap;
    });
  }

  // ── Row 3: Timeline | Deliverables ──────────────────────────
  const r3Y = r2Y + r2H + 10;
  const r3H = H - r3Y - 30;

  // Timeline (left half)
  const tlW = W * 0.54;
  if (phases.length > 0) {
    roundRect(ctx, 12, r3Y, tlW, r3H, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();
    ctx.strokeStyle = T.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = `700 10px Outfit, sans-serif`;
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('📅 DEVELOPMENT ROADMAP', 20, r3Y+16);

    const phW = (tlW - 24) / phases.length;
    const nodeY = r3Y + r3H*0.55;
    const lineY = nodeY;

    // Timeline line
    const tlLineGrad = ctx.createLinearGradient(20, lineY, 12+tlW-12, lineY);
    tlLineGrad.addColorStop(0, T.accent2+'66');
    tlLineGrad.addColorStop(0.5, T.cyan+'88');
    tlLineGrad.addColorStop(1, T.accent+'66');
    ctx.strokeStyle = tlLineGrad;
    ctx.lineWidth = 2;
    ctx.setLineDash([4,3]);
    ctx.beginPath();
    ctx.moveTo(20, lineY);
    ctx.lineTo(12+tlW-12, lineY);
    ctx.stroke();
    ctx.setLineDash([]);

    phases.forEach((ph, i) => {
      const nx = 20 + phW*i + phW/2;
      const colors2 = [T.accent, T.cyan, T.accent2, '#22c55e', '#f97316', '#f43f5e', '#a78bfa'];
      const nc = colors2[i % colors2.length];

      // Node circle
      ctx.beginPath();
      ctx.arc(nx, nodeY, 7, 0, Math.PI*2);
      ctx.fillStyle = T.bg1;
      ctx.fill();
      ctx.strokeStyle = nc;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(nx, nodeY, 3, 0, Math.PI*2);
      ctx.fillStyle = nc;
      ctx.fill();

      // Phase label
      ctx.font = `600 8px Inter, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(ph, nx, nodeY+(i%2===0?-14:18));

      // Connector lines (alternating above/below)
      ctx.strokeStyle = nc+'55';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nx, nodeY+(i%2===0?-7:7));
      ctx.lineTo(nx, nodeY+(i%2===0?-20:24));
      ctx.stroke();

      ctx.textAlign = 'left';
    });
  }

  // Deliverables (right half)
  const delX = 12 + tlW + 10;
  const delW = W - delX - 12;
  {
    roundRect(ctx, delX, r3Y, delW, r3H, 10);
    const delGrad = ctx.createLinearGradient(delX, r3Y, delX, r3Y+r3H);
    delGrad.addColorStop(0, 'rgba(34,197,94,0.08)');
    delGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = delGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,197,94,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = `700 10px Outfit, sans-serif`;
    ctx.fillStyle = '#4ade80';
    ctx.fillText('✅ PROJECT DELIVERABLES', delX+12, r3Y+16);

    const delItems = deliverables.length > 0 ? deliverables : ['Working System','Documentation','Source Code'];
    const halfLen = Math.ceil(delItems.length/2);
    const col1 = delItems.slice(0, halfLen);
    const col2 = delItems.slice(halfLen);
    const colW = (delW-24)/2;

    ctx.font = `500 9px Inter, sans-serif`;
    col1.forEach((d,i) => {
      const dy = r3Y+32+i*18;
      if (dy > r3Y+r3H-8) return;
      ctx.fillStyle = '#4ade80';
      ctx.fillText('✔', delX+12, dy);
      ctx.fillStyle = T.text;
      let ds = d;
      while(ctx.measureText(ds).width > colW-22) ds=ds.slice(0,-1);
      ctx.fillText(ds, delX+24, dy);
    });
    col2.forEach((d,i) => {
      const dy = r3Y+32+i*18;
      if (dy > r3Y+r3H-8) return;
      ctx.fillStyle = '#4ade80';
      ctx.fillText('✔', delX+12+colW, dy);
      ctx.fillStyle = T.text;
      let ds = d;
      while(ctx.measureText(ds).width > colW-22) ds=ds.slice(0,-1);
      ctx.fillText(ds, delX+24+colW, dy);
    });

    // Future if any
    if (form.future) {
      ctx.font = `italic 8px Inter, sans-serif`;
      ctx.fillStyle = T.muted;
      ctx.fillText('🔮 Future: ' + form.future.substring(0,50) + (form.future.length>50?'…':''), delX+12, r3Y+r3H-12);
    }
  }

  // ── Footer bar ───────────────────────────────────────────────
  const fY = H-28;
  const fGrad = ctx.createLinearGradient(0,fY,W,fY);
  fGrad.addColorStop(0,'rgba(0,0,0,0)');
  fGrad.addColorStop(0.3,`${T.accent}18`);
  fGrad.addColorStop(0.7,`${T.accent2}18`);
  fGrad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = fGrad;
  ctx.fillRect(0, fY-1, W, 2);

  ctx.font = `400 8px Inter, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('Digital Egypt Pioneers Initiative (DEPI)  •  Graduation Project Infographic', W/2, fY+14);
  ctx.textAlign = 'left';
}

// ── Download as PNG ──────────────────────────────────────────
function downloadPNG() {
  renderCanvas();
  const canvas = document.getElementById('infograph-canvas');
  const link = document.createElement('a');
  const title = (document.getElementById('f-title')?.value || 'depi-infograph').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  link.download = `${title}-infograph.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

// ── Generate (show preview) ──────────────────────────────────
function generateInfograph() {
  if (!state.track) {
    alert('Please select your DEPI track first (Step 1).');
    document.getElementById('track-grid').scrollIntoView({ behavior:'smooth' });
    return;
  }
  const form = collectForm();
  if (!form.title) {
    alert('Please enter a project title.');
    document.getElementById('f-title').focus();
    return;
  }

  const preview = document.getElementById('preview-section');
  preview.classList.add('show');
  preview.scrollIntoView({ behavior:'smooth', block:'start' });
  markStep(3,'done');
  markStep(4,'active');
  renderCanvas();
}

// ── Theme toggle ─────────────────────────────────────────────
function setTheme(name) {
  state.theme = name;
  document.querySelectorAll('.theme-swatch').forEach(s => s.classList.toggle('active', s.dataset.theme===name));
  scheduleRender();
}

// ── Color picker swatch rendering ────────────────────────────
function renderThemeSwatches() {
  const container = document.getElementById('theme-swatches');
  const swatchColors = { blue:'#2563eb', teal:'#0d9488', violet:'#7c3aed', orange:'#ea580c' };
  container.innerHTML = Object.entries(swatchColors).map(([name,color]) => `
    <div class="theme-swatch ${state.theme===name?'active':''}" 
         data-theme="${name}" 
         style="background:${color}"
         data-tip="${name.charAt(0).toUpperCase()+name.slice(1)} theme"
         onclick="setTheme('${name}')"></div>
  `).join('');
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  renderTrackGrid();
  renderTechChips();
  renderPhaseChips();
  renderThemeSwatches();
  initUpload();
  initFormListeners();

  // Canvas high-DPI
  const canvas = document.getElementById('infograph-canvas');
  if (canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = 1920, h = 1080;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // Render empty state
    renderCanvas();
  }

  // Tech search
  const techSearch = document.getElementById('tech-search');
  if (techSearch) {
    techSearch.addEventListener('input', () => renderTechChips(techSearch.value));
  }
});
