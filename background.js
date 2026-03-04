chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fetchBestMove') {
        fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(message.fen)}&multiPv=1`)
            .then(r => r.json())
            .then(data => {
                const best = data?.pvs?.[0]?.moves?.split(' ')[0];
                sendResponse({ move: best || null });
            })
            .catch(() => sendResponse({ move: null }));
        return true; // giữ kết nối async
    }
});