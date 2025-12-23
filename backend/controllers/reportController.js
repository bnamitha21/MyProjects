import DailyComplianceSnapshot from '../models/DailyComplianceSnapshot.js';
import BehaviorAlert from '../models/BehaviorAlert.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

const parseDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
};

const formatDateKey = (date) => {
  const iso = new Date(date).toISOString();
  return iso.split('T')[0];
};

// GET /api/reports/dgms?start=YYYY-MM-DD&end=YYYY-MM-DD&format=csv|pdf
export const generateDgmsReport = async (req, res) => {
  try {
    const { start, end, format } = req.query;

    // Default to last 7 days if not provided
    const endDate = parseDate(end) || new Date();
    const startDate = parseDate(start) || new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

    // Our snapshot.date is stored as YYYY-MM-DD string
    const startKey = formatDateKey(startDate);
    const endKey = formatDateKey(endDate);

    const snapshots = await DailyComplianceSnapshot.find({
      date: { $gte: startKey, $lte: endKey }
    }).populate('user', 'name email role').lean();

    // Also fetch open alerts count per user in range for context
    const alerts = await BehaviorAlert.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$user', openAlerts: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } }, totalAlerts: { $sum: 1 } } }
    ]).exec();

    const alertsMap = {};
    (alerts || []).forEach((a) => {
      alertsMap[a._id?.toString()] = { openAlerts: a.openAlerts || 0, totalAlerts: a.totalAlerts || 0 };
    });

    // Build rows
    const rows = snapshots.map((s) => {
      const uid = s.user?._id?.toString();
      const alertInfo = alertsMap[uid] || { openAlerts: 0, totalAlerts: 0 };
      return {
        userId: uid,
        name: s.user?.name || '',
        email: s.user?.email || '',
        role: s.user?.role || '',
        date: s.date,
        complianceScore: s.complianceScore || 0,
        riskLevel: s.riskLevel || '',
        checklistCompletionRate: s.metrics?.checklistCompletionRate || 0,
        hazardsReported: s.metrics?.hazardsReported || 0,
        quizAverageScore: s.metrics?.quizAverageScore || 0,
        streakCount: s.streakCount || 0,
        openAlerts: alertInfo.openAlerts,
        totalAlerts: alertInfo.totalAlerts,
      };
    });

    if (!format || format === 'csv') {
      // Generate CSV
      const header = [
        'userId','name','email','role','date','complianceScore','riskLevel','checklistCompletionRate','hazardsReported','quizAverageScore','streakCount','openAlerts','totalAlerts'
      ];
      const csvLines = [header.join(',')];
      rows.forEach((r) => {
        const line = header.map((h) => {
          const val = r[h] ?? '';
          // escape quotes
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        }).join(',');
        csvLines.push(line);
      });

      const filename = `dgms-report-${startKey}-${endKey}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csvLines.join('\n'));
    }

    if (format === 'pdf') {
      // Generate simple PDF using PDFKit
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const filename = `dgms-report-${startKey}-${endKey}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.fontSize(18).text('DGMS Compliance Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Period: ${startKey} to ${endKey}`, { align: 'center' });
      doc.moveDown(1);

      // Write rows, paginating as needed
      doc.fontSize(9);
      rows.forEach((r) => {
        if (doc.y > 720) doc.addPage();
        doc.text(r.userId, { continued: true, width: 100 });
        doc.text(r.name, { continued: true, width: 150 });
        doc.text(r.email, { continued: true, width: 150 });
        doc.text(r.date, { continued: true, width: 60 });
        doc.text(String(r.complianceScore), { width: 40 });
        doc.fontSize(8).fillColor('gray');
        doc.text(`Risk: ${r.riskLevel} • Checklist: ${r.checklistCompletionRate}% • Hazards: ${r.hazardsReported} • QuizAvg: ${r.quizAverageScore} • Streak: ${r.streakCount} • OpenAlerts: ${r.openAlerts}`, { indent: 10 });
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('black');
      });

      doc.end();
      doc.pipe(res);
      return;
    }

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error generating DGMS report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

export default generateDgmsReport;
