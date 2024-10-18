interface ContextMenuCommand {
    title: string;
    type: chrome.contextMenus.ContextItemType;  // Changed from chrome.contextMenus.ItemType
    id: string;
    targetUrlPatterns?: string[];
    documentUrlPatterns?: string[];
}

interface ContextMenuContents {
    link: ContextMenuCommand[];
    page: ContextMenuCommand[];
}

const CONTEXT_MENU_CONTENTS: ContextMenuContents = {
    link: [
        {
            title: 'Open in Freedium',
            type: 'normal',
            id: 'freedium-link',
            targetUrlPatterns: [
                '*://*.medium.com/*',
                '*://medium.com/*',
                '*://lifewithoutchildren.com/*',
            ],
        },
    ],
    page: [
        {
            title: 'Read via Freedium',
            type: 'normal',
            id: 'freedium-page',
            documentUrlPatterns: [
                '*://*.medium.com/*',
                '*://medium.com/*',
                '*://lifewithoutchildren.com/*',
            ],
        },
    ],
};

const setUpContextMenus = (): void => {
    chrome.storage.sync.get(
        { patterns: '' },
        (items: { [key: string]: any }) => {  // Changed type to match chrome.storage.sync.get
            const patterns = items.patterns as string;
            const patternsArray = patterns.replace(/\r/g, '').split('\n').filter(p => p).map(p => p.trim());

            CONTEXT_MENU_CONTENTS.link.forEach((command) => {
                chrome.contextMenus.create({
                    title: command.title,
                    type: command.type as chrome.contextMenus.ContextItemType,
                    id: command.id,
                    targetUrlPatterns: command.targetUrlPatterns?.concat(patternsArray),
                    contexts: ['link'],
                });
            });
            CONTEXT_MENU_CONTENTS.page.forEach((command) => {
                chrome.contextMenus.create({
                    title: command.title,
                    type: command.type as chrome.contextMenus.ContextItemType,
                    id: command.id,
                    documentUrlPatterns: command.documentUrlPatterns?.concat(patternsArray),
                    contexts: ['page'],
                });
            });
        }
    );
};

const openInFreedium = (url: string | undefined, newTab: boolean): void => {
    if (!url) {
        return;
    }

    const freediumUrl = 'https://freedium.cfd/' + url;

    if (newTab) {
        chrome.tabs.create({
            url: freediumUrl,
        });
    } else {
        chrome.tabs.update({
            url: freediumUrl,
        });
    }
};

chrome.runtime.onInstalled.addListener(() => {
    setUpContextMenus();
});

chrome.runtime.onMessage.addListener(
    (request: { message: string }, sender, sendResponse) => {
        if (request.message === "settingsSaved") {
            chrome.contextMenus.removeAll(() => {
                setUpContextMenus();
            });
        }
    }
);

chrome.contextMenus.onClicked.addListener((item: chrome.contextMenus.OnClickData) => {
    switch (item.menuItemId) {
        case 'freedium-link':
            openInFreedium(item.linkUrl, true);
            break;
        case 'freedium-page':
            openInFreedium(item.pageUrl, false);
            break;
    }
});
