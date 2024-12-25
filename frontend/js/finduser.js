const fs = require('fs');

function getUsersData() {
    try {
        const usersData = JSON.parse(fs.readFileSync('./_ASSETS/users.json', 'utf8'));
        return usersData.users;
    } catch (err) {
        console.error('Error reading users.json:', err);
        return [];
    }
}

module.exports = getUsersData;