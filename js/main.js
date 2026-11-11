// Lamp for the Nations – main JS

(function () {
  // Mobile nav toggle
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open);
      document.body.classList.toggle("nav-open", open);
    });
    mainNav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  var returnForm = document.getElementById("return-form");
  if (returnForm) {
    var dateInput = document.getElementById("return-date");
    if (dateInput && !dateInput.value) {
      var today = new Date();
      var month = String(today.getMonth() + 1).padStart(2, "0");
      var day = String(today.getDate()).padStart(2, "0");
      dateInput.value = today.getFullYear() + "-" + month + "-" + day;
    }

    returnForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var photo = document.getElementById("return-photo");
      var error = document.getElementById("return-form-error");
      var success = document.getElementById("return-form-success");
      var button = returnForm.querySelector("button[type='submit']");

      if (photo && photo.files[0] && photo.files[0].size > 8 * 1024 * 1024) {
        error.hidden = false;
        error.textContent = "Please choose a photo smaller than 8 MB.";
        photo.focus();
        return;
      }

      error.hidden = true;
      button.disabled = true;
      button.textContent = "Submitting…";

      fetch(returnForm.action, {
        method: "POST",
        body: new FormData(returnForm),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            returnForm.hidden = true;
            var schedule = document.getElementById("return-schedule");
            if (schedule) schedule.hidden = true;
            success.hidden = false;
            success.focus();
            return;
          }
          return response.json().then(function (data) {
            var message = "We could not send the form. Please email lftn.office@gmail.com.";
            if (data && data.error) message = data.error;
            if (data && data.errors && data.errors.length) {
              message = data.errors.map(function (item) { return item.message; }).join(" ");
            }
            throw new Error(message);
          });
        })
        .catch(function (err) {
          error.hidden = false;
          error.textContent = err && err.message
            ? err.message
            : "We could not send the form. Please email lftn.office@gmail.com.";
          button.disabled = false;
          button.textContent = "Submit Enrollment";
        });
    });
  }

  // Respect prefers-reduced-motion: don’t autoplay video in WELCOME
  var video = document.querySelector(".hero-title-video");
  if (video && window.matchMedia("(prefers-reduced-motion)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
  }
  // Hero background: cycle through short clips (1–2 sec each) for CCU-style effect.
  // Keep files small for GitHub: 480p or 720p, 1–2 sec, H.264 ~400–800 kbps → ~100–300 KB per clip.
  var heroClips = [
    "video/hero-1.mp4",
    "video/hero-2.mp4",
    "video/hero-3.mp4",
    "video/hero-4.mp4",
    "video/hero-5.mp4"
  ];

  var bgVideos = document.querySelectorAll(".hero-bg-video[data-hero-clip]");
  if (bgVideos.length === 0) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion)").matches;
  if (prefersReducedMotion) return;

  var currentIndex = 0;

  function playNextClip() {
    var clipIndex = currentIndex % heroClips.length;
    var elIndex = currentIndex % bgVideos.length;
    var nextVideo = bgVideos[elIndex];
    var prevActive = document.querySelector(".hero-bg-video.active");
    if (prevActive) prevActive.classList.remove("active");
    nextVideo.classList.add("active");
    nextVideo.src = heroClips[clipIndex];
    nextVideo.currentTime = 0;
    nextVideo.play().catch(function () {});
    currentIndex++;
  }

  function onClipEnded() {
    playNextClip();
  }

  function onClipError() {
    playNextClip();
  }

  for (var i = 0; i < bgVideos.length; i++) {
    bgVideos[i].addEventListener("ended", onClipEnded);
    bgVideos[i].addEventListener("error", onClipError);
  }

  playNextClip();
})();
