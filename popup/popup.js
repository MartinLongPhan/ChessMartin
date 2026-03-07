document.addEventListener("DOMContentLoaded", () => {
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
        opponentStats: "opponentStats",
        tacticalMap: "tacticalMap",
        mirrorBoard: "mirrorBoard",
        safeDrop: "safeDrop"
    };

    const elements = {};
    const storageKeys = Object.values(controls);

    Object.keys(controls).forEach(id => {
        elements[id] = document.getElementById(id);
    });

    const boardTheme = document.getElementById("boardTheme");
    const pieceSet   = document.getElementById("pieceSet");
    const arrowStyle = document.getElementById("arrowStyle"); // 👈 thêm

    // ===== LOAD SETTINGS =====
    chrome.storage.sync.get([...storageKeys, "boardTheme", "pieceSet", "arrowStyle"], (data) => {
        Object.keys(controls).forEach(id => {
            const storageKey = controls[id];
            if (elements[id]) {
                elements[id].checked = data[storageKey] || false;
            }
        });

        boardTheme.value = data.boardTheme || "default";
        pieceSet.value   = data.pieceSet   || "default";
        if (arrowStyle) arrowStyle.value = data.arrowStyle || "default"; // 👈 thêm
    });

    // ===== UPDATE SETTINGS =====
    function updateSettings() {
        const settings = {};
        Object.keys(controls).forEach(id => {
            settings[controls[id]] = elements[id].checked;
        });
        settings.boardTheme = boardTheme.value;
        settings.pieceSet   = pieceSet.value;
        settings.arrowStyle = arrowStyle?.value || "default"; // 👈 thêm

        chrome.storage.sync.set(settings);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            const url = tabs[0].url || '';
            if (!url.includes('chess.com')) return;
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", ...settings }, (response) => {
                if (chrome.runtime.lastError) return;
            });
        });
    }

    // Lắng nghe tất cả
    Object.values(elements).forEach(el => {
        if (el) el.addEventListener("change", updateSettings);
    });
    [boardTheme, pieceSet].forEach(el => el.addEventListener("change", updateSettings));
    if (arrowStyle) arrowStyle.addEventListener("change", updateSettings); // 👈 thêm

    // Lắng nghe storage thay đổi từ bên ngoài
    chrome.storage.onChanged.addListener((changes) => {
        Object.keys(controls).forEach(id => {
            const storageKey = controls[id];
            if (changes[storageKey] !== undefined && elements[id]) {
                elements[id].checked = changes[storageKey].newValue || false;
            }
        });
        if (changes.arrowStyle !== undefined && arrowStyle) {
            arrowStyle.value = changes.arrowStyle.newValue || "default"; // 👈 thêm
        }
    });
});