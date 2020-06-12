export class Config {
  public readonly esHost: string;
  public readonly esPort: string;
  public readonly esScheme: string;
  public readonly migrationsFile: string;

  constructor(private env: any) {
    this.esHost = env.ESMIGRATION_HOST;
    this.esPort = env.ESMIGRATION_PORT;
    this.esScheme = env.ESMIGRATION_SCHEME;
    this.migrationsFile = env.ESMIGRATION_MIGRATIONS_FILE;
  }
}
