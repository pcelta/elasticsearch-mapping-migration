import { MigrateCommand } from '../../src/command/migrate.command';
import { Config } from '../../src/config';
import { MigrationRepository } from '../../src/repository/migration.repository';
import { Output } from '../../src/output';
import { Command } from 'commander';
import { FileReader } from '../../src/file-reader';

describe('MigrateCommand', () => {
  describe('MigrateCommand::register', () => {
    it('should register migrate command', () => {
      const config = {} as unknown as Config;
      const fileReader = {} as unknown as FileReader;
      const repository = {} as unknown as MigrationRepository;
      const output = {} as unknown as Output;

      const mockCommanderAction = jest.fn();
      const mockCommandCreation = jest.fn();
      const mockCommandDescription = jest.fn();
      const commander = {
        action: mockCommanderAction.mockReturnThis(),
        command: mockCommandCreation.mockReturnThis(),
        description: mockCommandDescription.mockReturnThis(),
      } as unknown as Command;

      const command = new MigrateCommand(config, fileReader, repository, output);
      command.register(commander);

      expect(mockCommandCreation).toBeCalledWith('migrate');
      expect(mockCommandCreation).toBeCalledTimes(1);

      expect(mockCommandDescription).toBeCalledWith('Perform migrations on Elastic Search Mapping Indexes');
      expect(mockCommandDescription).toBeCalledTimes(1);

      expect(mockCommanderAction).toBeCalledTimes(1);
    });
  });

  describe('MigrateCommand::run', () => {
    it('should output an error when migration list file is invalid', () => {
      const migrationListFile = 'migration-list.json';
      const config = {
        migrationListFile: migrationListFile,
      } as unknown as Config;

      const errorMessage = 'Invalid File';
      const error = new Error(errorMessage);
      const mockGetFileContents = jest.fn(() => { throw error; });
      const fileReader = {
        getFileContentsAsObject: mockGetFileContents,
      } as unknown as FileReader;

      const repository = {} as unknown as MigrationRepository;

      const mockOutputError = jest.fn();
      const mockOutputStart = jest.fn();
      const output = {
        error: mockOutputError,
        start: mockOutputStart,
      } as unknown as Output;

      const command = new MigrateCommand(config, fileReader, repository, output);
      command.run();

      expect(mockGetFileContents).toBeCalledTimes(1);
      expect(mockGetFileContents).toBeCalledWith(config.migrationListFile);

      expect(mockOutputError).toBeCalledTimes(1);
      expect(mockOutputError).toBeCalledWith('Your migrations.json file is invalid.', error, true);

      expect(mockOutputStart).toBeCalledTimes(0);
    });

    it('should output an error when migration file is invalid', () => {
      const migrationListFile = 'migration-list.json';
      const config = {
        migrationListFile: migrationListFile,
      } as unknown as Config;

      const errorMessage = 'Invalid Migration File';
      const error = new Error(errorMessage);


      const list = [
        {
          timestamp: '00000001',
          file: 'any/migration.json',
        }
      ];
      const mockGetFileContents = jest.fn()
        .mockReturnValueOnce(list)
        .mockImplementationOnce(() => { throw error; });

      const fileReader = {
        getFileContentsAsObject: mockGetFileContents,
      } as unknown as FileReader;

      const repository = {} as unknown as MigrationRepository;

      const mockOutputError = jest.fn();
      const mockOutputStart = jest.fn();
      const output = {
        error: mockOutputError,
        start: mockOutputStart,
      } as unknown as Output;

      const command = new MigrateCommand(config, fileReader, repository, output);
      command.run();

      expect(mockGetFileContents).toBeCalledTimes(2);
      expect(mockGetFileContents).toBeCalledWith(config.migrationListFile);
      expect(mockGetFileContents).toBeCalledWith(list[0].file);

      expect(mockOutputError).toBeCalledTimes(1);
      expect(mockOutputError).toBeCalledWith(`Invalid migration: ${list[0].file}`, error, true);

      expect(mockOutputStart).toBeCalledTimes(1);
      expect(mockOutputStart).toBeCalledWith('Performing migrations');
    });

    it('should skip migration when it has already been run', async () => {
      const migrationListFile = 'migration-list.json';
      const config = {
        migrationListFile: migrationListFile,
      } as unknown as Config;

      const list = [
        {
          timestamp: '00000001',
          file: 'any/migration.json',
        }
      ];

      const rawMigration = {
        type: 'anyfield',
        index_target: 'anyindex',
        migration: {},
      };
      const mockGetFileContents = jest.fn()
        .mockReturnValueOnce(list)
        .mockReturnValueOnce(rawMigration);

      const fileReader = {
        getFileContentsAsObject: mockGetFileContents,
      } as unknown as FileReader;

      const mockRepositoryExists = jest.fn(() => Promise.resolve(true));
      const mockRepositoryExecute = jest.fn();
      const repository = {
        exists: mockRepositoryExists,
        execute: mockRepositoryExecute,

      } as unknown as MigrationRepository;

      const mockOutputError = jest.fn();
      const mockOutputStart = jest.fn();
      const mockOutputInfo = jest.fn();
      const output = {
        error: mockOutputError,
        start: mockOutputStart,
        info: mockOutputInfo,
      } as unknown as Output;

      const command = new MigrateCommand(config, fileReader, repository, output);
      await command.run();

      const expectedMigration = {
        id: list[0].timestamp,
        type: rawMigration.type,
        index: rawMigration.index_target,
        body: rawMigration.migration,
        file: list[0].file,
      };

      expect(mockGetFileContents).toBeCalledTimes(2);
      expect(mockGetFileContents).toBeCalledWith(config.migrationListFile);
      expect(mockGetFileContents).toBeCalledWith(list[0].file);

      expect(mockOutputStart).toBeCalledTimes(1);
      expect(mockOutputStart).toBeCalledWith('Performing migrations');

      expect(mockRepositoryExists).toBeCalledTimes(1);
      expect(mockRepositoryExists).toBeCalledWith(expectedMigration);

      expect(mockOutputInfo).toBeCalledTimes(1);
      expect(mockOutputInfo).toBeCalledWith('Nothing to be migrated. All good! =)');

      expect(mockRepositoryExecute).toBeCalledTimes(0);
      expect(mockOutputError).toBeCalledTimes(0);
    });

    it('should error first migration and stop execution', async () => {
      const migrationListFile = 'migration-list.json';
      const config = {
        migrationListFile: migrationListFile,
      } as unknown as Config;

      const list = [
        {
          timestamp: '00000001',
          file: 'any/migration-1.json',
        },
        {
          timestamp: '00000002',
          file: 'any/migration-2.json',
        },
      ];

      const rawMigration = {
        type: 'anyfield',
        index_target: 'anyindex',
        migration: {},
      };
      const mockGetFileContents = jest.fn()
        .mockReturnValueOnce(list)
        .mockReturnValueOnce(rawMigration);

      const fileReader = {
        getFileContentsAsObject: mockGetFileContents,
      } as unknown as FileReader;

      const mockRepositoryExists = jest.fn(() => Promise.resolve(false));
      const executionErrorMessage = 'It was unable to execute this mapping update.';
      const error = new Error(executionErrorMessage);
      const mockRepositoryExecute = jest.fn(() => Promise.reject(error));
      const mockRepositoryCommit = jest.fn();
      const repository = {
        exists: mockRepositoryExists,
        execute: mockRepositoryExecute,
        commit: mockRepositoryCommit,

      } as unknown as MigrationRepository;

      const mockOutputError = jest.fn();
      const mockOutputStart = jest.fn();
      const mockOutputInfo = jest.fn();
      const mockOutputFailed = jest.fn();
      const output = {
        error: mockOutputError,
        start: mockOutputStart,
        info: mockOutputInfo,
        failed: mockOutputFailed,
      } as unknown as Output;

      const command = new MigrateCommand(config, fileReader, repository, output);
      await command.run();

      const expectedMigration = {
        id: list[0].timestamp,
        type: rawMigration.type,
        index: rawMigration.index_target,
        body: rawMigration.migration,
        file: list[0].file,
      };

      expect(mockGetFileContents).toBeCalledTimes(2);
      expect(mockGetFileContents).toBeCalledWith(config.migrationListFile);
      expect(mockGetFileContents).toBeCalledWith(list[0].file);

      expect(mockOutputStart).toBeCalledTimes(1);
      expect(mockOutputStart).toBeCalledWith('Performing migrations');

      expect(mockRepositoryExists).toBeCalledTimes(1);
      expect(mockRepositoryExists).toBeCalledWith(expectedMigration);

      expect(mockRepositoryExecute).toBeCalledTimes(1);
      expect(mockRepositoryExecute).toBeCalledWith(expectedMigration);

      expect(mockOutputFailed).toBeCalledTimes(1);
      expect(mockOutputFailed).toBeCalledWith(expectedMigration, error, true);

      expect(mockOutputInfo).toBeCalledTimes(0);
      expect(mockOutputError).toBeCalledTimes(0);
      expect(mockRepositoryCommit).toBeCalledTimes(0);
    });

    it('should execute and commit all migrations successfully', async () => {
      const migrationListFile = 'migration-list.json';
      const config = {
        migrationListFile: migrationListFile,
      } as unknown as Config;

      const list = [
        {
          timestamp: '00000001',
          file: 'any/migration-1.json',
        },
        {
          timestamp: '00000002',
          file: 'any/migration-2.json',
        },
      ];

      const rawMigration = {
        type: 'anyfield',
        index_target: 'anyindex',
        migration: {},
      };

      const rawMigrationTwo = {
        type: 'anyfield2',
        index_target: 'anyindex',
        migration: {},
      };
      const mockGetFileContents = jest.fn()
        .mockReturnValueOnce(list)
        .mockReturnValueOnce(rawMigration)
        .mockReturnValueOnce(rawMigrationTwo);

      const fileReader = {
        getFileContentsAsObject: mockGetFileContents,
      } as unknown as FileReader;

      const mockRepositoryExists = jest.fn(() => Promise.resolve(false));
      const mockRepositoryExecute = jest.fn();
      const mockRepositoryCommit = jest.fn();
      const repository = {
        exists: mockRepositoryExists,
        execute: mockRepositoryExecute,
        commit: mockRepositoryCommit,

      } as unknown as MigrationRepository;

      const mockOutputError = jest.fn();
      const mockOutputStart = jest.fn();
      const mockOutputInfo = jest.fn();
      const mockOutputFailed = jest.fn();
      const mockOutputSuccess = jest.fn();
      const output = {
        error: mockOutputError,
        start: mockOutputStart,
        info: mockOutputInfo,
        failed: mockOutputFailed,
        success: mockOutputSuccess,
      } as unknown as Output;

      const command = new MigrateCommand(config, fileReader, repository, output);
      await command.run();

      const expectedMigration = {
        id: list[0].timestamp,
        type: rawMigration.type,
        index: rawMigration.index_target,
        body: rawMigration.migration,
        file: list[0].file,
      };

      const expectedMigrationTwo = {
        id: list[1].timestamp,
        type: rawMigrationTwo.type,
        index: rawMigrationTwo.index_target,
        body: rawMigrationTwo.migration,
        file: list[1].file,
      };

      expect(mockGetFileContents).toBeCalledTimes(3);
      expect(mockGetFileContents).toBeCalledWith(config.migrationListFile);
      expect(mockGetFileContents).toBeCalledWith(list[0].file);
      expect(mockGetFileContents).toBeCalledWith(list[1].file);

      expect(mockOutputStart).toBeCalledTimes(1);
      expect(mockOutputStart).toBeCalledWith('Performing migrations');

      expect(mockRepositoryExists).toBeCalledTimes(2);
      expect(mockRepositoryExists).toBeCalledWith(expectedMigration);
      expect(mockRepositoryExists).toBeCalledWith(expectedMigrationTwo);

      expect(mockRepositoryExecute).toBeCalledTimes(2);
      expect(mockRepositoryExecute).toBeCalledWith(expectedMigration);
      expect(mockRepositoryExecute).toBeCalledWith(expectedMigrationTwo);

      expect(mockRepositoryCommit).toBeCalledTimes(2);
      expect(mockRepositoryCommit).toBeCalledWith(expectedMigration);
      expect(mockRepositoryCommit).toBeCalledWith(expectedMigrationTwo);

      expect(mockOutputSuccess).toBeCalledTimes(2);
      expect(mockOutputSuccess).toBeCalledWith(expectedMigration);
      expect(mockOutputSuccess).toBeCalledWith(expectedMigrationTwo);

      expect(mockOutputInfo).toBeCalledTimes(2);
      expect(mockOutputInfo).toBeCalledWith('2 migration(s) have been executed');
      expect(mockOutputInfo).toBeCalledWith('All migrated!');

      expect(mockOutputFailed).toBeCalledTimes(0);
      expect(mockOutputError).toBeCalledTimes(0);
    });
  });
});
