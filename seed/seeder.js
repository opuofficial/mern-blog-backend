require("dotenv").config();
const Topic = require("../models/topic.model");
const connectToDB = require("../config/db");

const topicNames = [
  "Front-end development",
  "Back-end development",
  "Mobile development",
  "Game development",
  "Data science",
  "DevOps",
  "Cybersecurity",
  "Cloud computing",
  "Web development",
  "Programming languages",
];

const insertTopics = async () => {
  try {
    for (let i = 0; i < topicNames.length; i++) {
      const topicName = topicNames[i];

      const existingTopic = await Topic.findOne({ name: topicName });

      if (!existingTopic) {
        const topic = new Topic({ name: topicName });
        await topic.save();
        console.log(`Topic '${topicName}' added to the database`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

connectToDB();
insertTopics();
