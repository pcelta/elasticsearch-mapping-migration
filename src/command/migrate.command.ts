import { Command } from 'commander';
import { inject, injectable } from 'tsyringe';
import { Client } from 'elasticsearch';

@injectable()
export class MigrateCommand {
  constructor(@inject(Client) private client: Client) {

  }

  public run(): void {
    console.log(this.client);
    console.log('Performing a migration');
  }

  public register(commander: Command): void {
    commander.command('migrate')
    .description('Perform migrations on Elastic Search Mapping Indexes')
    .action(this.run.bind(this));
  }
}
