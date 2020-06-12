export interface MigrationInterface {
  id: string;
  index: string;
  type: string;
  file: string;
  body: any;
}
