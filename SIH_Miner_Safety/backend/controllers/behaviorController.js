import EngagementEvent from '../models/EngagementEvent.js';
import DailyComplianceSnapshot from '../models/DailyComplianceSnapshot.js';
import BehaviorAlert from '../models/BehaviorAlert.js';
import User from '../models/User.js';
import { EMPLOYEE_ROLE_FILTER, isEmployeeRole, normalizeRole } from '../utils/roleUtils.js';

const SUPPORTED_EVENT_TYPES = [
  'app_login',
  'app_logout',
  'checklist_viewed',
  'checklist_item_completed',
  'checklist_completed',
  'ppe_confirmed',
  'ppe_skipped',
  'video_started',
  'video_progress',
  'video_completed',
  'hazard_reported',
  'instruction_acknowledged',
  'quiz_completed',
  'nudge_acknowledged',
];

const formatDateKey = (date) => {
  const iso = new Date(date || Date.now()).toISOString();
  return iso.split('T')[0];
};

const clampScore = (value) => Math.max(0, Math.min(100, value));

const computeComplianceScore = (metrics) => {
  // Safety compliance score is now based ONLY on:
  // - Safety checklist completion
  // - Time spent watching training videos
  // - Reporting hazards
  // - Quiz scores from safety case studies

  // Checklist: use completion rate if available, otherwise give full
  // credit if at least one checklist was fully completed.
  const checklistScore = metrics.checklistCompletionRate || (metrics.checklistsCompleted > 0 ? 100 : 0);

  // Video watch time: derive from engagement minutes (driven by video progress
  // and completion events). Cap full credit at ~20 minutes of watch time per day.
  const videoWatchScore = clampScore((metrics.engagementMinutes || 0) * 5); // 20 minutes => 100

  // Hazard reporting: reward proactive hazard reporting, capped so a few
  // reports give full credit.
  const hazardScore = clampScore((metrics.hazardsReported || 0) * 10); // 10 hazards => 100

  // Quiz performance from case studies (and other safety quizzes that log
  // quiz_completed with a score in metadata.score).
  const quizScore = clampScore(metrics.quizAverageScore || 0);

  // Weighting:
  // - 40% checklist adherence
  // - 25% video watch time
  // - 15% hazard reporting
  // - 20% quiz performance
  return Math.round(
    0.4 * checklistScore +
    0.25 * videoWatchScore +
    0.15 * hazardScore +
    0.2 * quizScore
  );
};

const defaultMetrics = () => ({
  checklistsCompleted: 0,
  checklistItemsCompleted: 0,
  totalChecklistItems: 0,
  checklistCompletionRate: 0,
  videosStarted: 0,
  videosCompleted: 0,
  videoMilestones: 0,
  videoWatchSeconds: 0,
  hazardsReported: 0,
  acknowledgements: 0,
  ppeChecksPassed: 0,
  ppeChecksFailed: 0,
  quizAttempts: 0,
  quizAverageScore: 0,
  engagementMinutes: 0,
  nudgesAcknowledged: 0,
  loginCount: 0,
});

const ensureAlert = async (userId, snapshotDate, type, severity, message, metadata = {}) => {
  const existing = await BehaviorAlert.findOne({
    user: userId,
    snapshotDate,
    type,
    status: 'open',
  });

  if (existing) {
    return existing;
  }

  return BehaviorAlert.create({
    user: userId,
    snapshotDate,
    type,
    severity,
    message,
    metadata,
  });
};

