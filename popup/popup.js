document.addEventListener("DOMContentLoaded", () => {

    const clockToggle = document.getElementById("clockToggle");
    const hideOpponentToggle = document.getElementById("hideOpponentToggle");

    // Load state
    chrome.storage.sync.get(
        ["largerClock", "hideOpponent"],
        (data) => {
            clockToggle.checked = data.largerClock || false;
            hideOpponentToggle.checked = data.hideOpponent || false;
        }
    );

    function updateSettings() {

        const settings = {
            largerClock: clockToggle.checked,
            hideOpponent: hideOpponentToggle.checked
        };

        // lưu lại
        chrome.storage.sync.set(settings);

        // gửi realtime sang content.js
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "updateSettings",
                ...settings
            });
        });
    }

    // Khi tick -> chạy ngay
    clockToggle.addEventListener("change", updateSettings);
    hideOpponentToggle.addEventListener("change", updateSettings);

});