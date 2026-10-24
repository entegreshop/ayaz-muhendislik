/**
 * Ayaz Mühendislik - Antigravity UI & Interactive Engine
 * Industrial Cooling Insulation & Metal Jacketing
 */

document.addEventListener('DOMContentLoaded', () => {
  initAntigravityCanvas();
  initNavbarScroll();
  initMobileMenu();
  initTiltEffect();
  initGalleryFilterAndModal();
  initRoiCalculator();
  initQuoteForm();
  initCounters();
});

/* -------------------------------------------------------------
 * 1. Antigravity Particle & Vector Grid Canvas
 * ------------------------------------------------------------- */
function initAntigravityCanvas() {
  const canvas = document.getElementById('antigravity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  });

  let particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 75);

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 1;
      this.speedY = -(Math.random() * 0.45 + 0.15); // Antigravity: drift upward
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      // Mouse gentle interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }

      if (this.y < -10 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  createParticles();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting vectors
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / 110) * 0.15;
          ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------------------------------
 * 2. Sticky Glass Header & Scrollspy
 * ------------------------------------------------------------- */
function initNavbarScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('bg-slate-950/85', 'backdrop-blur-md', 'border-b', 'border-slate-800/80', 'shadow-2xl');
      header.classList.remove('bg-transparent', 'border-transparent');
    } else {
      header.classList.remove('bg-slate-950/85', 'backdrop-blur-md', 'border-b', 'border-slate-800/80', 'shadow-2xl');
      header.classList.add('bg-transparent', 'border-transparent');
    }
  });
}

/* -------------------------------------------------------------
 * 3. Mobile Navigation Drawer
 * ------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  const toggle = () => {
    mobileMenu.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  };

  toggleBtn.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', toggle);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  });
}

/* -------------------------------------------------------------
 * 4. 3D Tilt Effect on Interactive Cards
 * ------------------------------------------------------------- */
