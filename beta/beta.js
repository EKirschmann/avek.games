(function () {
  'use strict';
  var config = window.AVEK_BETA_FORM || {};
  var form = document.getElementById('beta-request');
  var fields = document.getElementById('request-fields');
  var status = document.getElementById('request-status');
  var button = document.getElementById('send-request');
  var token = '';
  var widget;
  var sending = false;
  var deliveryFeedback = false;
  function say(message, error) { status.textContent = message; status.dataset.error = String(!!error); }
  // Only the reviewed first-party endpoint can receive request details.
  if (config.endpoint !== 'https://forms.avek.games/beta' || !/^[a-zA-Z0-9_-]{10,100}$/.test(config.siteKey || '')) return;
  fields.disabled = false;
  say('Loading the spam check…');
  function clearToken() { token = ''; button.disabled = true; }
  window.avekSpamReady = function () {
    try {
      widget = window.turnstile.render('#spam-check', {
        sitekey: config.siteKey, action: 'beta_request', theme: 'dark', size: 'flexible',
        callback: function (value) { token = value; button.disabled = sending; if (!sending && !deliveryFeedback) say(''); },
        'expired-callback': function () { clearToken(); say('The spam check expired. Please complete it again.'); },
        'error-callback': function () { clearToken(); say('The spam check is unavailable. Please refresh or use the email link.', true); }
      });
    } catch { say('The spam check is unavailable. Please use the email link.', true); }
  };
  var script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=avekSpamReady&render=explicit';
  script.async = true;
  script.onerror = function () { say('The spam check could not load. Please use the email link.', true); };
  document.head.append(script);
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!token) { say('Please complete the spam check first.', true); return; }
    var values = new FormData(form);
    var body = { game: values.get('game'), email: values.get('email'), device: values.get('device'), message: values.get('message'), consent: values.get('consent') === 'on', website: values.get('website'), token: token };
    sending = true; deliveryFeedback = true; button.disabled = true; fields.disabled = true; say('Sending your request…');
    try {
      var response = await fetch(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(20000) });
      var result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(response.status === 429 ? 'Please wait a minute before trying again.' : 'We could not send your request. Please try again or use the email link.');
      say('Your request has been sent. We’ll reply when we have next steps to share.');
      form.reset();
    } catch (error) {
      say(error.message === 'Please wait a minute before trying again.' ? error.message : 'We could not send your request. Your details are still here; please try again or use the email link.', true);
    } finally {
      sending = false; fields.disabled = false; clearToken();
      if (widget !== undefined && window.turnstile) window.turnstile.reset(widget);
    }
  });
})();
