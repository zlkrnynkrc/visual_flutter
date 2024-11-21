const {getPermissionsList,getPermissionsMap} = require('./permissin-list');

class PermissionProvider {
    constructor(manifestService) {
        this.manifestService = manifestService; 
        this.permissionsMap = getPermissionsMap();
        this.availablePermissions = getPermissionsList();
    }

    resolveWebviewView(webviewView) {
        this.webviewView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        this.updateWebview();

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'addPermission':
                    this.manifestService.addPermission(message.permission);
                    this.updateWebview();
                    break;
                case 'removePermission':
                    this.manifestService.removePermission(message.permission);
                    this.updateWebview();
                    break;
            }
        });
    }

    updateWebview() {
        const permissions = this.manifestService.readPermissions();
        this.webviewView.webview.html = this.getWebviewContent(permissions);
    }

    getShortPermissionName(fullPermission) {
        // Extract the last part of the permission string after the last dot
        return fullPermission.split('.').pop();
    }

    getWebviewContent(permissions) {
        const permissionsList = permissions
            .map(permission => `
                <li>
                    ${this.getShortPermissionName(permission)}
                    <button onclick="removePermission('${permission}')">Remove</button>
                </li>
            `).join('');

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Manage Permissions</title>
                <style>
                    body {
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        padding: 15px;
                    }
                    .dropdown-container {
                        position: relative;
                        width: 100%;
                        margin-bottom: 20px;
                    }
                    .search-input {
                        width: 100%;
                        padding: 8px;
                        margin-bottom: 5px;
                        border: 1px solid var(--vscode-input-border);
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                    }
                    .dropdown-list {
                        display: none;
                        position: absolute;
                        width: 100%;
                        max-height: 200px;
                        overflow-y: auto;
                        background: var(--vscode-dropdown-background);
                        border: 1px solid var(--vscode-dropdown-border);
                        z-index: 1000;
                    }
                    .dropdown-list.show {
                        display: block;
                    }
                    .dropdown-item {
                        padding: 8px;
                        cursor: pointer;
                    }
                    .dropdown-item:hover {
                        background: var(--vscode-list-hoverBackground);
                    }
                    button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 5px 10px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                    }
                    li {
                        margin-bottom: 5px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 5px;
                        background: var(--vscode-list-inactiveSelectionBackground);
                    }
                </style>
            </head>
            <body>
                <h1>Manage Android Permissions</h1>
                <div class="dropdown-container">
                    <input 
                        type="text" 
                        id="searchInput" 
                        class="search-input"
                        placeholder="Search permissions..." 
                        autocomplete="off"
                    />
                    <div id="dropdownList" class="dropdown-list"></div>
                </div>
                <ul id="permissionsList">
                    ${permissionsList}
                </ul>
                <script>
                    const vscode = acquireVsCodeApi();
                    const permissionsMap = ${JSON.stringify(this.permissionsMap)};
                    const availablePermissions = Object.keys(permissionsMap);
                    const searchInput = document.getElementById('searchInput');
                    const dropdownList = document.getElementById('dropdownList');

                    searchInput.addEventListener('focus', () => {
                        filterPermissions('');
                        dropdownList.classList.add('show');
                    });

                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('.dropdown-container')) {
                            dropdownList.classList.remove('show');
                        }
                    });

                    searchInput.addEventListener('input', (e) => {
                        filterPermissions(e.target.value);
                    });

                    function filterPermissions(searchText) {
                        const filtered = availablePermissions.filter(perm => 
                            perm.toLowerCase().includes(searchText.toLowerCase())
                        );
                        
                        dropdownList.innerHTML = filtered
                            .map(perm => \`
                                <div class="dropdown-item" onclick="selectPermission('\${perm}')">
                                    \${perm}
                                </div>
                            \`).join('');
                        
                        dropdownList.classList.add('show');
                    }

                    function selectPermission(shortPermission) {
                        const fullPermission = permissionsMap[shortPermission];
                        vscode.postMessage({ 
                            command: 'addPermission', 
                            permission: fullPermission
                        });
                        searchInput.value = '';
                        dropdownList.classList.remove('show');
                    }

                    function removePermission(fullPermission) {
                        vscode.postMessage({ 
                            command: 'removePermission',
                            permission: fullPermission 
                        });
                    }
                </script>
            </body>
            </html>`;
    }
}

module.exports = PermissionProvider;
 