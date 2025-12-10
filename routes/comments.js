// routes/comments.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Comment = require('../models/Comment');
const User = require('../models/User'); // for optional population

const populateAuthor = [{ path: 'userId', select: 'name' }];

/*
Endpoints summary (mounted under /boo):
POST   /comments            -> create a comment (body: { profileId, userId, text, parentId? })
POST   /comments/:id/replies -> reply to comment
GET    /comments           -> list comments (query: sort=new|old|top, userId, minVotes, profileId)
GET    /comments/profile/:profileId -> list comments for a profile (same query params)
GET    /comments/:id       -> get single comment
PUT    /comments/:id       -> update comment text
DELETE /comments/:id       -> delete comment
POST   /comments/:id/like  -> like (body: { userId })
POST   /comments/:id/unlike-> unlike (body: { userId })
POST   /comments/:id/vote  -> reddit-style vote (body: { userId, value }) value = 1 (up) or -1 (down)
*/

function safeId(id) {
  return id ? String(id) : id;
}

// Create comment
router.post('/', async (req, res) => {
  try {
    const { profileId, userId, text, parentId = null } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: 'userId and text are required.' });
    }

    const comment = new Comment({
      profileId: profileId || undefined,
      userId,
      text,
      parentId: parentId || null,
      likes: [],
      votes: []
    });

    await comment.save();
    // required by tests: return top-level id and 201
    return res.status(201).json({ id: comment._id.toString(), comment });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reply to a comment
router.post('/:id/replies', async (req, res) => {
  try {
    const parent = await Comment.findById(req.params.id);
    if (!parent) return res.status(404).json({ error: 'Parent comment not found' });

    const { profileId, userId, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: 'userId and text are required.' });
    }

    const reply = new Comment({
      profileId: profileId || parent.profileId,
      userId,
      text,
      parentId: parent._id,
      likes: [],
      votes: []
    });

    await reply.save();
    return res.status(201).json({ id: reply._id.toString(), reply });
  } catch (err) {
    console.error('Error replying to comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /comments - list all (with optional sorting & filters)
router.get('/', async (req, res) => {
  try {
    const sortMode = (req.query.sort || 'new').toLowerCase(); // new | old | top
    const filterUserId = req.query.userId;
    const minVotes = parseInt(req.query.minVotes || '0', 10) || 0;
    const profileId = req.query.profileId;

    // build match
    const match = {};
    if (filterUserId) match.userId = filterUserId;
    if (profileId) match.profileId = profileId;

    // fetch and compute
    let docs = await Comment.find(match).lean();

    // attach computed score and counts
    docs = docs.map(d => {
      d.likesCount = d.likes ? d.likes.length : 0;
      d.votesCount = d.votes ? d.votes.length : 0;
      d.score = d.votes ? d.votes.reduce((s, v) => s + (v.value || 0), 0) : 0;
      return d;
    });

    // filter minVotes
    if (minVotes > 0) docs = docs.filter(d => (d.votesCount || 0) >= minVotes);

    // sort
    if (sortMode === 'old') {
      docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortMode === 'top') {
      docs.sort((a, b) => (b.score || 0) - (a.score || 0) || (new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      // new
      docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // optionally populate author names
    // NOTE: to keep this lightweight we will not populate here automatically; the client can request single comment endpoints
    res.json(docs);
  } catch (err) {
    console.error('GET /comments error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get comments for a profile
router.get('/profile/:profileId', async (req, res) => {
  req.query.profileId = req.params.profileId;
  return router.handle(req, res); // delegate to GET /comments
});

// Get a single comment
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id).populate(populateAuthor).lean();
    if (!comment) return res.status(404).json({ error: 'not found' });
    comment.likesCount = comment.likes ? comment.likes.length : 0;
    comment.votesCount = comment.votes ? comment.votes.length : 0;
    comment.score = comment.votes ? comment.votes.reduce((s, v) => s + (v.value || 0), 0) : 0;
    res.json(comment);
  } catch (err) {
    console.error('GET /comments/:id error', err);
    res.status(500).json({ error: 'error' });
  }
});

// Update comment text
router.put('/:id', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const updated = await Comment.findByIdAndUpdate(req.params.id, { text }, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });

    updated.likesCount = updated.likes ? updated.likes.length : 0;
    updated.votesCount = updated.votes ? updated.votes.length : 0;
    updated.score = updated.votes ? updated.votes.reduce((s, v) => s + (v.value || 0), 0) : 0;
    res.json({ success: true, updated });
  } catch (err) {
    console.error('PUT /comments error', err);
    res.status(500).json({ error: 'error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not found' });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('DELETE /comments error', err);
    res.status(500).json({ error: 'error' });
  }
});

// Like
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'not found' });

    if (!comment.likes) comment.likes = [];
    if (!comment.likes.includes(String(userId))) {
      comment.likes.push(String(userId));
      await comment.save();
    }

    return res.json({ likesCount: comment.likes.length });
  } catch (err) {
    console.error('POST like error', err);
    res.status(500).json({ error: 'error' });
  }
});

// Unlike
router.post('/:id/unlike', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'not found' });

    comment.likes = (comment.likes || []).filter(id => String(id) !== String(userId));
    await comment.save();

    return res.json({ likesCount: comment.likes.length });
  } catch (err) {
    console.error('POST unlike error', err);
    res.status(500).json({ error: 'error' });
  }
});

/*-----------------------------------------------------------
  Reddit-style voting (A)
  POST /:id/vote
  body: { userId, value }  value = 1 or -1
  Behavior:
    - if user has no vote -> add vote
    - if user has same vote -> remove vote (toggle)
    - if user has opposite vote -> replace with new value
-----------------------------------------------------------*/
router.post('/:id/vote', async (req, res) => {
  try {
    const { userId, value } = req.body;
    const id = req.params.id;

    if (!userId || ![1, -1].includes(Number(value))) {
      return res.status(400).json({ error: 'userId and value (1 or -1) required' });
    }

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'not found' });

    // find existing vote by user (compare as strings)
    const exIndex = (comment.votes || []).findIndex(v => String(v.userId) === String(userId));

    if (exIndex === -1) {
      // add
      comment.votes.push({ userId: String(userId), value: Number(value) });
    } else {
      const ex = comment.votes[exIndex];
      if (ex.value === Number(value)) {
        // toggle off
        comment.votes.splice(exIndex, 1);
      } else {
        // change
        comment.votes[exIndex].value = Number(value);
      }
    }

    await comment.save();

    const score = (comment.votes || []).reduce((s, v) => s + (v.value || 0), 0);
    const votesCount = (comment.votes || []).length;

    return res.json({ success: true, score, votesCount, comment });
  } catch (err) {
    console.error('POST vote error', err);
    res.status(500).json({ error: 'error' });
  }
});

module.exports = router;
