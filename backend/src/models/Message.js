const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 2000 },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  },
  { timestamps: true }
);

messageSchema.pre('validate', function validateTarget(next) {
  const hasConversation = Boolean(this.conversation);
  const hasGroup = Boolean(this.group);
  if (hasConversation === hasGroup) {
    next(new Error('Message must belong to either a conversation or a group'));
    return;
  }
  next();
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
