import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Hazard from '../models/Hazard.js';

const router = express.Router();

/**
 * GET /api/mine/risk
 * Admin-only endpoint returning AI-style risk data per zone.
 *
 * NOTE: This is a simple heuristic implementation that derives "risk" from
 * recent hazards. You can later replace this with a proper ML model while
 * keeping the same response shape for the frontend.
 *
 * Query params:
 * - horizonHours (optional, default 24): time window to consider recent hazards.
 */
router.get('/risk', protect, authorize('admin'), async (req, res) => {
  try {
    const horizonHours = parseInt(req.query.horizonHours, 10) || 24;
    const since = new Date(Date.now() - horizonHours * 60 * 60 * 1000);

    // Fetch recent hazards
    const recentHazards = await Hazard.find({ createdAt: { $gte: since } }).lean();

    // If no recent hazards, return a small demo set so UI still shows a clear
    // heatmap. You can remove this block in production.
    if (!recentHazards.length) {
      return res.json([
        {
          id: 'DEMO-ZONE-1',
          zoneId: 'DEMO-ENTRY',
          position: [0, -10, 0],
          radius: 4,
          riskLevel: 'LOW',
          riskScore: 0.25,
          topReasons: ['No recent serious hazards reported'],
        },
        {
          id: 'DEMO-ZONE-2',
          zoneId: 'DEMO-MID-SECTION',
          position: [10, -15, 5],
          radius: 4,
          riskLevel: 'MEDIUM',
          riskScore: 0.55,
          topReasons: ['Some medium-severity hazards in last day'],
        },
        {
          id: 'DEMO-ZONE-3',
          zoneId: 'DEMO-LOADER-BAY',
          position: [20, -20, -5],
          radius: 4,
          riskLevel: 'HIGH',
          riskScore: 0.78,
          topReasons: ['Frequent physical hazards', 'High equipment traffic'],
        },
        {
          id: 'DEMO-ZONE-4',
          zoneId: 'DEMO-GAS-POCKET',
          position: [-15, -20, 10],
          radius: 4,
          riskLevel: 'CRITICAL',
          riskScore: 0.92,
          topReasons: ['Cluster of high/critical hazards', 'Needs immediate review'],
        },
      ]);
    }

    // Aggregate simple risk per "zone".
    // For now we use hazard.location?.description or 'ZONE-UNKNOWN' as zoneId.
    const zoneMap = new Map();

    recentHazards.forEach((hz) => {
      const zoneId = hz.location?.description || hz.location?.zoneId || 'ZONE-UNKNOWN';

      if (!zoneMap.has(zoneId)) {
        zoneMap.set(zoneId, {
          zoneId,
          count: 0,
          weightedScore: 0,
          topReasons: new Set(),
        });
      }

      const entry = zoneMap.get(zoneId);
      entry.count += 1;

      // Map severity -> simple numeric score
      const sev = (hz.severity || '').toLowerCase();
      let sevScore = 0.3;
      if (sev === 'low') sevScore = 0.3;
      else if (sev === 'medium') sevScore = 0.6;
      else if (sev === 'high') sevScore = 0.8;
      else if (sev === 'critical') sevScore = 1.0;

      entry.weightedScore += sevScore;

      if (hz.category) {
        entry.topReasons.add(`Recent ${hz.category} hazard reported`);
      }
      if (hz.severity) {
        entry.topReasons.add(`Severity ${hz.severity}`);
      }
    });

    // Build response list
    const riskZones = Array.from(zoneMap.values()).map((z, index) => {
      const avgScore = z.count > 0 ? z.weightedScore / z.count : 0;
      let riskLevel = 'LOW';
      if (avgScore >= 0.8) riskLevel = 'CRITICAL';
      else if (avgScore >= 0.6) riskLevel = 'HIGH';
      else if (avgScore >= 0.4) riskLevel = 'MEDIUM';

      return {
        id: `${z.zoneId || 'ZONE'}-${index}`,
        zoneId: z.zoneId || `ZONE-${index + 1}`,
        // For now we do not have coordinates from DB, so use 0,0,0 and a
        // default radius; the 3D view can ignore position if not needed.
        position: [0, -10, 0],
        radius: 4,
        riskLevel,
        riskScore: Number(avgScore.toFixed(2)),
        topReasons: Array.from(z.topReasons),
      };
    });

    // If there are no recent hazards, return an empty array
    return res.json(riskZones);
  } catch (error) {
    console.error('Error computing mine risk:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute mine risk',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
