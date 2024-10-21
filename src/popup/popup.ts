interface StorageItems {
    patterns: string;
}

class PopupManager {
    private statusElement: HTMLElement | null;
    private customPatternsElement: HTMLTextAreaElement | null;
    private saveButton: HTMLElement | null;

    constructor() {
        this.statusElement = document.getElementById('status');
        this.customPatternsElement = document.getElementById('custom_patterns') as HTMLTextAreaElement;
        this.saveButton = document.getElementById('save');

        this.init();
    }

    private init(): void {
        document.addEventListener('DOMContentLoaded', this.restoreOptions.bind(this));
        this.saveButton?.addEventListener('click', this.saveOptions.bind(this));
    }

    private saveOptions(): void {
        const patterns = this.customPatternsElement?.value || '';

        if ( patterns !== '') {
            chrome.storage.sync.set(
                {patterns},
                () => {
                    this.updateStatus('Options saved.', 'success');
                    this.notifyBackgroundScript();
                }
            );
        }
    }

    private restoreOptions(): void {
        chrome.storage.sync.get(
            { patterns: '' },
            (items: { [key: string]: any }) => {
                if (this.customPatternsElement) {
                    this.customPatternsElement.value = items.patterns as string || '';
                }
            }
        );
    }

    private updateStatus(message: string, type: 'success' | 'error' = 'success'): void {
        if (this.statusElement) {
            this.statusElement.textContent = message;
            this.statusElement.className = `status ${type}`;
            setTimeout(() => {
                this.statusElement!.textContent = '';
                this.statusElement!.className = 'status';
            }, 2000);
        }
    }

    private notifyBackgroundScript(): void {
        chrome.runtime.sendMessage({ message: "settingsSaved" });
    }
}

// Initialize the popup
new PopupManager();
