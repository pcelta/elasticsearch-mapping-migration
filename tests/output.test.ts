import { Table } from 'cli-table3';
import { Chalk } from 'chalk';
import { Output } from '../src/output';
import { MigrationInterface } from '../src/interface/migration.interface';

describe('MigrationRepository', () => {
  const migration: MigrationInterface = {
    index: 'temp-index',
    id: '2020-06-14000000',
    type: 'tempfield',
    file: 'migration.json',
    body: {},
  };

  describe('MigrationRepository::start', () => {
    it('should call console with a log message', () => {
      const cli3table: Table = {} as unknown as Table;

      const blueBrightReturnValue = 'coloured string';
      const mockChalkBlueBright = jest.fn(() => blueBrightReturnValue );
      const chalk: Chalk = {
        blueBright: mockChalkBlueBright,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const process: NodeJS.Process = {} as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);
      const title = 'starting title';
      output.start(title);

      expect(mockChalkBlueBright).toBeCalledTimes(1);
      expect(mockChalkBlueBright).toBeCalledWith(`${title}...`);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(blueBrightReturnValue);
    });
  });

  describe('MigrationRepository::success', () => {
    it('should create a success green coloured output', () => {
      const mockCli3TablePush = jest.fn();
      const mockCli3TablePop = jest.fn();
      const tableToStringReturnValue = 'content stringified';
      const mockCli3TableToString = jest.fn(() => tableToStringReturnValue);
      const cli3table: Table = {
        push: mockCli3TablePush,
        pop: mockCli3TablePop,
        toString: mockCli3TableToString
      } as unknown as Table;

      const greenReturnValue = 'coloured string';
      const mockChalkGreen = jest.fn(() => greenReturnValue );
      const chalk: Chalk = {
        green: mockChalkGreen,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const process: NodeJS.Process = {} as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);
      output.success(migration);

      expect(mockCli3TablePush).toBeCalledTimes(1);
      expect(mockCli3TablePush).toBeCalledWith([
        migration.index,
        migration.id,
        migration.file,
        greenReturnValue
      ]);
      expect(mockChalkGreen).toBeCalledTimes(1);
      expect(mockChalkGreen).toBeCalledWith('Success');
      expect(mockCli3TableToString).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(tableToStringReturnValue);
      expect(mockCli3TablePop).toBeCalledTimes(1);

    });
  });

  describe('MigrationRepository::failed', () => {
    it('should create a failed red coloured output with no exit', () => {
      const mockCli3TablePush = jest.fn();
      const mockCli3TablePop = jest.fn();
      const tableToStringReturnValue = 'content stringified';
      const mockCli3TableToString = jest.fn(() => tableToStringReturnValue);
      const cli3table: Table = {
        push: mockCli3TablePush,
        pop: mockCli3TablePop,
        toString: mockCli3TableToString
      } as unknown as Table;

      const redReturnValueOne = 'coloured string one';
      const redReturnValueTwo = 'coloured string two';
      const mockChalkRed = jest.fn()
        .mockReturnValueOnce(redReturnValueOne)
        .mockReturnValueOnce(redReturnValueTwo);
      const chalk: Chalk = {
        red: mockChalkRed,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const mockProcessExit = jest.fn();
      const process: NodeJS.Process = {
        exit: mockProcessExit,
      } as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);

      const errorMessage = 'My error message';
      output.failed(migration, new Error(errorMessage), false);

      expect(mockCli3TablePush).toBeCalledTimes(2);
      expect(mockCli3TablePush).toBeCalledWith([
        migration.index,
        migration.id,
        migration.file,
        redReturnValueOne
      ]);

      expect(mockCli3TablePush).toBeCalledWith([
        {
          colSpan: 4,
          content: redReturnValueTwo + `: ${errorMessage}`,
        },
      ]);

      expect(mockChalkRed.mock.calls[0]).toEqual(['FAILED']);
      expect(mockChalkRed.mock.calls[1]).toEqual(['ERROR']);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(tableToStringReturnValue);
      expect(mockCli3TablePop).toBeCalledTimes(2);
      expect(mockProcessExit).toBeCalledTimes(0);
    });

    it('should create a failed red coloured output with no exit 1', () => {
      const mockCli3TablePush = jest.fn();
      const mockCli3TablePop = jest.fn();
      const tableToStringReturnValue = 'content stringified';
      const mockCli3TableToString = jest.fn(() => tableToStringReturnValue);
      const cli3table: Table = {
        push: mockCli3TablePush,
        pop: mockCli3TablePop,
        toString: mockCli3TableToString
      } as unknown as Table;

      const redReturnValueOne = 'coloured string one';
      const redReturnValueTwo = 'coloured string two';
      const mockChalkRed = jest.fn()
        .mockReturnValueOnce(redReturnValueOne)
        .mockReturnValueOnce(redReturnValueTwo);
      const chalk: Chalk = {
        red: mockChalkRed,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const mockProcessExit = jest.fn();
      const process: NodeJS.Process = {
        exit: mockProcessExit,
      } as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);

      const errorMessage = 'My error message';
      output.failed(migration, new Error(errorMessage), true);

      expect(mockCli3TablePush).toBeCalledTimes(2);
      expect(mockCli3TablePush).toBeCalledWith([
        migration.index,
        migration.id,
        migration.file,
        redReturnValueOne
      ]);

      expect(mockCli3TablePush).toBeCalledWith([
        {
          colSpan: 4,
          content: redReturnValueTwo + `: ${errorMessage}`,
        },
      ]);

      expect(mockChalkRed.mock.calls[0]).toEqual(['FAILED']);
      expect(mockChalkRed.mock.calls[1]).toEqual(['ERROR']);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(tableToStringReturnValue);
      expect(mockCli3TablePop).toBeCalledTimes(2);
      expect(mockProcessExit).toBeCalledTimes(1);
      expect(mockProcessExit).toBeCalledWith(1);
    });
  });

  describe('MigrationRepository::info', () => {
    it('should call console with a yellow coloured info message', () => {
      const cli3table: Table = {} as unknown as Table;

      const yellowReturnValue = 'coloured string';
      const mockChalkYellow = jest.fn(() => yellowReturnValue );
      const chalk: Chalk = {
        yellow: mockChalkYellow,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const process: NodeJS.Process = {} as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);
      const textInfo = 'some info';
      output.info(textInfo);

      expect(mockChalkYellow).toBeCalledTimes(1);
      expect(mockChalkYellow).toBeCalledWith(textInfo);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(yellowReturnValue);
    });
  });

  describe('MigrationRepository::error', () => {
    it('should call console with a red coloured error message with no exit', () => {
      const cli3table: Table = {} as unknown as Table;

      const redReturnValue = 'coloured string';
      const mockChalkRed = jest.fn(() => redReturnValue );
      const chalk: Chalk = {
        red: mockChalkRed,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const mockProcessExit = jest.fn();
      const process: NodeJS.Process = {
        exit: mockProcessExit,
      } as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);
      const textInfo = 'some error has happened';
      const errorMessage = 'My error message';
      const error = new Error(errorMessage);
      output.error(textInfo, new Error(errorMessage), false);

      expect(mockChalkRed).toBeCalledTimes(1);
      expect(mockChalkRed).toBeCalledWith(textInfo);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(redReturnValue, error);
      expect(mockProcessExit).toBeCalledTimes(0);
    });

    it('should call console with a red coloured error message with exit 1', () => {
      const cli3table: Table = {} as unknown as Table;

      const redReturnValue = 'coloured string';
      const mockChalkRed = jest.fn(() => redReturnValue );
      const chalk: Chalk = {
        red: mockChalkRed,
      } as unknown as Chalk;

      const mockConsoleLog = jest.fn();
      const console: Console = {
        log: mockConsoleLog,
      } as unknown as Console;

      const mockProcessExit = jest.fn();
      const process: NodeJS.Process = {
        exit: mockProcessExit,
      } as unknown as NodeJS.Process;

      const output = new Output(cli3table, chalk, console, process);
      const textInfo = 'some error has happened';
      const errorMessage = 'My error message';
      const error = new Error(errorMessage);
      output.error(textInfo, new Error(errorMessage), true);

      expect(mockChalkRed).toBeCalledTimes(1);
      expect(mockChalkRed).toBeCalledWith(textInfo);
      expect(mockConsoleLog).toBeCalledTimes(1);
      expect(mockConsoleLog).toBeCalledWith(redReturnValue, error);
      expect(mockProcessExit).toBeCalledTimes(1);
      expect(mockProcessExit).toBeCalledWith(1);
    });
  });
});


