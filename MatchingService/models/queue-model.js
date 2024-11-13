import createRedisConnection from '../config/redis.js';

const client = createRedisConnection();
const queueKey = 'match_requests';
const usersSetKey = 'current_users';

async function addRequest(userId, data) {
    // Check if the user is already in the queue
    const isInQueue = await client.sIsMember(usersSetKey, userId);
    if (isInQueue) {
        throw new Error(`User ${userId} is already in the queue, unable to publish to rabbitMQ`);
    }

    // Add user to the queue
    const requestData = { userId, ...data, timestamp: Date.now() };
    await client.rPush(queueKey, JSON.stringify(requestData));

    // Add user to the set of current users
    await client.sAdd(usersSetKey, userId);
}

async function removeRequest(userId) {
    const queue = await getQueue();
    const filteredQueue = queue.filter(item => item.userId !== userId);
    await updateQueue(filteredQueue);

    // Remove the user from the set of current users
    await client.sRem(usersSetKey, userId);
}

async function getQueue() {
    const queue = await client.lRange(queueKey, 0, -1);
    return queue.map(item => JSON.parse(item));
}

async function updateQueue(newQueue) {
    await client.del(queueKey);
    for (const item of newQueue) {
        await client.rPush(queueKey, JSON.stringify(item));
    }
}

async function getRequest(userId) {
    const queue = await getQueue();
    return queue.find(item => item.userId === userId);
}

async function isUserInQueue(userId) {
    return await client.sIsMember(usersSetKey, userId);
}

export default {
    addRequest,
    removeRequest,
    getQueue,
    getRequest,
    isUserInQueue
};
