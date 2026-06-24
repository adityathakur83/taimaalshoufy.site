/* =========================================================
   TAYMAA ALSHOUFY — scroll-scrubbed video hero
   Scroll position drives the hero film's currentTime.
   ========================================================= */
(function () {
  "use strict";
  const hero = document.querySelector(".vhero");
  if (!hero) return;

  const video   = hero.querySelector(".vhero__video");
  const overlay = hero.querySelector(".vhero__overlay");
  const cue     = hero.querySelector(".vhero__cue");
  const progI   = hero.querySelector(".vhero__progress i");
  const reduce  = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));

  let duration = 0, ready = false, target = 0, lastP = 0;

  // ---- scrub engine ----
  // Seek directly toward the latest scroll target. A new seek is only issued
  // once the previous one finishes (the 'seeked' event re-fires applySeek),
  // so rapid scrolling coalesces into the most recent position. No rAF needed.
  function applySeek() {
    if (ready && !video.seeking && Math.abs(video.currentTime - target) > 0.033) {
      try { video.currentTime = target; } catch (e) {}
    }
  }
  video.addEventListener("seeked", applySeek);

  const actions = overlay ? overlay.querySelector(".vhero__actions") : null;

  // ---- HUD + target from scroll progress ----
  function render(p) {
    lastP = p;
    if (overlay) {
      const op = clamp(1 - (p - 0.04) / 0.16, 0, 1);
      overlay.style.opacity = op;
      if (actions) actions.style.pointerEvents = op < 0.05 ? "none" : "auto";
    }
    if (cue)     cue.style.opacity     = clamp(1 - p / 0.06, 0, 1);
    if (progI)   progI.style.transform = `scaleX(${p})`;
    if (ready) { target = clamp(p * duration, 0, Math.max(0, duration - 0.05)); applySeek(); }
  }

  function onScroll() {
    const total = hero.offsetHeight - window.innerHeight;
    const p = clamp(-hero.getBoundingClientRect().top / (total || 1), 0, 1);
    render(p);
  }

  // ---- init once metadata is known ----
  function onMeta() {
    duration = video.duration;
    ready = isFinite(duration) && duration > 0;
    // nudge a first frame to paint (some browsers won't show frame 0 otherwise)
    try { video.currentTime = 0.01; } catch (e) {}
    onScroll();
  }
  if (video.readyState >= 1) onMeta();
  else video.addEventListener("loadedmetadata", onMeta, { once: true });

  video.pause();
  video.load();

  if (reduce) {
    // honour reduced-motion: hold a single representative frame, no scrubbing
    video.addEventListener("loadeddata", () => { try { video.currentTime = duration ? duration * 0.12 : 0.1; } catch (e) {} }, { once: true });
    if (cue) cue.style.display = "none";
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }
})();
