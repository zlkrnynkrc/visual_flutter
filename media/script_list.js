const vscode = acquireVsCodeApi();

function filterWidgets(className, filterValue) {
    const filter = filterValue.toLowerCase();
    const widgetItems = document.querySelectorAll(`.${className}`);

    widgetItems.forEach(widget => {
        const text = widget.textContent || widget.innerText;
        widget.style.display = text.toLowerCase().includes(filter) ? '' : 'none';
    });
}
document.querySelectorAll('.widget-item').forEach(widget => {
    widget.setAttribute('draggable', true); // Ensure the item is draggable
    widget.addEventListener('dragstart', (event) => {
        const templateData = event.target.dataset.template;
        event.dataTransfer.setData('text/plain', templateData);
        vscode.postMessage({
            command: 'dragStart',
            widget: templateData
        });
    })
});
document.addEventListener('click', event => {
    const panel = document.getElementById('suggestionsPanel');
    if (!event.target.closest('.suggestions-panel') && !event.target.closest('input')) {
        panel.style.display = 'none';
    }
});