const fetch = require('node-fetch');

class DependencyService {
  async fetchLatestVersion(dependency) {
    try {
      const response = await fetch(`https://pub.dev/api/packages/${dependency}`);
      const data = await response.json();
      return data.latest?.version || 'Unknown';
    // eslint-disable-next-line no-unused-vars
    } catch (e) { 
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
