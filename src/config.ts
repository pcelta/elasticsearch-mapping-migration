import { ConfigOptions } from 'elasticsearch';
import { injectable } from 'tsyringe';

@injectable()
export class Config {
  public readonly esHost: string;
  public readonly esPort: string;
  public readonly esProtocol: string;
  public readonly rootDir: string;
  public readonly migrationListFile: string;

  constructor(private env: any) {
    this.esHost = env.ESMIGRATION_HOST;
    this.esPort = env.ESMIGRATION_PORT;
    this.esProtocol = env.ESMIGRATION_PROTOCOL;
    this.migrationListFile = env.ESMIGRATION_MIGRATION_LIST_FILE;
    this.rootDir = env.INIT_CWD;
  }

  public getElasticSearchConfig(): ConfigOptions {
    return {
      host: {
        protocol: this.esProtocol,
        host: this.esHost,
        port: this.esPort,
      },
      apiVersion: '5.6',
    }
  }
}
