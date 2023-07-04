const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
