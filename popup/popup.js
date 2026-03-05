document.addEventListener("DOMContentLoaded", () => {
    // Tạo một bản đồ (Map) giữa ID trong HTML và Key trong Storage
    const controls = {
        clockToggle: "largerClock",
        hideOpponentToggle: "hideOpponent",
        cleanUI: "cleanUI",
        hideLogo: "hideLogo",
        hideAds: "hideAds",
        hideNotifications: "hideNotifications",
        lowTimeAlert: "lowTimeAlert",
        hideGameMessages: "hideGameMessages",
        digitalClock: "digitalClock",
        legalMoves: "legalMoves",
        opponentStats: "opponentStats" // Key mới của bạn
    };

    const elements = {};
    const storageKeys = Object.values(controls);

    // Tự động lấy Element và gán sự kiện
    Object.keys(controls).forEach(id => {
        elements[id] = document.getElementById(id);
    });

    // ===== LOAD SETTINGS =====
    chrome.storage.sync.get(storageKeys, (data) => {
        Object.keys(controls).forEach(id => {
            const storageKey = controls[id];
            if (elements[id]) {
                elements[id].checked = data[storageKey] || false;
            }
        });
    });

    // ===== UPDATE SETTINGS =====
    function updateSettings() {
        const settings = {};
        Object.keys(controls).forEach(id => {
            const storageKey = controls[id];
            settings[storageKey] = elements[id].checked;
        });

        chrome.storage.sync.set(settings);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "updateSettings",
                ...settings
            });
        });
    }

    // Lắng nghe tất cả
    Object.values(elements).forEach(el => {
        if (el) el.addEventListener("change", updateSettings);
    });
});