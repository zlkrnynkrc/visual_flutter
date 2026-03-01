const { LogService } = require('../services/log-service');

class DependencyService {
    async fetchLatestVersion(dependency) {
        try {
            const { default: fetch } = await import('node-fetch');
            const response = await fetch(`https://pub.dev/api/packages/${dependency}`);
            
            /** @type {any} */
            const data = await response.json();
            
            return data.latest?.version || 'Unknown';
        } catch (e) {
            LogService.log(`Fetching latest version of ${dependency} error: ${e}`);
            return 'Unknown';
        }
    }

    async fetchDependencies(pubspec) {
        const dependencies = pubspec.dependencies || {};

        return Promise.all(
            Object.entries(dependencies).map(async ([name, version]) => {
                const latestVersion = await this.fetchLatestVersion(name);
                const subDependencies = typeof version === 'object' ? version : null;

                return {
                    name,
                    current: typeof version === 'string' ? version : 'Custom Source',
                    latest: latestVersion,
                    subDependencies,
                };
            })
        );
    }
}

module.exports = DependencyService;
