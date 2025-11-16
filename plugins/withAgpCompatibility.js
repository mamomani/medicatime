const fs = require('fs');
const path = require('path');
const { withProjectBuildGradle, withDangerousMod } = require('@expo/config-plugins');

const AGP_VERSION = '8.5.2';
const KOTLIN_VERSION = '1.9.24';
const GRADLE_DISTRIBUTION = 'https://services.gradle.org/distributions/gradle-8.7-bin.zip';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureClassPath(contents, artifact, version) {
  const escaped = escapeRegExp(artifact);
  const regex = new RegExp(`classpath\\((['"])${escaped}(?::[^'"]+)?\\1\\)`);
  const replacement = `    classpath('${artifact}:${version}')`;
  if (regex.test(contents)) {
    return contents.replace(regex, replacement);
  }
  return contents.replace(/dependencies\s*{/, match => `${match}\n${replacement}`);
}

const withAgpCompatibility = config => {
  config = withProjectBuildGradle(config, cfg => {
    let gradleContents = cfg.modResults.contents;
    gradleContents = ensureClassPath(gradleContents, 'com.android.tools.build:gradle', AGP_VERSION);
    gradleContents = ensureClassPath(gradleContents, 'org.jetbrains.kotlin:kotlin-gradle-plugin', KOTLIN_VERSION);
    cfg.modResults.contents = gradleContents;
    return cfg;
  });

  config = withDangerousMod(config, ['android', cfg => {
    const wrapperPath = path.join(cfg.modRequest.platformProjectRoot, 'gradle', 'wrapper', 'gradle-wrapper.properties');
    const props = fs.readFileSync(wrapperPath, 'utf8');
    const updated = props.replace(/distributionUrl=.*\n/, `distributionUrl=${GRADLE_DISTRIBUTION}\n`);
    fs.writeFileSync(wrapperPath, updated);
    return cfg;
  }]);

  return config;
};

module.exports = withAgpCompatibility;
