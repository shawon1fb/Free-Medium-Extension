import {knownMediumDomainPatterns} from "./constanst/donains.urls";

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
                ...knownMediumDomainPatterns
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
                ...knownMediumDomainPatterns
            ],
        },
    ],
};

const setUpContextMenus = (): void => {
    chrome.storage.sync.get(
        {patterns: ''},
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
    async (request: { message: string, prompt?: string }, sender, sendResponse) => {
        if (request.message === "settingsSaved") {
            chrome.contextMenus.removeAll(() => {
                setUpContextMenus();
            });
        } else if (request.message === "TRANSLATE") {
            console.log(request)

            const client = new Ollama();
            if (!request.prompt) return
            try {
                const response = await client.makeOllamaRequest(request.prompt as string);
                console.log("Ollama response:", response);
                sendResponse({success: true, translation: response.response})
            } catch (e) {
                console.log("Ollama error:", e);
                sendResponse({success: false,  error: (e as Error).message })
            }

            return true; // Will respond asynchronously
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
 interface OllamaResponse {
    response: string;
    done: boolean;
}

 class Ollama {
    private readonly baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }

    private validateOllamaResponse(data: unknown): OllamaResponse {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response: data is not an object');
        }

        const response = (data as any).response;
        const done = (data as any).done;

        if (typeof response !== 'string') {
            throw new Error('Invalid response: response is not a string');
        }
        if (typeof done !== 'boolean') {
            throw new Error('Invalid response: done is not a boolean');
        }

        return {
            response,
            done
        };
    }

    async makeOllamaRequest(prompt: string, model: string = "llama3.2:latest"): Promise<OllamaResponse> {
        try {
            console.log("Making Ollama request...");
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false
                })
            });
            console.log("Ollama request made.");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            return this.validateOllamaResponse(rawData);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to make Ollama request: ${error.message}`);
            }
            throw new Error('Failed to make Ollama request: Unknown error');
        }
    }
}
