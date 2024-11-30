interface ToolbarOptions {
    highlight: () => void;
    translate: () => void;
}

class SelectionToolbar {
    private toolbar: HTMLElement;
    private options: ToolbarOptions;

    constructor(options: ToolbarOptions) {
        this.options = options;
        this.toolbar = this.createToolbar();
        document.body.appendChild(this.toolbar);
        this.attachListeners();
    }

    private createToolbar(): HTMLElement {
        const toolbar = document.createElement('div');
        toolbar.style.position = 'absolute';
        toolbar.style.display = 'none';
        toolbar.style.backgroundColor = '#1D2939';
        // toolbar.style.border = '1px solid #ccc';
        toolbar.style.borderRadius = '8px';
        toolbar.style.padding = '10px 2px';
        // toolbar.style.zIndex = '1000';
        toolbar.style.alignItems = 'center';
        toolbar.style.gap = '16px';

        const highlightBtn = this.createButton('Highlight', () => this.options.highlight());
        const translateBtn = this.createButton('Translate', () => this.options.translate());

        toolbar.appendChild(highlightBtn);
        toolbar.appendChild(this.createDivider());
        toolbar.appendChild(translateBtn);

        return toolbar;
    }

    private createButton(text: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        const img = document.createElement('img');

        // Set the image source
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.display = 'block'; // Prevent image from adding extra space
        img.style.margin = '0';
        img.style.padding = '0';

        if (text === 'Highlight') {
            img.src = chrome.runtime.getURL("edit-04.svg");
        } else {
            img.src = chrome.runtime.getURL("ion_language-sharp.svg");
        }

        button.appendChild(img);

        // Button styles
        button.style.display = 'inline-flex';
        button.style.flexDirection = 'row';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        button.style.margin = '0'; // Remove default margins
        button.style.backgroundColor = 'transparent';
        button.style.border = 'none';
        button.style.outline = 'none';
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';
        button.style.boxSizing = 'border-box'; // Include padding in width
        button.style.paddingLeft = '16px';
        button.style.paddingRight = '16px';

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
        return button;
    }

    private createDivider(): HTMLDivElement {
        const divider = document.createElement('div');
        divider.style.width = '1px';
        divider.style.height = '16px';
        divider.style.backgroundColor = '#6E7990';
        divider.style.display = 'inline-block';
        divider.style.margin = '0';
        divider.style.padding = '0';
        return divider;
    }
    private attachListeners(): void {
        document.addEventListener('mouseup', () => this.handleSelectionChange());
        document.addEventListener('mousedown', (e) => this.handleClickOutside(e));
    }

    private handleSelectionChange(): void {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            this.showToolbar(rect);
        }
    }

    private showToolbar(rect: DOMRect): void {
        this.toolbar.style.display = 'block';
        this.toolbar.style.left = `${rect.left + window.scrollX}px`;
        this.toolbar.style.top = `${rect.bottom + window.scrollY + 5}px`;
    }

    private hideToolbar(): void {
        this.toolbar.style.display = 'none';
    }

    private handleClickOutside(e: MouseEvent): void {
        if (!this.toolbar.contains(e.target as Node)) {
            this.hideToolbar();
        }
    }
}

// Implementation of toolbar options
const highlightSelection = (): void => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        range.surroundContents(span);
        // Clear the selection after highlighting
        selection.removeAllRanges();
    }
};
interface TranslationResponse {
    translation: string;
    success: boolean;
    error?: string;
}

const translateSelection = async (): Promise<void> => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    // Get all text from current page
    const pageText = document.body.innerText;

    // Get selected text and its position
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);

    // Calculate selection indices
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(document.body);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    // Create loading overlay
    const loadingOverlay = createLoadingOverlay();
    document.body.appendChild(loadingOverlay);

    try {
        const response = await callTranslationAPI(selectedText, pageText, start, end);
        if (response.success) {
            showTranslationPopup(response.translation, range.getBoundingClientRect());
        } else {
            showError(response.error || 'Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        showError('Translation service is unavailable');
    } finally {
        loadingOverlay.remove();
        selection.removeAllRanges();
    }
};

const createLoadingOverlay = (): HTMLElement => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(2px);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #1D2939;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(style);
    overlay.appendChild(spinner);
    return overlay;
};

const showTranslationPopup = (translation: string, rect: DOMRect): void => {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: absolute;
        left: ${rect.left + window.scrollX}px;
        top: ${rect.bottom + window.scrollY + 10}px;
        background: #1D2939;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
    `;

    popup.textContent = translation;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        position: absolute;
        right: 8px;
        top: 8px;
        background: none;
        border: none;
        color: #6E7990;
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
    `;
    closeBtn.onclick = () => popup.remove();

    popup.appendChild(closeBtn);
    document.body.appendChild(popup);

    // Close popup when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!popup.contains(e.target as Node)) {
            popup.remove();
        }
    });
};

const showError = (message: string): void => {
    const errorPopup = document.createElement('div');
    errorPopup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FF4D4F;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
    `;
    errorPopup.textContent = message;
    document.body.appendChild(errorPopup);
    setTimeout(() => errorPopup.remove(), 3000);
};
const callTranslationAPI = async (
    text: string,
    context: string,
    start: number,
    end: number
): Promise<TranslationResponse> => {
    try {
        const prompt = `
You are a translation expert. Translate the following text to Bangla (Bengali).
Keep the translation natural and contextual.

Context of the text: "${context.substring(Math.max(0, start - 100), Math.min(context.length, end + 100))}"

Text to translate: "${text}"

Provide only the translated text without any explanations or additional text.`;

        const response = await chrome.runtime.sendMessage({
            message: 'TRANSLATE',
            prompt: prompt
        });

        if (!response.success) {
            throw new Error(response.error);
        }

        return {
            translation: response.translation,
            success: true
        };
    } catch (error) {
        console.error('Translation API error:', error);
        return {
            translation: '',
            success: false,
            error: error instanceof Error ? error.message : 'Failed to connect to Ollama service'
        };
    }
};
// Create and initialize the toolbar
new SelectionToolbar({
    highlight: highlightSelection,
    translate: translateSelection
});
