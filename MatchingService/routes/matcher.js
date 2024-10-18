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
const userToTimeoutId = new Map();

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

            // send event signifying match found
            console.log(`Emitting matchFound event for ${userId} and ${userId2}...`);
            sse.emit('matchFound', { user1: userId, user2: userId2 });
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

                    // send event signifying match found
                    console.log(`Emitting matchFound event for ${userId} and ${userId2}...`);
                    sse.emit('matchFound', { user1: userId, user2: userId2 });

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

// for client to listen to events
router.get('/events',cors(), sse.init);

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
    res.json({ 'message': `User ${userIdVar} enqueued` });

    updateQueue();

    const timeoutId = setTimeout(() => {
        // Check if user is in the map
        if (diffToTopicToUser[diffLevelVar].has(topicVar) && diffToTopicToUser[diffLevelVar].get(topicVar) == userIdVar) {
            // send event signifying match found
            console.log(`Emitting matchNotFound event for ${userIdVar}...`);
            sse.emit('matchNotFound', { user: userIdVar });

            // delete user from diffToTopicToUser hash table
            diffToTopicToUser[diffLevelVar].delete(topicVar);

            // clear timer
            clearTimeout(timeoutId);

            // delete user from userToTimeoutId hash table
            userToTimeoutId.delete(userIdVar);

            console.log(`Match not found for ${userIdVar}!`);
            return; // go back to criteria page, with retry and quit button
        }
    }, waitingTime);

    // put timeoutId in hash table
    userToTimeoutId.set(userIdVar, timeoutId);

    sse.on('matchFound', (data) => {
        // Check if the event relates to the current user
        const userId1 = data.user1;
        const userId2 = data.user2;
        if (userId1 == userIdVar || userId2 == userIdVar) {
            // clear timer
            clearTimeout(timeoutId);

            // delete timer
            userToTimeoutId.delete(userIdVar);

            // delete other user from main hash table
            diffToTopicToUser[diffLevelVar].delete(topicVar);

            console.log(`Match found between ${userId1} and ${userId2}!`);
            return;
        }
    });
});

router.delete('/:userId/:topic/:diffLevel', (req, res) => {
    const { userId, topic, diffLevel } = req.params;

    if (!userId || !topic || !diffLevel) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (diffToTopicToUser[diffLevel].has(topic)) {
        // get user's timeoutId
        const timeoutId = userToTimeoutId.get(userId);

        // clear timeout
        clearTimeout(timeoutId);

        // delete user from userToTimeoutId hash table
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