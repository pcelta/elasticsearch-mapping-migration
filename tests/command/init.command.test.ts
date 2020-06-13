import { InitCommand } from '../../src/command/init.command';
import { MigrationRepository } from '../../src/repository/migration.repository';
import { Output } from '../../src/Output';
import { Command } from 'commander';

describe('InitCommand', () => {
  describe('InitCommand::register()', () => {
    it('should register --init as a new command', () => {
      const repository = {} as unknown as MigrationRepository;
      const output = {} as unknown as Output;

      const mockCommanderOption = jest.fn();
      const commander = {
        option: mockCommanderOption,
      } as unknown as Command;

      const command = new InitCommand(repository, output);
      command.register(commander);

      expect(mockCommanderOption.mock.calls[0][0]).toBe('-i, --init');
      expect(mockCommanderOption.mock.calls[0][1]).toBe('Initialize migration index on Elastic Search');
    });
  });

  describe('InitCommand::run()', () => {
    it('should create index', async () => {

      const mockIndexExists = jest.fn(() => {
        return Promise.resolve(false);
      });
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
  });
});
