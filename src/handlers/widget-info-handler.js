const DartAnalyzer = require('../services/dart-analyzer');
const FileAnalyzer = require('../services/file-analyzer');
const vscode = require('vscode');

class WidgetInfoHandler {
    static async getWidgetDescription(filePath, line, column) {
        const params = { file: filePath, offset: this.getOffset(line, column) };
        const request = { id: '1', method: 'flutter.getWidgetDescription', params };

        try {
            const dartAnalyzer = DartAnalyzer.getInstance().analysisServer;
            const widgetInfo = await dartAnalyzer.sendRequest(request);

            if (widgetInfo.id === '1' && widgetInfo.result) {
                const editor = vscode.window.activeTextEditor;
                const widgetDetail = await this.getHoverInfo(editor.document, editor.selection.active);

                if (widgetDetail) {
                    const mergedwidgetInfo= this.mergeProperties(widgetInfo, widgetDetail);
                    return mergedwidgetInfo;
                }
                return widgetInfo.result || null;
            }
        } catch (error) {
            console.error('Error getting widget description:', error);
            switch (error) {
                case 'Analysis server not started':
                    await this.analyzerServerNotStartedHandler();
                    return this.reGetWidgetDescription(request);
                case 'FILE_NOT_ANALYZED':
                    await this.fileNotAnalyzedHandler(filePath);
                    return this.reGetWidgetDescription(request);
                default:
                    throw error;
            }
        }
    }
    static async getHoverInfo(document, position) {
        const hoverResponse = await vscode.commands.executeCommand('vscode.executeHoverProvider', document.uri, position);

        if (Array.isArray(hoverResponse)) {
        if (!hoverResponse?.length) return null;

        const hover = hoverResponse[0];
        const range = hover.range;
            for (const hoverItem of hoverResponse) {
                for (const content of hoverItem.contents) {
                    const dartString = content instanceof vscode.MarkdownString
                        ? content.value
                        : typeof content === 'string'
                            ? content
                            : null;

                    if (dartString) {
                        const widgetDetail = this.parseWidgetProperties(dartString);

                        if (!widgetDetail) return null;

                        if (range) {
                            widgetDetail.start = range.start;
                            widgetDetail.end = range.end;
                        }
                        return widgetDetail;
                    }
                }
            }
        }
        return null;
    }

    static parseWidgetProperties(code) {
        const widgetNameMatch = code.match(/(\w+)\s+(\w+)\(/);
        if (!widgetNameMatch) return null;

        const widgetName = widgetNameMatch[2];
        const properties = [];
        const paramsString = code.match(/\{\s*([^}]*)\}/)?.[1] || '';
        const properties1 = paramsString.split(',').map(param => param.trim());

        properties1.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            const isRequired = trimmedLine.startsWith('required');
            const [nameType, value] = trimmedLine.split('=').map(part => part.trim());
            const [name, type] = nameType.replace('required', '').trim().split(' ').reverse();

            if (name) {
                properties.push({
                    required: isRequired,
                    name: name,
                    type: type,
                    value: value?.replace(/^const\s+/, '') || null
                });
            }
        });

        return {
            widgetName: widgetName,
            start: null,
            end: null,
            properties
        };
    }

    static mergeProperties(widgetInfo, widgetDetail) {
        widgetInfo.start = widgetDetail.start;
        widgetInfo.end = widgetDetail.end;
        widgetInfo.name = widgetDetail.widgetName;
        widgetInfo.offset = this.getOffset(widgetDetail.start.line, widgetDetail.start.character);

        widgetInfo.result.properties.forEach(widget => {
            const matchingDetailProp = widgetDetail.properties.find(prop => prop.name === widget.name);
            if (matchingDetailProp) {
                widget.type = matchingDetailProp.type;
                widget.defvalue = matchingDetailProp.value;
            }
        });
        return widgetInfo;
    }


    /* static async getWidgetDescription(filePath, line, column) {
        const params = { file: filePath, offset: this.getOffset(line, column) };
        const request = { id: '1', method: 'flutter.getWidgetDescription', params };
       
        try { 
            const widgetInfo = await DartAnalyzer.getInstance().analysisServer.sendRequest(request);
            return widgetInfo.result || null;
        } catch (error) { 
            switch (error) {
                case 'Analysis server not started': 
                    await this.analyzerServerNotStartedHandler();
                    this.reGetWidgetDescription(request);
                    break; 
                case "FILE_NOT_ANALYZED": 
                    await this.fileNotAnalyzedHandler(filePath);
                    this.reGetWidgetDescription(request);
                    break; 
                default:
                    break;
            }
        }
    }  */
    static async reGetWidgetDescription(request) {
        try {
            const dartAnalyzer = DartAnalyzer.getInstance().analysisServer;
            const widgetInfo = await dartAnalyzer.sendRequest(request);
            return widgetInfo.result || null;
        } catch (error) {
            console.error('Error fetching widget description:', error);
        }
    }

    static getOffset(line, column) {
        const fileContent = vscode.window.activeTextEditor.document.getText();
        if (!fileContent) throw new Error('File content not found');
        return fileContent.split('\n')
            .slice(0, line)
            .reduce((offset, lineContent) => offset + lineContent.length + 1, 0) + column;
    }
    static async analyzerServerNotStartedHandler() {
        try {
            const dartAnalyzer = DartAnalyzer.getInstance();
            dartAnalyzer.start();
        } catch (error) {
            console.error('Cant start server:', error);
        }
    }
    static async fileNotAnalyzedHandler(filePath) {
        try {
            const fileAnalyzer = FileAnalyzer.getInstance();
            fileAnalyzer.analyzeFile(filePath);
        } catch (error) {
            console.error('Cant start server:', error);
        }
    }
}

module.exports = WidgetInfoHandler;
