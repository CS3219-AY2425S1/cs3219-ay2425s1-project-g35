import mongoose from "mongoose";
import HistoryModel from "./history-model.js";

const Schema = mongoose.Schema;

var validateEmail = function (email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

const UserModelSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please fill a valid email address",
		],
  },
  password: {
    type: String,
    required: true,
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'], 
  },
  displayName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Setting default to the current date/time
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  history: [HistoryModel.schema],
});

export default mongoose.model("UserModel", UserModelSchema);
