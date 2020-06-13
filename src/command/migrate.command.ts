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

  public register(command: Command): void {
    command.option('-m, --migrate', 'Perform migrations on Elastic Search Mapping Indexes', this.run.bind(this));
  }

  public async run(): Promise<void> {
    this.output.start('Performing migrations');

    const migrationListPath: string = path.join(this.config.rootDir, '/', this.config.migrationListFile);
    const migrationList: any[] = this.getFileContentAsObject(migrationListPath);

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
      this.output.info('All migrated!');
      if (await this.repository.exists(migration)) {
        continue;
      }

      await this.repository.execute(migration);
      await this.repository.commit(migration);
      this.output.success(migration);
    }

    this.output.info('All migrated!');
  }

  private getFileContentAsObject(filePath: string): any {
    const migrationJson: Buffer = fs.readFileSync(filePath);
    return JSON.parse(migrationJson.toString());
  }
}
