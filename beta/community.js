(function () {
  'use strict';
  var config = window.AVEK_BETA_COMMUNITY || {};
  // A verified consumer-group slug only; never accept an arbitrary destination.
  if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(config.groupSlug || '')) return;
  var join = document.getElementById('community-join');
  join.href = 'https://groups.google.com/g/' + config.groupSlug;
  join.hidden = false;
  document.getElementById('community-status').textContent = 'Opens Google Groups. Join once, then follow the available game steps below.';
  if (config.thornmarchClosedTestReady !== true) return;
  var optIn = document.getElementById('thornmarch-opt-in');
  optIn.href = 'https://play.google.com/apps/testing/games.avek.thornmarch';
  optIn.hidden = false;
  document.getElementById('thornmarch-stage').textContent = 'ANDROID · CLOSED TEST';
  document.getElementById('thornmarch-status').textContent = 'Join the AVEK group above, then opt into Thornmarch with the same Google account and install from Google Play.';
  document.getElementById('thornmarch-switch').hidden = false;
})();
