(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile menu */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-links");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  var onVisible = function (el) {
    el.classList.add("is-visible");
    // Drop the reveal helper once finished so hover transforms on cards work.
    setTimeout(function () {
      el.classList.remove("reveal", "is-visible");
    }, 1400);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            onVisible(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.remove("reveal");
    });
  }

  /* Count-up numbers */
  var counters = document.querySelectorAll("[data-count]");
  var runCounter = function (el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var prefix = el.dataset.prefix || "";
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var start = performance.now();
    var dur = 1400;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  };
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      co.observe(el);
    });
  } else {
    counters.forEach(runCounter);
  }

  /* Copy contract address */
  var toast = document.querySelector(".toast");
  var toastTimer;
  var showToast = function (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 1800);
  };
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = document.querySelector(btn.dataset.copy).textContent.trim();
      var done = function () {
        showToast("Contract address copied!");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  });
  function fallbackCopy(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      cb();
    } catch (e) {
      showToast("Press Ctrl+C to copy");
    }
    document.body.removeChild(ta);
  }

  /* Twinkling stars & confetti */
  var rand = function (a, b) {
    return a + Math.random() * (b - a);
  };
  document.querySelectorAll("[data-stars]").forEach(function (box) {
    var n = parseInt(box.dataset.stars, 10) || 10;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "star";
      var size = rand(14, 34);
      s.style.cssText =
        "left:" + rand(2, 96) + "%;top:" + rand(4, 70) + "%;width:" + size +
        "px;height:" + size + "px;animation-delay:" + rand(0, 3) + "s;animation-duration:" + rand(2, 4) + "s";
      box.appendChild(s);
    }
  });

  /* Hero mascot follows the pointer in 3D */
  var tilt = document.querySelector("[data-tilt]");
  var heroSection = document.querySelector(".hero");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (tilt && heroSection && canHover && !reduceMotion) {
    heroSection.addEventListener("mousemove", function (e) {
      var r = tilt.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      var clamp = function (v) {
        return Math.max(-1, Math.min(1, v));
      };
      tilt.style.setProperty("--ry", clamp(dx) * 14 + "deg");
      tilt.style.setProperty("--rx", clamp(dy) * -12 + "deg");
    });
    heroSection.addEventListener("mouseleave", function () {
      tilt.style.setProperty("--ry", "0deg");
      tilt.style.setProperty("--rx", "0deg");
    });
  }

  /* Companion mascot */
  var buddy = document.querySelector(".buddy");
  if (buddy) {
    var bubble = buddy.querySelector(".buddy__bubble");
    var lines = ["万岁!", "皇帝!", "币安皇帝!", "To the throne!", "BNB!", "Long live!"];
    var colors = ["#ffd23f", "#ff5a5f", "#3ddc97", "#7fd0ff", "#ff8fd1", "#6d4aff"];
    var talkTimer;
    var burst = function () {
      var r = buddy.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      for (var i = 0; i < 12; i++) {
        var s = document.createElement("span");
        var ang = (Math.PI * 2 * i) / 12 + rand(-0.2, 0.2);
        var dist = rand(70, 130);
        s.className = "pop-star";
        s.style.left = cx - 10 + "px";
        s.style.top = cy - 10 + "px";
        s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
        s.style.setProperty("--c", colors[i % colors.length]);
        document.body.appendChild(s);
        setTimeout(
          (function (el) {
            return function () {
              el.remove();
            };
          })(s),
          1000
        );
      }
    };
    var talk = function () {
      bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
      buddy.classList.add("is-talking");
      clearTimeout(talkTimer);
      talkTimer = setTimeout(function () {
        buddy.classList.remove("is-talking");
      }, 2200);
    };
    buddy.addEventListener("click", function () {
      buddy.classList.remove("is-jumping");
      void buddy.offsetWidth;
      buddy.classList.add("is-jumping");
      talk();
      if (!reduceMotion) burst();
    });
    buddy.addEventListener("animationend", function (e) {
      if (e.animationName === "jump") buddy.classList.remove("is-jumping");
    });
    // Greets visitors once after a short delay.
    setTimeout(talk, 2500);
  }

  var confetti = document.querySelector(".confetti");
  if (confetti && !reduceMotion) {
    var colors = ["#ffd23f", "#ff5a5f", "#3ddc97", "#7fd0ff", "#ff8fd1", "#ffffff"];
    for (var c = 0; c < 28; c++) {
      var p = document.createElement("i");
      p.style.cssText =
        "left:" + rand(0, 100) + "%;background:" + colors[c % colors.length] +
        ";animation-duration:" + rand(5, 11) + "s;animation-delay:" + (-rand(0, 11)) + "s";
      confetti.appendChild(p);
    }
  }
})();
