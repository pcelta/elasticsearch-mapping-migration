import { Command } from 'commander';
import { inject, injectable } from 'tsyringe';
import { MigrationRepository } from '../repository/migration.repository';
import { Output } from '../output';

@injectable()
export class InitCommand {
  constructor(
    @inject(MigrationRepository) private repository: MigrationRepository,
    @inject(Output) private output: Output) {
  }

  public register(commander: Command): void {
    commander.command('init')
      .description('Initialize migration index on Elastic Search')
      .action(this.run.bind(this));
  }

  public async run(): Promise<void> {
    const exists = await this.repository.indexExists();
    if (exists) {
      this.output.info('It is all set up! It seems init had already been run');
      return;
    }

    this.repository.initIndex();
    this.output.info('Migration Index has been Created! You are good to go now!');
  }
}
