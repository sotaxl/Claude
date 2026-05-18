// Background service worker — message broker between content script and native layer
// SECURITY: No credential values pass through here. Only field metadata + domain.

browser.runtime.onMessage.addListener(async (message: unknown, sender) => {
  if (typeof message !== 'object' || message === null) return;
  const msg = message as Record<string, unknown>;

  if (msg.action === 'fieldFocused' || msg.action === 'getDomain') {
    // Forward field focus metadata to native extension handler
    // This tells the keyboard extension which field type is active
    await browser.runtime.sendNativeMessage('com.fillkey.app', msg);
  }
});

export {};
