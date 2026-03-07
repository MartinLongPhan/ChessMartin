chrome.storage.sync.get([
    'cleanUI', 'hideLogo', 'hideAds', 'hideNotifications', 'hideGameMessages'
], (data) => {
    const rules = [];

    if (data.cleanUI) rules.push(`
        .sidebar-free-trial-button,
        a.sidebar-link[href*="/puzzles"],
        .sidebar-accordion-header.sidebar-link,
        a.sidebar-link[href*="/learn"] { display: none !important; }
    `);

    if (data.hideLogo) rules.push(`
        .header-logo { display: none !important; }
    `);

    if (data.hideAds) rules.push(`
        .advertisement,
        .ad-banner,
        .ad-container,
        [class*="advertisement"] { display: none !important; }
    `);
    if (data.hideNotifications) rules.push(`
        .notification-area,
        .notifications-menu,
        [class*="notification-bell"],
        [class*="notification-indicator"] { display: none !important; }
    `);

    if (data.hideGameMessages) rules.push(`
        .game-over-message-component,
        .game-rate-sport-message-component,
        .game-start-message-component,
        .chat-input-component,
        .chat-room-chat,
        .resizable-chat-area-component { display: none !important; }
    `);

    if (rules.length) {
        const style = document.createElement('style');
        style.textContent = rules.join('\n');
        document.documentElement.appendChild(style);
    }
});