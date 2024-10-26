import QueueModel from '../models/queue-model.js';
import queueService from './queueService.js';

const { addRequest, removeRequest, getQueue } = QueueModel;
const { publishMatchRequest, consumeMatchRequests } = queueService;

async function addMatchRequest(userId, topic, difficulty, socketId) {
    const requestData = { topic, difficulty, socketId };

    try {
        await addRequest(userId, requestData);
        const currentQueue = await getQueue();
        console.log("Enqueue Redis: ", currentQueue);
        
        await publishMatchRequest({ userId, topic, difficulty, socketId });
    } catch (error) {
        throw new Error(error.message);
    }
}

async function cancelMatchRequest(userId) {
    await removeRequest(userId);

    const currentQueue = await getQueue();
    console.log("Dequeue Redis (cancel request) : ", currentQueue);
}

async function processMatchQueue(io) {
    await consumeMatchRequests(async (message) => {
        const { userId, topic, difficulty, socketId } = message;
        const allRequests = await getQueue();

        const match = findMatch(allRequests, userId, topic, difficulty);
        if (match) {
            await removeRequest(userId);
            await removeRequest(match.userId);

            const queue = await getQueue();

            // Find lowest common difficulty 
            const difficultyLevels = ['Easy', 'Medium', 'Hard'];

            const curUserDifficultyIndex = difficultyLevels.indexOf(difficulty);   
            const matchUserDifficultyIndex = difficultyLevels.indexOf(match.difficulty);

            let lowestCommonDifficulty = difficultyLevels[0];
            for (let i = 0; i < difficultyLevels.length; i++) {
                if (curUserDifficultyIndex === i || matchUserDifficultyIndex === i) {
                    lowestCommonDifficulty = difficultyLevels[i];
                    break;
                }
            }

            // TODO: emit more verbose event
            const matchData = {
                id: match.userId,
                topic: match.topic,
                difficulty: match.difficulty,
            }

            const curData = {
                id: userId,
                topic: topic,
                difficulty: difficulty,
            }
            
            // sent to current user socket
            io.to(socketId).emit('matched', matchData, curData);
            io.to(match.socketId).emit('matched', curData, matchData);

            console.log(`Matched ${userId} with ${match.userId}`);
            console.log("Redis Queue (matched) : ", queue);
        }
    });
}

function findMatch(queue, userId, topic, difficulty) {
    // Try to match by same topic and difficulty
    const exactMatch = queue.find(
        req => req.userId !== userId && req.topic === topic && req.difficulty === difficulty
    );
    if (exactMatch) return exactMatch;

    // If no exact match, try to match by closest difficulty
    const difficultyLevels = ['Easy', 'Medium', 'Hard'];
    const altDifficultyLevels = [
        ['Medium', 'Hard'],
        ['Easy', 'Hard'],
        ['Medium', 'Easy']
    ]
    const currentLevelIndex = difficultyLevels.indexOf(difficulty);

    for (let i = 0; i < difficultyLevels.length - 1; i++) {
        const closestMatch = queue.find(
            req => req.userId !== userId && 
            req.topic === topic && 
            req.difficulty === altDifficultyLevels[currentLevelIndex][i]
        )
        
        if (closestMatch) return closestMatch;
    }

    return null;
}

export default {
    addMatchRequest,
    cancelMatchRequest,
    processMatchQueue
};
