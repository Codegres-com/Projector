const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { content, projectId, recipientId } = req.body;
    const senderId = req.user.id;

    // Validate request: Must have content or attachments
    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    // Validate request: Must have target (project or recipient)
    if (!projectId && !recipientId) {
      return res.status(400).json({ message: 'Recipient or Project ID is required' });
    }

    // Process attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => `/uploads/${file.filename}`);
    }

    const newMessage = new Message({
      sender: senderId,
      content: content || '', // Allow empty content if there are attachments
      attachments,
      project: projectId || null,
      recipient: recipientId || null
    });

    const savedMessage = await newMessage.save();

    // Populate sender details for immediate display
    const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name email');

    res.status(201).json(populatedMessage);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get messages
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { projectId, userId } = req.query;
    const currentUserId = req.user.id;

    let query = {};

    if (projectId) {
      // Get Project Messages
      query = { project: projectId };
    } else if (userId) {
      // Get Direct Messages (Conversation between current user and target user)
      query = {
        $or: [
          { sender: currentUserId, recipient: userId },
          { sender: userId, recipient: currentUserId }
        ]
      };
    } else {
      return res.status(400).json({ message: 'Project ID or User ID is required' });
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email')
      .sort({ createdAt: 1 }); // Oldest first

    res.json(messages);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
