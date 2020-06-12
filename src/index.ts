'use strict'

require('dotenv').config();

const chalk = require('chalk');
const figlet = require('figlet');
const { createCommand } = require('commander');

console.log(
  chalk.red(
    figlet.textSync('es-migration-cli', { horizontalLayout: 'full' })
  )
);

const commandManager = createCommand();

commandManager.command('migrate')
  .description('Perform migrations on Elastic Search Mapping Indexes')
  .action(() => {
    console.log('setup for %s env(s) with %s mode');
  });

commandManager.parse(process.argv);

