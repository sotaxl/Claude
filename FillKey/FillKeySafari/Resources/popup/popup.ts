// Popup script — shows credentials matching current domain
// No credential values are stored here; display only, fill triggers native layer

interface CredentialEntry {
  id: string;
  label: string;
  username?: string;
  type: string;
}

async function getCurrentDomain(): Promise<string> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  try {
    const url = new URL(tab.url ?? '');
    const parts = url.hostname.replace(/^www\./, '').split('.');
    return parts.slice(-2).join('.');
  } catch {
    return '';
  }
}

function iconFor(type: string): string {
  switch (type) {
    case 'totp': return '⏱';
    case 'password': return '🔒';
    case 'card': return '💳';
    case 'passkey': return '👤';
    default: return '🔑';
  }
}

async function init() {
  const domain = await getCurrentDomain();
  const badge = document.getElementById('domainBadge')!;
  badge.textContent = domain || 'Unknown site';

  // Request credential list from native handler (metadata only)
  try {
    const response = await browser.runtime.sendNativeMessage('com.fillkey.app', {
      action: 'getCredentialList',
      domain
    }) as { credentials: CredentialEntry[] };

    const list = document.getElementById('credList')!;
    const empty = document.getElementById('emptyState')!;
    const creds = response.credentials ?? [];

    if (creds.length === 0) {
      empty.style.display = 'block';
      return;
    }

    for (const cred of creds) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="cred-icon">${iconFor(cred.type)}</span>
        <div class="cred-info">
          <div class="cred-label">${escapeHtml(cred.label)}</div>
          ${cred.username ? `<div class="cred-sub">${escapeHtml(cred.username)}</div>` : ''}
        </div>
      `;
      li.addEventListener('click', () => {
        // Signal native layer to perform fill — value never travels through JS
        browser.runtime.sendNativeMessage('com.fillkey.app', {
          action: 'fill',
          credentialId: cred.id,
          domain
        });
        window.close();
      });
      list.appendChild(li);
    }
  } catch {
    document.getElementById('emptyState')!.style.display = 'block';
    document.getElementById('emptyState')!.textContent = 'Open FillKey app to get started.';
  }

  document.getElementById('openApp')?.addEventListener('click', () => {
    browser.tabs.create({ url: 'https://fillkey.app' });
  });
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c] ?? c));
}

init();
