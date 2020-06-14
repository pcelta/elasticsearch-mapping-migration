import { Config } from '../src/config';

describe('Config', () => {
  describe('Config::getElasticSearchConfig', () => {
    it('should return Elastic Search Config with Version', () => {

      const env = {
        ESMIGRATION_HOST: 'elasticsearch.host',
        ESMIGRATION_PORT: 'elasticsearch.port',
        ESMIGRATION_PROTOCOL: 'http',
        ESMIGRATION_MIGRATION_LIST_FILE: 'migrations.json',
        ESMIGRATION_MIGRATION_INDEX: 'es-migration',
        INIT_CWD: '/app/directory',
      };

      const expected = {
        host: {
          protocol: env.ESMIGRATION_PROTOCOL,
          host: env.ESMIGRATION_HOST,
          port: env.ESMIGRATION_PORT,
        },
        apiVersion: '5.6',
      };

      const config = new Config(env);
      const result = config.getElasticSearchConfig();
      expect(result).toEqual(expected);
    });
  });
});
