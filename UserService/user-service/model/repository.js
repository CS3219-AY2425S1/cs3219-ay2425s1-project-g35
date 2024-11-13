import UserModel from "./user-model.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
  
  await connect(mongoDBUri);
}

export async function createUser(username, email, password, proficiency, displayName) {
  return new UserModel({ username, email, password, proficiency, displayName}).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function addHistoryEntry(userId, historyEntry) {
  const { sessionId, questionId, questionDescription, language, codeSnippet } = historyEntry;

  return UserModel.findOneAndUpdate(
    {
      _id: userId,
      history: {
        $elemMatch: {
          sessionId: sessionId,
          questionId: questionId,
          questionDescription: questionDescription,
          language: language,
        },
      }
    },
    {
      $set: {
        'history.$.codeSnippet': codeSnippet,
        'history.$.timestamp': new Date(),
      },
    },
    {
      new: true, // Return the updated document
      upsert: false, // Do not create a new entry if one is not found (for this query)
    }
  ).then((result) => {
    if (!result) {
      return UserModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            history: historyEntry,
          },
        },
        { new: true }
      );
    }
    return result;
  });
}


export async function updateUserById(userId, username, email, password, proficiency, displayName) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
        proficiency,
        displayName,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}