function initTiltEffect() {
  const cards = document.querySelectorAll('.tilt-card');
  if (window.innerWidth < 1024) return; // Only on desktop

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* -------------------------------------------------------------
 * 5. Project Gallery Filtering & Modal Lightbox
 * ------------------------------------------------------------- */
const projectData = [
  {
    id: 1,
    category: 'chiller',
    title: 'Merkezi Chiller & Glikol Hatları İzolasyonu',
    tag: 'Soğutma Grupları',
    image: './assets/images/hero-chiller.jpg',
    specs: {
      location: 'Organize Sanayi Bölgesi / Otomotiv Fabrikası',
      diameter: 'DN150 - DN300 (6" - 12")',
      material: '1. Seviye 32mm Kapalı Gözenekli NBR Kauçuk + 0.8mm Embossed Alüminyum Sac Kılıf',
      temperature: '-6°C Glikol & +4°C Chilled Water (CHW)',
      feature: 'Sıfır yoğuşma garantisi, anti-vibrasyon yaylı askı yalıtımları ve lazer kesim flanş kutuları.'
    }
  },
  {
    id: 2,
    category: 'tank',
    title: 'Silindirik Proses & Soğuk Akümülasyon Tankları',
    tag: 'Endüstriyel Tanklar',
    image: './assets/images/tanks.jpg',
    specs: {
      location: 'Gıda ve İçecek Üretim Tesisi',
      diameter: 'Çap: 4.800 mm | Yükseklik: 18.000 mm (x6 Tank)',
      material: '100mm Yüksek Yoğunluklu Taşyünü + Buhar Bariyeri + 1.0mm Eloksallı Alüminyum Sac',
      temperature: '+1°C Soğuk Proses Depolama',
      feature: 'Dikey kenet kilitli su sızdırmaz sistem, üst servis yürüyüş platformu entegre sac kaplama.'
    }
  },
  {
    id: 3,
    category: 'sac',
    title: 'Mandallı Vana Kutusu & Pres Segment Dirsekler',
    tag: 'Titiz Sac İşçiliği',
    image: './assets/images/valve-elbow.jpg',
    specs: {
      location: 'Kimya & Polimer Sentez Tesisi',
      diameter: 'DN200 Kontrol Vanaları & Balans Grupları',
      material: '0.8mm Alüminyum Sac, Paslanmaz Çelik Aç-Kapa Yaylı Mandallar (Quick-Release Clamps)',
      temperature: '-12°C Amonyak & Soğutma Devresi',
      feature: 'Bakım anında aletsiz 30 saniyede sökülüp tekrar takılabilen CUI korozyon önleyici sac kutu tasarımı.'
    }
  },
  {
    id: 4,
    category: 'chiller',
    title: 'Yoğuşma Önleyici Elastomerik Kauçuk Uygulaması',
    tag: 'Soğutma Grupları',
    image: './assets/images/rubber-insulation.jpg',
    specs: {
      location: 'Hassas Veri Merkezi (Data Center) Soğutma Altyapısı',
      diameter: 'DN250 Çift Hat Chiller Besleme',
      material: 'Armacell/K-Flex Class 0 Kapalı Gözenekli Kauçuk + Alüminyum Folyo Zırhı',
      temperature: '+7°C / +12°C Kesintisiz Soğutma',
      feature: 'µ ≥ 10.000 buhar difüzyon direnci, kaynak dikişleri özel yapıştırıcı ile sızdırmaz hale getirildi.'
    }
  },
  {
    id: 5,
    category: 'chiller',
    title: 'Merkezi Soğutma Santrali Ana Dağıtım Kollektörleri',
    tag: 'Soğutma Grupları',
    image: './assets/images/facility-wide.jpg',
    specs: {
      location: 'Bölgesel Lojistik & Soğuk Hava Deposu',
      diameter: 'DN400 Ana Kollektör & DN100 Dağıtım Kolları',
      material: '50mm Kauçuk + 0.8mm AlMg3 Deniz Suyu/Nem Dayanımlı Alüminyum Sac Jacketing',
      temperature: '+2°C / +8°C Soğutma Çevrimi',
      feature: 'Fabrika sahasında renk kodlu akış yönü markalamaları ve manyetik etiket yuvaları.'
    }
  },
  {
    id: 6,
    category: 'sac',
    title: 'FLIR Termografik Doğrulama & Telemetri Raporlama',
    tag: 'Titiz Sac İşçiliği',
    image: './assets/images/thermal-audit.jpg',
    specs: {
      location: 'Endüstriyel Enerji Santrali',
      diameter: 'DN50 - DN500 Muhtelif Hatlar',
      material: 'Kızılötesi (IR) Termal Görüntüleme & Yüzey Temas Sıcaklık Ölçümü',
      temperature: 'Delta T: Ortam ile Yüzey Arasında < 1.5°C Isı Kaçak Doğrulaması',
      feature: 'İş tesliminde her hat için bağımsız termal denetim raporu ve resmi garanti sertifikasyonu.'
    }
  }
];

function initGalleryFilterAndModal() {
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');
  const galleryGrid = document.getElementById('gallery-grid');
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (!galleryGrid) return;

  function renderGallery(filter = 'all') {
    galleryGrid.innerHTML = '';
    const filtered = filter === 'all' 
      ? projectData 
      : projectData.filter(item => item.category === filter);

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'group relative rounded-2xl overflow-hidden glass-panel border border-slate-700/60 transition-all duration-400 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/10 cursor-pointer flex flex-col';
      card.innerHTML = `
        <div class="relative h-64 overflow-hidden bg-slate-900">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40 backdrop-blur-md">
              ${item.tag}
            </span>
          </div>

          <div class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 border border-sky-400/40 flex items-center justify-center text-sky-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <p class="text-xs text-slate-400 font-mono mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              ${item.specs.location}
            </p>
            <h3 class="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-2 font-heading">
              ${item.title}
            </h3>
            <p class="text-xs text-slate-300 line-clamp-2">
              ${item.specs.feature}
            </p>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Çap: <strong class="text-slate-200">${item.specs.diameter.split(' ')[0]}</strong></span>
            <span class="text-sky-400 font-medium flex items-center gap-1">
              İncele & Detay
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openModal(item));
      galleryGrid.appendChild(card);
    });
  }

  // Filter Buttons Click
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'border-sky-400', 'shadow-sky-500/20', 'shadow-lg');
        b.classList.add('bg-slate-900/60', 'text-slate-300', 'border-slate-800');
      });
      btn.classList.remove('bg-slate-900/60', 'text-slate-300', 'border-slate-800');
      btn.classList.add('bg-sky-500', 'text-white', 'border-sky-400', 'shadow-sky-500/20', 'shadow-lg');

      const filterVal = btn.getAttribute('data-filter');
      renderGallery(filterVal);
    });
  });

  // Modal logic
  function openModal(item) {
    if (!modal) return;
    document.getElementById('modal-img').src = item.image;
    document.getElementById('modal-title').textContent = item.title;
    document.getElementById('modal-tag').textContent = item.tag;
    document.getElementById('modal-location').textContent = item.specs.location;
    document.getElementById('modal-diameter').textContent = item.specs.diameter;
    document.getElementById('modal-material').textContent = item.specs.material;
    document.getElementById('modal-temp').textContent = item.specs.temperature;
    document.getElementById('modal-feature').textContent = item.specs.feature;

    modal.classList.add('active');
    document.body.classList.add('overflow-hidden');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Initial render
  renderGallery('all');
}

/* -------------------------------------------------------------
 * 6. Interactive Industrial Energy Loss & ROI Simulator
 * ------------------------------------------------------------- */
function initRoiCalculator() {
  const pipeLengthInput = document.getElementById('calc-pipe-length');
  const pipeTempInput = document.getElementById('calc-pipe-temp');
  const ambientTempInput = document.getElementById('calc-ambient-temp');
  const insulationTypeSelect = document.getElementById('calc-insulation-type');

  const lengthDisplay = document.getElementById('val-pipe-length');
  const pipeTempDisplay = document.getElementById('val-pipe-temp');
  const ambientTempDisplay = document.getElementById('val-ambient-temp');

  const resAnnualSavings = document.getElementById('res-annual-savings');
  const resKwhSaved = document.getElementById('res-kwh-saved');
  const resCo2 = document.getElementById('res-co2');
  const resPayback = document.getElementById('res-payback');

  if (!pipeLengthInput || !pipeTempInput || !ambientTempInput) return;

  function calculate() {
    const L = parseFloat(pipeLengthInput.value); // Metre
    const T_pipe = parseFloat(pipeTempInput.value); // °C
    const T_amb = parseFloat(ambientTempInput.value); // °C
    const qualityFactor = parseFloat(insulationTypeSelect ? insulationTypeSelect.value : 1.0);

    lengthDisplay.textContent = `${L} m`;
    pipeTempDisplay.textContent = `${T_pipe > 0 ? '+' : ''}${T_pipe} °C`;
    ambientTempDisplay.textContent = `${T_amb} °C`;

    // Temperature difference (driving potential for heat gain)
    const deltaT = Math.abs(T_amb - T_pipe);

    // Realistic heat transfer baseline for cold pipelines (DN150 Chilled Water line)
    // Bare pipe heat gain: ~5.2 W/(m*K)
    // High-performance Ayaz NBR + Jacketing: ~0.32 W/(m*K)
    const uninsulatedHeatLossWatts = deltaT * 5.2 * L;
    const insulatedHeatLossWatts = deltaT * (0.32 / qualityFactor) * L;
    const savedWatts = uninsulatedHeatLossWatts - insulatedHeatLossWatts;

    // Running hours per year (typical cooling plant: 6,000 operating hours)
    const annualKwhSaved = (savedWatts * 6000) / 1000;

    // Commercial industrial electricity tariff in Turkey (~ 4.20 TL / kWh)
    const annualMoneySavedTL = annualKwhSaved * 4.20;

    // Carbon reduction: ~0.44 kg CO2 per kWh in national grid
    const annualCo2Tons = (annualKwhSaved * 0.44) / 1000;

    // Payback period (months) based on typical project capex
    const estimatedProjectCost = L * (850 * qualityFactor);
    const paybackMonths = Math.max(2.4, (estimatedProjectCost / annualMoneySavedTL) * 12);

    // Format numbers
    if (resAnnualSavings) {
      resAnnualSavings.textContent = `${Math.round(annualMoneySavedTL).toLocaleString('tr-TR')} ₺`;
    }
    if (resKwhSaved) {
      resKwhSaved.textContent = `${Math.round(annualKwhSaved).toLocaleString('tr-TR')} kWh`;
    }
    if (resCo2) {
      resCo2.textContent = `${annualCo2Tons.toFixed(1)} Ton CO₂`;
    }
    if (resPayback) {
      resPayback.textContent = `${paybackMonths.toFixed(1)} Ay`;
    }
  }

  pipeLengthInput.addEventListener('input', calculate);
  pipeTempInput.addEventListener('input', calculate);
  ambientTempInput.addEventListener('input', calculate);
  if (insulationTypeSelect) insulationTypeSelect.addEventListener('change', calculate);

  // Initial calculation
  calculate();
}

/* -------------------------------------------------------------
 * 7. Interactive RFQ Form with Real-time Feedback & WhatsApp Link
 * ------------------------------------------------------------- */
function initQuoteForm() {
  const form = document.getElementById('rfq-form');
  const successBox = document.getElementById('rfq-success-box');
  const ticketRefSpan = document.getElementById('rfq-ticket-ref');
  const resetBtn = document.getElementById('rfq-reset-btn');
  const whatsappCta = document.getElementById('rfq-whatsapp-cta');
  const submitBtn = form?.querySelector('button[type="submit"]');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('rfq-name')?.value.trim();
    const company = document.getElementById('rfq-company')?.value.trim();
    const phone = document.getElementById('rfq-phone')?.value.trim();
    const service = document.getElementById('rfq-service')?.value;
    const length = document.getElementById('rfq-length')?.value || 'Belirtilmedi';
    const location = document.getElementById('rfq-location')?.value || 'Belirtilmedi';
    const notes = document.getElementById('rfq-notes')?.value.trim() || 'Özel not yok';

    if (!name || !phone) {
      alert('Lütfen ad soyad ve telefon numaranızı eksiksiz doldurunuz.');
      return;
    }

    // Visual loading state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Gönderiliyor...</span>`;
    }

    let ticketCode = 'AYAZ-MÜH-' + Math.floor(100000 + Math.random() * 900000);
    let waUrl = `https://wa.me/905000000000?text=${encodeURIComponent('Merhaba Ayaz Mühendislik, keşif teklifi talebim var.')}`;

    try {
      // Real API Call to Backend
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          phone,
          service,
          length,
          location,
          notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ticket) ticketCode = data.ticket;
        if (data.whatsappUrl) waUrl = data.whatsappUrl;
      }
    } catch (err) {
      console.warn('Backend API offline or static mode, utilizing client fallback:', err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }

    if (ticketRefSpan) ticketRefSpan.textContent = ticketCode;
    if (whatsappCta) whatsappCta.href = waUrl;

    // Show animated success box
    form.classList.add('hidden');
    if (successBox) successBox.classList.remove('hidden');
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.classList.remove('hidden');
      if (successBox) successBox.classList.add('hidden');
    });
  }
}

/* -------------------------------------------------------------
 * 8. Telemetry Counters Animation on Scroll
 * ------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const prefix = counter.getAttribute('data-prefix') || '';
          const suffix = counter.getAttribute('data-suffix') || '';
          const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
          const duration = 2000;
          const startTime = performance.now();

          function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentVal = target * ease;

            counter.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
            }
          }

          requestAnimationFrame(update);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}
