import { Command } from 'commander';

export class MigrateCommand {
  public run(): void {
    console.log('Performing a migration');
  }

  public register(commander: Command): void {
    commander.command('migrate')
    .description('Perform migrations on Elastic Search Mapping Indexes')
    .action(this.run);
  }
}
