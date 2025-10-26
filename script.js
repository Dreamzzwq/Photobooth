const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('video');
const photoInput = document.getElementById('photoInput');
const captureBtn = document.getElementById('captureBtn');
const addFrameBtn = document.getElementById('addFrameBtn');
const frameInput = document.getElementById('frameInput');
const frameSelect = document.getElementById('frameSelect');
const downloadBtn = document.getElementById('downloadBtn');
const qrContainer = document.getElementById('qrContainer');

let photos = [];
let currentFrame = null;

// Load default frame
const defaultFrame = new Image();
defaultFrame.src = 'frame 1.png';
defaultFrame.onload = () => {
  currentFrame = defaultFrame;
  drawPreview();
};

// Load saved frames from localStorage
let savedFrames = JSON.parse(localStorage.getItem('frames') || '[]');
updateFrameList();

photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => addPhoto(img);
  img.src = URL.createObjectURL(file);
});

captureBtn.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.style.display = 'block';
  captureBtn.textContent = 'Ambil Gambar Sekarang';
  captureBtn.onclick = () => {
    takePhoto(video, stream);
  };
});

addFrameBtn.addEventListener('click', () => frameInput.click());

frameInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    savedFrames.push(evt.target.result);
    localStorage.setItem('frames', JSON.stringify(savedFrames));
    updateFrameList();
  };
  reader.readAsDataURL(file);
});

frameSelect.addEventListener('change', e => {
  const src = e.target.value;
  const img = new Image();
  img.onload = () => {
    currentFrame = img;
    drawPreview();
  };
  img.src = src;
});

downloadBtn.addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'photobooth.png';
  a.click();
  qrContainer.innerHTML = '';
  QRCode.toCanvas(document.createElement('canvas'), dataURL, { width: 150 }, (err, c) => {
    if (!err) qrContainer.appendChild(c);
  });
});

function addPhoto(img) {
  if (photos.length < 3) {
    photos.push(img);
    drawPreview();
  } else {
    alert('Sudah 3 foto diambil!');
  }
}

function drawPreview() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const photoHeight = canvas.height / 3;
  for (let i = 0; i < photos.length; i++) {
    ctx.drawImage(photos[i], 0, i * photoHeight, canvas.width, photoHeight);
  }

  if (currentFrame) ctx.drawImage(currentFrame, 0, 0, canvas.width, canvas.height);
}

function updateFrameList() {
  frameSelect.innerHTML = '<option value="' + defaultFrame.src + '">Default Frame</option>';
  savedFrames.forEach((src, i) => {
    const opt = document.createElement('option');
    opt.value = src;
    opt.textContent = 'Frame ' + (i + 1);
    frameSelect.appendChild(opt);
  });
}

function takePhoto(video, stream) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  tempCanvas.getContext('2d').drawImage(video, 0, 0);
  const img = new Image();
  img.onload = () => {
    addPhoto(img);
    stream.getTracks().forEach(t => t.stop());
    video.style.display = 'none';
    captureBtn.textContent = 'Ambil Foto';
    captureBtn.onclick = null;
  };
  img.src = tempCanvas.toDataURL();
}
