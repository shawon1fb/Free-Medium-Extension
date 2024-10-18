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
        toolbar.style.backgroundColor = '#f0f0f0';
        toolbar.style.border = '1px solid #ccc';
        toolbar.style.borderRadius = '4px';
        toolbar.style.padding = '5px';
        toolbar.style.zIndex = '1000';

        const highlightBtn = this.createButton('Highlight', () => this.options.highlight());
        const translateBtn = this.createButton('Translate', () => this.options.translate());

        toolbar.appendChild(highlightBtn);
        toolbar.appendChild(translateBtn);

        return toolbar;
    }

    private createButton(text: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.marginRight = '5px';
        button.addEventListener('click', onClick);
        return button;
    }

    private attachListeners(): void {
        document.addEventListener('selectionchange', () => this.handleSelectionChange());
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    private handleSelectionChange(): void {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            this.showToolbar(rect);
        } else {
            this.hideToolbar();
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
    if (selection) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        range.surroundContents(span);
    }
};

const translateSelection = (): void => {
    const selection = window.getSelection();
    if (selection) {
        const text = selection.toString();
        // Here you would typically send this text to a translation service
        // For this example, we'll just show an alert
        alert(`Translation requested for: "${text}"`);
        // In a real implementation, you might do something like:
        // chrome.runtime.sendMessage({action: 'translate', text: text}, response => {
        //     console.log('Translated text:', response.translatedText);
        // });
    }
};

// Create and initialize the toolbar
new SelectionToolbar({
    highlight: highlightSelection,
    translate: translateSelection
});