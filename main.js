/* さかもと司法書士事務所  main.js */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};

  /* ---------- 現在ページのメニューを強調 ---------- */
  var page = document.body.getAttribute("data-page");
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
  });

  /* ---------- スマホメニュー ---------- */
  var btn = document.getElementById("menuBtn");
  var nav = document.getElementById("gnav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* ---------- 年表示 ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Instagramリンク ---------- */
  document.querySelectorAll("[data-instagram-link]").forEach(function (a) {
    if (CFG.INSTAGRAM_URL) a.href = CFG.INSTAGRAM_URL;
    else (a.closest(".sns") || a.parentElement).style.display = "none";
  });

  /* ---------- 共通：文字のエスケープ ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(d) {
    var p = String(d).split("-");
    return p.length === 3 ? p[0] + "年" + Number(p[1]) + "月" + Number(p[2]) + "日" : esc(d);
  }

  /* ---------- お知らせ・法改正情報（news.json / law.json を読み込み） ---------- */
  var feeds = document.querySelectorAll("[data-feed]");
  var cache = {};
  function load(name) {
    if (!cache[name]) {
      cache[name] = fetch(name + ".json", { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      });
    }
    return cache[name];
  }
  feeds.forEach(function (ul) {
    var name = ul.getAttribute("data-feed");
    var limit = Number(ul.getAttribute("data-limit")) || 0;
    var full = ul.hasAttribute("data-full");
    load(name).then(function (items) {
      items = items.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      if (limit) items = items.slice(0, limit);
      if (!items.length) { ul.innerHTML = "<li>現在、掲載している情報はありません。</li>"; return; }
      ul.innerHTML = items.map(function (it) {
        var tags = (it.tags || []).map(function (t) {
          var cls = name === "law" ? "tag law" : "tag";
          if (t === "重要") cls = "tag important";
          return '<span class="' + cls + '">' + esc(t) + "</span>";
        }).join("");
        var html = '<div class="post-meta"><time datetime="' + esc(it.date) + '">' + fmtDate(it.date) + "</time>" + tags + "</div>";
        html += '<p class="post-title">' + esc(it.title) + "</p>";
        if (full && it.body) {
          var body = Array.isArray(it.body) ? it.body : [it.body];
          html += '<div class="post-body">' + body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>";
        }
        if (full && it.source) html += '<p class="post-link">出典：' + esc(it.source) + "</p>";
        if (it.link) html += '<p class="post-link"><a href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.linkText || "詳しくはこちら") + " →</a></p>";
        if (it.instagram) html += '<p class="post-link"><a href="' + esc(it.instagram) + '" target="_blank" rel="noopener">Instagramの投稿を見る →</a></p>';
        return "<li>" + html + "</li>";
      }).join("");
    }).catch(function () {
      ul.innerHTML = "<li>情報を読み込めませんでした。時間をおいて再度お試しください。</li>";
    });
  });

  /* ---------- お知らせページのタブ ---------- */
  var tabs = document.querySelectorAll("[data-tab]");
  function showTab(name) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-tab") === name ? "true" : "false"); });
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== name; });
  }
  if (tabs.length) {
    tabs.forEach(function (t) { t.addEventListener("click", function () { showTab(t.getAttribute("data-tab")); history.replaceState(null, "", "#" + t.getAttribute("data-tab")); }); });
    if (location.hash === "#law") showTab("law");
  }

  /* ---------- Instagram投稿の埋め込み（instagram.json に投稿URLを並べる） ---------- */
  var insta = document.querySelector("[data-instagram]");
  if (insta) {
    load("instagram").then(function (list) {
      if (!list || !list.length) {
        if (!CFG.INSTAGRAM_URL) document.getElementById("instagram").style.display = "none";
        return;
      }
      insta.innerHTML = list.slice(0, 3).map(function (url) {
        return '<blockquote class="instagram-media" data-instgrm-permalink="' + esc(url) + '" data-instgrm-version="14"></blockquote>';
      }).join("");
      var s = document.createElement("script");
      s.async = true; s.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(s);
    }).catch(function () {
      if (!CFG.INSTAGRAM_URL) document.getElementById("instagram").style.display = "none";
    });
  }

  /* ---------- お問合せフォーム（GASへ送信） ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var msg = document.getElementById("formMsg");
    var submit = document.getElementById("submitBtn");
    function show(ok, text) { msg.className = "form-msg " + (ok ? "ok" : "ng"); msg.innerHTML = text; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var missing = [];
      if (!String(fd.get("name") || "").trim()) missing.push("お名前");
      var email = String(fd.get("email") || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("メールアドレス（正しい形式）");
      if (!fd.get("category")) missing.push("ご相談の種類");
      if (!String(fd.get("message") || "").trim()) missing.push("ご相談内容");
      if (!document.getElementById("agree").checked) missing.push("プライバシーポリシーへの同意");
      if (missing.length) { show(false, "次の項目をご確認ください：<br>・" + missing.map(esc).join("<br>・")); return; }

      if (!CFG.GAS_URL || CFG.GAS_URL.indexOf("ここに") !== -1) {
        show(false, "フォームの送信先が未設定です（config.js の GAS_URL）。お手数ですがお電話でお問合せください。");
        return;
      }
      submit.disabled = true; submit.textContent = "送信しています…";
      fd.append("page", location.href);

      fetch(CFG.GAS_URL, { method: "POST", body: new URLSearchParams(fd) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.ok) {
            form.reset();
            show(true, "<strong>送信が完了しました。</strong><br>ご入力のメールアドレスに確認メールをお送りしました。内容を確認のうえ、原則2営業日以内にご連絡いたします。");
            submit.textContent = "送信済み";
          } else {
            throw new Error((res && res.error) || "error");
          }
        })
        .catch(function () {
          show(false, "送信できませんでした。通信環境をご確認のうえ、もう一度お試しいただくか、お電話（055-275-9100）でお問合せください。");
          submit.disabled = false; submit.textContent = "この内容で送信する";
        });
    });
  }
})();
