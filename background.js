chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchStats') {
        const { username } = request;
        Promise.all([
            fetch(`https://api.chess.com/pub/player/${username}/stats`).then(r => r.ok ? r.json() : null),
            fetch(`https://api.chess.com/pub/player/${username}`).then(r => r.ok ? r.json() : null)
        ])
        .then(([stats, profile]) => sendResponse({ stats, profile }))
        .catch(() => sendResponse(null));
        return true; // giữ channel mở cho async
    }
});