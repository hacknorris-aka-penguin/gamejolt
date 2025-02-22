const argv = require('minimist')(process.argv);
const os = require('os');
const gulp = require('gulp');
const FwdRef = require('undertaker-forward-reference');
const path = require('path');

// https://github.com/gulpjs/undertaker-forward-reference
// https://github.com/gulpjs/gulp/issues/802
gulp.registry(FwdRef());

module.exports = (config, projectBase) => {
	function filterSections(predicate) {
		const sections = {};
		for (const section in config.sections) {
			const sectionConfig = config.sections[section];
			if (predicate(sectionConfig, section)) {
				sections[section] = sectionConfig;
			}
		}
		return sections;
	}

	config.production = argv.production || false;
	config.watching = argv._.indexOf('watch') !== -1 ? 'initial' : false;
	config.write = argv.fs || false;
	config.analyzeBundle = argv['analyze-bundle'] || false;
	config.ssr = argv.ssr || false; // 'client' | 'server' | false
	config.isClient = argv.client || false;
	config.isApp = argv.app || false;
	config.isWeb = !config.isClient && !config.isApp;

	// To push the new build to our servers, pass this flag in.
	config.pushBuild = argv['push-build'] || false;

	// If true, the client package will be pushed to the test package.
	config.useTestPackage = argv['use-test-package'] || false;

	config.noClean = argv['no-clean'] || false;

	// Whether or not the environment of angular should be production or development.
	// Even when not doing prod builds we use the prod environment by default.
	// This way it's easy for anyone to build without the GJ dev environment.
	// You can pass this flag in to include the dev environment config for angular instead.
	config.developmentEnv = argv.development || false;

	// If true, will enable the auto updater checks for the client package.
	config.withUpdater = argv['with-updater'] || false;

	config.port = config.port || argv.port || 8080;

	// On start, the client redirects to auth when it doesnt have a user in localstorage,
	// and redirects to app when it does.
	// When watching the client (as opposed to building it fully), this is undesired because
	// at the time of writing we are limited to watching one section at a time in the client.
	config.withLocalStorageAuthRedirect =
		argv['with-localstorage-auth-redirect'] || !config.watching;

	config.translationSections = config.translationSections || [];
	config.buildSection = argv['section'] || 'app';

	if (config.ssr === 'server') {
		config.sections = filterSections(i => i.server);
	} else if (config.isClient) {
		config.sections = filterSections(i => i.client);
	} else if (config.isApp) {
		config.sections = filterSections(i => i.app);
	} else {
		// app sections ONLY work for the app
		config.sections = filterSections(i => !i.app);
	}

	if (argv.section) {
		const newConfigSections = {};

		const argSections = argv.section.split(',');
		for (let argSection of argSections) {
			newConfigSections[argSection] = config.sections[argSection];
		}

		config.sections = newConfigSections;
	}

	config.projectBase = projectBase;
	config.buildBaseDir = process.env.BUILD_DIR || '.';
	if (!config.buildBaseDir.endsWith(path.sep)) {
		config.buildBaseDir += path.sep;
	}
	config.buildDir = config.buildBaseDir + (config.production ? 'build/prod' : 'build/dev');
	config.libDir = 'src/lib/';

	if (config.isClient || config.isApp || config.ssr) {
		config.write = true;
	}

	if (config.ssr === 'server') {
		config.buildDir += '-server';
	} else if (config.isApp) {
		config.buildDir += '-app';
	} else if (config.isClient) {
		config.buildDir += '-client';
		config.clientBuildDir = config.buildDir + '-build';
		config.clientBuildCacheDir = config.buildDir + '-cache';

		// Get our platform that we are building on.
		switch (os.type()) {
			case 'Linux':
				config.platform = 'linux';
				config.arch = '64';
				break;

			case 'Windows_NT':
				config.platform = 'win';
				config.arch = '32';

				break;

			case 'Darwin':
				config.platform = 'osx';
				config.arch = '64';
				break;

			default:
				throw new Error('Can not build client on your OS type.');
		}

		config.platformArch = config.platform + config.arch;
	}

	require('./clean.js')(config);
	require('./translations.js')(config);
	require('./client.js')(config);
	require('./webpack.js')(config);
};
