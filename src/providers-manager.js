const vscode = require('vscode');
const DependencyProvider = require('./dependency-edit/dependency-provider');
const DependencyService = require('./dependency-edit/dependency-service');
const ManifestService = require('./permission-edit/manifest-service');
const PermissionProvider = require('./permission-edit/permission-provider');
const PubspecManager = require('./dependency-edit/pubspec-manager');
const WidgetFieldProvider = require('./widget-edit/widget-field-provider');
const WidgetListProvider = require('./widget-list/widget-list-provider');

class ProvidersManager {
    
    constructor(context) {
        this._context = context;
        this.pubspecManager = new PubspecManager();
        this.manifestService = new ManifestService();
        this.dependencyService = new DependencyService();
        this.permissionProvider = new PermissionProvider(this.manifestService);
        this.widgetListProvider = new WidgetListProvider(this._context.extensionUri);
        this.widgetFieldProvider = WidgetFieldProvider.getInstance(this._context.extensionUri);
        this.dependencyProvider = new DependencyProvider(this._context.extensionUri, this.dependencyService, this.pubspecManager);
    }

    registerProviders() {
        this._context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('flutter-widget-list-activitybar', this.widgetListProvider),
            vscode.window.registerWebviewViewProvider('widget-fields-sidebar-activitybar', this.widgetFieldProvider),
            vscode.window.registerWebviewViewProvider('flutter-dependencies-activitybar', this.dependencyProvider),
            vscode.window.registerWebviewViewProvider('flutter-permissions-activitybar', this.permissionProvider),

            vscode.window.registerWebviewViewProvider('flutter-widget-list-explorer', this.widgetListProvider),
            vscode.window.registerWebviewViewProvider('widget-fields-sidebar-explorer', this.widgetFieldProvider),
            vscode.window.registerWebviewViewProvider('flutter-dependencies-explorer', this.dependencyProvider),
            vscode.window.registerWebviewViewProvider('flutter-permissions-explorer', this.permissionProvider),
        );
    }

    showInvalidProjectMessages() {
        this.widgetFieldProvider.showInvalidProjectMessage();
        this.widgetListProvider.showInvalidProjectMessage();
    }
}

module.exports = ProvidersManager;