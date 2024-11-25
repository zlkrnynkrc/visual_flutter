const vscode = require('vscode');
const WidgetListProvider = require('./widget-list/widget-list-provider');
const WidgetFieldProvider = require('./widget-edit/widget-field-provider');
const DependencyProvider = require('./dependency-edit/dependency-provider');
const DependencyService = require('./dependency-edit/dependency-service');
const PubspecManager = require('./dependency-edit/pubspec-manager');
const PermissionProvider = require('./permission-edit/permission-provider');
const ManifestService = require('./permission-edit/manifest-service');


class ProvidersManager {
    constructor(context) {
        this._context = context;
        this.widgetListProvider = new WidgetListProvider(this._context.extensionUri);
        this.fieldProvider = WidgetFieldProvider.getInstance(this._context.extensionUri);
        this.pubspecManager = new PubspecManager();
        this.dependencyService = new DependencyService();
        this.manifestService = new ManifestService();
        this.permissionProvider = new PermissionProvider(this.manifestService);
        this.dependencyProvider = new DependencyProvider(this._context.extensionUri, this.dependencyService, this.pubspecManager);
    }

    registerProviders() {
        this._context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('flutter-widget-list-activitybar', this.widgetListProvider),
            vscode.window.registerWebviewViewProvider('widget-fields-sidebar-activitybar', this.fieldProvider),
            vscode.window.registerWebviewViewProvider('flutter-dependencies-activitybar', this.dependencyProvider),
            vscode.window.registerWebviewViewProvider('flutter-permissions-activitybar', this.permissionProvider),

            vscode.window.registerWebviewViewProvider('flutter-widget-list-explorer', this.widgetListProvider),
            vscode.window.registerWebviewViewProvider('widget-fields-sidebar-explorer', this.fieldProvider),
            vscode.window.registerWebviewViewProvider('flutter-dependencies-explorer', this.dependencyProvider),
            vscode.window.registerWebviewViewProvider('flutter-permissions-explorer', this.permissionProvider),
        );
    }

    showInvalidProjectMessages() {
        this.fieldProvider.showInvalidProjectMessage();
        this.widgetListProvider.showInvalidProjectMessage();
    }
}

module.exports = ProvidersManager;