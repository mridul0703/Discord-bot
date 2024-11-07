// Import packages
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env

// Initialize the bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // To access message content
        GatewayIntentBits.GuildMembers,   // To track member join/leave events and reactions
    ]
});

// Load bot token from environment variables
const token = process.env.TOKEN;

// Store participant data in a JSON file
const participantFilePath = './participants.json';
const winnerFilePath = './winners.json';

// Ensure the participants and winners files exist
if (!fs.existsSync(participantFilePath)) fs.writeFileSync(participantFilePath, JSON.stringify({}));
if (!fs.existsSync(winnerFilePath)) fs.writeFileSync(winnerFilePath, JSON.stringify([]));

// Function to send giveaway reminder
function sendGiveawayReminder(channel) {
    const giveawayEmbed = {
        color: 0x0099ff,
        title: '🚀 GTA VI Giveaway is ongoing!',
        description: 'React to this message to participate in the giveaway!',
        timestamp: new Date(),
        footer: {
            text: 'Good luck!'
        }
    };
    channel.send({ content: '@everyone', embeds: [giveawayEmbed] });
}

// Function to store participants
function addParticipant(userId) {
    const participants = JSON.parse(fs.readFileSync(participantFilePath, 'utf8'));
    if (!participants[userId]) {
        participants[userId] = true;
        fs.writeFileSync(participantFilePath, JSON.stringify(participants, null, 2));
    }
}

// Function to remove participant after selecting the winner
function removeParticipant(userId) {
    const participants = JSON.parse(fs.readFileSync(participantFilePath, 'utf8'));
    delete participants[userId];
    fs.writeFileSync(participantFilePath, JSON.stringify(participants, null, 2));
}

// Function to store winners
function storeWinner(winnerId) {
    const winners = JSON.parse(fs.readFileSync(winnerFilePath, 'utf8'));
    winners.push(winnerId);
    fs.writeFileSync(winnerFilePath, JSON.stringify(winners, null, 2));
}

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    startGiveaway(); // Start the giveaway process (cron job)
});

// Giveaway function
function startGiveaway() {
    // Schedule the giveaway reminder every Monday at 9 AM IST
    cron.schedule('0 9 * * 1', async () => {
        const channel = client.channels.cache.get('YOUR_CHANNEL_ID'); // Replace with your channel ID
        if (channel) {
            sendGiveawayReminder(channel); // Send the giveaway reminder
        } else {
            console.log('Channel not found!');
        }
    }, {
        timezone: 'Asia/Kolkata' // Set timezone to Indian Standard Time
    });
}

// Slash command setup
client.on('ready', async () => {
    const commands = [
        new SlashCommandBuilder().setName('gstart').setDescription('Start a giveaway!'),
        new SlashCommandBuilder().setName('gend').setDescription('End the giveaway and stop accepting participants.'),
        new SlashCommandBuilder().setName('gwinner').setDescription('Announce a winner for the giveaway.')
    ];

    await client.application.commands.set(commands);
});

// Slash command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, channel, user } = interaction;

    if (commandName === 'gstart') {
        // Send giveaway message when /gstart is used
        sendGiveawayReminder(channel);
        await interaction.reply({ content: 'Giveaway started! React to the giveaway message to participate.', ephemeral: true });
    } else if (commandName === 'gend') {
        // End the giveaway and stop accepting reactions
        const giveawayMessage = await channel.send('The giveaway is now closed! No further participants can join.');
        
        // Optionally, delete or lock the message to prevent further reactions (you can implement this)
        await giveawayMessage.react('🔒'); // Add a lock emoji to signify that it's closed
        await interaction.reply({ content: 'Giveaway is now closed and no more participants can join.', ephemeral: true });
    } else if (commandName === 'gwinner') {
        // Close the giveaway and pick a winner
        const participants = JSON.parse(fs.readFileSync(participantFilePath, 'utf8'));
        const participantIds = Object.keys(participants);
        
        if (participantIds.length === 0) {
            await interaction.reply({ content: 'No participants in the giveaway!', ephemeral: true });
            return;
        }

        // Pick a random winner
        const winnerId = participantIds[Math.floor(Math.random() * participantIds.length)];
        storeWinner(winnerId);
        removeParticipant(winnerId);

        await interaction.reply({ content: `<@${winnerId}> is the winner! Congratulations! 🎉`, ephemeral: true });
    }
});

// Message reaction event to track participants (any reaction)
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore bot reactions

    // Check if the reaction is on a giveaway message
    const giveawayMessage = reaction.message.embeds[0]?.title;
    if (giveawayMessage && giveawayMessage.includes('GTA VI Giveaway')) {
        addParticipant(user.id); // Add participant to the list
    }
});

// Bot login
client.login(token);
