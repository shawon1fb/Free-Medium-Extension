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
        toolbar.style.padding = '10px 18px';
        // toolbar.style.zIndex = '1000';
        toolbar.style.alignItems = 'center';
        toolbar.style.gap = '16px';

        const highlightBtn = this.createButton('Highlight', () => this.options.highlight());
        const translateBtn = this.createButton('Translate', () => this.options.translate());

        toolbar.appendChild(highlightBtn);
        toolbar.appendChild(translateBtn);

        return toolbar;
    }

    private createButton(text: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        // button.textContent = text;
        // button.style.marginRight = '5px';
        const img = document.createElement('img');

        // Set the image source
       // img.src = "https://cdn-icons-png.flaticon.com/512/15481/15481881.png";
        img.style.width = '20px';  // Adjust the size of the image as needed
        img.style.height = '20px';  // Adjust the size of the image as needed

        if (text === 'Highlight') {
            img.src = chrome.runtime.getURL("edit-04.svg");

            button.style.paddingLeft = '10px';
            button.style.paddingRight = '5px';
        } else {
            img.src = chrome.runtime.getURL("ion_language-sharp.svg");
            button.style.paddingLeft = '5px';
            button.style.paddingRight = '10px';
        }

        button.appendChild(img);

        // add button padding horizontally
        // button.style.paddingLeft = '10px';
        // button.style.paddingRight = '10px';

        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent hiding toolbar when clicking on it
            onClick();
        });
        return button;
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
