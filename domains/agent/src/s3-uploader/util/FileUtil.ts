import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
//import sharp from 'sharp';

export default class FileUtil {
  public static customFilename(file) {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const uniqueFileName = `${uuidv4()}-${timestamp}.${extname(
      file.originalname,
    )}`;

    return uniqueFileName;
  }
}
