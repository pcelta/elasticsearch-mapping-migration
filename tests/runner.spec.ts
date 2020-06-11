import { Runner } from '../src/runner';
import { Config } from '../src/config';
import { Client, ConfigOptions } from 'elasticsearch';


test('', () => {
  const configOptions: ConfigOptions = {
    host: {
      protocol: 'http',
      host: '192.168.99.100',
      port: '9200',
    },
    apiVersion: '5.6',
  };

  const client: Client = new Client(configOptions);
  const config: Config = { migrations_path: '/Users/pribeiro/workplace/es-index-migration' };
  const runner: Runner = new Runner(config, client);
  expect(true);
});
