import matchService from '../services/matchService.js';
import QueueModel from '../models/queue-model.js';

const { addMatchRequest, cancelMatchRequest, processMatchQueue } = matchService;
const { isUserInQueue } = QueueModel;

const VITE_USER_SERVICE_API = process.env.USER_SERVICE_URL || 'http://user-service:3001';

/* Verify user's token */
async function verifyUser(token) {
    try {
        console.log("Verifying user " + token);

        const response = await fetch(`${VITE_USER_SERVICE_API}/auth/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the header if required
            },
        });

        if (!response.ok) {
            // If response is not OK, handle the error
            return false;
        }

        // const data = await response.json();

        // Sending the data from the API call as the response
        return true;
    } catch (error) {
        console.error("Error during authentication:", error);
        return false;
    }
}

async function handleMatchRequest(req, res) {
    console.log("Cookies:", req.cookies);
    const token = req.cookies.accessToken;

    if (!process.env.USER_SERVICE_URL) {
        if (!await verifyUser(token)) {
            return res.status(401).json({ message: "Authentication failed" });
        }
    }

    const { userId, topic, difficulty, socketId } = req.body;
    if (await isUserInQueue(userId)) {
        return res.status(400).json({ message: "User is already in the queue" });
    }

    try {
        await addMatchRequest(userId, topic, difficulty, socketId);
        res.status(200).json({ message: "Match request sent", userId });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

async function cancelRequest(req, res) {
    const token = req.cookies.accessToken;
    if (!process.env.USER_SERVICE_URL) {
        if (!await verifyUser(token)) {
            return res.status(401).json({ message: "Authentication failed" });
        }
    }

    const { userId } = req.body;

    console.log("Checking if user ", userId, " is in the queue", " ", await isUserInQueue(userId));
    if (!await isUserInQueue(userId)) {
        return res.status(400).json({ message: "User is not in the queue, no request to cancel" });
    }
    try {
        await cancelMatchRequest(userId);
        res.status(200).json({ message: "Match request cancelled", userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

function initializeQueueProcessing(io) {
    processMatchQueue(io);
}

export default {
    handleMatchRequest,
    cancelRequest,
    initializeQueueProcessing
};
