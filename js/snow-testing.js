/* This is a casual testing gate, not protection for private assets. */
(async () => {
  const gate = document.createElement('main');
  gate.className = 'snow-gate';
  gate.innerHTML = `<a href="/">← Games</a><p class="tools-eyebrow">TESTING ROOM / SNOW RIDER 3D</p><h1>A little more time<br>on the mountain.</h1><p>Snow Rider 3D hacks are in progress. Testers can still play the game below.</p><form><label for="tester-code">Tester passcode</label><input id="tester-code" type="password" autocomplete="off" required><button type="submit">Play testing build</button></form><p role="status" aria-live="polite"></p><a href="/bookmarks/">Browse available game hacks →</a>`;
  document.body.append(gate);
  const status = gate.querySelector('[role=status]');
  gate.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    try {
      const input = gate.querySelector('input');
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value)))).map(b => b.toString(16).padStart(2, '0')).join('');
      input.value = '';
      if (digest !== '92c0c3b05314b36d3aca20aa1b64e0e3366922bee25af526307218391ffe53a1') { status.textContent = 'Incorrect passcode. Try again.'; input.focus(); return; }
      gate.remove();
      window.gameInstance = UnityLoader.instantiate('gameContainer', 'Build/SnowRider3D-gd-1.json', { onProgress: UnityProgress, Module: { onRuntimeInitialized() { UnityProgress(window.gameInstance, 'complete'); } } });
    } catch { status.textContent = 'Unable to start the testing build. Please reload and try again.'; }
  };
  async function noticeRequest(method = 'GET') {
    const response = await fetch('/.netlify/functions/snow-notice', { method, credentials: 'same-origin' });
    if (!response.ok) throw new Error('Notice unavailable');
    return response.json();
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'tools-notice';
  dialog.innerHTML = `<p class="tools-eyebrow">WORK IN PROGRESS</p><h2>Snow Rider 3D</h2><p>We’re working on adding hacks to Snow Rider 3D. The game is available for passcode testing while work continues.</p><p>Click Okay to dismiss this notice for this browser. Clearing cookies or using a different browser can show it again.</p><p role="status" aria-live="polite"></p><button type="button">Okay</button>`;
  document.body.append(dialog);
  dialog.addEventListener('cancel', e => e.preventDefault());
  dialog.querySelector('button').onclick = async () => {
    const button = dialog.querySelector('button'); button.disabled = true;
    try { await noticeRequest('POST'); dialog.close(); dialog.remove(); }
    catch { dialog.querySelector('[role=status]').textContent = 'Could not save dismissal. Please try again.'; button.disabled = false; }
  };
  try { if (!(await noticeRequest()).seen) dialog.showModal(); }
  catch { status.textContent = 'Notice service is unavailable. You can still enter your tester passcode.'; }
})();
