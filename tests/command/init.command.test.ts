import { InitCommand } from '../../src/command/init.command';
import { MigrationRepository } from '../../src/repository/migration.repository';
import { Output } from '../../src/Output';
import { Command } from 'commander';

describe('InitCommand', () => {
  describe('InitCommand::register()', () => {
    it('should register init as a new command', () => {
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

      const command = new InitCommand(repository, output);
      command.register(commander);

      expect(mockCommandCreation).toBeCalledWith('init');
      expect(mockCommandCreation).toBeCalledTimes(1);
      expect(mockCommandDescription).toBeCalledWith('Initialize migration index on Elastic Search');
      expect(mockCommandDescription).toBeCalledTimes(1);
      expect(mockCommanderAction).toBeCalledTimes(1);
    });
  });

  describe('InitCommand::run()', () => {
    it('should create index', async () => {
      const mockIndexExists = jest.fn(() => Promise.resolve(false));
      const mockInitIndex = jest.fn();
      const repository = {
        initIndex: mockInitIndex,
        indexExists: mockIndexExists,
      } as unknown as MigrationRepository;

      const mockInfo =  jest.fn();
      const output = {
        info: mockInfo
      } as unknown as Output;

      const command = new InitCommand(repository, output);
      await command.run();

      expect(mockIndexExists).toBeCalledTimes(1);
      expect(mockInitIndex).toBeCalledTimes(1);
      expect(mockInfo).toBeCalledTimes(1);
      expect(mockInfo).toBeCalledWith('Migration Index has been Created! You are good to go now!');
    });

    it('should not create index when it already exists', async () => {
      const mockIndexExists = jest.fn(() => Promise.resolve(true));
      const mockInitIndex = jest.fn();
      const repository = {
        initIndex: mockInitIndex,
        indexExists: mockIndexExists,
      } as unknown as MigrationRepository;

      const mockInfo =  jest.fn();
      const output = {
        info: mockInfo
      } as unknown as Output;

      const command = new InitCommand(repository, output);
      await command.run();

      expect(mockIndexExists).toBeCalledTimes(1);

      expect(mockInitIndex).toBeCalledTimes(0);

      expect(mockInfo).toBeCalledTimes(1);
      expect(mockInfo).toBeCalledWith('It is all set up! It seems init had already been run');
    });
  });
});
