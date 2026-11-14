(function () {
  "use strict";

  var cfg = window.PERFIT_CONFIG || {};

  function fillCfg() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      var val = cfg[key];
      if (val !== undefined && val !== "") {
        el.textContent = val;
      } else {
        var prev = el.previousSibling;
        if (prev && prev.nodeType === 3 && /:\s*$/.test(prev.textContent)) prev.textContent = "";
        el.remove();
      }
    });
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
      var tpl = el.getAttribute("data-cfg-href");
      var href = tpl.replace(/\{(\w+)\}/g, function (m, key) {
        return cfg[key] !== undefined ? cfg[key] : m;
      });
      if (href.indexOf("{") === -1) el.setAttribute("href", href);
      else el.removeAttribute("href");
    });
  }

  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function markActiveNav() {
    var path = window.location.pathname.replace(/\/index\.html$/, "/");
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      var href = a.pathname.replace(/\/index\.html$/, "/");
      if (href === path) a.classList.add("active");
    });
  }

  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      nav.classList.toggle("open", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) setOpen(false);
    });
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var els = document.querySelectorAll(
      ".step, .activity, .work-class a, .team figure, .testimonial, .contact-card, .post-list li, .partners a, .gallery img, .video-poster"
    );
    els.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initVideo() {
    var dialog = document.getElementById("video-dialog");
    if (!dialog) return;
    var iframe = document.getElementById("video-iframe");
    var closeBtn = document.getElementById("video-close");
    document.querySelectorAll("[data-video]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (iframe) iframe.src = btn.getAttribute("data-video") + "&autoplay=1";
        if (dialog.showModal) dialog.showModal();
      });
    });
    function close() { if (iframe) iframe.src = ""; if (dialog.close) dialog.close(); }
    if (closeBtn) closeBtn.addEventListener("click", close);
    dialog.addEventListener("click", function (e) { if (e.target === dialog) close(); });
  }

  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        nom: form.nom.value.trim(),
        telephone: form.telephone.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim()
      };
      if (status) { status.className = "form-status"; status.textContent = "Ouverture de votre messagerie…"; }
      var subject = encodeURIComponent("Demande de contact — " + (cfg.siteName || ""));
      var body = encodeURIComponent(
        "Nom : " + data.nom + "\nTéléphone : " + data.telephone + "\nEmail : " + data.email + "\n\n" + data.message
      );
      window.location.href = "mailto:" + (cfg.email || "") + "?subject=" + subject + "&body=" + body;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCfg();
    setYear();
    markActiveNav();
    initNav();
    initVideo();
    initForm();
    initReveal();
  });
})();
