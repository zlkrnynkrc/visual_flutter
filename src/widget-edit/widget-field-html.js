
const { Kind } = require('../widget-list/kinds');
const vscode = require('vscode');

function getHtml() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Widget Properties</title>
        <style>
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
        </style>
    </head>
    <body> 
        <h3>Edit Widget Properties</h3></body>
        </html>`;
}

function getWebviewContent(widgetInfo, webview, extensionUri) {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'scripts.js'));
    widgetInfo.result.properties.sort((a, b) => {
        const nameA = a?.name || '';
        const nameB = b?.name || '';
        return nameA > nameB ? 1 : nameB > nameA ? -1 : 0;
    });

    // widgetInfo.properties.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    const tableRows = widgetInfo.result.properties
        .map(property => {
            if (property.type) {
                return ` <tr>
                <td>${property.name}</td>
                <td>${generateInputField(property)}</td> 
                </tr> `
            }
        })
        .join('');

    return `
        <html> 
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Widget Properties</title> 
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <h2>${widgetInfo.name}</h2>
            <div id="dynamicList"  class="dropdown-content"></div>
            <table>
            ${tableRows}
            </table> 
            <div class="suggestions-panel" id="suggestionsPanel">
                <ul id="suggestionsList"></ul>
            </div>
            <script src="${scriptUri}"></script>  
        </body>
        </html>
    `;
}
module.exports = {
    getHtml,
    getWebviewContent
};
function generateInputField(property) {
    const value = property.expression || '';
    const isDefault = property.defvalue !== undefined && property.defvalue !== null;
    const hintText = isDefault ? `placeholder="${property.type}"` : '';

    if (property.editor) {
        return generateEditorInputField(property, value, hintText, isDefault);
    }

    return generateTypeInputField(property, value, hintText, isDefault);
}

function generateEditorInputField(property, value, hintText, isDefault) {
    switch (property.editor.kind) {
        case Kind.boolean:
            return generateCheckboxField(property, value, isDefault);
        case Kind.Enum:
        case Kind.EnumLike:
            return generateEnumInputField(property, value, hintText);
        default:
            return generateDefaultInputField(property, value, hintText);
    }
}

function generateTypeInputField(property, value, hintText, isDefault) {
    switch (property.type) {
        case 'bool':
        case 'bool?':
            return generateCheckboxField(property, value, isDefault);
        case 'Color':
        case 'Color?':
            return generateColorInputField(property, value);
        case 'Widget':
        case 'Widget?':
        case 'List<Widget>?':
        case 'List<Widget>':
            return generateWidgetButtonField(property);
        default:
            return generateDefaultInputField(property, value, hintText);
    }
}

function generateCheckboxField(property, value, isDefault) {
    return `<div>
                <label class="switch">  
                <input type="checkbox" name="${property.name}"
                    class="generalinput-checkbox"
                    value="true" ${value ? 'checked' : ''} 
                    ${isDefault && property.defvalue === true ? 'style="accent-color: blue;" indeterminate="true"' : ''} 
                    onchange="this.value=this.checked ? 'true' : 'false'; this.indeterminate=false;" />
                <span class="slider round"></span>
                </label> 
            </div>`;
}

function generateEnumInputField(property, value, hintText) {
    return `<select name="${property.name}" ${hintText}  class="generalinput-select">
            ${property.editor.enumItems.map(enumItem => {
        const fullValue = `${enumItem.className}.${enumItem.name}`;
        return `<option value="${fullValue}" ${value === fullValue ? 'selected' : ''}>
                             ${enumItem.name}
                        </option>`;
    }).join('')}
        </select>`;
}

function generateColorInputField(property, value) {
    const hex = value.replace("Color(0xFF", "").replace(")", "");
    return `<div class="color-input-row">
                <input type="text" class="colorText" id="${property.name}" value="${value}"
                placeholder="(red,#ffeeff)"
                oninput="filterColors(this)">
                <input type="color" class="colorPicker" id="${property.name}" name="${property.name}" value="${hex}">
            </div>`;
}

function generateWidgetButtonField(property) {
    return `<div><label>Go to <label>
        <button type="button" class="move-to-widget"  name="${property.name}" id="generalinput-button">
            ${property.name}
        </button></div>`;
}

function generateDefaultInputField(property, value, hintText) {
    if (property.type.toLowerCase().includes('edgeinset')) {
        return getEdginsetsHtml(property);
    }
    return `<div><input type="text" id="${property.name}" name="${property.name}" 
    value="${value}" ${hintText} class="generalinput-text" 
    placeholder="${property.type}"/>  </div>`;
}

function getEdginsetsHtml(property) {
    let all = '';
    if (property.expression?.includes('EdgeInsets.all(')) {
        const regex = /\(([^)]+)\)/;
        const match = property.expression?.match(regex);
        if (match) {
            all = match[1];
        }
    }
    return ` 
        <table>
            <tr>
                <td/>
                <td class="edgeinset"><input type="text" data-propName="${property.name}" 
                data-propType="${property.type}" class="edgeinsetinput" 
                name="top"  placeholder="top"
                value="${all === '' ? (property.children[1]?.expression || '') : ''}"/>
                <td/>
            </tr>
            <tr>
                <td class="edgeinset"><input type="text" data-propName="${property.name}" 
                data-propType="${property.type}"  class="edgeinsetinput" 
                name="left" placeholder="left"
                value="${all === '' ? (property.children[0]?.expression || '') : ''}"/>

                <td class="edgeinset"><input type="text" data-propName="${property.name}" 
                data-propType="${property.type}"  class="edgeinsetinput" 
                name="all" placeholder="all"
                value="${all || ''}"/>

                <td class="edgeinset"><input type="text" data-propName="${property.name}" 
                data-propType="${property.type}"  class="edgeinsetinput" 
                name="right" placeholder="right"
                value="${all === '' ? (property.children[2]?.expression || '') : ''}"/>

            </tr>
            <tr>
                <td/>
                <td class="edgeinset"><input type="text" data-propName="${property.name}" 
                data-propType="${property.type}"  class="edgeinsetinput" 
                name="bottom" placeholder="bottom"
                value="${all === '' ? (property.children[3]?.expression || '') : ''}"/>
                <td/>
            </tr>
        </table> `;
}
