const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { logger } = require('../utils/logger');

const GAME_CAPTURES_PATH = '/home/totaluploads/gameCaptures';

// Helper function to recursively get all image files
function getAllImages(dirPath, baseUrl = '') {
    const images = [];
    
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                // Recursively get images from subdirectories
                const subImages = getAllImages(fullPath, `${baseUrl}/${item}`);
                images.push(...subImages);
            } else if (stats.isFile() && /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(item)) {
                // It's an image file
                images.push({
                    filename: item,
                    path: `${baseUrl}/${item}`.replace(/^\//, ''), // Remove leading slash
                    fullPath: fullPath,
                    size: stats.size,
                    modified: stats.mtime,
                    directory: baseUrl.replace(/^\//, '') || 'root'
                });
            }
        }
    } catch (error) {
        logger.error(`Error reading directory ${dirPath}:`, error);
    }
    
    return images;
}

// Helper function to organize images by game and child
function organizeImages(images) {
    const organized = {};
    
    images.forEach(image => {
        const pathParts = image.path.split('/');
        if (pathParts.length >= 3) {
            const gameId = pathParts[0];
            const childId = pathParts[1];
            const date = pathParts[2];
            
            if (!organized[gameId]) {
                organized[gameId] = {};
            }
            if (!organized[gameId][childId]) {
                organized[gameId][childId] = {};
            }
            if (!organized[gameId][childId][date]) {
                organized[gameId][childId][date] = [];
            }
            
            organized[gameId][childId][date].push(image);
        }
    });
    
    return organized;
}

// Route to display all game captures in HTML format
router.get('/', (req, res) => {
    try {
        const allImages = getAllImages(GAME_CAPTURES_PATH);
        const organizedImages = organizeImages(allImages);
        
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Captures - Total Solutions</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .game-section {
            margin-bottom: 40px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .game-header {
            background: #007bff;
            color: white;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
        }
        .child-section {
            border-bottom: 1px solid #eee;
        }
        .child-header {
            background: #f8f9fa;
            padding: 12px 15px;
            font-weight: bold;
            border-bottom: 1px solid #dee2e6;
        }
        .date-section {
            padding: 15px;
        }
        .date-header {
            font-weight: bold;
            color: #495057;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 10px;
        }
        .image-item {
            border: 1px solid #dee2e6;
            border-radius: 4px;
            overflow: hidden;
            background: white;
        }
        .image-item img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .image-item img:hover {
            transform: scale(1.05);
        }
        .image-info {
            padding: 8px;
            font-size: 12px;
            color: #6c757d;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            color: #6c757d;
            margin-top: 5px;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
        }
        .modal-content {
            margin: auto;
            display: block;
            width: 80%;
            max-width: 700px;
            max-height: 80%;
            margin-top: 50px;
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Game Captures - Total Solutions</h1>
        <p>View all captured game screenshots organized by game, child, and date</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${Object.keys(organizedImages).length}</div>
            <div class="stat-label">Games</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${allImages.length}</div>
            <div class="stat-label">Total Images</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(allImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024)} MB</div>
            <div class="stat-label">Total Size</div>
        </div>
    </div>
`;

        // Generate HTML for each game
        Object.keys(organizedImages).sort().forEach(gameId => {
            html += `
    <div class="game-section">
        <div class="game-header">Game ID: ${gameId}</div>
`;
            
            Object.keys(organizedImages[gameId]).sort().forEach(childId => {
                html += `
        <div class="child-section">
            <div class="child-header">Child ID: ${childId}</div>
`;
                
                Object.keys(organizedImages[gameId][childId]).sort().reverse().forEach(date => {
                    const images = organizedImages[gameId][childId][date];
                    html += `
            <div class="date-section">
                <div class="date-header">Date: ${date} (${images.length} images)</div>
                <div class="images-grid">
`;
                    
                    images.forEach(image => {
                        const imageUrl = `/uploads/gameCaptures/${image.path}`;
                        html += `
                    <div class="image-item">
                        <img src="${imageUrl}" alt="${image.filename}" onclick="openModal('${imageUrl}')">
                        <div class="image-info">
                            ${image.filename}<br>
                            ${Math.round(image.size / 1024)} KB
                        </div>
                    </div>
`;
                    });
                    
                    html += `
                </div>
            </div>
`;
                });
                
                html += `
        </div>
`;
            });
            
            html += `
    </div>
`;
        });

        html += `
    <!-- Modal for image preview -->
    <div id="imageModal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>

    <script>
        function openModal(imageSrc) {
            document.getElementById('imageModal').style.display = 'block';
            document.getElementById('modalImage').src = imageSrc;
        }

        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        // Close modal when clicking outside the image
        window.onclick = function(event) {
            const modal = document.getElementById('imageModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>
`;

        res.send(html);
    } catch (error) {
        logger.error('Error generating game captures page:', error);
        res.status(500).send(`
            <h1>Error</h1>
            <p>Unable to load game captures: ${error.message}</p>
        `);
    }
});

// API route to get images data as JSON
router.get('/api', (req, res) => {
    try {
        const allImages = getAllImages(GAME_CAPTURES_PATH);
        const organizedImages = organizeImages(allImages);
        
        res.json({
            success: true,
            totalImages: allImages.length,
            totalGames: Object.keys(organizedImages).length,
            images: organizedImages,
            raw: allImages
        });
    } catch (error) {
        logger.error('Error getting game captures data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route to get images for a specific game
router.get('/game/:gameId', (req, res) => {
    try {
        const { gameId } = req.params;
        const gamePath = path.join(GAME_CAPTURES_PATH, gameId);
        
        if (!fs.existsSync(gamePath)) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }
        
        const images = getAllImages(gamePath, gameId);
        const organized = organizeImages(images);
        
        res.json({
            success: true,
            gameId,
            images: organized[gameId] || {},
            totalImages: images.length
        });
    } catch (error) {
        logger.error('Error getting game images:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route to get images for a specific child in a specific game
router.get('/game/:gameId/child/:childId', (req, res) => {
    try {
        const { gameId, childId } = req.params;
        const childPath = path.join(GAME_CAPTURES_PATH, gameId, childId);
        
        if (!fs.existsSync(childPath)) {
            return res.status(404).json({
                success: false,
                error: 'Child or game not found'
            });
        }
        
        const images = getAllImages(childPath, `${gameId}/${childId}`);
        const organized = organizeImages(images);
        
        res.json({
            success: true,
            gameId,
            childId,
            images: organized[gameId]?.[childId] || {},
            totalImages: images.length
        });
    } catch (error) {
        logger.error('Error getting child images:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;