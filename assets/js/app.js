// ===== CURSOR =====
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useCustomCursor = cursor && ring && window.matchMedia('(pointer: fine)').matches && !reduceMotion;
  if (useCustomCursor) {
    cursor.style.display = 'block';
    ring.style.display = 'block';
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx - 10}px, ${my - 10}px)`;
    });
    function animateRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();
  }

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ===== MOBILE MENU =====
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburgerBtn = document.getElementById('hamburger');
  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburgerBtn.focus();
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  // ===== SHOWROOM PAGINATION =====
  const showroomGrid = document.getElementById('showroomGrid');
  const showroomPagination = document.getElementById('showroomPagination');
  const showroomCount = document.getElementById('showroomCount');
  const localShowroomImages = [
    { src: 'image1.jpeg', title: 'Local Beauty Image 1', category: 'Local JPEG', note: 'Project image from the Jessy showroom folder.' },
    { src: 'image1.jpg', title: 'Local Beauty Image 2', category: 'Local JPEG', note: 'Project image from the Jessy showroom folder.' },
    { src: 'image2.jpeg', title: 'Local Beauty Image 3', category: 'Local JPEG', note: 'Project image from the Jessy showroom folder.' },
    { src: 'image3.jpeg', title: 'Local Beauty Image 4', category: 'Local JPEG', note: 'Project image from the Jessy showroom folder.' },
    { src: 'inage4.jpeg', title: 'Local Beauty Image 5', category: 'Local JPEG', note: 'Project image from the Jessy showroom folder.' },
    { src: 'image5.jpeg', title: 'Local Beauty Image 6', category: 'Local JPEG', note: 'Project image from the Jessy showroom folder.' }
  ];
  const unsplashShowroomBase = [
    ['photo-1519014816548-bf5fe059798b', 'Pink Acrylic Inspiration', 'Nails', 'A close-up nail look for acrylic and gel set inspiration.'],
    ['photo-1639629509821-c54cdd984227', 'Soft Lash Close-Up', 'Lashes', 'Eye-focused beauty reference for lash style planning.'],
    ['photo-1572954889228-2b12a55144d1', 'Elegant Braids', 'Hair', 'Braided hairstyle inspiration for protective looks.'],
    ['photo-1772322586754-34c9e6f5be6f', 'Floral Nail Art', 'Nails', 'Detailed nail art reference for statement sets.'],
    ['photo-1772322586702-73125782bd99', 'Blue Gel Polish', 'Nails', 'Colorful gel polish inspiration with a glossy finish.'],
    ['photo-1695527081848-1e46c06e6458', 'Golden Hair Styling', 'Hair', 'Salon styling inspiration for polished glam.'],
    ['photo-1674049406467-824ea37c7184', 'Hybrid Lash Detail', 'Lashes', 'Lash extension inspiration for soft glam eyes.'],
    ['photo-1596457792485-746d39f1794e', 'Ombre Nail Detail', 'Nails', 'Nail color and shape reference for modern designs.'],
    ['photo-1722751250788-7134e5675cbf', 'Bold Eye Glam', 'Lashes', 'Dramatic eye styling reference for bolder lash looks.'],
    ['photo-1675034743339-0b0747047727', 'Salon Styling Moment', 'Hair', 'Beauty studio reference for hair installs and styling.'],
    ['photo-1693776529070-2cdea397595b', 'French Nail Finish', 'Nails', 'Clean manicure inspiration for French and nude sets.'],
    ['photo-1759756655332-d66200497312', 'Knotless Braids', 'Hair', 'Braided style reference for lightweight protective looks.'],
    ['photo-1527203561188-dae1bc1a417f', 'Color Melt Hair', 'Hair', 'Hair color and styling reference for bold transformations.'],
    ['photo-1648010035195-6b0a56e14667', 'Goddess Braid Mood', 'Hair', 'Bohemian braid inspiration with a soft finish.'],
    ['photo-1613099084406-4b9140fc780a', 'Beauty Studio Portrait', 'Studio', 'Salon portrait inspiration for the showroom mood.']
  ];
  const unsplashShowroomImages = Array.from({ length: 44 }, (_, index) => {
    const [id, title, category, note] = unsplashShowroomBase[index % unsplashShowroomBase.length];
    const cropRound = Math.floor(index / unsplashShowroomBase.length) + 1;
    return {
      src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=720&h=900&q=82`,
      title: cropRound > 1 ? `${title} ${cropRound}` : title,
      category,
      note
    };
  });
  const showroomImages = [...localShowroomImages, ...unsplashShowroomImages].slice(0, 50);

  function renderShowroomPage(pageNumber = 1) {
    if (!showroomGrid || !showroomPagination) return;
    const perPage = 10;
    const pageCount = Math.ceil(showroomImages.length / perPage);
    const currentPage = Math.min(Math.max(pageNumber, 1), pageCount);
    const start = (currentPage - 1) * perPage;
    const pageItems = showroomImages.slice(start, start + perPage);

    showroomGrid.innerHTML = pageItems.map((item, index) => `
      <article class="showroom-card">
        <div class="showroom-image" role="img" aria-label="${item.title}" style="background-image:url('${item.src}');"></div>
        <div class="showroom-card-body">
          <span>${item.category}</span>
          <h3>${String(start + index + 1).padStart(2, '0')}. ${item.title}</h3>
          <p>${item.note}</p>
        </div>
      </article>
    `).join('');

    if (showroomCount) {
      showroomCount.textContent = `Showing ${start + 1}-${start + pageItems.length} of ${showroomImages.length}`;
    }

    const buttons = [
      `<button type="button" data-showroom-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`,
      ...Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;
        return `<button type="button" class="${page === currentPage ? 'active' : ''}" data-showroom-page="${page}" aria-label="Showroom page ${page}">${page}</button>`;
      }),
      `<button type="button" data-showroom-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>Next</button>`
    ];
    showroomPagination.innerHTML = buttons.join('');
    showroomPagination.querySelectorAll('button[data-showroom-page]').forEach(button => {
      button.addEventListener('click', () => {
        renderShowroomPage(Number(button.dataset.showroomPage));
        showroomGrid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  renderShowroomPage(1);

  // ===== JESSY AI CHAT =====
  const aiMessages = document.getElementById('aiMessages');
  const aiForm = document.getElementById('aiForm');
  const aiInput = document.getElementById('aiInput');
  const aiSend = document.getElementById('aiSend');
  const aiStatus = document.getElementById('aiStatus');
  const aiHistory = [];

  function addAiMessage(role, content, options = {}) {
    const message = document.createElement('div');
    message.className = `ai-message ${role}${options.loading ? ' loading' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = role === 'user' ? 'You' : 'J';

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    bubble.textContent = content;

    message.append(avatar, bubble);
    aiMessages.appendChild(message);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return message;
  }

  async function sendAiMessage(messageText) {
    const message = messageText.trim();
    if (!message || aiSend.disabled) return;

    addAiMessage('user', message);
    aiHistory.push({ role: 'user', content: message });
    aiInput.value = '';
    aiInput.style.height = '';
    aiSend.disabled = true;
    aiStatus.textContent = 'Designing your recommendation...';

    const loadingMessage = addAiMessage('assistant', 'Jessy AI is typing...', { loading: true });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22_000);

    try {
      const response = await fetch('/api/jessy-ai', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: aiHistory.slice(-8) })
      });
      clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Jessy AI could not answer right now.');
      }

      const reply = data.reply || 'I can help with that. Tell me the look, length and occasion you want.';
      loadingMessage.remove();
      addAiMessage('assistant', reply);
      aiHistory.push({ role: 'assistant', content: reply });
      aiStatus.textContent = 'Online beauty concierge';
    } catch (error) {
      clearTimeout(timeout);
      loadingMessage.remove();
      const serverHint = location.protocol === 'file:'
        ? 'Start the local AI server with npm start, then open the localhost link.'
        : 'Please try again in a moment.';
      const message = error.name === 'AbortError'
        ? 'Jessy AI took too long. Send a shorter message and I will keep it quick.'
        : `${error.message || 'Jessy AI is unavailable right now.'} ${serverHint}`;
      addAiMessage('assistant', message);
      aiStatus.textContent = 'Needs connection';
    } finally {
      aiSend.disabled = false;
      aiInput.focus();
    }
  }

  if (aiForm) {
    aiForm.addEventListener('submit', event => {
      event.preventDefault();
      sendAiMessage(aiInput.value);
    });

    aiInput.addEventListener('input', () => {
      aiInput.style.height = 'auto';
      aiInput.style.height = `${Math.min(aiInput.scrollHeight, 130)}px`;
    });

    aiInput.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        aiForm.requestSubmit();
      }
    });

    document.querySelectorAll('[data-ai-prompt]').forEach(button => {
      button.addEventListener('click', () => sendAiMessage(button.dataset.aiPrompt || ''));
    });
  }

  // ===== HOME GLAM FINDER =====
  const glamFinderForm = document.getElementById('glamFinderForm');
  const glamResult = document.getElementById('glamResult');
  const glamPlans = {
    nails: {
      soft: ['Pink Ombre Nail Set', 'Soft pink ombre gel extensions with a glossy finish and tiny crystals.'],
      natural: ['Clean Girl Gel Manicure', 'Short natural nails with nude gel, glossy top coat and tidy cuticle work.'],
      bold: ['Chrome Rhinestone Set', 'Acrylic or gel extensions with chrome accents, crystals and a statement shape.'],
      luxury: ['Pearl Chrome Luxe Nails', 'Elegant chrome nails with pearl detail, French edges and premium shine.'],
      low: ['Short Gel Polish', 'A neat solid gel color that is easy to maintain and works with every outfit.']
    },
    hair: {
      soft: ['Soft Glam Wig Install', 'A sleek install with gentle curls for a feminine, polished finish.'],
      natural: ['Natural Hair Styling', 'A clean natural style or twist-out with treatment-first prep.'],
      bold: ['Color Melt Styling', 'A vivid color or styled wig look for a dramatic transformation.'],
      luxury: ['Goddess Braids', 'Bohemian goddess braids with soft texture and premium finish.'],
      low: ['Medium Knotless Braids', 'Lightweight protective braids that are easier on the scalp and last beautifully.']
    },
    lashes: {
      soft: ['Hybrid Wispy Lashes', 'A pretty mix of classic and volume fans for soft but visible glam.'],
      natural: ['Classic Lash Set', 'A clean 1:1 lash set that enhances your eyes without looking heavy.'],
      bold: ['Volume Lash Set', 'Fuller lash fans for photos, parties and a more dramatic finish.'],
      luxury: ['Wispy Kim K Set', 'Textured spikes and fluffy fans for a luxury eye-framing effect.'],
      low: ['Lash Lift & Tint', 'A natural curl and tint with less upkeep than extensions.']
    },
    full: {
      soft: ['Soft Lagos Glam Package', 'Hybrid wispy lashes, glossy pink gel nails and a smooth styled finish.'],
      natural: ['Clean Beauty Reset', 'Classic lashes, nude gel polish and a tidy natural hairstyle.'],
      bold: ['Birthday Main Character Glam', 'Volume lashes, chrome rhinestone nails and a sleek install or bold braids.'],
      luxury: ['Luxury Polished Combo', 'Wispy lashes, pearl chrome nails and goddess braids or a flawless wig install.'],
      low: ['Low-Maintenance Beauty Plan', 'Lash lift, short gel polish and medium knotless braids for easy upkeep.']
    }
  };

  function occasionNote(occasion) {
    return {
      everyday: 'Keep the finish wearable, neat and easy to refresh.',
      birthday: 'Add one statement detail so the look photographs beautifully at dinner.',
      wedding: 'Choose comfort and longevity so the look survives the full celebration.',
      photoshoot: 'Go slightly bolder than everyday makeup because camera lighting softens details.',
      work: 'Stay polished and clean with a professional finish.'
    }[occasion] || 'Keep the look balanced and beautiful.';
  }

  function budgetNote(budget) {
    return {
      under10: 'Best budget move: focus on one service first, usually gel nails or a lash lift.',
      under20: 'Good range for one detailed service or a simpler two-service combo.',
      under35: 'Strong range for lashes plus nails, or hair with a clean add-on.',
      flexible: 'Best choice: prioritize the exact finish you want, then confirm the final quote on WhatsApp.'
    }[budget] || 'Send your inspo for exact pricing.';
  }

  if (glamFinderForm && glamResult) {
    glamFinderForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(glamFinderForm);
      const focus = formData.get('focus') || 'full';
      const vibe = formData.get('vibe') || 'soft';
      const occasion = formData.get('occasion') || 'everyday';
      const budget = formData.get('budget') || 'flexible';
      const [title, description] = glamPlans[focus][vibe];
      const message = encodeURIComponent(`Hi Jessy! I used the Glam Finder and want: ${title}. Occasion: ${occasion}. Budget: ${budget}.`);

      glamResult.innerHTML = `
        <div class="glam-result-label">Recommended Plan</div>
        <h3>${title}</h3>
        <p>${description}</p>
        <ul>
          <li>${occasionNote(occasion)}</li>
          <li>${budgetNote(budget)}</li>
          <li>Send inspo photos on WhatsApp so Jessy can confirm the exact service and price.</li>
        </ul>
        <div class="glam-result-actions">
          <a href="https://wa.me/2349076649660?text=${message}" target="_blank" rel="noopener">Book This Look</a>
          <a href="jessy-ai.html">Ask Jessy AI</a>
        </div>
      `;
    });
  }

  // ===== PRICE TABS =====
  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      const isActive = b.classList.contains(`${tab}-tab`);
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
    document.querySelectorAll('.price-panel').forEach(p => {
      const isActive = p.id === `panel-${tab}`;
      p.classList.toggle('active', isActive);
      p.hidden = !isActive;
    });
  }

  // ===== SCROLL REVEAL =====
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));

  // ===== SPARKLE POSITIONS =====
  const sparkles = document.querySelectorAll('.sparkle');
  sparkles.forEach(s => {
    s.style.background = ['var(--yellow)','var(--pink)','var(--blue)'][Math.floor(Math.random()*3)];
  });

  // ===== TILT EFFECT ON SERVICE CARDS =====
  if (!reduceMotion) {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        card.style.transform = `translateY(-8px) rotateY(${x*0.02}deg) rotateX(${-y*0.02}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ===== GALLERY TOUCH DRAG =====
  document.querySelectorAll('.scroll-track').forEach(track => {
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', () => { isDown = false; track.style.animationPlayState = 'running'; });
    track.addEventListener('mouseup', () => { isDown = false; track.style.animationPlayState = 'running'; });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 2;
    });
  });
