import CaseStudy from '../models/CaseStudy.js';
import CaseEngagement from '../models/CaseEngagement.js';
import { updateDailySnapshot } from './behaviorController.js';

const isPrivilegedRole = (role) =>
  ['supervisor', 'admin', 'dgms_officer'].includes(role || 'employee');

const formatListItem = (doc) => ({
  id: doc._id,
  title: doc.title,
  date: doc.date,
  severity: doc.severity,
  tags: doc.tags,
  location: doc.location,
  quickSummary: doc.quickSummary,
  microVideo: doc.microVideo,
  status: doc.status,
  engagementStats: doc.engagementStats,
});

const formatDetailView = (doc, role = 'employee') => {
  const base = doc.toObject({ versionKey: false });
  const employeeChecklist = base.preventiveChecklist?.filter((item) => item.role !== 'supervisor') || [];
  const supervisorChecklist = base.preventiveChecklist?.filter((item) => item.role !== 'employee') || [];

  if (!isPrivilegedRole(role)) {
    return {
      id: base._id,
      title: base.title,
      date: base.date,
      severity: base.severity,
      tags: base.tags,
      location: base.location,
      quickSummary: base.quickSummary,
      microVideo: base.microVideo,
      checklist: employeeChecklist,
      quiz: base.quiz?.slice(0, 1) || [],
      relevanceRoles: base.relevanceRoles,
      engagementStats: base.engagementStats,
    };
  }

  return {
    ...base,
    employeeChecklist,
    supervisorChecklist,
  };
};

const recomputeEngagementStats = async (caseId) => {
  const stats = await CaseEngagement.aggregate([
    { $match: { case: caseId } },
    {
      $group: {
        _id: '$case',
        views: {
          $sum: {
            $cond: [{ $ifNull: ['$viewedAt', false] }, 1, 0],
          },
        },
        completions: {
          $sum: {
            $cond: [{ $ifNull: ['$completedAt', false] }, 1, 0],
          },
        },
        averageQuizScore: { $avg: '$quizScore' },
      },
    },
  ]);

  const aggregateStats = stats[0] || { views: 0, completions: 0, averageQuizScore: 0 };

  await CaseStudy.findByIdAndUpdate(caseId, {
    engagementStats: {
      views: aggregateStats.views,
      completions: aggregateStats.completions,
      averageQuizScore: Number(aggregateStats.averageQuizScore || 0).toFixed ? Number(Number(aggregateStats.averageQuizScore || 0).toFixed(1)) : 0,
    },
  });

  return aggregateStats;
};

export const createCaseStudy = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?._id,
    };

    const caseStudy = await CaseStudy.create(payload);

    res.status(201).json({
      success: true,
      data: formatDetailView(caseStudy, req.user?.role),
    });
  } catch (error) {
    console.error('Error creating case study:', error);
    res.status(500).json({ success: false, message: 'Failed to create case study', error: error.message });
  }
};

export const updateCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!caseStudy) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    res.json({
      success: true,
      data: formatDetailView(caseStudy, req.user?.role),
    });
  } catch (error) {
    console.error('Error updating case study:', error);
    res.status(500).json({ success: false, message: 'Failed to update case study', error: error.message });
  }
};

export const listCaseStudies = async (req, res) => {
  try {
    const {
      role = req.user?.role || 'employee',
      tags,
      severity,
      search,
      status,
      limit = 25,
    } = req.query;

    const filter = {};

    if (!isPrivilegedRole(role)) {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filter.tags = { $in: tagArray.map((tag) => tag.trim()) };
    }

    if (severity) {
      filter.severity = severity;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { quickSummary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const cases = await CaseStudy
      .find(filter)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: cases.map(formatListItem),
      meta: { count: cases.length },
    });
  } catch (error) {
    console.error('Error listing case studies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch case studies', error: error.message });
  }
};

export const getCaseStudy = async (req, res) => {
  try {
    const role = req.query.role || req.user?.role || 'employee';
    const caseStudy = await CaseStudy.findById(req.params.id);

    if (!caseStudy) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    if (!isPrivilegedRole(role) && caseStudy.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Case study not published' });
    }

    res.json({
      success: true,
      data: formatDetailView(caseStudy, role),
    });
  } catch (error) {
    console.error('Error fetching case study:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch case study', error: error.message });
  }
};

export const approveCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findByIdAndUpdate(
      req.params.id,
      {
        status: 'published',
        approvedBy: req.user?._id,
        approvedAt: new Date(),
      },
      { new: true },
    );

    if (!caseStudy) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    res.json({
      success: true,
      message: 'Case study approved',
      data: formatDetailView(caseStudy, req.user?.role),
    });
  } catch (error) {
    console.error('Error approving case study:', error);
    res.status(500).json({ success: false, message: 'Failed to approve case study', error: error.message });
  }
};

export const logCaseEngagement = async (req, res) => {
  try {
    const { action = 'view', quizScore } = req.body;
    const role = req.user?.role || 'employee';
    const caseId = req.params.id;

    let engagement = await CaseEngagement.findOne({ case: caseId, user: req.user._id });

    if (!engagement) {
      engagement = new CaseEngagement({
        case: caseId,
        user: req.user._id,
        role,
      });
    }

    if (action === 'view' && !engagement.viewedAt) {
      engagement.viewedAt = new Date();
    }

    if (action === 'complete') {
      const completedAt = new Date();
      engagement.completedAt = completedAt;
      if (typeof quizScore === 'number') {
        engagement.quizScore = quizScore;

        // Log quiz completion into the daily safety compliance snapshot so that
        // case study quizzes contribute to the compliance score.
        await updateDailySnapshot(req.user._id, 'quiz_completed', {
          score: quizScore,
          source: 'case_study',
          caseId,
        }, completedAt);
      }
    }

    await engagement.save();
    const stats = await recomputeEngagementStats(engagement.case);

    res.json({
      success: true,
      message: 'Engagement logged',
      data: {
        engagement,
        stats,
      },
    });
  } catch (error) {
    console.error('Error logging case engagement:', error);
    res.status(500).json({ success: false, message: 'Failed to log engagement', error: error.message });
  }
};

