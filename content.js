// FULLSCREEN BUTTON - always visible

const btn = document.createElement("button");
btn.innerText = "⛶";
btn.title = "Fullscreen";
btn.style.position = "fixed";
btn.style.top = "15px";
btn.style.right = "15px";
btn.style.zIndex = "9999";
btn.style.padding = "8px 12px";
btn.style.fontSize = "16px";
btn.style.borderRadius = "6px";
btn.style.border = "none";
btn.style.cursor = "pointer";
btn.style.backgroundColor = "#2b2b2b";
btn.style.color = "white";
btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

btn.onclick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
};

document.body.appendChild(btn);

console.log("MartinChessVN loaded");


// ===== APPLY SETTINGS FUNCTION =====
function applySettings(settings) {

    const clocks = document.querySelectorAll(".clock-time-monospace");

    clocks.forEach(clock => {
        if (settings.largerClock) {
            clock.style.fontSize = "40px";
            clock.style.fontWeight = "bold";

        } else {
            clock.style.fontSize = "";
            clock.style.fontWeight = "";
        }
    });


    // ===== Hide Opponent Block =====
    toggleOpponentVisibility(settings.hideOpponent);

}


// ===== Hide Opponent Block (Clean Version) =====
function toggleOpponentVisibility(hide) {

    const username = document.querySelector('[data-test-element="user-tagline-username"]');

    if (!username) return;

    // Tìm block lớn bao toàn bộ avatar + tên + rating + flag
    const opponentBlock = username.closest('[class*="player"]');

    if (opponentBlock) {
        opponentBlock.style.display = hide ? "none" : "";
    }
}


// ===== LOAD SETTINGS ON PAGE LOAD =====
chrome.storage.sync.get(
    ["largerClock", "hideOpponent"],
    (data) => {
        applySettings(data);
    }
);


// ===== LISTEN FOR REAL-TIME UPDATE =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateSettings") {
        applySettings(message);
    }
});



