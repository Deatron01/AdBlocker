// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LEARN_NEW_AD_DOMAIN' && message.domain) {
        const targetDomain = message.domain;

        // Lekérdezzük a jelenlegi dinamikus szabályokat
        chrome.declarativeNetRequest.getDynamicRules(existingRules => {
            
            // Megnézzük, hogy a domain szerepel-e már a listán
            const isAlreadyBlocked = existingRules.some(rule => 
                rule.condition.urlFilter === `||${targetDomain}`
            );

            if (isAlreadyBlocked) {
                return; // Már ismerjük, nincs dolgunk
            }

            // Generálunk egy új, egyedi ID-t a szabálynak (10000 felett, hogy ne akadjon össze a rules.json-nel)
            const newId = existingRules.length > 0 
                ? Math.max(...existingRules.map(r => r.id)) + 1 
                : 10000;

            // Hozzáadjuk a szabályt
            chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: newId,
                    priority: 2,
                    action: { type: "block" },
                    condition: {
                        urlFilter: `||${targetDomain}`,
                        resourceTypes: ["sub_frame", "script", "image", "xmlhttprequest"]
                    }
                }]
            }).then(() => {
                console.log(`🛡️ [Background] Új hirdetési domain megtanulva és blokkolva: ${targetDomain}`);
            });
        });
    }
});