import { Config } from './config';
import { injectable } from 'tsyringe';

@injectable()
export class FileReader {
  constructor(private fs: any, private path: any, private config: Config) {
  }

  public getFileContentsAsObject(relativeFilePath: string): any {
    const absoluteFilePath: string = this.path.join(this.config.rootDir, '/', relativeFilePath);
    const content: Buffer = this.fs.readFileSync(absoluteFilePath);
    return JSON.parse(content.toString());
  }
}
