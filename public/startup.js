/* global window, document */
// Independent of the application bundle so asset failures have a recovery path.
window.setTimeout(function () {
  if (document.documentElement.dataset.hydrated !== "true") {
    var notice = document.getElementById("startup-recovery");
    if (notice) notice.hidden = false;
  }
}, 8000);