export const updateDailySnapshot = async (userId, type, metadata = {}, occurredAt = new Date()) => {
  const dateKey = formatDateKey(occurredAt);

  // Only mine employees should have a safety compliance score and daily snapshot.
  // Skip snapshot creation & scoring for supervisors, admins, and DGMS officers.
  const user = await User.findById(userId).select('role');
  if (!user || !isEmployeeRole(user.role)) {
    return null;
  }

  let snapshot = await DailyComplianceSnapshot.findOne({ user: userId, date: dateKey });
  const isNewSnapshot = !snapshot;

  if (!snapshot) {
    snapshot = new DailyComplianceSnapshot({
      user: userId,
      date: dateKey,
      metrics: defaultMetrics(),
    });
  }

  const metrics = { ...defaultMetrics(), ...(snapshot.metrics?.toObject?.() || snapshot.metrics || {}) };

  switch (type) {
  case 'app_login':
    metrics.loginCount += 1;
    break;
  case 'checklist_viewed':
    metrics.totalChecklistItems = metadata.totalItems || metrics.totalChecklistItems || 0;
    break;
  case 'checklist_item_completed':
    metrics.checklistItemsCompleted += metadata.completed ? 1 : 0;
    metrics.totalChecklistItems = metadata.totalItems || metrics.totalChecklistItems;
    break;
  case 'checklist_completed':
    metrics.checklistsCompleted += 1;
    metrics.checklistItemsCompleted = metrics.totalChecklistItems || metrics.checklistItemsCompleted;
    break;
  case 'ppe_confirmed':
    metrics.ppeChecksPassed += 1;
    break;
  case 'ppe_skipped':
    metrics.ppeChecksFailed += 1;
    break;
  case 'video_started':
    metrics.videosStarted += 1;
    break;
  case 'video_progress':
    metrics.videoMilestones += 1;
    if (metadata.deltaSeconds) {
      metrics.videoWatchSeconds += metadata.deltaSeconds;
      metrics.engagementMinutes += metadata.deltaSeconds / 60;
    }
    break;
  case 'video_completed':
    metrics.videosCompleted += 1;
    if (metadata.durationSeconds) {
      metrics.videoWatchSeconds += metadata.durationSeconds;
      metrics.engagementMinutes += metadata.durationSeconds / 60;
    }
    break;
  case 'hazard_reported':
    metrics.hazardsReported += 1;
    break;
  case 'instruction_acknowledged':
    metrics.acknowledgements += 1;
    break;
  case 'quiz_completed': {
    const score = Number(metadata.score) || 0;
    const attempts = metrics.quizAttempts || 0;
    metrics.quizAverageScore = attempts === 0
      ? score
      : ((metrics.quizAverageScore * attempts) + score) / (attempts + 1);
    metrics.quizAverageScore = Number(metrics.quizAverageScore.toFixed(2));
    metrics.quizAttempts = attempts + 1;
    break;
  }
  case 'nudge_acknowledged':
    metrics.nudgesAcknowledged += 1;
    break;
  default:
    break;
  }

  if (metrics.totalChecklistItems > 0) {
    metrics.checklistCompletionRate = Math.round(
      (metrics.checklistItemsCompleted / metrics.totalChecklistItems) * 100
    );
  } else if (metrics.checklistsCompleted > 0) {
    metrics.checklistCompletionRate = 100;
  }

  const complianceScore = computeComplianceScore(metrics);
  const riskLevel = complianceScore < 60 ? 'high' : complianceScore < 80 ? 'medium' : 'low';

  if (complianceScore >= 80) {
    if (!snapshot.streakSeeded) {
      const previousDate = new Date(dateKey);
      previousDate.setDate(previousDate.getDate() - 1);
      const previousKey = formatDateKey(previousDate);
      const previousSnapshot = await DailyComplianceSnapshot.findOne({ user: userId, date: previousKey });
      const previousStreak = previousSnapshot && previousSnapshot.complianceScore >= 80
        ? previousSnapshot.streakCount || 0
        : 0;
      snapshot.streakCount = previousStreak + 1;
      snapshot.streakSeeded = true;
    }
  } else {
    snapshot.streakCount = 0;
    snapshot.streakSeeded = false;
  }

  snapshot.metrics = metrics;
  snapshot.complianceScore = complianceScore;
  snapshot.riskLevel = riskLevel;
  snapshot.lastEventType = type;
  snapshot.lastEventMetadata = metadata;
  snapshot.lastEventAt = occurredAt;

  await snapshot.save();

  if (riskLevel === 'high') {
    await ensureAlert(
      userId,
      dateKey,
      'low_compliance',
      'high',
      'Compliance score dropped below 60.',
      { complianceScore }
    );
  }

  if (type === 'ppe_skipped') {
    await ensureAlert(
      userId,
      dateKey,
      'ppe_non_compliance',
      'medium',
      'Repeated PPE confirmations were skipped.',
      { totalSkipped: metrics.ppeChecksFailed }
    );
  }

  return snapshot;
};

