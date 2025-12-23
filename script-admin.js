<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin PANGS!T - Live Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>
                <i class="fas fa-satellite-dish"></i>
                PANGS!T LIVE ADMIN
            </h1>
            <p class="subtitle">Real-time orders from GitHub Pages</p>
            <div class="github-badge">
                <i class="fab fa-github"></i> GitHub Pages Active
            </div>
        </div>
        
        <!-- Stats -->
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalOrders">0</div>
                <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card new">
                <div class="stat-number" id="newOrders">0</div>
                <div class="stat-label">New Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="todayOrders">0</div>
                <div class="stat-label">Today's Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalRevenue">0</div>
                <div class="stat-label">Total Revenue</div>
            </div>
        </div>
        
        <!-- Bulk Actions -->
        <div class="bulk-actions" id="bulkActions">
            <div>
                <strong id="selectedCount">0</strong> orders selected
            </div>
            <div>
                <button class="btn btn-success" onclick="PangsitAdmin.updateBulkStatus('processing')">
                    <i class="fas fa-play"></i> Process Selected
                </button>
                <button class="btn" onclick="PangsitAdmin.updateBulkStatus('completed')">
                    <i class="fas fa-check"></i> Complete Selected
                </button>
                <button class="btn btn-secondary" onclick="PangsitAdmin.clearSelection()">
                    <i class="fas fa-times"></i> Clear
                </button>
            </div>
        </div>
        
        <!-- Controls -->
        <div class="controls">
            <button class="btn" onclick="PangsitAdmin.loadOrders()" id="refreshBtn">
                <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button class="btn btn-success" onclick="PangsitAdmin.exportOrders()">
                <i class="fas fa-download"></i> Export Data
            </button>
            <button class="btn" onclick="PangsitAdmin.toggleBulkSelectMode()">
                <i class="fas fa-check-square"></i> Bulk Select
            </button>
            <button class="btn btn-secondary" onclick="PangsitAdmin.clearAllOrders()">
                <i class="fas fa-trash"></i> Clear All
            </button>
            <div style="margin-left: auto; display: flex; align-items: center; gap: 10px;">
                <span id="lastUpdate">Last update: -</span>
                <span id="autoRefresh" style="background: #e9ecef; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                    Auto: ON
                </span>
            </div>
        </div>
        
        <!-- Orders Container -->
        <div class="orders-container" id="ordersContainer">
            <h2 style="color: var(--secondary); margin-bottom: 20px;">
                <i class="fas fa-bolt"></i> Live Orders
                <span id="ordersCount" style="font-size: 14px; color: var(--gray);">(0 orders)</span>
            </h2>
            
            <div class="orders-list" id="ordersList">
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No orders yet</h3>
                    <p>Waiting for customers to place orders</p>
                </div>
            </div>
            
            <!-- Pagination -->
            <div class="pagination" id="pagination"></div>
        </div>
        
        <!-- Instructions -->
        <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <h3 style="color: var(--secondary); margin-bottom: 15px;">
                <i class="fas fa-info-circle"></i> How It Works
            </h3>
            <div style="color: var(--gray); font-size: 14px; line-height: 1.6;">
                <p><strong>1.</strong> Customers order via main website</p>
                <p><strong>2.</strong> Orders saved to browser storage</p>
                <p><strong>3.</strong> This admin panel reads orders automatically</p>
                <p><strong>4.</strong> Admin can update status and contact customers</p>
                <p><strong>5.</strong> Data persists in browser (localStorage)</p>
            </div>
        </div>
    </div>
    
    <!-- Sound Toggle -->
    <div class="sound-toggle" onclick="PangsitAdmin.toggleSound()" id="soundToggle">
        <i class="fas fa-volume-up" id="soundIcon"></i>
    </div>
    
    <!-- Refresh Button -->
    <div class="refresh-fixed" onclick="PangsitAdmin.loadOrders()">
        <i class="fas fa-redo"></i>
    </div>
    
    <!-- Notification Sound -->
    <audio id="notificationSound" preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3" type="audio/mpeg">
    </audio>
    
    <script src="admin.js"></script>
</body>
</html>
