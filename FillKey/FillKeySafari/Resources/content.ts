// Content script — runs in page context
// IMPORTANT: Only field metadata is sent. No credential values ever pass through here.

type FieldType = 'otp' | 'password' | 'username' | 'cardNumber' | 'cardExpiry' | 'cardCVV' | 'unknown';

function classifyField(input: HTMLInputElement): FieldType {
  const type = input.type.toLowerCase();
  const name = (input.name + ' ' + input.id + ' ' + input.autocomplete + ' ' + (input.placeholder || '')).toLowerCase();

  if (type === 'password') return 'password';

  if (/otp|one.?time|verification.?code|auth.?code|passcode|2fa|totp/i.test(name)) return 'otp';
  if (type === 'tel' && input.maxLength >= 4 && input.maxLength <= 8) return 'otp';
  if (/card.?number|cc.?num|credit.?card/i.test(name)) return 'cardNumber';
  if (/exp(iry|iration)|mm.?yy/i.test(name)) return 'cardExpiry';
  if (/cvv|cvc|security.?code/i.test(name)) return 'cardCVV';
  if (/email|username|user.?name|login/i.test(name) || input.autocomplete === 'username') return 'username';

  return 'unknown';
}

function getHostname(): string {
  return window.location.hostname;
}

function notifyBackground(fieldType: FieldType) {
  // Only send field type + domain — never any credential value
  browser.runtime.sendMessage({
    action: 'fieldFocused',
    fieldType,
    domain: getHostname()
  }).catch(() => {});
}

function observeInputFocus() {
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT') return;
    const input = target as HTMLInputElement;
    const fieldType = classifyField(input);
    if (fieldType !== 'unknown') {
      notifyBackground(fieldType);
    }
  });
}

// Fill handler — receives value from native layer via background script
browser.runtime.onMessage.addListener((message: unknown) => {
  if (typeof message !== 'object' || message === null) return;
  const msg = message as Record<string, unknown>;
  if (msg.action !== 'fill' || typeof msg.value !== 'string') return;

  const focused = document.activeElement as HTMLInputElement | null;
  if (!focused || focused.tagName !== 'INPUT') return;

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  nativeInputValueSetter?.call(focused, msg.value);
  focused.dispatchEvent(new Event('input', { bubbles: true }));
  focused.dispatchEvent(new Event('change', { bubbles: true }));
});

// Send current domain on load
browser.runtime.sendMessage({
  action: 'getDomain',
  domain: getHostname()
}).catch(() => {});

observeInputFocus();

export {};
