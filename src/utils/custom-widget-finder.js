const vscode = require('vscode');
const { libPath } = require("../utils/path-provider");


function extractConstructorParams(content, widgetName) {
    // Enhanced regex to capture more complex parameter declarations
    const constructorRegex = new RegExp(`${widgetName}\\s*\\(\\{([^}]+)\\}\\)\\s*;`, 's');
    const match = content.match(constructorRegex);

    if (!match) return [];

    // More comprehensive regex for parameter extraction
    const paramRegex = /(?:(?:required\s+)?(?:final\s+)?(?:const\s+)?)?(?:(?:super\.)?([a-zA-Z]\w*)\s*=\s*([^,]+)?|([a-zA-Z]\w*)\s+([a-zA-Z]\w*)(?:\s*=\s*([^,]+)?)?|\s*this\.([a-zA-Z]\w*)(?:\s*=\s*([^,]+)?)?)/g;

    const requiredParams = [];
    const processedParams = new Set();

    let paramMatch;
    while ((paramMatch = paramRegex.exec(match[1])) !== null) {
        // Extract different possible match groups
        const [
            superKeyParam, superKeyDefaultValue,
            typeParam, nameParam, typeDefaultValue,
            thisParam, thisDefaultValue
        ] = paramMatch.slice(1);

        let param;
        if (superKeyParam) {
            // Super key parameter
            param = {
                name: superKeyParam,
                type: 'dynamic',
                defaultValue: superKeyDefaultValue?.trim(),
                isRequired: false
            };
        } else if (typeParam && nameParam) {
            // Type and name parameter
            param = {
                name: nameParam,
                type: typeParam,
                defaultValue: typeDefaultValue?.trim(),
                isRequired: match[1].includes(`required ${typeParam} ${nameParam}`)
            };
        } else if (thisParam) {
            // This parameter
            param = {
                name: thisParam,
                type: 'dynamic', // We'll try to infer the type from class field declarations
                defaultValue: thisDefaultValue?.trim(),
                isRequired: match[1].includes(`required this.${thisParam}`)
            };
        }

        // Attempt to infer type from class field declarations if not already known
        if (param && param.type === 'dynamic') {
            const fieldTypeRegex = new RegExp(`final\\s+(\\w+(?:<[^>]+>)?\\??)?\\s+${param.name};`, 'm');
            const fieldTypeMatch = content.match(fieldTypeRegex);
            if (fieldTypeMatch) {
                param.type = fieldTypeMatch[1] || 'dynamic';
            }
        }

        // Avoid duplicates and add if valid
        if (param && param.name && !processedParams.has(param.name)) {
            requiredParams.push(param);
            processedParams.add(param.name);
        }
    }

    return requiredParams;
}

function generateWidgetTemplate(widgetName, params) {
    const requiredParams = params.filter(p => p.isRequired || !p.defaultValue);

    const paramStrings = requiredParams.map(param => {
        // Generate default values based on type
        const defaultValue =
            param.type.includes('String') ? '""' :
                param.type.includes('RxString') ? '"".obs' :
                    param.type.includes('bool') ? 'false' :
                        param.type.includes('RxBool') ? 'false.obs' :
                            param.type.includes('int') ? '0' :
                                param.type.includes('double') ? '0.0' :
                                    param.type.includes('List') ? '[]' :
                                        param.type.includes('Map') ? '{}' :
                                            param.type.includes('Widget') ? 'const SizedBox()' :
                                                param.type.includes('VoidCallback') ? '() {}' :
                                                    'null';

        return `\n\t${param.name}: ${defaultValue}`;
    });

    return `${widgetName}(${paramStrings.join(', ')},),`;
}

async function findCustomWidgetFiles() {
    if (!libPath) {
        vscode.window.showInformationMessage('No workspace folder open');
        return [];
    }

    const customWidgets = [];
    const globPattern = new vscode.RelativePattern(libPath(), '**/*.dart');

    const dartFiles = await vscode.workspace.findFiles(globPattern);

    for (const fileUri of dartFiles) {
        try {
            const document = await vscode.workspace.openTextDocument(fileUri);
            const content = document.getText();
            const customWidgetRegex = /class\s+(\w+CW)\s+extends\s+(StatelessWidget|StatefulWidget|(\w+Widget))\s*{/g;
            let match;
            while ((match = customWidgetRegex.exec(content)) !== null) {
                const widgetName = match[1];
                const constructorParams = extractConstructorParams(content, widgetName);
                const template = generateWidgetTemplate(widgetName, constructorParams);
                customWidgets.push({
                    name: widgetName,
                    icon: '✦', // Custom icon for custom widgets
                    template: template,
                });
            }
        } catch (error) {
            console.error(`Error processing file ${fileUri.fsPath}:`, error);
        }
    }

    return customWidgets;
}


// Call this function when your extension activates or when you want to refresh the list
module.exports = findCustomWidgetFiles;