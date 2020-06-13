import { MigrationInterface } from './interface/migration.interface';
import { Table } from 'cli-table3';
import { injectable } from 'tsyringe';
import { Chalk } from 'chalk';

@injectable()
export class Output {

  constructor(private table: Table, private chalk: Chalk, private console: Console) {
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

  public info(textInfo: string): void {
    this.console.log(this.chalk.yellow(textInfo));
  }
}
