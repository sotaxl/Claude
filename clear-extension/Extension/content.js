(() => {
  'use strict';

  // ─── Constants ─────────────────────────────────────────────────────────────

  const SEVERITY = { LOW: 1, MEDIUM: 2, HIGH: 3 };

  const TYPE_META = {
    'fake-urgency':       { label: 'Fake Urgency Timer',        icon: '⏱', color: '#ef4444' },
    'fake-scarcity':      { label: 'Fake Stock Scarcity',       icon: '📦', color: '#ef4444' },
    'fake-social-proof':  { label: 'Fake Social Proof',         icon: '👥', color: '#f97316' },
    'prechecked':         { label: 'Pre-checked Opt-in',        icon: '☑', color: '#f97316' },
    'confirm-shaming':    { label: 'Confirm-Shaming',           icon: '😔', color: '#f97316' },
    'hidden-costs':       { label: 'Hidden Cost Disclosure',    icon: '💸', color: '#eab308' },
    'forced-continuity':  { label: 'Forced Continuity',         icon: '🔄', color: '#ef4444' },
  };

  const findings = [];
  let neutralizeEnabled = true;
  let scanComplete = false;

  // ─── Detectors ─────────────────────────────────────────────────────────────

  function detectFakeUrgency() {
    const results = [];

    const urgencySelectors = [
      '[class*="countdown"]', '[class*="count-down"]',
      '[class*="timer"]',     '[class*="time-left"]',
      '[id*="countdown"]',    '[id*="timer"]',
      '[data-countdown]',     '[data-timer]',
      '[class*="urgency"]',   '[class*="hurry"]',
    ];

    // Selector-based — highly reliable signal
    urgencySelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el._clearTagged && isVisible(el)) {
          results.push(make(el, 'fake-urgency', SEVERITY.HIGH));
        }
      });
    });

    // Text-based — catches inline countdown text
    const countdownRe   = /\b\d{1,2}:\d{2}(:\d{2})?\b/;
    const urgencyTextRe = /\b(offer\s+ends?|deal\s+ends?|limited[\s-]time|ends?\s+in|expires?\s+in|time\s+running\s+out|today\s+only|flash\s+sale|act\s+now)\b/i;

    walkText(node => {
      const text = node.textContent.trim();
      if (text.length > 120) return;
      if (countdownRe.test(text) || urgencyTextRe.test(text)) {
        const el = node.parentElement;
        if (el && !el._clearTagged && isVisible(el) && notScript(el)) {
          results.push(make(el, 'fake-urgency', SEVERITY.HIGH));
        }
      }
    });

    return results;
  }

  function detectFakeScarcity() {
    const scarcityPatterns = [
      { re: /only\s+\d+\s+(items?\s+)?left(\s+in\s+stock)?/i,                type: 'fake-scarcity' },
      { re: /(almost|nearly|running)\s+(gone|out)/i,                          type: 'fake-scarcity' },
      { re: /selling\s+(out|fast|quickly)/i,                                  type: 'fake-scarcity' },
      { re: /limited\s+(stock|quantity|quantities|availability)/i,             type: 'fake-scarcity' },
      { re: /\d+\s+people\s+(are\s+)?(viewing|watching|looking\s+at\s+this)/i, type: 'fake-social-proof' },
      { re: /\d+\s+(shoppers?\s+(have\s+this|viewing)|in\s+(their\s+)?carts?)/i, type: 'fake-social-proof' },
      { re: /\d+\s+sold\s+in\s+(the\s+)?(last|past)\s+\d+\s+hours?/i,       type: 'fake-social-proof' },
      { re: /in\s+high\s+demand/i,                                            type: 'fake-social-proof' },
    ];

    const results = [];
    walkText(node => {
      const text = node.textContent.trim();
      if (text.length > 160) return;
      for (const { re, type } of scarcityPatterns) {
        if (re.test(text)) {
          const el = node.parentElement;
          if (el && !el._clearTagged && isVisible(el) && notScript(el)) {
            results.push(make(el, type, SEVERITY.HIGH));
          }
          break;
        }
      }
    });
    return results;
  }

  function detectPreChecked() {
    const results = [];
    const marketingRe = /newsletter|email\s+me|marketing|offers?|promotions?|updates?|special\s+deals?|subscribe|sms|text\s+message|opt.?in|third.?part/i;

    document.querySelectorAll('input[type="checkbox"]:checked').forEach(el => {
      if (el._clearTagged) return;
      const labelText = getLabelText(el);
      if (marketingRe.test(labelText)) {
        const wrapper = el.closest('label') || el.parentElement;
        results.push({ ...make(wrapper || el, 'prechecked', SEVERITY.MEDIUM), checkboxEl: el });
      }
    });
    return results;
  }

  function detectConfirmShaming() {
    const shamingRe = [
      /no\s+thanks?,?\s+i\s+(hate|don'?t\s+(want|need|like)|prefer\s+not)/i,
      /no\s+thanks?,?\s+i\s+(don'?t\s+)?(want\s+to\s+)?(save|get|have|enjoy|take\s+advantage)/i,
      /i\s+don'?t\s+want\s+(to\s+)?(save|be\s+notified|improve|get|free|help|discounts?|deals?|better)/i,
      /no,?\s+i\s+(hate|don'?t\s+want)\s+(deals?|savings?|discounts?|free)/i,
      /no\s+thanks,\s+i('?ll)?\s+(pay\s+)?full\s+price/i,
    ];

    const results = [];
    document.querySelectorAll('a, button, [role="button"], span').forEach(el => {
      if (el._clearTagged) return;
      const text = el.textContent.trim();
      if (text.length > 120) return;
      for (const re of shamingRe) {
        if (re.test(text)) {
          results.push(make(el, 'confirm-shaming', SEVERITY.MEDIUM));
          break;
        }
      }
    });
    return results;
  }

  function detectHiddenCosts() {
    const costPatterns = [
      /\+\s*(tax(es)?|fees?|service\s+fee|shipping|handling)/i,
      /before\s+(taxes?|fees?|additional)/i,
      /excl(uding|\.)\s*(vat|gst|tax)/i,
      /additional\s+(charges?|fees?)\s+(may\s+)?apply/i,
      /\*+\s*(some\s+)?conditions?\s+apply/i,
    ];

    const results = [];
    walkText(node => {
      const text = node.textContent.trim();
      if (text.length > 120) return;
      for (const re of costPatterns) {
        if (re.test(text)) {
          const el = node.parentElement;
          if (el && !el._clearTagged && notScript(el)) {
            results.push(make(el, 'hidden-costs', SEVERITY.MEDIUM));
          }
          break;
        }
      }
    });
    return results;
  }

  function detectForcedContinuity() {
    const continuityPatterns = [
      /free\s+trial.{0,40}then\s+[\$£€]?\d/i,
      /auto.?renew(s|al)?/i,
      /charged\s+automatically/i,
      /recurring\s+(charge|billing|payment)/i,
      /billed\s+(monthly|annually|yearly|weekly)\s+(at|starting)/i,
    ];

    const results = [];
    walkText(node => {
      const text = node.textContent.trim();
      if (text.length > 300) return;
      for (const re of continuityPatterns) {
        if (re.test(text)) {
          const el = node.parentElement;
          if (el && !el._clearTagged && notScript(el)) {
            results.push(make(el, 'forced-continuity', SEVERITY.HIGH));
          }
          break;
        }
      }
    });
    return results;
  }

  // ─── Neutralizers ──────────────────────────────────────────────────────────

  function tagElement({ el, type, severity }) {
    if (!el || !el.isConnected) return;
    el.setAttribute('data-clear-type', type);
    el.style.setProperty('outline', `2px solid ${severityColor(severity)}`, 'important');
    el.style.setProperty('outline-offset', '3px', 'important');
    el.style.setProperty('border-radius', '3px', 'important');

    const badge = document.createElement('span');
    badge.className = 'clear-badge';
    badge.dataset.severity = severity;
    const meta = TYPE_META[type] || { icon: '⚠', label: type };
    badge.textContent = `${meta.icon} ${meta.label}`;
    badge.title = 'Clear: dark pattern detected';
    el.insertAdjacentElement('afterend', badge);
  }

  function neutralizePreChecked(finding) {
    if (!neutralizeEnabled || !finding.checkboxEl) return;
    finding.checkboxEl.checked = false;
    finding.checkboxEl.setAttribute('data-clear-unchecked', 'true');
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  function make(el, type, severity) {
    el._clearTagged = true;
    return { el, type, severity };
  }

  function walkText(cb) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    let node;
    while ((node = walker.nextNode())) cb(node);
  }

  function isVisible(el) {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
  }

  function notScript(el) {
    const tag = el.tagName;
    return tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'NOSCRIPT';
  }

  function getLabelText(input) {
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label) return label.textContent;
    }
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent;
    return input.parentElement?.textContent ?? '';
  }

  function severityColor(s) {
    return s === SEVERITY.HIGH ? '#ef4444' : s === SEVERITY.MEDIUM ? '#f97316' : '#eab308';
  }

  function injectStyles() {
    if (document.getElementById('clear-ext-styles')) return;
    const style = document.createElement('style');
    style.id = 'clear-ext-styles';
    style.textContent = `
      .clear-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif !important;
        font-weight: 600 !important;
        color: #fff !important;
        background: #ef4444;
        padding: 2px 8px 2px 6px !important;
        border-radius: 100px !important;
        margin: 0 4px !important;
        vertical-align: middle !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        white-space: nowrap !important;
        line-height: 1.6 !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
      }
      .clear-badge[data-severity="2"] { background: #f97316 !important; }
      .clear-badge[data-severity="1"] { background: #eab308 !important; }
    `;
    document.head.appendChild(style);
  }

  function scoreOf(list) {
    return list.reduce((acc, f) => acc + f.severity, 0);
  }

  function toReport(f) {
    return { type: f.type, label: TYPE_META[f.type]?.label ?? f.type, severity: f.severity };
  }

  // ─── Core scan ─────────────────────────────────────────────────────────────

  function runScan() {
    if (!document.body) return;
    injectStyles();

    const newFindings = [
      ...detectFakeUrgency(),
      ...detectFakeScarcity(),
      ...detectPreChecked(),
      ...detectConfirmShaming(),
      ...detectHiddenCosts(),
      ...detectForcedContinuity(),
    ];

    newFindings.forEach(f => {
      findings.push(f);
      tagElement(f);
      if (f.type === 'prechecked') neutralizePreChecked(f);
    });

    if (newFindings.length > 0 || !scanComplete) {
      scanComplete = true;
      browser.runtime.sendMessage({
        action: 'updateBadge',
        count: findings.length,
        score: scoreOf(findings),
        findings: findings.map(toReport),
      }).catch(() => {});
    }
  }

  // ─── Bootstrap ─────────────────────────────────────────────────────────────

  browser.storage.local.get(['neutralize'], result => {
    neutralizeEnabled = result.neutralize !== false;
    runScan();

    // Re-scan on dynamic DOM mutations (React / SPA sites)
    let debounce;
    new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(runScan, 600);
    }).observe(document.body, { childList: true, subtree: true });
  });

  browser.runtime.onMessage.addListener((msg, _sender, respond) => {
    if (msg.action === 'getFindings') {
      respond({ findings: findings.map(toReport), score: scoreOf(findings) });
      return true;
    }
    if (msg.action === 'setNeutralize') {
      neutralizeEnabled = msg.enabled;
      browser.storage.local.set({ neutralize: msg.enabled });
    }
  });
})();
