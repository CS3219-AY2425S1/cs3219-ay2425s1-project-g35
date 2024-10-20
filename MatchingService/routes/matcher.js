const express = require('express');
const express_sse = require('express-sse');
const cors = require('cors');

const router = express.Router();
const sse = new express_sse();

const waitingTime = 60000;

// if no exact match for diffLevel and topic, look in other diffLevels in order below
/*
    For example, user A wants topic "Dynamic Programming", and diffLevel "Hard",
    but there is no exact match,
    so system first searches "Medium" for "Dynamic Programming"
    then lastly "Easy" for "Dynamic Programming"
*/
const altDiffLevelOrders = {
    'Easy': ['Medium', 'Hard'],
    'Medium': ['Hard', 'Easy'],
    'Hard': ['Medium', 'Easy']
}

// hash table of waiting users
/* structure:
{
    Easy: [topic 1: user A], [topic 2: user B]...
    Medium: Easy: [topic 3, user C], [topic 4, user D]...
    Hard: [topic 2: user E], [topic 4: user F]...
}
*/
const diffToTopicToUser = {
    'Easy': new Map(),
    'Medium': new Map(),
    'Hard': new Map()
}

// hash table of users to timers
const userToIntervalId = new Map();
const userToTimeoutId = new Map();

// hash table of users to partners
const userToPartner = new Map();

// queue to streamline order in which requests are processed
const queue = [];

function updateQueue() {
    while (queue.length > 0) {
        const queueElement = queue.shift();

        const userId = queueElement['userId'];
        const topic = queueElement['criteria']['topic'];
        const diffLevel = queueElement['criteria']['diffLevel'];

        if (diffToTopicToUser[diffLevel].has(topic)) { // someone matches both diffLevel and topic
            // get other user
            const userId2 = diffToTopicToUser[diffLevel].get(topic);

            // delete waiting user from hash table
            diffToTopicToUser[diffLevel].delete(topic);

            // place matched users in hash table
            userToPartner.set(userId, userId2);
            userToPartner.set(userId2, userId);
        } else {
            // get other diffLevels in stated order
            const altDiffLevels = altDiffLevelOrders[diffLevel];

            // boolean variable to prevent unnecessary hash table insertion
            let hasPartialMatch = false;

            // find those with same topic, different diffLevel
            for (const altDiffLevel of altDiffLevels) {
                if (diffToTopicToUser[altDiffLevel].has(topic)) { // someone matches topic but not diffLevel
                    hasPartialMatch = true;

                    // get other user
                    const userId2 = diffToTopicToUser[altDiffLevel].get(topic);

                    // delete waiting user from hash table
                    diffToTopicToUser[altDiffLevel].delete(topic);

                    // place matched users in hash table
                    userToPartner.set(userId, userId2);
                    userToPartner.set(userId2, userId);

                    break;
                }
            }

            // if no one matches both topic AND diffLevel, put in hash table
            if (!hasPartialMatch) {
                diffToTopicToUser[diffLevel].set(topic, userId);
                console.log(diffToTopicToUser);
            }
        }
    }
}

router.get('/', (req, res) => {
    updateQueue();
    console.log(`Get all entries`);

    // convert each map to JSON first
    const newHashTable = {
        'Easy': JSON.stringify(Object.fromEntries(diffToTopicToUser['Easy'])),
        'Medium': JSON.stringify(Object.fromEntries(diffToTopicToUser['Medium'])),
        'Hard': JSON.stringify(Object.fromEntries(diffToTopicToUser['Hard']))
    }

    res.json(newHashTable);
});

router.post('/', (req, res) => {
    const userIdVar = req.body.userId;
    const topicVar = req.body.topic;
    const diffLevelVar = req.body.diffLevel;

    if (userIdVar == null) {
        console.log('Invalid User ID');
        res.status(400).json({ 'error': 'Invalid User ID' });
        return;
    } else if (topicVar == null) {
        console.log('Invalid topic');
        res.status(400).json({ 'error': 'Invalid topic' });
        return;
    } else if (diffLevelVar == null) {
        console.log('Invalid difficulty level');
        res.status(400).json({ 'error': 'Invalid difficulty level' });
        return;
    }

    const queueElement = {
        userId: userIdVar,
        criteria: {
            topic: topicVar,
            diffLevel: diffLevelVar
        }
    }

    // enqueue user
    queue.push(queueElement);
    console.log(`User ${userIdVar} enqueued`);

    updateQueue();

    const intervalId = setInterval(() => {
        console.log(`Checking every 3 seconds for ${userIdVar}...`);
      
        // check if user is already matched
        if (userToPartner.has(userIdVar)) {
            // get partner
            const partner = userToPartner.get(userIdVar);

            // remove user from hash table
            userToPartner.delete(userIdVar);

            // Stop the interval
            clearInterval(intervalId);

            // delete timer from hash table
            userToIntervalId.delete(userIdVar);

            console.log(`Match found between ${userIdVar} and ${partner}!`);
            res.json({
                message: `${userIdVar}, your partner is ${partner}!`,
                matchFound: true
            });        }
    }, 3000);

    const timeoutId = setTimeout(() => {
        // Check if user is in the map
        if (diffToTopicToUser[diffLevelVar].has(topicVar) && diffToTopicToUser[diffLevelVar].get(topicVar) == userIdVar) {
            // delete user from diffToTopicToUser hash table
            diffToTopicToUser[diffLevelVar].delete(topicVar);

            // clear timers
            clearTimeout(timeoutId);
            clearInterval(intervalId);

            // delete user from timer hash tables
            userToIntervalId.delete(userIdVar);
            userToTimeoutId.delete(userIdVar);

            console.log(`Match not found for ${userIdVar}!`);
            //res.json({'message': `Sorry ${userIdVar}, we couldn't find you a match!`});
            res.json({
                message: `Sorry ${userIdVar}, we couldn't find you a match!`,
                matchFound: false
            });
            return; // go back to criteria page, with retry and quit button
        }
    }, waitingTime);

    // put time-related IDs in hash tables
    userToIntervalId.set(userIdVar, intervalId);
    userToTimeoutId.set(userIdVar, timeoutId); 
});

router.delete('/:userId/:topic/:diffLevel', (req, res) => {
    const { userId, topic, diffLevel } = req.params;

    if (!userId || !topic || !diffLevel) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (diffToTopicToUser[diffLevel].has(topic)) {
        // get user's timeoutId
        const intervalId = userToIntervalId.get(userId);
        const timeoutId = userToTimeoutId.get(userId);
        
        // clear timers
        clearInterval(intervalId);
        clearTimeout(timeoutId);

        // delete user from userToTimeoutId hash table
        userToIntervalId.delete(userId);
        userToTimeoutId.delete(userId);

        // delete user from diffToTopicToUser hash table
        diffToTopicToUser[diffLevel].delete(topic);

        console.log("User deleted successfully from queue");
        res.status(200).json({ message: 'User deleted successfully from queue', userId });
    } else {
        console.log("User not found in queue");
        res.status(400).json({ message: 'User not found in queue', userId });
    }
});

module.exports = router;