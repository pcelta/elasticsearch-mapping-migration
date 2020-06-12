import { Command } from 'commander';
import { inject, injectable } from 'tsyringe';
import { Client, IndicesPutMappingParams } from 'elasticsearch';
import * as fs from "fs";
import * as path from "path";
import { Config } from '../config';

@injectable()
export class MigrateCommand {
  constructor(@inject(Client) private client: Client, @inject(Config) private config: Config) {

  }

  public register(commander: Command): void {
    commander.command('migrate')
      .description('Perform migrations on Elastic Search Mapping Indexes')
      .action(this.run.bind(this));
  }

  public async run(): Promise<void> {
    const migrationListPath: string = path.join(this.config.rootDir, '/', this.config.migrationListFile);
    const migrationList: any[] = this.getFileContentAsObject(migrationListPath);

    const total: number = migrationList.length;
    for (let i: number = 0; i < total; i++) {
      const migrationReference: any = migrationList[i];
      const migrationFileName: string = migrationReference.file;

      const migrationPath: string = `${this.config.rootDir}/${migrationFileName}`;
      const migration = this.getFileContentAsObject(migrationPath);

      const mappingUpdate: IndicesPutMappingParams = {
        index: migration.index_target,
        body: migration.migration,
        type: migration.type,
        updateAllTypes: true,
      };

      console.log(JSON.stringify(mappingUpdate));
      const result: any = await this.client.indices.putMapping(mappingUpdate);
      console.log(result.acknowledged);
    }
  }

  private getFileContentAsObject(filePath: string): any {
    const migrationJson: Buffer = fs.readFileSync(filePath);
    return JSON.parse(migrationJson.toString());
  }
}
