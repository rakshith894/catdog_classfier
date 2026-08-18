/* ===================================================
   PAWSAI — JAVASCRIPT
   Handles: drag & drop, preview, predict API call,
            animated bars, history, particles, paws
   =================================================== */
// ── DOM REFS ──────────────────────────────────────────
const dropZone       = document.getElementById('dropZone');
const imageInput     = document.getElementById('imageInput');
const uploadIdle     = document.getElementById('uploadIdle');
const uploadPreview  = document.getElementById('uploadPreview');
const previewImage   = document.getElementById('previewImage');
const changeBtn      = document.getElementById('changeBtn');
const predictBtn     = document.getElementById('predictBtn');
const btnLoader      = document.getElementById('btnLoader');
const resultCard     = document.getElementById('resultCard');
const errorCard      = document.getElementById('errorCard');
const errorMsg       = document.getElementById('errorMsg');
const errorRetryBtn  = document.getElementById('errorRetryBtn');
const tryAgainBtn    = document.getElementById('tryAgainBtn');
const resultEmoji    = document.getElementById('resultEmoji');
const resultLabel    = document.getElementById('resultLabel');
const resultConf     = document.getElementById('resultConfidence');
const resultFun      = document.getElementById('resultFun');
const catBar         = document.getElementById('catBar');
const dogBar         = document.getElementById('dogBar');
const catPct         = document.getElementById('catPct');
const dogPct         = document.getElementById('dogPct');
const historyGrid    = document.getElementById('historyGrid');
const clearBtn       = document.getElementById('clearBtn');
let selectedFile = null;
// ── FUN MESSAGES ─────────────────────────────────────
const funMessages = {
  Cat: [
    "Purrfect prediction! That's definitely a feline. 😸",
    "Meow! Our AI is 100% sure this is a cat. 🐈",
    "Your cat looks like it's plotting world domination. 😹",
    "Confirmed: this cat owns whoever took this photo. 👑",
    "Feline fine! Our model spotted the cat immediately. 🐾",
  ],
  Dog: [
    "Woof! Good boy/girl! That's a dog for sure! 🐕",
    "Tail-waggingly obvious — that's a doggo! 🐶",
    "10/10 would pet. Our AI loves this dog! 🦴",
    "A very good boy/girl has been detected! 🎾",
    "Such wow, much dog. Our CNN is impressed! 🐩",
  ],
};
function getRandomFun(label) {
  const msgs = funMessages[label] || [];
  return msgs[Math.floor(Math.random() * msgs.length)] || '';
}
// ── BACKGROUND PARTICLES ─────────────────────────────
function createParticles() {
  const container = document.getElementById('bgParticles');
  const colors = ['#a855f7', '#6366f1', '#ff6ec7', '#6eb4ff', '#34d399'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}
// ── PAW PRINT FLOATS ─────────────────────────────────
function createPaws() {
  const container = document.getElementById('pawContainer');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'paw-float';
    p.textContent = '🐾';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      font-size: ${Math.random() * 1.5 + 0.8}rem;
    `;
    container.appendChild(p);
  }
}
// ── FILE HANDLING ─────────────────────────────────────
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showError('Please upload a valid image file (JPG, PNG, WEBP).');
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    uploadIdle.style.display = 'none';
    uploadPreview.style.display = 'block';
    predictBtn.disabled = false;
    // Hide cards when new file selected
    resultCard.style.display = 'none';
    errorCard.style.display = 'none';
  };
  reader.readAsDataURL(file);
}
// ── DRAG & DROP ───────────────────────────────────────
dropZone.addEventListener('click', () => {
  if (uploadPreview.style.display === 'none' || uploadIdle.style.display !== 'none') {
    imageInput.click();
  }
});
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  handleFile(file);
});
imageInput.addEventListener('change', () => {
  handleFile(imageInput.files[0]);
});
changeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  imageInput.click();
});
// ── RESET ─────────────────────────────────────────────
function resetUpload() {
  selectedFile = null;
  imageInput.value = '';
  previewImage.src = '';
  uploadPreview.style.display = 'none';
  uploadIdle.style.display = 'flex';
  predictBtn.disabled = true;
  resultCard.style.display = 'none';
  errorCard.style.display = 'none';
}
tryAgainBtn.addEventListener('click', resetUpload);
errorRetryBtn.addEventListener('click', resetUpload);
// ── PREDICTION ────────────────────────────────────────
predictBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  // Loading state
  predictBtn.disabled = true;
  predictBtn.querySelector('.btn-text').textContent = 'Analyzing...';
  predictBtn.querySelector('.btn-icon').style.display = 'none';
  btnLoader.style.display = 'block';
  resultCard.style.display = 'none';
  errorCard.style.display = 'none';
  const formData = new FormData();
  formData.append('image', selectedFile);
  try {
    const response = await fetch('/predict/', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Unknown error occurred.');
    }
    showResult(data);
    updateHistory(data.history);
  } catch (err) {
    showError(err.message);
  } finally {
    predictBtn.disabled = false;
    predictBtn.querySelector('.btn-text').textContent = 'Analyze Image';
    predictBtn.querySelector('.btn-icon').style.display = 'inline';
    btnLoader.style.display = 'none';
  }
});
// ── SHOW RESULT ───────────────────────────────────────
function showResult(data) {
  const { label, confidence, cat_prob, dog_prob, emoji } = data;
  resultEmoji.textContent = emoji;
  resultLabel.textContent = label;
  resultConf.textContent = `Confidence: ${confidence}%`;
  resultFun.textContent = getRandomFun(label);
  // Color theme
  resultCard.className = 'glass-card result-card';
  resultCard.classList.add(label === 'Cat' ? 'result-cat' : 'result-dog');
  // Show card
  resultCard.style.display = 'block';
  // Animate bars after a short delay
  setTimeout(() => {
    catBar.style.width = cat_prob + '%';
    dogBar.style.width = dog_prob + '%';
    catPct.textContent = cat_prob + '%';
    dogPct.textContent = dog_prob + '%';
  }, 300);
  // Scroll to result
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // Confetti burst
  spawnConfetti(label);
}
// ── SHOW ERROR ────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorCard.style.display = 'block';
  errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
// ── UPDATE HISTORY ────────────────────────────────────
function updateHistory(history) {
  if (!history || !history.length) return;
  // Remove empty state
  const empty = document.getElementById('historyEmpty');
  if (empty) empty.remove();
  // Rebuild grid
  historyGrid.innerHTML = '';
  history.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <img src="${item.img_src}" alt="${item.label}" class="history-img"/>
      <div class="history-overlay">
        <span class="history-emoji">${item.emoji}</span>
        <span class="history-label">${item.label}</span>
        <span class="history-conf">${item.confidence}%</span>
      </div>
    `;
    historyGrid.appendChild(div);
  });
}
// ── CLEAR HISTORY ─────────────────────────────────────
clearBtn.addEventListener('click', async () => {
  try {
    await fetch('/clear-history/', { method: 'POST' });
    historyGrid.innerHTML = `
      <div class="history-empty" id="historyEmpty">
        <span>📭</span>
        <p>No predictions yet. Upload an image to get started!</p>
      </div>
    `;
  } catch (e) { console.error('Clear failed:', e); }
});
// ── CONFETTI BURST ────────────────────────────────────
function spawnConfetti(label) {
  const colors = label === 'Cat'
    ? ['#ff6ec7', '#ff4da6', '#ffb3e1', '#fff']
    : ['#6eb4ff', '#4d9eff', '#b3d9ff', '#fff'];
  const emojis = label === 'Cat' ? ['🐱', '😸', '🐾', '✨'] : ['🐶', '🦴', '🐾', '✨'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      pointer-events: none;
      z-index: 9999;
      font-size: ${Math.random() * 1.2 + 0.8}rem;
      transform: translate(-50%, -50%);
      animation: confettiFly 1.2s ease-out forwards;
      --tx: ${(Math.random() - 0.5) * 400}px;
      --ty: ${(Math.random() - 0.5) * 400}px;
      --rot: ${Math.random() * 720}deg;
    `;
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
}
// Inject confetti keyframe
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
  @keyframes confettiFly {
    0%   { transform: translate(-50%,-50%) scale(0) rotate(0deg); opacity: 1; }
    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(var(--rot)); opacity: 0; }
  }
`;
document.head.appendChild(confettiStyle);
// ── CSRF TOKEN ────────────────────────────────────────
// Django CSRF for POST requests (exempt on predict but needed for clear-history)
function getCookie(name) {
  let v = null;
  if (document.cookie && document.cookie !== '') {
    document.cookie.split(';').forEach(c => {
      c = c.trim();
      if (c.startsWith(name + '=')) v = decodeURIComponent(c.slice(name.length + 1));
    });
  }
  return v;
}
const csrfToken = getCookie('csrftoken');
const originalFetch = window.fetch;
window.fetch = (url, options = {}) => {
  if (options.method === 'POST') {
    options.headers = { ...(options.headers || {}), 'X-CSRFToken': csrfToken };
  }
  return originalFetch(url, options);
};
// ── INIT ──────────────────────────────────────────────
createParticles();
createPaws();