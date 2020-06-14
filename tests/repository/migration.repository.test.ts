import { Client } from 'elasticsearch';
import { Config } from '../../src/config';
import { MigrationRepository } from '../../src/repository/migration.repository';
import { MigrationInterface } from '../../src/interface/migration.interface';

describe('MigrationRepository', () => {
  const migration: MigrationInterface = {
    index: 'temp-index',
    id: '2020-06-14000000',
    type: 'tempfield',
    file: 'migration.json',
    body: {},
  };

  describe('MigrationRepository::execute', () => {
    it('should execute given migration', async () => {
      const putMappingReturnValue = 'put mapping return value';
      const mockPutMapping = jest.fn(() => Promise.resolve(putMappingReturnValue));
      const client = {
        indices: {
          putMapping: mockPutMapping,
        }
      } as unknown as Client;
      const config = {} as unknown as Config;

      const repository = new MigrationRepository(client, config);
      const result = await repository.execute(migration);

      const expectedMapping = {
        index: migration.index,
        body: migration.body,
        type: migration.type,
        updateAllTypes: true,
      };
      expect(mockPutMapping).toBeCalledTimes(1);
      expect(mockPutMapping).toBeCalledWith(expectedMapping);
      expect(result).toEqual(putMappingReturnValue);
    });
  });

  describe('MigrationRepository::commit', () => {
    it('should save executed migration into internal index', async () => {
      const indexReturnValue = 'index return value';
      const mockClientIndex = jest.fn(() => Promise.resolve(indexReturnValue));
      const client = {
        index: mockClientIndex,
      } as unknown as Client;

      const migrationIndexName = 'es-migration';
      const config = {
        migrationIndex: migrationIndexName,
      } as unknown as Config;

      const repository = new MigrationRepository(client, config);
      const result = await repository.commit(migration);

      const expectedRecord = {
        index: migrationIndexName,
        type: 'migration',
        body: {
          id: migration.id,
          file: migration.file,
        },
      };
      expect(mockClientIndex).toBeCalledTimes(1);
      expect(mockClientIndex).toBeCalledWith(expectedRecord);
      expect(result).toEqual(indexReturnValue);
    });
  });

  describe('MigrationRepository::exists', () => {
    it('should return true when migration has already been run', async () => {
      const searchReturnValue = {
        hits: {
          total: 1,
        }
      };
      const mockClientSearch = jest.fn(() => Promise.resolve(searchReturnValue));
      const client = {
        search: mockClientSearch,
      } as unknown as Client;

      const migrationIndexName = 'es-migration';
      const config = {
        migrationIndex: migrationIndexName,
      } as unknown as Config;

      const repository = new MigrationRepository(client, config);
      const result = await repository.exists(migration);

      const expectedSearch = {
        size: 1,
        index: migrationIndexName,
        body: {
          query: {
            term: {
              id: migration.id,
            }
          },
        },
      };
      expect(mockClientSearch).toBeCalledTimes(1);
      expect(mockClientSearch).toBeCalledWith(expectedSearch);
      expect(result).toEqual(true);
    });

    it('should return false when migration is not found', async () => {
      const searchReturnValue = {
        hits: {
          total: 0,
        }
      };
      const mockClientSearch = jest.fn(() => Promise.resolve(searchReturnValue));
      const client = {
        search: mockClientSearch,
      } as unknown as Client;

      const migrationIndexName = 'es-migration';
      const config = {
        migrationIndex: migrationIndexName,
      } as unknown as Config;

      const repository = new MigrationRepository(client, config);
      const result = await repository.exists(migration);

      const expectedSearch = {
        size: 1,
        index: migrationIndexName,
        body: {
          query: {
            term: {
              id: migration.id,
            }
          },
        },
      };
      expect(mockClientSearch).toBeCalledTimes(1);
      expect(mockClientSearch).toBeCalledWith(expectedSearch);
      expect(result).toEqual(false);
    });
  });

  describe('MigrationRepository::initIndex', () => {
    it('should create internal index', async () => {
      const mockIndicesCreate = jest.fn(() => Promise.resolve(''));
      const client = {
        indices: {
          create: mockIndicesCreate
        },
      } as unknown as Client;

      const migrationIndexName = 'es-migration';
      const config = {
        migrationIndex: migrationIndexName,
      } as unknown as Config;

      const repository = new MigrationRepository(client, config);
      await repository.initIndex();

      const expectedCreateParams = {
        index: migrationIndexName,
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
        },
      };
      expect(mockIndicesCreate).toBeCalledTimes(1);
      expect(mockIndicesCreate).toBeCalledWith(expectedCreateParams);
    });
  });

  describe('MigrationRepository::indexExists', () => {
    it('should return false when internal index does not exist', async () => {
      const mockIndicesExists = jest.fn(() => Promise.resolve(false));
      const client = {
        indices: {
          exists: mockIndicesExists
        },
      } as unknown as Client;

      const migrationIndexName = 'es-migration';
      const config = {
        migrationIndex: migrationIndexName,
      } as unknown as Config;

      const repository = new MigrationRepository(client, config);
      const result = await repository.indexExists();

      const expectedParams = {
        index: migrationIndexName,
      };
      expect(mockIndicesExists).toBeCalledTimes(1);
      expect(mockIndicesExists).toBeCalledWith(expectedParams);
      expect(result).toEqual(false);
    });

    it('should return true when internal index exists', async () => {
      const mockIndicesExists = jest.fn(() => Promise.resolve(true));
      const client = {
        indices: {
          exists: mockIndicesExists
        },
      } as unknown as Client;

      const migrationIndexName = 'es-migration';
      const config = {
        migrationIndex: migrationIndexName,
      } as unknown as Config;

      const repository = new MigrationRepository(client, config);
      const result = await repository.indexExists();

      const expectedParams = {
        index: migrationIndexName,
      };
      expect(mockIndicesExists).toBeCalledTimes(1);
      expect(mockIndicesExists).toBeCalledWith(expectedParams);
      expect(result).toEqual(true);
    });
  });
});
