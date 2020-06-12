#!/usr/bin/env node

'use strict';

import { Config } from './config';
import { Command } from 'commander';
import { CommandManager } from './command-manager';
import { CommandInterface } from './interface/command.interface';
import { MigrateCommand } from './command/migrate.command';

require('dotenv').config();

const chalk = require('chalk');
const figlet = require('figlet');
const { createCommand } = require('commander');

console.log(
  chalk.red(
    figlet.textSync('es-migration-cli', { horizontalLayout: 'full' })
  )
);

const config: Config = new Config(process.env);


const commander: Command = createCommand();
const commands: CommandInterface[] = [
  new MigrateCommand(),
];
const commandManager: CommandManager = new CommandManager(process, commander, commands);
commandManager.boot();
