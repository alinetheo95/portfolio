// ─── Media loaders ───
function loadImg(input, containerId) {
  const file = input.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const el = document.getElementById(containerId);
  const existing = el.querySelector('img');
  if (existing) existing.remove();
  const img = document.createElement('img');
  img.src = url;
  el.querySelector('span').style.display = 'none';
  el.appendChild(img);
}

function loadMedia(input, containerId) {
  const file = input.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const el = document.getElementById(containerId);
  el.querySelector('span').style.display = 'none';
  if (file.type.startsWith('video/')) {
    const v = document.createElement('video');
    v.src = url; v.autoplay = true; v.loop = true; v.muted = true;
    el.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = url;
    el.appendChild(img);
  }
}

function loadVideo(input, containerId) {
  const file = input.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const el = document.getElementById(containerId);
  el.querySelector('.video-label').style.display = 'none';
  const v = document.createElement('video');
  v.src = url; v.controls = true; v.style.position = 'absolute';
  v.style.inset = '0'; v.style.width = '100%'; v.style.height = '100%';
  v.style.objectFit = 'cover';
  el.appendChild(v);
}

// Clear placeholder text on first edit
document.querySelectorAll('[contenteditable]').forEach(el => {
  el.addEventListener('focus', function() {
    if (this.querySelector('.placeholder-text')) {
      this.innerHTML = '';
    }
  });
});