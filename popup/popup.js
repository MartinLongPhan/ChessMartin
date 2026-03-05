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

    const boardTheme = document.getElementById("boardTheme");
    const pieceSet   = document.getElementById("pieceSet");

    // ===== LOAD SETTINGS =====
    chrome.storage.sync.get([...storageKeys, "boardTheme", "pieceSet"], (data) => {
        Object.keys(controls).forEach(id => {
            const storageKey = controls[id];
            if (elements[id]) {
                elements[id].checked = data[storageKey] || false;
            }
        });
    
        boardTheme.value = data.boardTheme || "default";
        pieceSet.value   = data.pieceSet   || "default";
    });

    // ===== UPDATE SETTINGS =====
    function updateSettings() {
        const settings = {};
        Object.keys(controls).forEach(id => {
            settings[controls[id]] = elements[id].checked;
        });
        settings.boardTheme = boardTheme.value;
        settings.pieceSet   = pieceSet.value;

        chrome.storage.sync.set(settings);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", ...settings });
        });
    }

    // Lắng nghe tất cả
    Object.values(elements).forEach(el => {
        if (el) el.addEventListener("change", updateSettings);
    });

    [boardTheme, pieceSet].forEach(el => el.addEventListener("change", updateSettings));
});