export const logEngagementEvent = async (req, res) => {
  try {
    const { type, metadata = {} } = req.body;

    if (!SUPPORTED_EVENT_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported engagement event type',
      });
    }

    const event = await EngagementEvent.create({
      user: req.user._id,
      type,
      metadata,
      occurredAt: metadata.occurredAt || new Date(),
    });

    await updateDailySnapshot(req.user._id, type, metadata, event.occurredAt);

    res.status(201).json({
      success: true,
      eventId: event._id,
    });
  } catch (error) {
    console.error('Error logging engagement event:', error);
    res.status(500).json({ success: false, message: 'Failed to log engagement event' });
  }
};

export const getMyBehaviorSnapshot = async (req, res) => {
  try {
    const range = Number(req.query.range) || 7;
    const endDate = formatDateKey(new Date());
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - (range - 1));
    const startDate = formatDateKey(startDateObj);

    const snapshots = await DailyComplianceSnapshot
      .find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 });

    const latest = snapshots[snapshots.length - 1] || null;

    res.json({
      success: true,
      data: {
        latest,
        trend: snapshots.map((snapshot) => ({
          date: snapshot.date,
          complianceScore: snapshot.complianceScore,
          riskLevel: snapshot.riskLevel,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching behavior snapshot:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch behavior snapshot' });
  }
};

export const getSupervisorBehaviorOverview = async (req, res) => {
  try {
    const rangeDays = Number(req.query.range) || 7;
    const endDate = formatDateKey(new Date());
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - (rangeDays - 1));
    const startDate = formatDateKey(startDateObj);

    const [snapshots, totalEmployees, alerts, heatmapAggregation] = await Promise.all([
      DailyComplianceSnapshot
        .find({ date: { $gte: startDate, $lte: endDate } })
        .populate('user', 'name role email'),
      // Only count mine employees when reporting safety compliance and risk
      User.countDocuments({ role: { $in: EMPLOYEE_ROLE_FILTER } }),
      BehaviorAlert.find({ status: 'open' })
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(20),
      EngagementEvent.aggregate([
        {
          $match: {
            occurredAt: { $gte: new Date(Date.now() - (24 * 60 * 60 * 1000)) },
            'metadata.zone': { $exists: true },
          },
        },
        {
          $group: {
            _id: '$metadata.zone',
            events: { $sum: 1 },
            ppeSkips: {
              $sum: {
                $cond: [{ $eq: ['$type', 'ppe_skipped'] }, 1, 0],
              },
            },
            hazards: {
              $sum: {
                $cond: [{ $eq: ['$type', 'hazard_reported'] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    // Only compute averages over employees; filter out non-employee roles.
    const employeeSnapshots = snapshots.filter((snap) => normalizeRole(snap.user?.role) === 'employee');

    const averageScore = employeeSnapshots.length
      ? Math.round(employeeSnapshots.reduce((acc, snap) => acc + (snap.complianceScore || 0), 0) / employeeSnapshots.length)
      : 0;

    const todaySnapshots = employeeSnapshots.filter((snap) => snap.date === endDate);
    const highRisk = todaySnapshots.filter((snap) => snap.riskLevel === 'high');
    const lowRisk = todaySnapshots.filter((snap) => snap.riskLevel === 'low');
    const inactiveEmployees = Math.max(totalEmployees - todaySnapshots.length, 0);

    const trendMap = {};
    snapshots.forEach((snap) => {
      if (!trendMap[snap.date]) {
        trendMap[snap.date] = { scoreSum: 0, count: 0 };
      }
      trendMap[snap.date].scoreSum += snap.complianceScore || 0;
      trendMap[snap.date].count += 1;
    });
    const trend = Object.entries(trendMap)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        averageScore: Math.round(data.scoreSum / data.count),
      }));

    const topCompliantEmployees = [...todaySnapshots]
      .sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0))
      .slice(0, 5);

    const atRiskEmployees = [...todaySnapshots]
      .filter((snap) => snap.riskLevel !== 'low')
      .sort((a, b) => (a.complianceScore || 0) - (b.complianceScore || 0))
      .slice(0, 5);

    const heatmap = heatmapAggregation.map((zone) => ({
      zone: zone._id || 'Unspecified',
      totalEvents: zone.events,
      ppeIncidents: zone.ppeSkips,
      hazardsReported: zone.hazards,
      riskLevel: zone.ppeSkips > 2 ? 'high' : zone.ppeSkips > 0 ? 'medium' : 'low',
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalWorkers: totalEmployees,
          averageScore,
          highRiskCount: highRisk.length,
          lowRiskCount: lowRisk.length,
          inactiveWorkers: inactiveEmployees,
        },
        trend,
        topCompliantWorkers: topCompliantEmployees,
        atRiskWorkers: atRiskEmployees,
        heatmap,
        alerts,
      },
    });
  } catch (error) {
    console.error('Error fetching supervisor overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supervisor overview' });
  }
};

export const listBehaviorAlerts = async (req, res) => {
  try {
    const alerts = await BehaviorAlert
      .find({ status: 'open' })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching behavior alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch behavior alerts' });
  }
};

export const acknowledgeBehaviorAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await BehaviorAlert.findById(id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    await alert.save();

    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error acknowledging behavior alert:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge alert' });
  }
};

// @desc    Lightweight predictive risk endpoint
// @route   POST /api/behavior/predict
// @access  Private
export const predictRisk = async (req, res) => {
  try {
    const { userId: requestedUserId, metrics: providedMetrics } = req.body || {};

    // Determine which user to evaluate: explicit userId or the requester
    const targetUserId = requestedUserId || req.user?._id;

    // If metrics are provided directly, use them (useful for supervisor simulations)
    let metrics = providedMetrics;

    // Otherwise fetch the latest snapshot for the target user
    let latestSnapshot = null;
    if (!metrics) {
      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'userId or metrics required' });
      }

      latestSnapshot = await DailyComplianceSnapshot.findOne({ user: targetUserId }).sort({ date: -1 });
      if (!latestSnapshot) {
        return res.status(404).json({ success: false, message: 'No snapshot available for user' });
      }

      metrics = latestSnapshot.metrics || defaultMetrics();
    }

    // Basic baseline compliance score using existing scoring function
    const baselineCompliance = computeComplianceScore(metrics);

    // Pull previous snapshot to detect short-term trend (if available)
    let trendDelta = 0;
    if (!providedMetrics && latestSnapshot) {
      const prevSnapshot = await DailyComplianceSnapshot.findOne({
        user: targetUserId,
        date: { $lt: latestSnapshot.date }
      }).sort({ date: -1 });
      if (prevSnapshot) {
        const prevScore = prevSnapshot.complianceScore || computeComplianceScore(prevSnapshot.metrics || defaultMetrics());
        trendDelta = baselineCompliance - prevScore; // positive => improving, negative => declining
      }
    }

    // Predict next-day compliance using a simple trend-adjusted heuristic
    // If trendDelta is negative (decline), amplify the effect to forecast further decline.
    const predictedCompliance = clampScore(
      baselineCompliance + (trendDelta >= 0 ? trendDelta * 0.4 : trendDelta * 1.2)
    );

    // Risk is inverse of predicted compliance
    const riskScore = Math.round(clampScore(100 - predictedCompliance));
    const riskLevel = predictedCompliance < 60 ? 'high' : predictedCompliance < 80 ? 'medium' : 'low';

    // Build simple confidence metric based on available features
    const featuresAvailable = [
      'checklistCompletionRate', 'engagementMinutes', 'hazardsReported', 'quizAverageScore', 'ppeChecksFailed'
    ].reduce((acc, key) => acc + (typeof metrics[key] !== 'undefined' && metrics[key] !== null ? 1 : 0), 0);
    const confidence = Math.min(95, 50 + featuresAvailable * 9); // 50-95

    // Suggested next actions
    const suggestions = [];
    if ((metrics.checklistCompletionRate || 0) < 80) suggestions.push('Complete your daily safety checklist immediately');
    if ((metrics.engagementMinutes || 0) < 10) suggestions.push('Watch assigned safety training videos (at least 15 minutes)');
    if ((metrics.ppeChecksFailed || 0) > 0) suggestions.push('Verify PPE and confirm presence (helmet, vest, goggles)');
    if ((metrics.hazardsReported || 0) === 0) suggestions.push('Report observed hazards in your area if any');

    const explanation = {
      baselineCompliance,
      trendDelta,
      predictedCompliance,
      featuresUsed: featuresAvailable,
    };

    res.json({
      success: true,
      data: {
        riskScore,
        riskLevel,
        confidence,
        suggestions,
        explanation,
      }
    });
  } catch (error) {
    console.error('Error in predictRisk:', error);
    res.status(500).json({ success: false, message: 'Failed to predict risk' });
  }
};

