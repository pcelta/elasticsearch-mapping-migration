import { inject, injectable } from 'tsyringe';
import {
  Client, IndicesCreateParams,
  IndicesPutMappingParams,
  SearchParams,
} from 'elasticsearch';
import { MigrationInterface } from '../interface/migration.interface';
import { Config } from '../config';

@injectable()
export class MigrationRepository {
  constructor(@inject(Client) private client: Client, @inject(Config) private config: Config) {
  }

  public async execute(migration: MigrationInterface): Promise<any> {
    const mappingUpdate: IndicesPutMappingParams = {
      index: migration.index,
      body: migration.body,
      type: migration.type,
      updateAllTypes: true,
    };

    return this.client.indices.putMapping(mappingUpdate);
  }

  public async commit(migration: MigrationInterface): Promise<void> {
    const record = {
      index: this.config.migrationIndex,
      type: 'migration',
      body: {
        id: migration.id,
        file: migration.file,
      },
    };
    this.client.index(record);
  }

  public async exists(migration: MigrationInterface): Promise<boolean> {
    const searchParams: SearchParams = {
      size: 1,
      index: this.config.migrationIndex,
      body: {
        query: {
          term: {
            id: migration.id,
          }
        },
      },
    };

    const searchResponse = await this.client.search(searchParams);
    return searchResponse.hits.total > 0;
  }

  public async initIndex(): Promise<void>  {
    const params: IndicesCreateParams = {
      index: this.config.migrationIndex,
      body: {
        mappings: {
          migration: {
            properties: {
              id: {
                type: 'keyword',
              },
              file: {
                type: 'text',
              }
            }
          }
        }
      }
    };
    this.client.indices.create(params);
  }
}
