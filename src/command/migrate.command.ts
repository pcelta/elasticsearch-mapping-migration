import { Command } from 'commander';
import { inject, injectable } from 'tsyringe';
import * as fs from "fs";
import * as path from "path";
import { Config } from '../config';
import { MigrationInterface } from '../interface/migration.interface';
import { MigrationRepository } from '../repository/migration.repository';
import { Output } from '../Output';

@injectable()
export class MigrateCommand {
  constructor(
    @inject(Config) private config: Config,
    @inject(MigrationRepository) private repository: MigrationRepository,
    @inject(Output) private output: Output) {

  }

  public register(commander: Command): void {
    //command.option('-m, --migrate', 'Perform migrations on Elastic Search Mapping Indexes', this.run.bind(this));
      commander.command('migrate')
        .description('Perform migrations on Elastic Search Mapping Indexes')
        .action(this.run.bind(this));
  }

  public async run(): Promise<void> {
    const migrationListPath: string = path.join(this.config.rootDir, '/', this.config.migrationListFile);

    let migrationList: any[] = [];
    try {
      migrationList = this.getFileContentAsObject(migrationListPath);
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

      const migrationPath: string = `${this.config.rootDir}/${migrationFileName}`;
      const rawMigration = this.getFileContentAsObject(migrationPath);

      const migration: MigrationInterface = {
        id: timestamp,
        type: rawMigration.type,
        index: rawMigration.index_target,
        body: rawMigration.migration,
        file: migrationFileName,
      };

      if (await this.repository.exists(migration)) {
        continue;
      }

      await this.repository.execute(migration).catch((e) => {
        this.output.failed(migration, e, true);
      });

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

  private getFileContentAsObject(filePath: string): any {
    const migrationJson: Buffer = fs.readFileSync(filePath);
    return JSON.parse(migrationJson.toString());
  }
}
