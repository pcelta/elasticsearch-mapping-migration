import { Command } from 'commander';
import { inject, injectable } from 'tsyringe';
import { MigrationInterface } from '../interface/migration.interface';
import { MigrationRepository } from '../repository/migration.repository';
import { Output } from '../output';
import { FileReader } from '../file-reader';
import { Config } from '../config';

@injectable()
export class MigrateCommand {
  constructor(
    @inject(Config) private config: Config,
    @inject(FileReader) private fileReader: FileReader,
    @inject(MigrationRepository) private repository: MigrationRepository,
    @inject(Output) private output: Output) {

  }

  public register(commander: Command): void {
      commander.command('migrate')
        .description('Perform migrations on Elastic Search Mapping Indexes')
        .action(this.run.bind(this));
  }

  public async run(): Promise<void> {
    let migrationList: any[] = [];
    try {
      migrationList = this.fileReader.getFileContentsAsObject(this.config.migrationListFile);
    } catch (e) {
      this.output.error('Your migrations.json file is invalid.', e, true);

      return;
    }

    this.output.start('Performing migrations');

    let totalExecuted: number = 0;
    const total: number = migrationList.length;
    for (let i: number = 0; i < total; i++) {
      const migrationReference: any = migrationList[i];
      const migrationFileName: string = migrationReference.file;
      const timestamp: string = migrationReference.timestamp;

      let rawMigration = {};
      try {
        rawMigration = this.fileReader.getFileContentsAsObject(migrationFileName);
      } catch (e) {
        this.output.error(`Invalid migration: ${migrationFileName}`, e, true);

        return;
      }

      const migration: MigrationInterface = this.transformRawToMigration(timestamp, migrationFileName, rawMigration);
      if (await this.repository.exists(migration)) {
        continue;
      }

      try {
        await this.repository.execute(migration);
      } catch (e) {
        this.output.failed(migration, e, true);

        return;
      }

      await this.repository.commit(migration);
      this.output.success(migration);

      totalExecuted++;
    }

    if (totalExecuted > 0) {
      this.output.info(`${totalExecuted} migration(s) have been executed`);
      this.output.info('All migrated!');
    } else {
      this.output.info('Nothing to be migrated. All good! =)');
    }
  }

  private transformRawToMigration(timestamp: string, fileName: string, raw: any): MigrationInterface  {
    return {
      id: timestamp,
      type: raw.type,
      index: raw.index_target,
      body: raw.migration,
      file: fileName,
    };
  }
}
