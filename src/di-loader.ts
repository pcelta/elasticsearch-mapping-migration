import { container } from "tsyringe";
import { Client } from 'elasticsearch';
import { CommandManager } from './command-manager';
import { Command } from 'commander';
import { CommandInterface } from './interface/command.interface';
import { MigrateCommand } from './command/migrate.command';
import DependencyContainer from 'tsyringe/dist/typings/types/dependency-container';
const { createCommand } = require('commander');

export class DILoader {
  public static load(): DependencyContainer {
    container.register<Client>(Client, {
      useFactory: (c) => {
        console.log('client bootstrapping');
        const config = {
          host: {
            protocol: process.env.ESMIGRATION_PROTOCOL,
            host: process.env.ESMIGRATION_HOST,
            port: process.env.ESMIGRATION_PORT,
          },
          apiVersion: '5.6',
        };
        return new Client(config);
      }
    });

    container.register<CommandManager>(CommandManager, {
      useFactory: (c) => {
        const commander: Command = createCommand();
        const commands: CommandInterface[] = [
          c.resolve(MigrateCommand),
        ];
        return new CommandManager(process, commander, commands);
      }
    });

    return container;
  }
}
