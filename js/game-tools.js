/* Live controls for the local game builds. No unrelated browser saves are scanned. */
(() => {
  'use strict';
  const path = location.pathname;
  const fields = [], actions = [];
  const field = (label, get, set, min = 0, max = 1e12, step = 1) => fields.push({ label, get, set, min, max, step });
  const action = (label, run) => actions.push({ label, run });
  let title, ready;
  if (path.includes('/tinyfishing')) {
    title = 'Tiny Fishing';
    const state = () => _zp(null, null, global._Dw);
    ready = () => typeof global !== 'undefined' && typeof _zp === 'function' && state() && Number.isFinite(state()._FG);
    const direct = (label, key, min = 0, max = 1e12, step = 1) => field(label, () => state()[key], value => { state()[key] = value; }, min, max, step);
    direct('Money', '_FG'); direct('Gems', '_1G'); direct('Best score', '_Ew');
    for (const [label, key] of [['Fish capacity upgrade level', '_BG'], ['Depth upgrade level', '_CG'], ['Offline income upgrade level', '_EG']]) {
      field(label, () => state()[key], value => { state()[key] = value; _ra(state(), state()); }, 0, 50);
    }
    direct('Fish capacity (this session)', '_2F', 1, 1000);
    direct('Maximum depth (this session)', '_cF', 1, 1000);
    direct('Offline income per minute', '_DG');
    direct('Maximum energy', '_bG', 1, 100000); direct('Energy', '_aG', 0, 100000);
    field('Selected hook (0–8)', () => state()._wJ, value => {
      const hook = state()._gF[value];
      if (!hook || !_Ou(hook, 'unlocked')) throw new Error('Unlock this hook first.');
      state()._wJ = value;
    }, 0, 8);
    action('Unlock all hooks', () => { for (let i = 0; i < state()._fF; i++) _Iu(state()._gF[i], 'unlocked', 1); });
    action('Unlock every fish type', () => { for (let i = 0; i < state()._dF; i++) _Iu(state()._eF[i], 'unlocked', 1); });
    action('Toggle unlimited energy', () => { state()._cG = !state()._cG; return `Unlimited energy ${state()._cG ? 'on' : 'off'}.`; });
    // Expose each fish's gameplay values through the build's own map accessors.
    action('Show individual fish values', () => {
      if (document.getElementById('fish-values')) return 'Fish controls are already open below.';
      const group = document.createElement('div'); group.id = 'fish-values';
      for (let i = 0; i < state()._dF; i++) {
        const fish = state()._eF[i];
        const section = document.createElement('details'); const summary = document.createElement('summary');
        summary.textContent = `Fish ${i + 1}`; section.append(summary);
        for (const [label, key, min, max, step] of [['Price', 'price', 0, 1e9, 1], ['Minimum depth', 'minDepth', 0, 1000, .1], ['Maximum depth', 'maxDepth', 0, 1000, .1], ['Rarity', 'rarity', 0, 1, .01], ['Unlocked (0/1)', 'unlocked', 0, 1, 1], ['Aquarium income enabled (0/1)', 'earning', 0, 1, 1]]) {
          addField(section, { label, get: () => _Ou(fish, key), set: v => {
            const other = key === 'minDepth' ? _Ou(fish, 'maxDepth') : _Ou(fish, 'minDepth');
            if ((key === 'minDepth' && v > other) || (key === 'maxDepth' && v < other)) throw new Error('Minimum depth must not exceed maximum depth.');
            _Iu(fish, key, v);
          }, min, max, step });
        }
        group.append(section);
      }
      body.append(group); return 'Fish controls added below.';
    });
  } else if (path.includes('/cookieclicker')) {
    title = 'Cookie Clicker'; ready = () => typeof Game !== 'undefined' && Game.ready;
    field('Cookies', () => Game.cookies, value => { Game.Earn(value - Game.cookies); });
    field('Heavenly chips', () => Game.heavenlyChips, value => { Game.heavenlyChips = value; });
    action('Unlock all upgrades', () => { for (const name of Object.keys(Game.Upgrades)) Game.Unlock(name); });
    action('Spawn a golden cookie', () => { new Game.shimmer('golden'); });
  } else if (path.includes('/ngon')) {
    title = 'N Gon'; ready = () => typeof m !== 'undefined' && typeof player !== 'undefined' && player && !simulation.onTitlePage;
    field('Health', () => m.health, value => { if (value > m.maxHealth) throw new Error(`Maximum health is ${m.maxHealth}.`); m.health = value; m.displayHealth(); }, .01, 100, .01);
    field('Energy', () => m.energy, value => { m.energy = value; }, 0, 100, .01);
    action('Get every gun', () => b.giveGuns('all'));
    action('Refill ammunition', () => { for (const gun of b.guns) if (gun.have && Number.isFinite(gun.ammo)) gun.ammo = 9999; simulation.updateGunHUD(); });
    action('Get random technology', () => tech.giveTech('random'));
  } else if (path.includes('/sandboxels')) {
    title = 'Sandboxels'; ready = () => typeof elements !== 'undefined' && typeof settings !== 'undefined';
    field('Brush size', () => mouseSize, value => { mouseSize = value; }, 1, 50);
    field('Simulation speed (ticks/sec)', () => tps, value => { tps = value; resetInterval(value); }, 1, 120);
    action('Reveal every element', () => { settings.unhide = 1; for (const e in elements) { settings.unlocked[e] = true; const button = document.getElementById(`elementButton-${e}`); if (button) button.style.display = ''; else if (e !== 'unknown') createElementButton(e); } });
  } else if (path.includes('/blackjack')) {
    title = 'Black Jack'; ready = () => Boolean(window.cheatBlackjack && window.cheatBlackjack.ready());
    field('Funds (between hands)', () => window.cheatBlackjack.getFunds(), value => window.cheatBlackjack.setFunds(value), 1, 100000);
  } else if (path.includes('/flappy-2048')) {
    title = 'Flappy 2048'; ready = () => Boolean(window.cheatFlappy);
    field('Score', () => Math.floor(window.cheatFlappy.score), value => { window.cheatFlappy.score = value; window.cheatFlappy.actuate(); }, 0, 1000000);
    field('Bird position', () => window.cheatFlappy.birdpos, value => { window.cheatFlappy.birdpos = value; window.cheatFlappy.birdspd = 0; }, 0, 1, .01);
    action('Move bird into current gap', () => {
      const game = window.cheatFlappy;
      game.birdpos = [0.075, 0.375, 0.675][game.ab]; game.birdspd = 0; game.actuate();
    });
  } else if (path.includes('/2048/')) {
    title = '2048'; ready = () => Boolean(window.cheat2048);
    field('Score', () => window.cheat2048.score, value => { window.cheat2048.score = value; window.cheat2048.actuate(); });
    action('Remove smallest tile', () => {
      const game = window.cheat2048; let smallest;
      game.grid.eachCell((x, y, tile) => { if (tile && (!smallest || tile.value < smallest.value)) smallest = tile; });
      if (!smallest) throw new Error('No tiles to remove.');
      game.grid.removeTile(smallest); game.over = false; game.actuate();
    });
    action('Double every tile', () => { const game = window.cheat2048; game.grid.eachCell((x, y, tile) => { if (tile && tile.value < 1048576) tile.value *= 2; }); game.actuate(); });
  } else return;
  const panel = document.createElement('details'); panel.className = 'game-tools';
  const heading = document.createElement('summary'); heading.textContent = `${title} / Hacks`; panel.append(heading);
  const body = document.createElement('div'); body.className = 'tools-body'; panel.append(body);
  const intro = document.createElement('p'); intro.textContent = 'Start the game, then read and set values here. Changes are live; normal game saving still applies. Reloading resets temporary effects.'; body.append(intro);
  const status = document.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); body.append(status);
  function execute(callback) {
    try {
      if (!ready()) throw new Error('Start the game and wait for it to finish loading, then try again.');
      status.textContent = callback() || 'Applied to the current game.';
    } catch (error) { status.textContent = error.message || 'Unable to apply this control.'; }
  }
  let count = 0; const refreshers = [];
  function addField(container, f) {
    const label = document.createElement('label'); label.textContent = f.label;
    const row = document.createElement('div'); row.className = 'tools-row';
    const input = document.createElement('input'); input.type = 'number'; input.min = f.min; input.max = f.max; input.step = f.step; input.id = `game-value-${++count}`; label.htmlFor = input.id;
    let dirty = false; input.addEventListener('input', () => { dirty = true; });
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Set'; button.setAttribute('aria-label', `Set ${f.label}`);
    button.onclick = () => execute(() => {
      if (!input.value.trim() || !input.checkValidity() || !Number.isFinite(input.valueAsNumber)) throw new Error(`Enter ${f.min}–${f.max} in steps of ${f.step}.`);
      f.set(input.valueAsNumber);
      dirty = false; input.value = f.get();
      return `${f.label} updated.`;
    });
    row.append(input, button); container.append(label, row);
    const refresh = (force = false) => { if (dirty && !force) return; const v = f.get(); input.value = Number.isFinite(v) ? v : ''; };
    refreshers.push(refresh); try { if (ready()) refresh(); } catch { /* Game still loading. */ }
  }
  const refresh = document.createElement('button'); refresh.className = 'tools-action'; refresh.textContent = 'Read current values'; refresh.onclick = () => execute(() => { refreshers.forEach(fn => fn(true)); return 'Current values loaded.'; }); body.append(refresh);
  fields.forEach(f => addField(body, f));
  actions.forEach(a => { const button = document.createElement('button'); button.className = 'tools-action'; button.textContent = a.label; button.onclick = () => execute(a.run); body.append(button); });
  const link = document.createElement('a'); link.href = '/bookmarks/'; link.textContent = 'More game hacks →'; body.append(link);
  panel.addEventListener('toggle', () => { if (panel.open) execute(() => { refreshers.forEach(fn => fn()); return 'Ready. Choose a value or action.'; }); });
  document.body.append(panel);
})();
