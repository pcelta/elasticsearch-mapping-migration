import { Command } from 'commander';
import { CommandInterface } from '../src/interface/command.interface';
import { CommandManager } from '../src/command-manager';

describe('CommandManager', () => {
  describe('CommandManager::boot', () => {
    it('should register all commands', async () => {
      const process = {
        argv: 'any arguments',
      };

      const mockCommanderParse = jest.fn();
      const commander = {
        parse: mockCommanderParse,
      } as unknown as Command;

      const mockCommandOneRegister = jest.fn();
      const commandOne = {
        register: mockCommandOneRegister,
      } as unknown as CommandInterface;

      const mockCommandTwoRegister = jest.fn();
      const commandTwo = {
        register: mockCommandTwoRegister,
      } as unknown as CommandInterface;

      const manager = new CommandManager(process, commander, [commandOne, commandTwo])
      await manager.boot();

      expect(mockCommandOneRegister).toBeCalledTimes(1);
      expect(mockCommandOneRegister).toBeCalledWith(commander);

      expect(mockCommandTwoRegister).toBeCalledTimes(1);
      expect(mockCommandTwoRegister).toBeCalledWith(commander);

      expect(mockCommanderParse).toBeCalledTimes(1);
      expect(mockCommanderParse).toBeCalledWith(process.argv);
    });
  });
});
