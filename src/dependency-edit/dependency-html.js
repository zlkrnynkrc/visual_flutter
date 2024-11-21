class DependencyWebViewHtml {
    static generate(dependencies) {
      const rows = dependencies
        .map((dep) => {
          const isLatest = dep.current == '^' + dep.latest;
          const colorClass = isLatest ? 'latest-version' : 'outdated-version';
          const subRows = dep.subDependencies
            ? Object.entries(dep.subDependencies)
              .map(
                ([key, value]) =>
                  `<tr class="subdependency-row">
                        <td><span class="icon">&#x21A9;</span> ${key}</td>
                        <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
                        <td>-</td>
                    </tr>`
              )
              .join('')
            : '';
  
          return `
            <tr class="dependency-row" data-dependency="${dep.name}">
              <td>${dep.name}</td>
              <td class="${colorClass}">${dep.current}</td>
              <td>${dep.latest}</td>
            </tr>${subRows}`;
        })
        .join('');
  
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <style>
                /* Root Styling */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
  
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0 auto;
                }
  
                th, td {
                    padding: 10px;
                    text-align: left;
                    white-space: nowrap;
                    border: 1px dotted black;
                }
  
                th {
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-weight: bold;
                    border-bottom: 2px dotted var(--vscode-editor-foreground);
                }
  
                td {
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    border-bottom: 1px dotted var(--vscode-editor-foreground);
                }

                td.edgeinset { 
                    /* Dotted border for each cell */
                    padding: 0px;
                    text-align: left;
                }

  
                /* Colors */
                .latest-version {
                    color: var(--vscode-terminal-ansiGreen);
                }
  
                .outdated-version {
                    color: var(--vscode-terminal-ansiRed);
                }
  
                /* Subdependency */
                .subdependency-row td {
                    padding-left: 20px;
                    font-style: italic;
                }
  
                .icon {
                    color: var(--vscode-terminal-ansiBlue);
                    font-weight: bold;
                    margin-right: 5px;
                }
  
                /* Context Menu Styling */
                .context-menu {
                    display: none;
                    position: fixed;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    border: 1px solid var(--vscode-editor-foreground);
                    z-index: 1000;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                }
  
                .context-menu li {
                    padding: 8px 16px;
                    cursor: pointer;
                }
  
                .context-menu li:hover {
                    background-color: var(--vscode-editor-hoverBackground);
                }
                .button-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    /* Space between buttons */
                    margin: 20px 0;
                }
                .button-row button {
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .button-row .add {
                    background-color: #4CAF50;
                    /* Green */
                    color: white;
                }
                .button-row .remove {
                    background-color: #f44336;
                    /* Red */
                    color: white;
                }
                .button-row .update {
                    background-color: #008CBA;
                    /* Blue */
                    color: white;
                }
                .button-row .outdated {
                    background-color: #FFA500;
                    /* Orange */
                    color: white;
                }
                button:focus {
                    outline: none;
                }

            </style>
        </head>
        <body>
            <div class="button-row">
                <button onclick="refresh()" title="Refresh">&#8635;</button>
                <button class="add" onclick="handleAdd()" title="Add Dependency">&#43;</button> 
                <button class="update" onclick="handleUpdate()" title="Pub Update">&#8635;</button>
                <button class="outdated" onclick="handleListOutdated()" title="List Outdated">&#9888;</button>
            </div>

            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Current</th>
                        <th>Latest</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
  
            <ul class="context-menu" id="context-menu">
                <li onclick="handleAdd()">Add Dependency</li>
                <li onclick="handleRemove()">Remove Dependency</li>
                <li onclick="handleUpdate()">Pub Update</li>
                <li onclick="handleListOutdated()">List Outdated</li>
            </ul>
  
            <script>
                const vscode = acquireVsCodeApi();
  
                function refresh() {
                    vscode.postMessage({ command: 'refresh' });
                }
  
                // Right-click menu logic
               const contextMenu = document.getElementById('context-menu');
                let selectedDependency = null;

                document.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    const row = event.target.closest('.dependency-row');
                    
                    if (row) {
                        selectedDependency = row.dataset.dependency;
        
                    // Position the context menu exactly where the cursor is
                    contextMenu.style.left = \`\${event.clientX}px\`;
                    contextMenu.style.top = \`\${event.clientY}px\`;
                    contextMenu.style.display = 'block';
                } else {
                    contextMenu.style.display = 'none';
                }
            });

            // Hide context menu when clicking elsewhere
            document.addEventListener('click', (event) => {
                if (!event.target.closest('.context-menu')) {
                    contextMenu.style.display = 'none';
                }
            });
                document.addEventListener('click', () => {
                    contextMenu.style.display = 'none';
                });
  
                function handleAdd() {
                    vscode.postMessage({ command: 'addDependency', dependency: selectedDependency });
                }
  
                function handleRemove() {
                    vscode.postMessage({ command: 'removeDependency', dependency: selectedDependency });
                }
  
                function handleUpdate() {
                    vscode.postMessage({ command: 'updateDependency', dependency: selectedDependency });
                }
  
                function handleListOutdated() {
                    vscode.postMessage({ command: 'listOutdated' });
                }
            </script>
        </body>
        </html>
      `;
    }
  }
  
  module.exports = DependencyWebViewHtml;