import { container } from "tsyringe";
import { Client } from 'elasticsearch';
import { CommandManager } from './command-manager';
import { Command } from 'commander';
import { CommandInterface } from './interface/command.interface';
import { MigrateCommand } from './command/migrate.command';
import DependencyContainer from 'tsyringe/dist/typings/types/dependency-container';
import { Config } from './config';
import { InitCommand } from './command/init.command';
const { createCommand } = require('commander');

export class DILoader {
  public static load(): DependencyContainer {
    container.register<Config>(Config, {
      useFactory: (c) => {
        return new Config(process.env);
      }
    });

    container.register<Client>(Client, {
      useFactory: (c) => {
        const config: Config = c.resolve(Config);
        return new Client(config.getElasticSearchConfig());
      }
    });

    container.register<CommandManager>(CommandManager, {
      useFactory: (c) => {
        const commander: Command = createCommand();
        const commands: CommandInterface[] = [
          c.resolve(MigrateCommand),
          c.resolve(InitCommand),
        ];

        return new CommandManager(process, commander, commands);
      }
    });

    return container;
  }
}