const nodemailer = require('nodemailer');
const config = require('../../utils/config');

class MailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: 'OpenMusic API',
      to: targetEmail,
      subject: 'Ekspor Lagu Playlist',
      text: 'Terlampir adalah hasil ekspor lagu dari playlist Anda.',
      attachments: [
        {
          filename: 'playlist.json',
          content,
          contentType: 'application/json',
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailService;