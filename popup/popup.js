document.addEventListener("DOMContentLoaded", () => {

    const clockToggle = document.getElementById("clockToggle");
    const hideOpponentToggle = document.getElementById("hideOpponentToggle");
    const cleanUI = document.getElementById("cleanUI");
    const hideLogo = document.getElementById("hideLogo");
    const hideAds = document.getElementById("hideAds");
    const hideNotifications = document.getElementById("hideNotifications");

    // ===== LOAD ALL SETTINGS =====
    chrome.storage.sync.get(
        ["largerClock", "hideOpponent", "cleanUI", "hideLogo", "hideAds", "hideNotifications"],
        (data) => {
            clockToggle.checked = data.largerClock || false;
            hideOpponentToggle.checked = data.hideOpponent || false;
            cleanUI.checked = data.cleanUI || false;
            hideLogo.checked = data.hideLogo || false;
            hideAds.checked = data.hideAds || false;
            hideNotifications.checked = data.hideNotifications || false;
        }
    );

    // ===== GỬI TẤT CẢ SETTINGS MỖI KHI CÓ THAY ĐỔI =====
    function updateSettings() {
        const settings = {
            largerClock: clockToggle.checked,
            hideOpponent: hideOpponentToggle.checked,
            cleanUI: cleanUI.checked,
            hideLogo: hideLogo.checked,
            hideAds: hideAds.checked,
            hideNotifications: hideNotifications.checked,
        };

        // Lưu vào storage
        chrome.storage.sync.set(settings);

        // Gửi realtime sang content.js
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "updateSettings",
                ...settings
            });
        });
    }

    // ===== LẮNG NGHE THAY ĐỔI =====
    [
        clockToggle,
        hideOpponentToggle,
        cleanUI,
        hideLogo,
        hideAds,
        hideNotifications,
    ].forEach(el => el.addEventListener("change", updateSettings));

});