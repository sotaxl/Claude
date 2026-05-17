(() => {
  'use strict';

  const TYPE_META = {
    'fake-urgency':       { icon: '⏱', label: 'Fake Urgency Timer'     },
    'fake-scarcity':      { icon: '📦', label: 'Fake Stock Scarcity'    },
    'fake-social-proof':  { icon: '👥', label: 'Fake Social Proof'      },
    'prechecked':         { icon: '☑',  label: 'Pre-checked Opt-in'     },
    'confirm-shaming':    { icon: '😔', label: 'Confirm-Shaming'        },
    'hidden-costs':       { icon: '💸', label: 'Hidden Cost Disclosure' },
    'forced-continuity':  { icon: '🔄', label: 'Forced Continuity'      },
  };

  const CIRCUMFERENCE = 2 * Math.PI * 50; // r=50 in SVG

  // ─── DOM refs ────────────────────────────────────────────────────────────
  const ringFill      = document.getElementById('ring-fill');
  const ringWrap      = document.querySelector('.score-ring-wrap');
  const scoreNumber   = document.getElementById('score-number');
  const scoreLabel    = document.getElementById('score-label');
  const sectionHeader = document.getElementById('section-header');
  const countChip     = document.getElementById('count-chip');
  const emptyState    = document.getElementById('empty-state');
  const findingsList  = document.getElementById('findings-list');
  const toggle        = document.getElementById('neutralize-toggle');
  const shareBtn      = document.getElementById('share-btn');

  // ─── Score helpers ───────────────────────────────────────────────────────
  function scoreLevel(score) {
    if (score === 0)  return 'clean';
    if (score <= 3)   return 'suspicious';
    if (score <= 8)   return 'manipulative';
    return 'toxic';
  }

  function scoreDescription(level) {
    return { clean: 'Clean', suspicious: 'Suspicious', manipulative: 'Manipulative', toxic: 'Toxic' }[level];
  }

  function renderScore(score, count) {
    const maxScore = 20;
    const progress = Math.min(score / maxScore, 1);
    const level    = scoreLevel(score);

    ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    ringWrap.dataset.level = level;
    scoreNumber.textContent = score;
    scoreLabel.textContent  = scoreDescription(level);

    sectionHeader.style.display = count > 0 ? 'flex' : 'none';
    emptyState.style.display    = count === 0 ? 'flex' : 'none';
    countChip.textContent       = count;
  }

  function renderFindings(findings) {
    // Deduplicate by type (show each category once)
    const seen = new Set();
    const unique = findings.filter(f => {
      if (seen.has(f.type)) return false;
      seen.add(f.type);
      return true;
    });

    findingsList.innerHTML = '';
    unique.forEach(({ type, severity }) => {
      const meta = TYPE_META[type] || { icon: '⚠', label: type };
      const li = document.createElement('li');
      li.className = 'finding-item';
      li.innerHTML = `
        <div class="finding-icon" data-severity="${severity}">${meta.icon}</div>
        <span class="finding-label">${meta.label}</span>
        <div class="finding-dot" data-severity="${severity}"></div>
      `;
      findingsList.appendChild(li);
    });
  }

  // ─── Load findings ───────────────────────────────────────────────────────
  async function loadFindings() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    // Try cached data from background first (instant)
    const cached = await browser.runtime.sendMessage({ action: 'getCachedFindings', tabId: tab.id });
    if (cached && cached.findings.length > 0) {
      applyData(cached);
    }

    // Then ask content script for live data
    try {
      const live = await browser.tabs.sendMessage(tab.id, { action: 'getFindings' });
      if (live) applyData(live);
    } catch {
      // Content script not injected yet (non-http pages, etc.)
      if (!cached || cached.findings.length === 0) {
        scoreNumber.textContent = '0';
        scoreLabel.textContent  = 'Clean';
        ringWrap.dataset.level  = 'clean';
        ringFill.style.strokeDashoffset = CIRCUMFERENCE;
        emptyState.style.display = 'flex';
      }
    }
  }

  function applyData({ findings, score }) {
    renderScore(score ?? 0, findings.length);
    renderFindings(findings);
  }

  // ─── Toggle ──────────────────────────────────────────────────────────────
  browser.storage.local.get(['neutralize'], ({ neutralize }) => {
    toggle.checked = neutralize !== false;
  });

  toggle.addEventListener('change', () => {
    browser.storage.local.set({ neutralize: toggle.checked });
    browser.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) {
        browser.tabs.sendMessage(tab.id, { action: 'setNeutralize', enabled: toggle.checked }).catch(() => {});
      }
    });
  });

  // ─── Share ───────────────────────────────────────────────────────────────
  shareBtn.addEventListener('click', async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const cached = await browser.runtime.sendMessage({ action: 'getCachedFindings', tabId: tab?.id });
    const score    = cached?.score ?? 0;
    const findings = cached?.findings ?? [];
    const level    = scoreDescription(scoreLevel(score));
    const types    = [...new Set(findings.map(f => TYPE_META[f.type]?.label ?? f.type))];

    const text = [
      `🔍 Clear scanned ${tab?.url ? new URL(tab.url).hostname : 'this page'}`,
      `Manipulation score: ${score} (${level})`,
      types.length > 0 ? `Detected: ${types.join(', ')}` : 'No dark patterns found.',
      '#darkpatterns #Clear',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      shareBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        shareBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          Share scan
        `;
      }, 1800);
    } catch {
      // Clipboard not available
    }
  });

  // ─── Init ────────────────────────────────────────────────────────────────
  loadFindings();
})();
