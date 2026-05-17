// Keyed by tabId: { findings, score }
const tabData = new Map();

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action !== 'updateBadge' || !sender.tab) return;

  const tabId = sender.tab.id;
  tabData.set(tabId, { findings: msg.findings, score: msg.score });

  const count = msg.count;

  browser.action.setBadgeText({
    text: count > 0 ? String(count) : '',
    tabId,
  });

  browser.action.setBadgeBackgroundColor({
    color: scoreColor(msg.score),
    tabId,
  });
});

// Clean up on tab close
browser.tabs.onRemoved.addListener(tabId => tabData.delete(tabId));

// Popup asks for cached data before content script responds
browser.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg.action === 'getCachedFindings' && msg.tabId != null) {
    respond(tabData.get(msg.tabId) ?? { findings: [], score: 0 });
    return true;
  }
});

function scoreColor(score) {
  if (score >= 9)  return '#ef4444'; // red
  if (score >= 5)  return '#f97316'; // orange
  if (score >= 2)  return '#eab308'; // yellow
  return '#22c55e';                   // green
}
