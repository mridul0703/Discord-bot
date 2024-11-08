// index.js
const fs = require('fs'); // Import the fs module
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const status = require('./config/status');
const { sendGiveawayReminder, startGiveaway } = require('./utils/giveaways');
const { addParticipant, removeParticipant, storeWinner } = require('./utils/participantManager');
require('dotenv').config();

// Initialize the bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions // Enable reaction tracking
    ]
});

// Load bot token from environment variables
const token = process.env.TOKEN;
let giveawayMessageId = null; // Store the giveaway message ID here

// Bot ready event
client.once('ready', () => {
    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
    
    // Replace 'YOUR_CHANNEL_ID' with your channel ID
    startGiveaway(client, 'YOUR_CHANNEL_ID');
});

// Slash command setup
client.on('ready', async () => {
    const commands = [
        new SlashCommandBuilder().setName('pstart').setDescription('Start a giveaway!'),
        new SlashCommandBuilder().setName('pend').setDescription('End the giveaway and stop accepting participants.'),
        new SlashCommandBuilder().setName('pwinner').setDescription('Announce a winner for the giveaway.')
    ];

    await client.application.commands.set(commands);
});

// Slash command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, channel } = interaction;

    if (commandName === 'pstart') {
        giveawayMessageId = await sendGiveawayReminder(channel); // Send reminder and store message ID
        await interaction.reply({ content: 'Giveaway started! React to the giveaway message to participate.', ephemeral: true });
    } else if (commandName === 'pend') {
        const giveawayMessage = await channel.send('The giveaway is now closed! No further participants can join.');
        await giveawayMessage.react('🔒'); // Add a lock emoji to signify closure
        await interaction.reply({ content: 'Giveaway is now closed and no more participants can join.', ephemeral: true });
    } else if (commandName === 'pwinner') {
        const participants = JSON.parse(fs.readFileSync('./participants.json', 'utf8'));
        const participantIds = Object.keys(participants);
        
        if (participantIds.length === 0) {
            await interaction.reply({ content: 'No participants in the giveaway!', ephemeral: true });
            return;
        }

        // Pick a random winner
        const winnerId = participantIds[Math.floor(Math.random() * participantIds.length)];
        storeWinner(winnerId);
        removeParticipant(winnerId);

        // Create an embed for the winner announcement
        const winnerEmbed = {
            color: 0x00FF00,
            title: '🎉 Giveaway Winner Announced! 🎉',
            description: `Congratulations to <@${winnerId}>! You are the winner of the GTA VI Giveaway!`,
            thumbnail: {
                url: 'https://www.gtavice.net/content/images/gta-vi-logo-3840x2160.jpg', // Optional: Add a link to an image
            },
            footer: {
                text: 'Thanks to everyone who participated!',
            },
            timestamp: new Date()
        };

        // Send the winner announcement as an embedded message with winner tagged in content
        await channel.send({ content: `<@${winnerId}>`, embeds: [winnerEmbed] });
        
        // Reply to the command initiator
        await interaction.reply({ content: 'Winner has been announced!', ephemeral: true });
    }
});

// Message reaction event to track participants
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore bot reactions

    // Fetch the message if it’s not cached
    if (reaction.message.partial) await reaction.message.fetch();

    // Check if the reaction is on the specific giveaway message
    if (reaction.message.id === giveawayMessageId) {
        addParticipant(user.id); // Add participant to the list
    }
});

// Bot login
client.login(token);
