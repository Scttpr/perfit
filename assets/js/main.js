(function () {
  "use strict";

  // Aucun cookie, aucun stockage local, aucune requête tierce au chargement :
  // ce script se limite à l'affichage des coordonnées, au menu, aux vidéos (au clic)
  // et à la préparation d'un e-mail dans la messagerie du visiteur.

  document.documentElement.classList.add("js");

  var cfg = window.PERFIT_CONFIG || {};

  function has(key) {
    return cfg[key] !== undefined && cfg[key] !== null && String(cfg[key]).trim() !== "";
  }

  function fillCfg() {
    // data-cfg-if="clé" : retire l'élément entier quand la valeur n'est pas configurée.
    document.querySelectorAll("[data-cfg-if]").forEach(function (el) {
      if (!has(el.getAttribute("data-cfg-if"))) el.remove();
    });
    // data-cfg="clé" : insère la valeur (ou la valeur de repli data-cfg-default).
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      if (has(key)) el.textContent = cfg[key];
      else if (el.hasAttribute("data-cfg-default")) el.textContent = el.getAttribute("data-cfg-default");
      else el.remove();
    });
    // data-cfg-href="mailto:{email}" : construit le lien ; conserve le href statique à défaut.
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
      var tpl = el.getAttribute("data-cfg-href");
      var encode = /^https?:/.test(tpl);
      var missing = false;
      var href = tpl.replace(/\{(\w+)\}/g, function (m, key) {
        if (!has(key)) { missing = true; return ""; }
        var val = String(cfg[key]);
        if (key === "phone") val = val.replace(/[^\d+]/g, "");
        return encode ? encodeURIComponent(val) : val;
      });
      if (!missing) el.setAttribute("href", href);
    });
  }

  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
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
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initScrollspy() {
    if (!("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll('.main-nav a[href^="#"]');
    var sections = document.querySelectorAll("[data-spy]");
    if (!links.length || !sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  function initVideo() {
    var dialog = document.getElementById("video-dialog");
    var iframe = document.getElementById("video-iframe");
    if (!dialog || !iframe || !dialog.showModal) return;
    var closeBtn = document.getElementById("video-close");
    document.querySelectorAll("[data-video]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Le lecteur YouTube (mode « confidentialité avancée ») n'est chargé qu'ici, au clic.
        iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(btn.getAttribute("data-video")) + "?rel=0&autoplay=1";
        iframe.title = btn.getAttribute("data-video-title") || "Vidéo";
        dialog.showModal();
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    // « close » couvre le bouton, le clic hors cadre et la touche Échap : la vidéo s'arrête toujours.
    dialog.addEventListener("close", function () { iframe.removeAttribute("src"); });
  }

  function initCopy() {
    var btn = document.getElementById("copy-email");
    var status = document.getElementById("copy-status");
    if (!btn) return;
    if (!has("email") || !navigator.clipboard) { btn.remove(); return; }
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(cfg.email).then(function () {
        if (status) status.textContent = "Adresse copiée.";
      }, function () {
        if (status) status.textContent = "Copie impossible : sélectionnez l’adresse.";
      });
    });
  }

  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    function say(text, kind) {
      if (!status) return;
      status.className = "form-status" + (kind ? " " + kind : "");
      status.textContent = text;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!has("email")) {
        say("L’adresse de contact n’est pas disponible pour le moment.", "ko");
        return;
      }
      var lines = ["Nom : " + form.nom.value.trim()];
      var tel = form.telephone.value.trim();
      if (tel) lines.push("Téléphone : " + tel);
      lines.push("", form.message.value.trim());
      var subject = "Prise de contact — " + (cfg.siteName || "Perf IT");
      window.location.href = "mailto:" + cfg.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      say("Votre messagerie s’ouvre avec le message prérempli : il ne vous reste qu’à l’envoyer. Si rien ne se passe, écrivez-nous directement à " + cfg.email + ".", "ok");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCfg();
    setYear();
    initNav();
    initHeader();
    initScrollspy();
    initVideo();
    initCopy();
    initForm();
  });
})();
