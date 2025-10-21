const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const config = require('../../utils/config');
const InvariantError = require('../../exceptions/InvariantError');

class StorageService {
  constructor() {
    this._folder = path.resolve(__dirname, `../../../${config.storage.localUploadPath}`);

    if (!fs.existsSync(this._folder)) {
      fs.mkdirSync(this._folder, { recursive: true });
    }
  }

  /**
   * Menyimpan file ke local storage
   * @param {Buffer} fileBuffer - Buffer dari file
   * @param {string} originalname - Nama file asli
   * @param {string} mimetype - Tipe MIME file
   * @returns {string} URL file yang dapat diakses publik
   */
  async writeFile(fileBuffer, originalname, mimetype) {
    const extension = path.extname(originalname); 
    const filename = `${nanoid(16)}${extension}`;
    const filePath = path.join(this._folder, filename);

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(mimetype)) { 
      throw new InvariantError('File type not allowed. Only images are permitted.');
    }

    try {
      await fs.promises.writeFile(filePath, fileBuffer);
      
      const fileUrl = `${config.storage.baseUrl}/${config.storage.localUploadPath}/${filename}`;
      return fileUrl;
    } catch (error) {
      throw new InvariantError('Gagal menyimpan file');
    }
  }

  async deleteFile(fileUrl) {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(this._folder, filename);
      await fs.promises.unlink(filePath);
    } catch (error) {

      if (error.code !== 'ENOENT') {
        console.error('Gagal menghapus file lama:', error);
      }
    }
  }
}

module.exports = StorageService;