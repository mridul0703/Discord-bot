// utils/participantManager.js
const fs = require('fs');

const participantFilePath = './participants.json';
const winnerFilePath = './winners.json';

// Ensure the participants and winners files exist
if (!fs.existsSync(participantFilePath)) fs.writeFileSync(participantFilePath, JSON.stringify({}));
if (!fs.existsSync(winnerFilePath)) fs.writeFileSync(winnerFilePath, JSON.stringify([]));

function addParticipant(userId) {
    const participants = JSON.parse(fs.readFileSync(participantFilePath, 'utf8'));
    if (!participants[userId]) {
        participants[userId] = true;
        fs.writeFileSync(participantFilePath, JSON.stringify(participants, null, 2));
    }
}

function removeParticipant(userId) {
    const participants = JSON.parse(fs.readFileSync(participantFilePath, 'utf8'));
    delete participants[userId];
    fs.writeFileSync(participantFilePath, JSON.stringify(participants, null, 2));
}

function storeWinner(winnerId) {
    const winners = JSON.parse(fs.readFileSync(winnerFilePath, 'utf8'));
    winners.push(winnerId);
    fs.writeFileSync(winnerFilePath, JSON.stringify(winners, null, 2));
}

module.exports = { addParticipant, removeParticipant, storeWinner };
