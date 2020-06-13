#!/usr/bin/env node

'use strict';

import "reflect-metadata";
require('dotenv').config();

import { DILoader } from './di-loader';
import DependencyContainer from 'tsyringe/dist/typings/types/dependency-container';
import { CommandManager } from './command-manager';

const chalk = require('chalk');
const figlet = require('figlet');
console.log(
  chalk.red(
    figlet.textSync('es-migration', { horizontalLayout: 'default' })
  )
);

const container: DependencyContainer = DILoader.load();
container.resolve(CommandManager).boot();
