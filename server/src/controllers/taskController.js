const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, assignee, dueDate, tags } = req.body;

    // In a shared workspace, any authenticated user can create tasks in a project
    // We still verify the project exists
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get the max order for the status column
    const maxOrderTask = await Task.findOne({ project, status: status || 'todo' })
      .sort('-order')
      .select('order');
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      assignee,
      createdBy: req.user.id,
      dueDate,
      tags,
      order,
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks?project=:projectId
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignee, search } = req.query;

    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('order');

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // In a shared workspace, any authenticated user can update tasks
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Only creator, project owner, or admin can delete
    const project = await Project.findById(task.project);
    const isAdminOfProject = project.members.some(
      (m) => m.user.toString() === req.user.id.toString() && m.role === 'admin'
    );

    if (
      task.createdBy.toString() !== req.user.id.toString() &&
      project.owner.toString() !== req.user.id.toString() &&
      !isAdminOfProject &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task order (for drag & drop)
// @route   PUT /api/tasks/reorder
// @access  Private
exports.reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { id, status, order }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.id },
        update: { $set: { status: t.status, order: t.order } },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.json({ success: true, message: 'Tasks reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task analytics/stats
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res, next) => {
  try {
    const { project } = req.query;
    const match = {};
    if (project) match.project = require('mongoose').Types.ObjectId.createFromHexString(project);

    // Status distribution
    const statusStats = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Tasks created over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeline = await Task.aggregate([
      { $match: { ...match, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Overdue tasks
    const overdue = await Task.countDocuments({
      ...match,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    });

    const total = await Task.countDocuments(match);

    res.json({
      success: true,
      data: {
        statusStats,
        priorityStats,
        timeline,
        overdue,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};
