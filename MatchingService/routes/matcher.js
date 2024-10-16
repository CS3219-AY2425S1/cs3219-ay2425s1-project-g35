const express = require('express');
const express_sse = require('express-sse');
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
            sse.emit('matchFound', { user1: userId, user2: userId2 });
        } else {
            // get other diffLevels in stated order
            const altDiffLevels = altDiffLevelOrders[diffLevel];

            // find those with same topic, different diffLevel
            for (const altDiffLevel of altDiffLevels) {
                if (diffToTopicToUser[altDiffLevel].has(topic)) { // someone matches topic but not diffLevel
                    // get other user
                    const userId2 = diffToTopicToUser[altDiffLevel].get(topic);
    
                    // send event signifying match found
                    sse.emit('matchFound', { user1: userId, user2: userId2 });
                }
            }

            // if no one matches both topic AND diffLevel, put in hash table
            diffToTopicToUser[diffLevel].set(topic, userId);             
        }
    }
}

// for client to listen to events
router.get('/events', sse.init);

router.get('/', (req, res) => {
    // Returns queue view with the current queue data
    updateQueue();
    res.json(diffToTopicToUser);
});

router.post('/', (req, res) => {
    const userIdVar = req.query.userId;
    const topicVar = req.query.topic;
    const diffLevelVar = req.query.diffLevel;

    if (userIdVar == null) {
        console.log('Invalid User ID');
        res.status(400).json({'error': 'Invalid User ID'});
        return;
    } else if (topicVar == null) {
        console.log('Invalid topic');
        res.status(400).json({'error': 'Invalid topic'});
        return;
    } else if (diffLevelVar == null) {
        console.log('Invalid difficulty level');
        res.status(400).json({'error': 'Invalid difficulty level'});
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

    const timeoutId = setTimeout(() => {
        // Check if user is in the map
        if (diffToTopicToUser[diffLevelVar].has(topicVar) && diffToTopicToUser[diffLevelVar].get(topicVar) == userIdVar) {
            // send event signifying match found
            console.log('Emitting matchNotFound event');
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

    sse.on('matchFound', (event) => {
        data = event.data

        // Check if the event relates to the current user
        const userId1 = data.userId1;
        const userId2 = data.userId2;
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

router.delete('/', (req, res) => {
    const userId = req.query.userId;
    const topic = req.query.topic;
    const diffLevel = req.query.diffLevel;
    
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
        res.json({ message: 'User deleted successfully from queue', userId });
    } else {
        console.log("User not found in queue");
        res.json({ message: 'User not found in queue', userId });
    }
});

module.exports = router;