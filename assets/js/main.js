(function () {
  "use strict";

  var cfg = window.PERFIT_CONFIG || {};

  // Fill personal-data placeholders from config.js (generated from env vars at build time)
  function fillCfg() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      if (cfg[key] !== undefined && cfg[key] !== "") el.textContent = cfg[key];
    });
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
      var tpl = el.getAttribute("data-cfg-href");
      var href = tpl.replace(/\{(\w+)\}/g, function (m, key) {
        return cfg[key] !== undefined ? cfg[key] : m;
      });
      el.setAttribute("href", href);
    });
  }

  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function markActiveNav() {
    var path = window.location.pathname.replace(/\/index\.html$/, "/");
    if (path === "/") path = "/";
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path !== "/" && path.indexOf(href) === 0 && href !== "/")) {
        a.classList.add("active");
      }
    });
  }

  function closeNavOnClick() {
    var toggle = document.getElementById("nav-toggle");
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () { if (toggle) toggle.checked = false; });
    });
  }

  // Native <dialog> video player (YouTube iframe injected lazily on open)
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

  // Contact form: POST to FORM_ENDPOINT (env) if set, otherwise mailto fallback
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
      var endpoint = cfg.formEndpoint || "";
      if (status) { status.className = "form-status"; status.textContent = "Envoi en cours…"; }
      if (!endpoint) {
        var subject = encodeURIComponent("Demande de contact — " + (cfg.siteName || ""));
        var body = encodeURIComponent(
          "Nom : " + data.nom + "\nTéléphone : " + data.telephone + "\nEmail : " + data.email + "\n\n" + data.message
        );
        window.location.href = "mailto:" + (cfg.email || "") + "?subject=" + subject + "&body=" + body;
        return;
      }
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (status) { status.className = "form-status ok"; status.textContent = "Merci ! Votre message a bien été envoyé."; }
        form.reset();
      }).catch(function () {
        if (status) { status.className = "form-status ko"; status.textContent = "Échec de l’envoi. Réessayez ou utilisez le lien email ci-dessous."; }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCfg();
    setYear();
    markActiveNav();
    closeNavOnClick();
    initVideo();
    initForm();
  });
})();
