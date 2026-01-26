const Estimation = require('../models/Estimation');
const Requirement = require('../models/Requirement');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

// @desc    Get all estimations
// @route   GET /api/estimations
// @access  Private
exports.getEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.find()
      .populate('client', 'name company')
      .populate('requirement', 'title')
      .sort({ createdAt: -1 });
    res.json(estimations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single estimation
// @route   GET /api/estimations/:id
// @access  Private
exports.getEstimation = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id)
      .populate('client')
      .populate('requirement');
    if (!estimation) {
      return res.status(404).json({ msg: 'Estimation not found' });
    }
    res.json(estimation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Estimation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new estimation
// @route   POST /api/estimations
// @access  Private
exports.createEstimation = async (req, res) => {
  const { title, requirement, client, items, ironTriangle, currency, totalHours, totalCost } = req.body;

  try {
    const newEstimation = new Estimation({
      title,
      requirement,
      client,
      items,
      ironTriangle,
      currency,
      totalHours,
      totalCost
    });

    const estimation = await newEstimation.save();
    res.json(estimation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update estimation
// @route   PUT /api/estimations/:id
// @access  Private
exports.updateEstimation = async (req, res) => {
  const { title, items, ironTriangle, currency, totalHours, totalCost } = req.body;

  try {
    let estimation = await Estimation.findById(req.params.id);
    if (!estimation) {
      return res.status(404).json({ msg: 'Estimation not found' });
    }

    estimation.title = title || estimation.title;
    estimation.items = items || estimation.items;
    estimation.ironTriangle = ironTriangle || estimation.ironTriangle;
    estimation.currency = currency || estimation.currency;
    estimation.totalHours = totalHours !== undefined ? totalHours : estimation.totalHours;
    estimation.totalCost = totalCost !== undefined ? totalCost : estimation.totalCost;

    await estimation.save();
    res.json(estimation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Estimation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete estimation
// @route   DELETE /api/estimations/:id
// @access  Private
exports.deleteEstimation = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id);
    if (!estimation) {
      return res.status(404).json({ msg: 'Estimation not found' });
    }

    await estimation.deleteOne();
    res.json({ msg: 'Estimation removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Estimation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Generate AI Estimation
// @route   POST /api/estimations/ai-generate
// @access  Private
exports.generateAIEstimate = async (req, res) => {
  const { requirementId } = req.body;

  try {
    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ msg: 'Requirement not found' });
    }

    if (!process.env.OPENAI_API_KEY) {
        // Fallback Mock Response if no API Key
        console.warn('OPENAI_API_KEY not found, returning mock data');
        return res.json({
            items: [
                { description: 'Setup Project Infrastructure', role: 'DevOps', hours: 8, rate: 100, cost: 800 },
                { description: 'Database Schema Design', role: 'Senior Developer', hours: 6, rate: 150, cost: 900 },
                { description: 'Frontend Layout Implementation', role: 'Frontend Developer', hours: 16, rate: 120, cost: 1920 },
                { description: 'API Development', role: 'Backend Developer', hours: 24, rate: 130, cost: 3120 }
            ]
        });
    }

    // Prepare Prompt
    const prompt = `
      You are an expert Project Manager and Technical Architect.
      Based on the following project requirements, please generate a detailed itemized estimation.

      Requirement Title: ${requirement.title}
      Requirement Details: ${requirement.details.replace(/<[^>]*>?/gm, '')} // Strip HTML tags

      Output JSON format strictly:
      [
        { "description": "Task description", "role": "Role Name", "hours": number, "rate": number, "cost": number }
      ]
      Assume standard agency rates (Dev: $100-$150, Designer: $100, PM: $120).
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse JSON from AI response (handle potential markdown formatting)
    let items = [];
    try {
        const jsonMatch = aiResponse.match(/\[.*\]/s);
        if (jsonMatch) {
             items = JSON.parse(jsonMatch[0]);
        } else {
             items = JSON.parse(aiResponse);
        }
    } catch (parseError) {
        console.error('Failed to parse AI response', aiResponse);
        return res.status(500).json({ msg: 'AI Generation Failed to produce valid JSON' });
    }

    res.json({ items });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
