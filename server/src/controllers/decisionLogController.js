const DecisionLog = require('../models/DecisionLog');

// @desc    Get all decision logs for a project
// @route   GET /api/decision-logs?projectId=:projectId
// @access  Private
exports.getDecisionLogs = async (req, res) => {
  const { projectId } = req.query;

  try {
    const query = projectId ? { project: projectId } : {};
    const decisionLogs = await DecisionLog.find(query).sort({ createdAt: -1 });
    res.json(decisionLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new decision log
// @route   POST /api/decision-logs
// @access  Private
exports.createDecisionLog = async (req, res) => {
  const { project, title, status, context, decision, rationale } = req.body;

  try {
    const newDecisionLog = new DecisionLog({
      project,
      title,
      status,
      context,
      decision,
      rationale
    });

    const decisionLog = await newDecisionLog.save();
    res.json(decisionLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update decision log
// @route   PUT /api/decision-logs/:id
// @access  Private
exports.updateDecisionLog = async (req, res) => {
  const { title, status, context, decision, rationale } = req.body;

  try {
    let decisionLog = await DecisionLog.findById(req.params.id);

    if (!decisionLog) {
      return res.status(404).json({ message: 'Decision Log not found' });
    }

    decisionLog.title = title || decisionLog.title;
    decisionLog.status = status || decisionLog.status;
    decisionLog.context = context || decisionLog.context;
    decisionLog.decision = decision || decisionLog.decision;
    decisionLog.rationale = rationale || decisionLog.rationale;

    await decisionLog.save();
    res.json(decisionLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete decision log
// @route   DELETE /api/decision-logs/:id
// @access  Private
exports.deleteDecisionLog = async (req, res) => {
  try {
    const decisionLog = await DecisionLog.findById(req.params.id);

    if (!decisionLog) {
      return res.status(404).json({ message: 'Decision Log not found' });
    }

    await DecisionLog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Decision Log removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
