import { Command, default as commander } from 'commander';
import { inject, injectable } from 'tsyringe';
import { MigrationRepository } from '../repository/migration.repository';

@injectable()
export class InitCommand {
  constructor(
    @inject(MigrationRepository) private repository: MigrationRepository) {

  }

  public register(command: commander.Command): void {
    command.option(
      '-i, --init',
      'Initialize migration index on Elastic Search',
      this.run.bind(this)
    );
  }

  public async run(): Promise<void> {
    this.repository.initIndex();
  }
}
