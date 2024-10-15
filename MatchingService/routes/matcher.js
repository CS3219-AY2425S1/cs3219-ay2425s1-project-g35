const events = require('events');
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

            // delete other user from hash table
            diffToTopicToUser[diffLevel].delete(topic);

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
    
                    // delete other user from hash table
                    diffToTopicToUser[altDiffLevel].delete(topic);
    
                    // send event signifying match found
                    sse.emit('matchFound', { user1: userId, user2: userId2 });

                    return;
                }
            }

            // if no one matches both topic AND diffLevel, put in hash table
            diffToTopicToUser[diffLevel].set(topic, userId);                
        }
    }
}

router.get('/', (req, res) => {
    // Returns queue view with the current queue data
    updateQueue();
    res.json(diffToTopicToUser);
});

router.post('/', (req, res) => {
    const userIdVar = req.query.userId;
    const topicVar = req.query.topic;
    const diffLevelVar = req.query.diffLevel;

    if (isNaN(userIdVar)) {
        console.log('Invalid User ID');
        res.status(400).json({'error': 'Invalid User ID'});
        return;
    }

    if (topicVar == null || diffLevelVar == null) {
        console.log('Invalid criteria');
        res.status(400).json({'error': 'Invalid criteria'});
        return;
    }
 
    const queueElement = {
        userId: userIdVar,
        criteria: {
            topic: topicVar,
            diffLevel: diffLevelVar 
        }
    }

    queue.push(queueElement);
    console.log(`User ${userIdVar} enqueued`);

    updateQueue();

    const timeoutId = setTimeout(() => {
        // Check if user is in the map
        if (diffToTopicToUser[diffLevelVar].has(topic) && diffToTopicToUser[diffLevelVar].get(topicVar) == userIdVar) {
            // User did not find match
            diffToTopicToUser[diffLevelVar].delete(topic);

            // send event signifying match not found (go back to criteria page, with retry and quit button)
            sse.emit('matchNotFound', { user: userIdVar });

            console.log(`Match not found for ${userIdVar}!`);
            res.json({ message: "Match not found!", userIdVar });
            return;
        }
    }, waitingTime);
    
    // Listen for the 'matchFound' event and clear the timeout if it occurs
    sse.on('matchFound', (event) => {
        data = event.data

        // Check if the event relates to the current user
        const user1 = data.user1;
        const user2 = data.user2;
        if (user1 == userIdVar) {
            clearTimeout(timeoutId);
            console.log(`Match found with ${user2}!`);
            res.json({ message: `Match found with ${user2}!`});
            return;
        } else if (user2 == userIdVar) {
            clearTimeout(timeoutId);
            console.log(`Match found with ${user1}!`);
            res.json({ message: `Match found with ${user1}!`});
            return;
        }
    });
});

router.delete('/', (req, res) => {
    const userId = req.query.userId;
    const topic = req.query.topic;
    const diffLevel = req.query.diffLevel;
    
    if (diffToTopicToUser[diffLevel].has(topic)) {
        diffToTopicToUser[diffLevel].delete(topic);
        console.log("User deleted successfully from queue");
        res.json({ message: 'User deleted successfully from queue', userId });
    } else {
        console.log("User not found in queue");
        res.json({ message: 'User not found in queue', userId });
    }
});

module.exports = router;