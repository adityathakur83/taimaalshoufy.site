/* =========================================================
   TAYMAA ALSHOUFY — interactions
   3D mouse parallax · scroll reveals · tilt · nav · reels
   ========================================================= */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, n) => a + (b - a) * n;

  /* ---------- Sticky header ---------- */
  const header = document.querySelector(".site-header");
  const onScrollHeader = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    function closeNav() {
      nav.classList.remove("open");
      document.body.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
    }
    burger.addEventListener("click", () => {
      const opening = !nav.classList.contains("open");
      nav.classList.toggle("open");
      document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(opening));
      if (opening) nav.querySelector("a")?.focus();
    });
    nav.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", closeNav)
    );
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        burger.focus();
      }
    });
  }

  /* ---------- HERO · scroll-scrubbed video ---------- */
  const vhero = document.querySelector(".vhero");
  if (vhero) {
    const vid     = vhero.querySelector("video");
    const overlay = vhero.querySelector(".vhero__overlay");
    const progBar = vhero.querySelector(".vhero__progress i");
    const clampP  = (v, a, b) => Math.max(a, Math.min(b, v));

    const scrub = () => {
      const total = vhero.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clampP(-vhero.getBoundingClientRect().top / total, 0, 1);
      if (vid.readyState >= 2 && vid.duration) {
        vid.currentTime = p * vid.duration;
      }
      if (overlay) overlay.style.opacity = String(1 - clampP(p * 3.5, 0, 1));
      if (progBar) progBar.style.transform = `scaleX(${p})`;
    };

    if (reduce) {
      if (overlay) overlay.style.opacity = "1";
    } else {
      window.addEventListener("scroll", scrub, { passive: true });
      window.addEventListener("resize", scrub);
      vid.addEventListener("loadedmetadata", scrub);
      scrub();
    }
  }

  /* ---------- Scroll reveal (3D rise) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  /* ---------- Animated bars ---------- */
  const barWrap = document.querySelector(".bars");
  if (barWrap) {
    const bo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".fill").forEach(f => { f.style.width = (f.dataset.val || 80) + "%"; });
          bo.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    bo.observe(barWrap);
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduce) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
        let cur = 0; const step = Math.max(1, target / 48);
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = target + suffix; }
          else { el.textContent = Math.floor(cur) + suffix; requestAnimationFrame(tick); }
        };
        tick(); co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => co.observe(c));
  }

  /* ---------- HERO · "Interior Defined" scroll scene ---------- */
  const define = document.querySelector(".define");
  if (define) {
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
    const easeIO = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const draws  = [...define.querySelectorAll(".d-draw")];
    const fades  = [...define.querySelectorAll(".d-fade")];
    const furnis = [...define.querySelectorAll(".d-furni")];
    const glows  = [...define.querySelectorAll(".d-glow")];
    const steps  = [...define.querySelectorAll(".dstep")];
    const prog   = define.querySelector(".dprogress i");
    const cap    = define.querySelector("[data-cap]");
    const paper  = define.querySelector(".define__paper");
    const warm   = define.querySelector(".define__warm");

    // [progress-threshold, caption]
    const caps = [
      [0.00, "Every space starts as a single line."],
      [0.18, "Walls, floor and proportion take shape."],
      [0.36, "Furniture, chosen with intent, settles in."],
      [0.64, "Warm light changes everything."],
      [0.84, "A room — finally ready to be lived in."]
    ];
    let cur = -1;

    const render = (p) => {
      draws.forEach(el => { el.style.strokeDashoffset = 1 - seg(p, +el.dataset.from, +el.dataset.to); });
      fades.forEach(el => { el.style.opacity = seg(p, +el.dataset.from, +el.dataset.to); });
      furnis.forEach(el => {
        const s = easeIO(seg(p, +el.dataset.from, +el.dataset.to));
        el.style.opacity = s;
        el.style.transform = `translateY(${(1 - s) * 64}px)`;
      });
      glows.forEach(el => { el.style.opacity = seg(p, +el.dataset.from, +el.dataset.to) * 0.95; });
      if (paper) paper.style.opacity = 1 - seg(p, 0.12, 0.40);
      if (warm)  warm.style.opacity = seg(p, 0.30, 0.72) * 0.55;
      if (prog)  prog.style.transform = `scaleX(${p})`;

      let idx = 0;
      caps.forEach((c, i) => { if (p >= c[0]) idx = i; });
      if (idx !== cur) {
        cur = idx;
        steps.forEach((s, i) => s.classList.toggle("active", i === idx));
        if (cap) { cap.style.opacity = 0; setTimeout(() => { cap.textContent = caps[idx][1]; cap.style.opacity = 1; }, 160); }
      }
    };

    if (reduce) {
      render(1);
      furnis.forEach(el => { el.style.transform = "none"; });
    } else {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return; ticking = true;
        requestAnimationFrame(() => {
          const total = define.offsetHeight - window.innerHeight;
          const p = clamp(-define.getBoundingClientRect().top / total, 0, 1);
          render(p); ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      render(0);
    }
  }

  /* ---------- Generic [data-parallax] on scroll ---------- */
  const paraEls = document.querySelectorAll("[data-parallax]");
  if (paraEls.length && !reduce) {
    const update = () => {
      const vh = window.innerHeight;
      paraEls.forEach(el => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const prog = (center - vh / 2) / vh;            // -0.5..0.5-ish
        const speed = parseFloat(el.dataset.parallax || 0.15);
        el.style.transform = `translate3d(0, ${prog * speed * -140}px, 0)`;
      });
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ---------- Card / media tilt (3D) ---------- */
  const tilts = document.querySelectorAll("[data-tilt]");
  tilts.forEach(card => {
    if (reduce) return;
    const max = parseFloat(card.dataset.tilt || 7);
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(6px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  /* ---------- Services accordion ---------- */
  const svcItems = document.querySelectorAll(".svc-item");
  if (svcItems.length) {
    svcItems.forEach(item => {
      item.querySelector(".svc-head").addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        svcItems.forEach(i => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  }

  /* ---------- Portfolio filter ---------- */
  const pills = document.querySelectorAll(".pill");
  if (pills.length) {
    const items = document.querySelectorAll("[data-cat]");
    pills.forEach(p => p.addEventListener("click", () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      const f = p.dataset.filter;
      items.forEach(it => {
        const show = f === "all" || it.dataset.cat.includes(f);
        it.classList.toggle("is-hidden", !show);
      });
    }));
  }

  /* ---------- Portfolio gallery lightbox ---------- */
  const portLb = document.querySelector(".port-lb");
  if (portLb) {
    const lbImg   = portLb.querySelector(".port-lb__img");
    const lbCat   = portLb.querySelector(".port-lb__cat");
    const lbTitle = portLb.querySelector(".port-lb__title");
    const lbYear  = portLb.querySelector(".port-lb__year");
    const lbCount = portLb.querySelector(".port-lb__counter");
    const lbClose = portLb.querySelector(".port-lb__close");
    const lbPrev  = portLb.querySelector(".port-lb__prev");
    const lbNext  = portLb.querySelector(".port-lb__next");
    const works   = [...document.querySelectorAll(".work-grid .work")];
    let cur = 0, lastFocus = null;

    function populate(idx) {
      const card = works[idx];
      lbImg.src           = card.querySelector("img").src;
      lbImg.alt           = card.querySelector("img").alt;
      lbCat.textContent   = card.querySelector(".tag").textContent;
      lbTitle.textContent = card.querySelector(".meta h3").textContent;
      lbYear.textContent  = card.querySelector(".meta span").textContent;
      if (lbCount) lbCount.textContent = (idx + 1) + " / " + works.length;
    }

    function openAt(idx) {
      lastFocus = document.activeElement;
      cur = ((idx % works.length) + works.length) % works.length;
      populate(cur);
      portLb.classList.add("open");
      portLb.setAttribute("aria-hidden", "false");
      document.body.classList.add("lb-open");
      lbClose.focus();
    }

    function goTo(idx) {
      lbImg.classList.add("fading");
      setTimeout(() => {
        cur = ((idx % works.length) + works.length) % works.length;
        populate(cur);
        lbImg.classList.remove("fading");
      }, 220);
    }

    function closeGallery() {
      portLb.classList.remove("open");
      portLb.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lb-open");
      if (lastFocus) lastFocus.focus();
    }

    works.forEach((card, i) => {
      card.addEventListener("click", e => {
        if (e.target.closest(".work-enquire")) return;
        openAt(i);
      });
    });

    lbClose.addEventListener("click", closeGallery);
    portLb.addEventListener("click", e => { if (e.target === portLb) closeGallery(); });
    lbPrev.addEventListener("click", () => goTo(cur - 1));
    lbNext.addEventListener("click", () => goTo(cur + 1));
    document.addEventListener("keydown", e => {
      if (!portLb.classList.contains("open")) return;
      if (e.key === "Escape")     closeGallery();
      if (e.key === "ArrowLeft")  goTo(cur - 1);
      if (e.key === "ArrowRight") goTo(cur + 1);
    });
  }

  /* ---------- Reels lightbox ---------- */
  const lb = document.querySelector(".lightbox");
  if (lb) {
    const box = lb.querySelector(".box");
    document.querySelectorAll(".reel").forEach(r => {
      r.addEventListener("click", () => {
        const src = r.dataset.video;
        box.innerHTML = "";
        if (src && /^https?:\/\//i.test(src)) {
          const fr = document.createElement("iframe");
          fr.src = src;
          fr.setAttribute("allow", "autoplay; encrypted-media; fullscreen");
          fr.setAttribute("allowfullscreen", "");
          fr.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
          fr.title = "Video reel";
          box.appendChild(fr);
        } else if (src && /\.mp4$/i.test(src)) {
          const vid = document.createElement("video");
          vid.src = src;
          vid.controls = true;
          vid.autoplay = true;
          vid.playsInline = true;
          vid.style.cssText = "width:100%;height:100%;object-fit:contain;background:#000;";
          box.appendChild(vid);
        } else {
          const msg = document.createElement("div");
          msg.style.cssText = "display:grid;place-items:center;height:100%;color:#f4f0e8;text-align:center;padding:2rem;font-family:'Cormorant Garamond',serif;font-size:1.3rem;";
          msg.textContent = "Video coming soon";
          box.appendChild(msg);
        }
        lb.classList.add("open");
      });
    });
    const close = () => { lb.classList.remove("open"); box.innerHTML = ""; };
    lb.querySelector(".close").addEventListener("click", close);
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  /* ---------- Custom cursor ---------- */
  if (window.matchMedia("(hover:hover)").matches && !reduce) {
    const dot = document.createElement("div"); dot.className = "cursor";
    const ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.append(dot, ring);
    let rx = 0, ry = 0, dxv = 0, dyv = 0;
    window.addEventListener("mousemove", e => {
      dxv = e.clientX; dyv = e.clientY;
      dot.style.transform = `translate(${dxv}px,${dyv}px) translate(-50%,-50%)`;
    });
    const loop = () => { rx = lerp(rx, dxv, 0.18); ry = lerp(ry, dyv, 0.18);
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll("a,button,.work,.reel,[data-tilt]").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
  }

  /* ---------- Contact form (front-end only) ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const note = form.querySelector(".form-status");
      const data = new FormData(form);
      const subject = encodeURIComponent("Project enquiry — " + (data.get("name") || ""));
      const body = encodeURIComponent(
        `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\nService: ${data.get("service")}\n\n${data.get("message")}`
      );
      window.location.href = `mailto:taymaashouf98@gmail.com?subject=${subject}&body=${body}`;
      if (note) { note.textContent = "Opening your email app… or write directly to taymaashouf98@gmail.com"; }
    });
  }

  /* ---------- Footer year ---------- */
  const yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
