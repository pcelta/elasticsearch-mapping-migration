import { Config } from '../src/config';
import { FileReader } from '../src/file-reader';

describe('FileReader', () => {
  describe('FileReader::getFileContentsAsObject', () => {
    it('should return error when file content is not compatible with JSON.parse', () => {
      const mockFsReadFileSync = jest.fn(() => new Buffer('invalid json'));
      const fs = {
        readFileSync: mockFsReadFileSync,
      };

      const joinReturnValue = 'joined path';
      const mockPathJoin = jest.fn(() => joinReturnValue);
      const path = {
        join: mockPathJoin,
      };

      const config = {
        rootDir: '/tmp/some-fake-directory'
      } as unknown as Config;


      const fileReader = new FileReader(fs, path, config);
      const relativeFilePath = 'src/any/file.json';
      expect(() => {
        fileReader.getFileContentsAsObject(relativeFilePath);
      }).toThrowError(SyntaxError);

      expect(mockPathJoin).toBeCalledTimes(1);
      expect(mockPathJoin).toBeCalledWith(config.rootDir, '/', relativeFilePath);
      expect(mockFsReadFileSync).toBeCalledTimes(1);
      expect(mockFsReadFileSync).toBeCalledWith(joinReturnValue);
    });
  });
});
