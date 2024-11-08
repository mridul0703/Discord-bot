const fs = require('fs');
const participantsFilePath = './data/participants.json';
const winnersFilePath = './data/winners.json';

function addParticipant(userId) {
    const participants = JSON.parse(fs.readFileSync(participantsFilePath, 'utf8'));
    participants[userId] = true;
    fs.writeFileSync(participantsFilePath, JSON.stringify(participants));
}

function removeParticipant(userId) {
    const participants = JSON.parse(fs.readFileSync(participantsFilePath, 'utf8'));
    delete participants[userId];
    fs.writeFileSync(participantsFilePath, JSON.stringify(participants));
}

function storeWinner(userId) {
    const winners = JSON.parse(fs.readFileSync(winnersFilePath, 'utf8'));
    winners.push(userId);
    fs.writeFileSync(winnersFilePath, JSON.stringify(winners));
}

module.exports = { addParticipant, removeParticipant, storeWinner };
