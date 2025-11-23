// SPA Fallback for Render Static Sites
(function () {
    var path = window.location.pathname;

    // If we're on /index.html but should be on a route
    if (path === '/index.html') {
        var actualPath = window.location.search.replace('?redirect=', '') || '/';
        window.history.replaceState(null, '', actualPath);
    }
})();