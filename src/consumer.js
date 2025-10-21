require('dotenv').config();

const amqp = require('amqplib');
const config = require('./utils/config');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const MailService = require('./services/mail/MailService');

const initConsumer = async () => {
  try {
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const mailService = new MailService();

    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();

    const queue = 'export:playlists';
    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`[Consumer] Menunggu pesan di queue: ${queue}`);

    channel.consume(queue, async (message) => {
      if (message.content) {
        try {
          const { playlistId, targetEmail } = JSON.parse(message.content.toString());
          console.log(`[Consumer] Menerima tugas ekspor playlist ${playlistId} ke ${targetEmail}`);
          
          const playlistData = await playlistsService.getSongsFromPlaylist(playlistId);

          const exportResult = {
            playlist: {
              id: playlistData.id,
              name: playlistData.name,
              songs: playlistData.songs,
            },
          };

          const content = JSON.stringify(exportResult, null, 2);

          await mailService.sendEmail(targetEmail, content);
          console.log(`[Consumer] Email berhasil dikirim ke ${targetEmail}`);
        } catch (error) {
          console.error(`[Consumer] Gagal memproses pesan: ${error.message}`);
        } finally {
          channel.ack(message);
        }
      }
    }, { noAck: false });
  } catch (error) {
    console.error(`[Consumer] Gagal terhubung ke RabbitMQ: ${error.message}`);
    setTimeout(initConsumer, 5000);
  }
};

initConsumer();