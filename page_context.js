// page_context.js

(function () {

    const originalOpen = window.open;
    const originalAssign = window.location.assign;
    const originalReplace = window.location.replace;

    function getBaseDomain(hostname) {

        const parts = hostname.split('.');

        if (parts.length <= 2) {
            return hostname;
        }

        return parts.slice(-2).join('.');
    }

    function isDifferentDomain(url) {

        try {

            const currentDomain =
                getBaseDomain(window.location.hostname);

            const target =
                new URL(url, window.location.href);

            const targetDomain =
                getBaseDomain(target.hostname);

            return currentDomain !== targetDomain;

        } catch {

            return true;
        }
    }

    // =========================
    // window.open blokkolás
    // =========================

    window.open = function (url, name, specs) {

        if (url && isDifferentDomain(url)) {

            console.warn(
                "🚫 Popup blokkolva:",
                url
            );

            return null;
        }

        return originalOpen.call(
            window,
            url,
            name,
            specs
        );
    };

    // =========================
    // location.assign blokkolás
    // =========================

    window.location.assign = function (url) {

        if (isDifferentDomain(url)) {

            console.warn(
                "🚫 Redirect blokkolva:",
                url
            );

            return;
        }

        return originalAssign.call(
            window.location,
            url
        );
    };

    // =========================
    // location.replace blokkolás
    // =========================

    window.location.replace = function (url) {

        if (isDifferentDomain(url)) {

            console.warn(
                "🚫 Replace redirect blokkolva:",
                url
            );

            return;
        }

        return originalReplace.call(
            window.location,
            url
        );
    };

    // =========================
    // target=_blank linkek
    // =========================

    document.addEventListener(
        "click",
        function (event) {

            const link =
                event.target.closest("a");

            if (!link) {
                return;
            }

            const href = link.href;

            if (
                link.target === "_blank" &&
                href &&
                isDifferentDomain(href)
            ) {

                event.preventDefault();
                event.stopPropagation();

                console.warn(
                    "🚫 Külső új tab blokkolva:",
                    href
                );
            }
        },
        true
    );

    // =========================
    // Gyors automatikus redirect figyelés
    // =========================

    let lastUrl = location.href;

    setInterval(() => {

        if (location.href !== lastUrl) {

            if (isDifferentDomain(location.href)) {

                console.warn(
                    "🚫 Gyanús redirect visszafordítva:",
                    location.href
                );

                history.back();
            }

            lastUrl = location.href;
        }

    }, 100);

})();

// page_context.js
(function() {
    const originalWindowOpen = window.open;

    window.open = function(url, name, specs) {
        if (!url || url === 'about:blank') {
            console.warn("🛡️ Üres felugró ablak blokkolva.");
            // Értesítjük a kiterjesztést a blokkolásról
            window.postMessage({ from: "AD_BLOCKER_PAGE_CONTEXT", type: "POPUP_BLOCKED" }, "*");
            return null;
        }

        const blacklistedKeywords = ['ad', 'click', 'pop', 'track', 'traffic', 'affiliate', 'happyleafmotion'];
        const shouldBlock = blacklistedKeywords.some(keyword => url.toLowerCase().includes(keyword));

        if (shouldBlock) {
            console.warn(`🛡️ Külső új tab blokkolva: ${url}`);
            // Értesítjük a kiterjesztést a blokkolásról
            window.postMessage({ from: "AD_BLOCKER_PAGE_CONTEXT", type: "POPUP_BLOCKED" }, "*");
            return null;
        }

        return originalWindowOpen.apply(this, arguments);
    };
})();