import { Config } from './config';
import { Client } from 'elasticsearch';

export class Runner {
  constructor(private config: Config, private client: Client) {

  }

  public run(): void {
    console.log(this.client);
    console.log(this.config);
  }
}
