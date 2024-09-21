const { MongoClient } = require('mongodb');
const connectionString = process.env.MONGO_URI || "";
const client = new MongoClient(connectionString);

let db;

async function connectToDatabase() {
    let conn;
    try {
        conn = await client.connect();
        db = conn.db("questions");
    } catch (e) {
        console.error(e);
    }
    return db;
}

module.exports = connectToDatabase;
