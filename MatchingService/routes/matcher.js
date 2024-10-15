const events = require('events');
const express = require('express');
const express_sse = require('express-sse');
const router = express.Router();
const sse = new express_sse();
const waitingTime = 60000;

// hash table of waiting users
const criteriaToUsers = new Map();
const queue = [];

function updateQueue() {
    while (queue.length > 0) {
        const queueElement = queue.shift();
        const criteria = queueElement['criteria']
        if (criteriaToUsers.has(criteria)) {
            const userId1 = queueElement['userId']
            const userId2 = criteriaToUsers.get(criteria);

            // delete other user from hash table
            criteriaToUsers.delete(criteria);

            // send event signifying match found
            sse.emit('matchFound', { user1: userId1, user2: userId2 });

            // FOR FUTURE CONSIDERATION (collab service logic)
            // if question id not null, go to waiting room
            // if null, pick random question based on diffLevel and topic
        } else {
            criteriaToUsers.set(criteria, queueElement['userId']);
        }
    }
}

router.get('/', (req, res) => {
    // Returns queue view with the current queue data
    updateQueue();
    res.json(criteriaToUsers);
});

router.post('/', (req, res) => {
    const userIdVar = req.query.userId
    if (isNaN(userIdVar)) {
        console.log('Invalid User ID');
        res.status(400).json({'error': 'Invalid User ID'});
        return;
    }

    const criteriaVar = {
        questionId: req.query.questionId,
        topic: req.query.topic,
        diffLevel: req.query.diffLevel
    }
    const queueElement = {
        userId: userIdVar,
        criteria: criteriaVar
    }

    queue.push(queueElement);
    console.log(`User ${userIdVar} enqueued`);

    updateQueue();

    const timeoutId = setTimeout(() => {
        // Check if user is still in the map
        if (criteriaToUsers.has(criteriaVar) && criteriaToUsers.get(criteriaVar) == userIdVar) {
            // User did not find match
            console.log(`Match not found for ${userIdVar}!`);
            res.json({ message: "Match not found!", userIdVar });
        }
    }, waitingTime);
    
    // Listen for the 'matchFound' event and clear the timeout if it occurs
    sse.on('matchFound', (event) => {
        data = event.data

        // Check if the event relates to the current user
        userId1 = data.userId1;
        userId2 = data.userId2;
        if (userId1 == userIdVar) {
            clearTimeout(timeoutId);
            console.log(`Match found with ${userId2}!`);
            res.json({ message: `Match found with ${userId2}!`});
        } else if (userId2 == userIdVar) {
            clearTimeout(timeoutId);
            console.log(`Match found with ${userId1}!`);
            res.json({ message: `Match found with ${userId1}!`});
        }
    });
});

router.delete('/', (req, res) => {
    const userId = req.query.userId;
    const key = {
        questionId: req.query.questionId,
        topic: req.query.topic,
        diffLevel: req.query.diffLevel
    };
    
    if (criteriaToUsers.has(key)) {
        criteriaToUsers.delete(key);
        res.json({ message: 'Key deleted successfully', key });
    } else {
        queue.filter(user => user['userId'] != userId);
        res.json({ message: 'Key not found', key });
    }
});

module.exports = router;