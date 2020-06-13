import { Command, default as commander } from 'commander';
import { inject, injectable } from 'tsyringe';
import { MigrationRepository } from '../repository/migration.repository';
import { Output } from '../Output';

@injectable()
export class InitCommand {
  constructor(
    @inject(MigrationRepository) private repository: MigrationRepository,
    @inject(Output) private output: Output) {
  }

  public register(command: commander.Command): void {
    command.option(
      '-i, --init',
      'Initialize migration index on Elastic Search',
      this.run.bind(this)
    );
  }

  public async run(): Promise<void> {
    const exists = await this.repository.indexExists();
    if (exists) {
      this.output.info('It is all set up! It seems --init had already been run');
      return;
    }

    this.repository.initIndex();
    this.output.info('Migration Index has been Created! You are good to go now!');
  }
}
