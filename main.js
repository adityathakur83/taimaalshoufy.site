/* ============================================================
   MKT Motion Lab — main.js
   Upload this file to Hostinger public_html/
   Loaded with defer — does not block page rendering (better SEO)
   ============================================================ */
(function(){
  'use strict';

  /* ── CURSOR ── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  (function animCursor(){
    if(dot)  dot.style.transform  = `translate(${mx}px,${my}px)`;
    rx += (mx-rx)*.11; ry += (my-ry)*.11;
    if(ring) ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animCursor);
  })();

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive:true });

  /* ── SCROLL REVEAL ── */
  const revIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('visible'); revIO.unobserve(en.target); } });
  }, { threshold:.08 });
  document.querySelectorAll('.reveal-up').forEach(el => revIO.observe(el));

  /* ── SKILL BARS ── */
  const skillIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.style.width = (en.target.dataset.w||'0')+'%';
        skillIO.unobserve(en.target);
      }
    });
  }, { threshold:.25 });
  document.querySelectorAll('.skill-fill').forEach(f => skillIO.observe(f));

  /* ── STAT COUNTERS ── */
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(!en.isIntersecting) return;
      const el  = en.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1600;
      let cur = 0;
      const tick = () => {
        cur = Math.min(cur + Math.ceil(end / (dur / 16)), end);
        el.childNodes[0].textContent = cur;
        if(cur < end) requestAnimationFrame(tick);
      };
      tick();
      statIO.unobserve(el);
    });
  }, { threshold:.5 });
  document.querySelectorAll('.stat-num[data-count]').forEach(el => statIO.observe(el));

  /* ── ACTIVE NAV ── */
  const desktopLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const mobileLinks  = [...document.querySelectorAll('.mob-nav-item[href^="#"]')];
  const sectionIds   = desktopLinks.map(a => a.getAttribute('href').slice(1));
  const sections     = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  function setActive(){
    const y = window.scrollY + 110;
    let cur = sectionIds[0];
    sections.forEach(s => { if(s.offsetTop <= y) cur = s.id; });
    desktopLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
    mobileLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
  }
  window.addEventListener('scroll', setActive, { passive:true });
  window.addEventListener('load', setActive);

  /* ── SMOOTH SCROLL ── */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
  });

  /* ── HERO VIDEO ── */
  window.addEventListener('load', () => {
    const v = document.querySelector('.hero-video');
    const cta = document.getElementById('heroPlayCta');
    if(!v) return;
    v.muted = true;
    const play = () => v.play().then(() => { if(cta) cta.style.display='none'; }).catch(() => { if(cta) cta.style.display='flex'; });
    v.readyState >= 2 ? play() : v.addEventListener('loadeddata', play, { once:true });
    document.getElementById('heroPlayBtn')?.addEventListener('click', () => { v.muted=true; play(); });
  });

  /* ── GALLERY KEYBOARD ── */
  document.querySelectorAll('.g-item[tabindex]').forEach(item => {
    item.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openModal(item); } });
  });

  /* ── IMAGE MODAL ── */
  window.openModal = function(el){
    const img = el?.querySelector('img'); if(!img) return;
    document.getElementById('modalImg').src = img.src;
    document.getElementById('myModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeModal = function(){
    document.getElementById('myModal').classList.remove('open');
    document.body.style.overflow = '';
  };
  document.getElementById('myModal')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeModal(); });

  /* ═══════════════════════════════════════════
     CINEMA PLAYER — HLS adaptive + MP4 fallback
  ═══════════════════════════════════════════ */
  function fmt(s){
    s = Math.max(0, Math.floor(s||0));
    const m = Math.floor(s/60), sec = s%60;
    return m+':'+(sec<10?'0':'')+sec;
  }

  function attachSource(vid, src, qualitySelect){
    if(vid._hls){ vid._hls.destroy(); vid._hls = null; }
    const isHLS = /\.m3u8(\?|$)/i.test(src);

    if(isHLS && typeof Hls !== 'undefined' && Hls.isSupported()){
      const hls = new Hls({ maxBufferLength:30, maxMaxBufferLength:60, startLevel:-1, capLevelToPlayerSize:true });
      hls.loadSource(src);
      hls.attachMedia(vid);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        if(!qualitySelect) return;
        while(qualitySelect.options.length > 1) qualitySelect.remove(1);
        data.levels.forEach((lvl, i) => {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = lvl.height ? lvl.height+'p' : 'Level '+(i+1);
          qualitySelect.appendChild(opt);
        });
        qualitySelect.style.display = 'inline-block';
        qualitySelect.addEventListener('change', () => {
          hls.currentLevel = parseInt(qualitySelect.value, 10);
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if(!qualitySelect) return;
        const live = qualitySelect.querySelector('option[value="-1"]');
        if(live) live.textContent = 'Auto ('+(hls.levels[data.level]?.height||'?')+'p)';
      });

      vid._hls = hls;
      return hls;

    } else if(isHLS && vid.canPlayType('application/vnd.apple.mpegurl')){
      vid.src = src;
    } else {
      vid.src = src;
      vid.load();
      if(qualitySelect) qualitySelect.style.display = 'none';
    }
    return null;
  }

  function CinemaPlayer(cfg){
    const vid      = cfg.video;
    const playBtn  = cfg.playBtn;
    const muteBtn  = cfg.muteBtn;
    const volSldr  = cfg.volSlider;
    const seek     = cfg.seek;
    const progress = cfg.progressBar;
    const buffered = cfg.buffered;
    const curEl    = cfg.current;
    const durEl    = cfg.duration;
    const speedSel = cfg.speed;
    const qualSel  = cfg.qualitySelect;
    const pipBtn   = cfg.pip;
    const fullBtn  = cfg.full;
    const spinner  = cfg.spinner;
    const bigBtn   = cfg.bigBtn;
    const bigIcon  = cfg.bigIcon;

    function updatePlay(){
      const icon = vid.paused ? 'fas fa-play' : 'fas fa-pause';
      if(playBtn) playBtn.innerHTML = `<i class="${icon}"></i>`;
      if(bigIcon) bigIcon.className = icon;
    }
    function showBig(){
      if(!bigBtn) return;
      bigBtn.classList.add('show');
      clearTimeout(bigBtn._t);
      bigBtn._t = setTimeout(() => bigBtn.classList.remove('show'), 650);
    }
    function togglePlay(){ vid.paused ? vid.play() : vid.pause(); showBig(); }

    vid.addEventListener('play',  updatePlay);
    vid.addEventListener('pause', updatePlay);
    vid.addEventListener('ended', updatePlay);

    vid.addEventListener('timeupdate', () => {
      if(!seek || !vid.duration) return;
      const pct = vid.currentTime/vid.duration*100;
      if(progress) progress.style.width = pct+'%';
      seek.value = pct;
      if(curEl) curEl.textContent = fmt(vid.currentTime);
    });

    vid.addEventListener('loadedmetadata', () => {
      if(durEl) durEl.textContent = fmt(vid.duration);
    });

    vid.addEventListener('progress', () => {
      if(!vid.duration || !buffered) return;
      const b = vid.buffered;
      if(b.length) buffered.style.width = (b.end(b.length-1)/vid.duration*100)+'%';
    });

    vid.addEventListener('waiting', () => { if(spinner) spinner.classList.add('active'); });
    vid.addEventListener('canplay', () => { if(spinner) spinner.classList.remove('active'); });

    if(seek) seek.addEventListener('input', () => {
      if(vid.duration) vid.currentTime = vid.duration * seek.value/100;
    });

    if(playBtn) playBtn.addEventListener('click', togglePlay);
    vid.addEventListener('click', togglePlay);

    if(muteBtn) muteBtn.addEventListener('click', () => {
      vid.muted = !vid.muted;
      if(volSldr) volSldr.value = vid.muted ? 0 : vid.volume;
      muteBtn.innerHTML = vid.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    if(volSldr) volSldr.addEventListener('input', () => {
      vid.volume = parseFloat(volSldr.value);
      vid.muted  = vid.volume === 0;
      if(muteBtn) muteBtn.innerHTML = vid.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    if(speedSel) speedSel.addEventListener('change', () => { vid.playbackRate = parseFloat(speedSel.value); });

    if(pipBtn) pipBtn.addEventListener('click', () => {
      document.pictureInPictureElement
        ? document.exitPictureInPicture().catch(()=>{})
        : vid.requestPictureInPicture?.().catch(()=>{});
    });

    if(fullBtn) fullBtn.addEventListener('click', () => {
      const el = vid.closest('.cvp') || vid;
      document.fullscreenElement
        ? document.exitFullscreen?.().catch(()=>{})
        : el.requestFullscreen?.().catch(()=>{});
    });

    document.addEventListener('fullscreenchange', () => {
      if(fullBtn) fullBtn.innerHTML = document.fullscreenElement
        ? '<i class="fas fa-compress"></i>'
        : '<i class="fas fa-expand"></i>';
    });

    this.loadSrc = (src) => attachSource(vid, src, qualSel);
  }

  /* Featured player */
  const fvid = document.getElementById('featuredVideo');
  if(fvid){
    new CinemaPlayer({
      video:         fvid,
      playBtn:       document.getElementById('cvpPlay'),
      muteBtn:       document.getElementById('cvpMute'),
      volSlider:     document.getElementById('cvpVol'),
      seek:          document.getElementById('cvpSeek'),
      progressBar:   document.getElementById('cvpProgressBar'),
      buffered:      document.getElementById('cvpBuffered'),
      current:       document.getElementById('cvpCurrent'),
      duration:      document.getElementById('cvpDuration'),
      speed:         document.getElementById('cvpSpeed'),
      qualitySelect: document.getElementById('cvpQuality'),
      pip:           document.getElementById('cvpPip'),
      full:          document.getElementById('cvpFull'),
      spinner:       document.getElementById('cvpSpinner'),
      bigBtn:        document.getElementById('cvpBig'),
      bigIcon:       document.getElementById('cvpBigIcon'),
    });
  }

  /* Modal player */
  const mvid = document.getElementById('modalVideo');
  if(mvid){
    new CinemaPlayer({
      video:         mvid,
      playBtn:       document.getElementById('mPlay'),
      muteBtn:       document.getElementById('mMute'),
      volSlider:     document.getElementById('mVol'),
      seek:          document.getElementById('mSeek'),
      progressBar:   document.getElementById('mProgressBar'),
      buffered:      document.getElementById('mBuffered'),
      current:       document.getElementById('mCurrent'),
      duration:      document.getElementById('mDuration'),
      speed:         document.getElementById('mSpeed'),
      qualitySelect: document.getElementById('mQuality'),
      pip:           document.getElementById('mPip'),
      full:          document.getElementById('mFull'),
      spinner:       document.getElementById('mSpinner'),
      bigBtn:        document.getElementById('mCvpBig'),
      bigIcon:       document.getElementById('mCvpBigIcon'),
    });
  }

  /* ── VIDEO MODAL open/close ── */
  const videoModal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  const modalCvp   = document.getElementById('modalCvp');

  window.openVideo = function(src){
    if(!videoModal) return;
    const isEmbed = /youtube|youtu\.be|vimeo/i.test(src);
    if(isEmbed){
      videoFrame.src = src;
      videoFrame.style.display = 'block';
      modalCvp.style.display   = 'none';
    } else {
      attachSource(mvid, src, document.getElementById('mQuality'));
      modalCvp.style.display   = 'block';
      videoFrame.style.display = 'none';
    }
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeVideo = function(){
    videoModal?.classList.remove('open');
    if(videoFrame){ videoFrame.src=''; videoFrame.style.display='none'; }
    if(mvid){
      mvid.pause();
      if(mvid._hls){ mvid._hls.destroy(); mvid._hls=null; }
      mvid.src='';
    }
    if(modalCvp) modalCvp.style.display='none';
    document.body.style.overflow = '';
  };
  videoModal?.addEventListener('click', e => { if(e.target===e.currentTarget) closeVideo(); });

  /* ── KEYBOARD ── */
  document.addEventListener('keydown', e => {
    if(e.key==='Escape'){ closeModal(); closeVideo(); }
    if(e.key===' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA'){
      const openVid = document.querySelector('#videoModal.open #modalVideo, #featuredVideo');
      if(openVid && !openVid.paused){ e.preventDefault(); openVid.pause(); }
    }
  });

  /* ── VIDEOS GRID ── */
  let allVideos = [];
  const videosGrid = document.getElementById('videosGrid');
  const filterBtns = document.querySelectorAll('.vf-btn');
  const showMoreBtn = document.getElementById('showMoreVideos');
  let activeFilter = 'Event Highlight', visibleCount = 6;

  function esc(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

  function renderVideos(){
    if(!videosGrid) return;
    const filtered = allVideos.filter(v => v.category === activeFilter);
    const slice    = filtered.slice(0, visibleCount);
    if(!slice.length){
      videosGrid.innerHTML = `<div style="grid-column:span 3;padding:48px;text-align:center;color:var(--chalk3);font-family:var(--ff-m);font-size:.7rem;letter-spacing:.12em;">NO VIDEOS FOUND FOR "${esc(activeFilter)}"</div>`;
      if(showMoreBtn) showMoreBtn.style.display='none';
      return;
    }

    const first = slice.find(v => v.src && !/youtube|youtu\.be|vimeo/i.test(v.src));
    const featWrap = document.getElementById('featuredWrap');
    if(first && fvid && featWrap){
      const newSrc = first.src;
      const curSrc = fvid._hls ? fvid._hls.url : fvid.getAttribute('src') || '';
      if(curSrc !== newSrc) attachSource(fvid, newSrc, document.getElementById('cvpQuality'));
      featWrap.style.display = 'block';
    } else if(featWrap){
      featWrap.style.display = 'none';
    }

    videosGrid.innerHTML = slice.map(v => {
      const dataV = v.src || v.embedUrl || '';
      return `<div class="v-item" role="button" tabindex="0" aria-label="Play: ${esc(v.title)}" data-video="${esc(dataV)}">
        ${v.src ? `<video src="${esc(v.src)}" muted preload="metadata" playsinline></video>` : `<div style="width:100%;height:100%;background:var(--bg3);display:flex;align-items:center;justify-content:center;"><i class="fab fa-youtube" style="font-size:2rem;color:var(--chalk3);"></i></div>`}
        <div class="play-ring"><div class="play-circle"><i class="fas fa-play"></i></div></div>
        <div class="v-cat">${esc(v.category)}</div>
      </div>`;
    }).join('');

    videosGrid.querySelectorAll('.v-item').forEach(item => {
      const thumb = item.querySelector('video');
      item.addEventListener('click', () => { const u=item.dataset.video; if(u) openVideo(u); });
      item.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); const u=item.dataset.video; if(u) openVideo(u); } });
      item.addEventListener('mouseenter', () => { try{ thumb?.play(); }catch(_){} });
      item.addEventListener('mouseleave', () => { try{ thumb?.pause(); if(thumb) thumb.currentTime=0; }catch(_){} });
    });

    if(showMoreBtn) showMoreBtn.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || activeFilter;
      visibleCount = 6;
      renderVideos();
    });
  });
  showMoreBtn?.addEventListener('click', () => { visibleCount+=6; renderVideos(); });

  async function loadVideos(){
    try {
      const res = await fetch('WebData/Video%20Data/videos.json', { cache:'no-store' });
      if(!res.ok) throw new Error('no json');
      const data = await res.json();
      allVideos = [];
      Object.keys(data||{}).forEach(cat => {
        (Array.isArray(data[cat]) ? data[cat] : []).forEach(item => {
          allVideos.push({ title:item.title||item.src?.split('/').pop()||'Video', category:cat, src:item.src||'', embedUrl:item.embedUrl||'' });
        });
      });
    } catch(_){
      allVideos = [
        { title:'Sheikh Zayed Festival',  category:'Event Highlight',         src:'WebData/Video%20Data/Event%20Highlight/SHEIKH%20ZAYED%20FESTIVAL.mp4', embedUrl:'' },
        { title:'3D Logo After Effect',   category:'Logo Animation',          src:'WebData/Video%20Data/Logo%20Animation/3d%20Logo%20After%20Effect.mp4', embedUrl:'' },
        { title:'3D Product Render',      category:'3D Visualization',        src:'WebData/Video%20Data/3D%20Visualization/3d%20Product%20Render.MP4', embedUrl:'' },
        { title:'360 Projection Mapping', category:'360 & Projection Maping', src:'WebData/Video%20Data/360%20%26%20Projection%20Maping/360%20projection%20Mpping.mp4', embedUrl:'' },
        { title:'Live Digital Heritage',  category:'Behind The Scene',        src:'WebData/Video%20Data/Behind%20The%20Scene/Live%20Digital%20Heritage.MP4', embedUrl:'' }
      ];
    }
    renderVideos();
  }
  loadVideos();

  /* ── WHATSAPP FORM ── */
  window.sendToWhatsapp = function(e){
    e.preventDefault();
    const name    = document.getElementById('waName')?.value?.trim()||'';
    const subject = document.getElementById('waSubject')?.value?.trim()||'';
    const message = document.getElementById('waMessage')?.value?.trim()||'';
    const text = `Hello Munna,\n\nName: ${name}\nSubject: ${subject}\n\n${message}\n\n— Sent from mktmotionlab.net`;
    window.open(`https://wa.me/971529703583?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

})();
