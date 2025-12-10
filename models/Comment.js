// models/Comment.js
const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // keep as String to accept non-ObjectId test IDs
  value: { type: Number, enum: [1, -1], required: true } // 1 = upvote, -1 = downvote
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },

  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },

  // simple likes array (preserves your previous likes feature)
  likes: [{ type: String }], // store userId as string to allow test-friendly ids

  // Reddit-style votes stored per user
  votes: [VoteSchema],

  createdAt: { type: Date, default: Date.now }
});

// Virtual: score = sum of votes
CommentSchema.virtual('score').get(function () {
  if (!this.votes) return 0;
  return this.votes.reduce((s, v) => s + (v && v.value ? v.value : 0), 0);
});

// Virtual: likesCount
CommentSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual: votesCount
CommentSchema.virtual('votesCount').get(function () {
  return this.votes ? this.votes.length : 0;
});

CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);
