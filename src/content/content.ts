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

const translateSelection = (): void => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
        const text = selection.toString();
        // Here you would typically send this text to a translation service
        alert(`Translation requested for: "${text}"`);
        // Clear the selection after action
        selection.removeAllRanges();
    }
};

// Create and initialize the toolbar
new SelectionToolbar({
    highlight: highlightSelection,
    translate: translateSelection
});
