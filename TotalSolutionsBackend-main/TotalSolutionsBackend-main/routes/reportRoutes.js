const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Reports = require("../models/Reports");
const createMulter = require("../middleware/fileUpload");
const fs = require("fs");
const path = require("path");
const fileUpload = require("express-fileupload");
const { logger } = require("../utils/logger");
router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
}));

router.post("/upload", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.report) {
      return res.status(400).send("No file uploaded");
    }
    const { childId, userId, reportType } = req.body;
    if (!childId || !userId || !reportType) {
      return res.status(400).send("Missing required fields");
    }
    const reportFile = req.files.report;
    const uploadPath = `/home/totaluploads/generatedReports/${childId}/${Date.now()}_${
      reportFile.name
    }`;

    const fileDir = path.dirname(uploadPath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    try {
      await fs.promises.writeFile(uploadPath, reportFile.data);
    } catch (err) {
      logger.error(err);
      return res.status(500).send("Error saving file: " + err.message);
    }
    const report = new Reports({
      childId,
      userId,
      reportType,
      reportName: reportFile.name,
      reportUrl: uploadPath,
      role: req.user.role
    });
    const savedReport = await report.save();
    return res.status(201).json(savedReport);
  } catch (err) {
    return res.status(500).send("Server Error: " + err.message);
  }
});


router.get("/child/:childId", auth, async (req, res) => {
    try {
        const { childId } = req.params;
        if (!childId) {
            return res.status(400).send("Child ID is required");
        }
        const reports = await Reports.find({ childId });
        return res.status(200).json(reports);
    } catch (err) {
        return res.status(500).send("Server Error: " + err.message);
    }
});

router.get("/:reportId", async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            return res.status(400).send("Report ID is required");
        }
        
        const report = await Reports.findById(reportId);
        if (!report) {
            return res.status(404).send("Report not found");
        }

        // Check if file exists on EBS
        if (!fs.existsSync(report.reportUrl)) {
            return res.status(404).send("Report file not found on server");
        }

        // Get file info
        const filePath = report.reportUrl;
        const fileName = report.reportName;
        const fileExt = path.extname(fileName).toLowerCase();
        
        // Set content type based on file extension
        let contentType = 'application/octet-stream';
        if (fileExt === '.pdf') {
            contentType = 'application/pdf';
        } else if (['.jpg', '.jpeg'].includes(fileExt)) {
            contentType = 'image/jpeg';
        } else if (fileExt === '.png') {
            contentType = 'image/png';
        } else if (fileExt === '.doc') {
            contentType = 'application/msword';
        } else if (fileExt === '.docx') {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Read the entire file into memory
        const fileBuffer = fs.readFileSync(filePath);
        
        // Set headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', fileBuffer.length);
        
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

        // Send the file buffer directly
        return res.status(200).send(fileBuffer);
        
    } catch (err) {
        logger.error('Report serving error:', err);
        return res.status(500).send("Server Error: " + err.message);
    }
});

