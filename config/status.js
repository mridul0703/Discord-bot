// config/status.js
const { ActivityType } = require('discord.js');

const status = [
    {
        name: 'Phasmophobia',
        type: ActivityType.Playing,
    },
    {
        name: 'Under Maintenance',
        type: ActivityType.Custom,
    },
    {
        name: 'Developed by - not_mridul',
        type: ActivityType.Custom,
    },
];

module.exports = status;
