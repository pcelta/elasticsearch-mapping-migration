import { MigrationInterface } from './interface/migration.interface';
import { Table } from 'cli-table3';
import { injectable } from 'tsyringe';
import { Chalk } from 'chalk';
import Process = NodeJS.Process;

@injectable()
export class Output {

  constructor(private table: Table, private chalk: Chalk, private console: Console, private process: Process) {
  }

  public start(title: string): void  {
    this.console.log(this.chalk.blueBright(`${title}...`));
  }

  public success(migration: MigrationInterface): void  {
    this.table.push([
      migration.index,
      migration.id,
      migration.file,
      this.chalk.green('Success'),
    ]);

    this.console.log(this.table.toString());
    this.table.pop();
  }

  public failed(migration: MigrationInterface, e: Error, exitWithError: boolean): void  {
    this.table.push([
      migration.index,
      migration.id,
      migration.file,
      this.chalk.red('FAILED'),
    ]);

    this.table.push([
      {
        colSpan: 4,
        content: this.chalk.red('ERROR') + `: ${e.message}`,
      }
    ]);

    this.console.log(this.table.toString());
    this.table.pop();
    this.table.pop();

    if (exitWithError) {
      this.process.exit(1)
    }
  }

  public info(textInfo: string): void {
    this.console.log(this.chalk.yellow(textInfo));
  }

  public error(textInfo: string, e: Error, exitWithError: boolean): void {
    this.console.log(this.chalk.red(textInfo), e);
    if (exitWithError) {
      this.process.exit(1)
    }
  }
}