// HTML interface to view all reports (for testing) - No auth required
router.get("/", async (req, res) => {
    try {
        // Get all reports with populated child info if available
        const reports = await Reports.find({}).sort({ createdAt: -1 });
        
        // Generate statistics
        const totalReports = reports.length;
        const reportsByType = {};
        const reportsByRole = {};
        let totalSize = 0;
        
        reports.forEach(report => {
            // Count by type
            reportsByType[report.reportType] = (reportsByType[report.reportType] || 0) + 1;
            
            // Count by role
            reportsByRole[report.role] = (reportsByRole[report.role] || 0) + 1;
            
            // Calculate total size if file exists
            if (fs.existsSync(report.reportUrl)) {
                const stats = fs.statSync(report.reportUrl);
                totalSize += stats.size;
            }
        });

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Reports - Total Solutions</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 1rem;
            font-weight: 500;
        }
        
        .reports-section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .section-title {
            font-size: 1.8rem;
            margin-bottom: 25px;
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .reports-grid {
            display: grid;
            gap: 20px;
        }
        
        .report-card {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            background: #fafafa;
        }
        
        .report-card:hover {
            border-color: #667eea;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
            background: white;
        }
        
        .report-header {
            display: flex;
            justify-content: between;
            align-items: flex-start;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .report-title {
            font-size: 1.2rem;
            font-weight: bold;
            color: #333;
            flex: 1;
            min-width: 200px;
        }
        
        .report-type {
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .report-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
            font-size: 0.9rem;
            color: #666;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .meta-label {
            font-weight: 600;
            color: #333;
        }
        
        .report-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .btn-view {
            background: #4CAF50;
            color: white;
        }
        
        .btn-view:hover {
            background: #45a049;
            transform: translateY(-1px);
        }
        
        .btn-download {
            background: #2196F3;
            color: white;
        }
        
        .btn-download:hover {
            background: #1976D2;
            transform: translateY(-1px);
        }
        
        .btn-info {
            background: #FF9800;
            color: white;
        }
        
        .btn-info:hover {
            background: #F57C00;
            transform: translateY(-1px);
        }
        
        .no-reports {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .no-reports h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .report-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .report-actions {
                justify-content: center;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 All Reports Dashboard</h1>
            <p>Total Solutions Report Management System</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalReports}</div>
                <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(reportsByType).length}</div>
                <div class="stat-label">Report Types</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${(totalSize / 1024 / 1024).toFixed(1)} MB</div>
                <div class="stat-label">Total Storage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(reportsByRole).length}</div>
                <div class="stat-label">User Roles</div>
            </div>
        </div>

        <div class="reports-section">
            <h2 class="section-title">All Reports (${totalReports})</h2>
            
            ${reports.length > 0 ? `
                <div class="reports-grid">
                    ${reports.map(report => {
                        const fileExists = fs.existsSync(report.reportUrl);
                        const fileSize = fileExists ? fs.statSync(report.reportUrl).size : 0;
                        const fileSizeFormatted = fileSize > 0 ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
                        
                        return `
                        <div class="report-card">
                            <div class="report-header">
                                <div class="report-title">📄 ${report.reportName}</div>
                                <div class="report-type">${report.reportType}</div>
                            </div>
                            
                            <div class="report-meta">
                                <div class="meta-item">
                                    <span class="meta-label">Child ID:</span>
                                    ${report.childId}
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Uploaded by:</span>
                                    ${report.role}
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">File Size:</span>
                                    ${fileSizeFormatted}
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Created:</span>
                                    ${new Date(report.createdAt).toLocaleDateString()}
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Status:</span>
                                    ${fileExists ? '✅ Available' : '❌ Missing'}
                                </div>
                            </div>
                            
                            ${fileExists ? `
                                <div class="report-actions">
                                    <a href="/api/reports/${report._id}" target="_blank" class="btn btn-view">
                                        👁️ View
                                    </a>
                                    <a href="/api/reports/${report._id}?download=true" class="btn btn-download">
                                        📥 Download
                                    </a>
                                    <a href="/api/reports/${report._id}/info" target="_blank" class="btn btn-info">
                                        ℹ️ Info
                                    </a>
                                </div>
                            ` : `
                                <div class="report-actions">
                                    <span style="color: #f44336; font-weight: 500;">❌ File not found on server</span>
                                </div>
                            `}
                        </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="no-reports">
                    <h3>📭 No Reports Found</h3>
                    <p>Upload some reports to see them here!</p>
                </div>
            `}
        </div>
    </div>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const reportCards = document.querySelectorAll('.report-card');
            
            reportCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    // Don't trigger if clicking on buttons
                    if (!e.target.classList.contains('btn')) {
                        // Optional: Add click behavior for entire card
                        console.log('Report card clicked');
                    }
                });
            });
            
            // Add tooltips or other enhancements here
            console.log('Reports dashboard loaded with ${totalReports} reports');
        });
    </script>
</body>
</html>
        `;

        res.send(html);
        
    } catch (err) {
        logger.error('Error generating reports page:', err);
        res.status(500).send(`
            <h1>Error Loading Reports</h1>
            <p>Unable to load reports: ${err.message}</p>
        `);
    }
});

module.exports = router;
