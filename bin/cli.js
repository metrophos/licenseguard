#!/usr/bin/env node

const Runner = require('../lib/runner');
const reporters = require('../lib/reporters');
const licenseIds = require('spdx-license-ids');
const rc = require('rc');
const chalk = require('chalk');
const wrapAnsi = require('wrap-ansi');

licenseIds.sort();

const options = rc('licensetest', {
  blacklist: [],
  ignore: [],
  production: false,
  development: false,
  reporter: 'text',
});

if (options.help) {
  console.log('Usage: license-test [options]');
  console.log();
  console.log('Options:');
  console.log('  --production              Test only production dependencies');
  console.log('  --development             Test only development dependencies');
  console.log('  --blacklist <license>     Test that license is not used in any npm dependency');
  console.log('  --ignore <package>        Ignore package <package> and do not check against blacklist');
  console.log('  --path <dirname>          Test "path" for license violations. Defaults to current directory');
  console.log('  --reporter                Reporter to use. Supported reporters: "text", "junit"');
  console.log('  --licenses                Print a list of valid license names that can be used in blacklist');
  console.log('  --help                    Print help');
  console.log();
  console.log('Examples:');
  console.log();
  console.log('  Test that no "beerware license" dependency was used            $ license-test --blacklist Beerware');
  console.log('  List of blacklisted licenses                                   $ license-test --blacklist beerware --blacklist AGPL-3.0');
  console.log('  Ignore a dependency                                            $ license-test --ignore yargs@10.0.3');
  console.log('  Ignore multiple dependencies                                   $ license-test --ignore yargs@10.0.3 --ignore doctrine@2.1.0');
  console.log();

  process.exit(0);
}

if (options.licenses) {
  console.log();
  console.log('  SPDX licenses IDs');
  console.log();
  console.log('    ' + wrapAnsi(licenseIds.join(chalk.gray(', ')), 80).split('\n').join('\n    '));
  console.log();

  process.exit(0);
}

const runner = new Runner(options);
const reporter = reporters.create(options.reporter, options);

runner
  .execute(reporter)
  .then(tests => {
    if (tests.filter(test => test.result == 'fail')) {
      process.exit(1);
    }
  })
  .catch(e => {
    console.log();
    console.log(`  License test failed due to a runtime exception "${chalk.red(e.message)}"`);
    console.log(`    ${chalk.gray(e.stack)}`);

    process.exit(2);
  });