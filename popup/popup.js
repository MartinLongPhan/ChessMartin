document.addEventListener("DOMContentLoaded", () => {

    const clockToggle = document.getElementById("clockToggle");
    const hideOpponentToggle = document.getElementById("hideOpponentToggle");
    const cleanUI = document.getElementById("cleanUI");
    const hideLogo = document.getElementById("hideLogo");
    const hideAds = document.getElementById("hideAds");
    const hideNotifications = document.getElementById("hideNotifications");
    const lowTimeAlert = document.getElementById("lowTimeAlert");
    const hideGameMessages = document.getElementById("hideGameMessages");
    const digitalClock = document.getElementById("digitalClock");
    const legalMoves = document.getElementById("legalMoves");

    // ===== LOAD ALL SETTINGS =====
    chrome.storage.sync.get(
        ["largerClock", "hideOpponent", "cleanUI",
            "hideLogo", "hideAds", "hideNotifications",
            "lowTimeAlert", "hideGameMessages", "digitalClock", "legalMoves"],
        (data) => {
            clockToggle.checked = data.largerClock || false;
            hideOpponentToggle.checked = data.hideOpponent || false;
            cleanUI.checked = data.cleanUI || false;
            hideLogo.checked = data.hideLogo || false;
            hideAds.checked = data.hideAds || false;
            hideNotifications.checked = data.hideNotifications || false;
            lowTimeAlert.checked = data.lowTimeAlert || false;
            hideGameMessages.checked = data.hideGameMessages || false;
            digitalClock.checked = data.digitalClock || false;
            legalMoves.checked = data.legalMoves || false;
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
            lowTimeAlert: lowTimeAlert.checked,
            hideGameMessages: hideGameMessages.checked,
            digitalClock: digitalClock.checked,
            legalMoves: legalMoves.checked,
        };

        chrome.storage.sync.set(settings);

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
        lowTimeAlert,
        hideGameMessages,
        digitalClock,
        legalMoves,
    ].forEach(el => el.addEventListener("change", updateSettings));

});
