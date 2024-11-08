// utils/giveaways.js
const cron = require('node-cron');

async function sendGiveawayReminder(channel) {
    const giveawayEmbed = {
        color: 0x0099ff,
        title: '🚀 GTA VI Giveaway is ongoing!',
        description: 'React to this message to participate in the giveaway!',
        timestamp: new Date(),
        footer: {
            text: 'Good luck!'
        }
    };
    const message = await channel.send({ content: '@everyone', embeds: [giveawayEmbed] });
    return message.id; // Return the message ID
}

function startGiveaway(client, channelId) {
    cron.schedule('0 9 * * 1', async () => {
        const channel = client.channels.cache.get(channelId); // Replace with your channel ID
        if (channel) {
            sendGiveawayReminder(channel); // Send the giveaway reminder
        } else {
            console.log('Channel not found!');
        }
    }, {
        timezone: 'Asia/Kolkata' // Set timezone to Indian Standard Time
    });
}

module.exports = { sendGiveawayReminder, startGiveaway };
