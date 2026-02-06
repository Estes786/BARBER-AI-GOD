import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Definisi Binding (Sesuai wrangler.jsonc)
type Bindings = {
  DB?: D1Database      // D1 Database (optional untuk fase 1)
  AI: any              // Workers AI (ALWAYS available!)
  R2?: R2Bucket        // R2 Storage (optional untuk fase 1)
  KV?: KVNamespace     // KV Storage (optional untuk fase 1)
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS untuk frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// BARBER-AI-GOD CORE ROUTES
// ============================================

// 1. ROUTE: Home - Landing Page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BARBER-AI-GOD | AI-Powered Barber Consultation</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 min-h-screen text-white">
        <div class="container mx-auto px-4 py-16">
            <!-- Header -->
            <div class="text-center mb-16">
                <h1 class="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    <i class="fas fa-cut mr-4"></i>
                    BARBER-AI-GOD
                </h1>
                <p class="text-2xl text-gray-300">AI-Powered Barber Consultation Platform</p>
                <p class="text-lg text-gray-400 mt-2">Built with Cloudflare Workers AI + D1 + R2 + KV</p>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-8 mb-16">
                <!-- Feature 1: AI Consultation -->
                <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30 hover:border-purple-500 transition-all">
                    <div class="text-5xl mb-4"><i class="fas fa-brain text-purple-400"></i></div>
                    <h3 class="text-2xl font-bold mb-3">AI Konsultasi</h3>
                    <p class="text-gray-300">Llama 3 AI memberikan saran gaya rambut berdasarkan bentuk wajah Anda</p>
                </div>

                <!-- Feature 2: Face Analysis -->
                <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-pink-500/30 hover:border-pink-500 transition-all">
                    <div class="text-5xl mb-4"><i class="fas fa-camera text-pink-400"></i></div>
                    <h3 class="text-2xl font-bold mb-3">Analisis Wajah</h3>
                    <p class="text-gray-300">ResNet AI menganalisis bentuk wajah dari foto Anda</p>
                </div>

                <!-- Feature 3: Credit System -->
                <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-indigo-500/30 hover:border-indigo-500 transition-all">
                    <div class="text-5xl mb-4"><i class="fas fa-coins text-indigo-400"></i></div>
                    <h3 class="text-2xl font-bold mb-3">Credit Gratis</h3>
                    <p class="text-gray-300">5 credit gratis setiap hari untuk konsultasi AI</p>
                </div>
            </div>

            <!-- Photo Upload Section -->
            <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700 mb-8">
                <h2 class="text-3xl font-bold mb-6">
                    <i class="fas fa-camera mr-2"></i>Upload Foto Wajah
                </h2>
                
                <div class="space-y-4">
                    <!-- User ID Input -->
                    <div>
                        <label class="block text-sm font-medium mb-2">User ID</label>
                        <input type="text" id="uploadUserId" value="user-demo-123" 
                               class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                    </div>
                    
                    <!-- File Input with Preview -->
                    <div>
                        <label class="block text-sm font-medium mb-2">Pilih Foto Wajah</label>
                        <input type="file" id="photoFile" accept="image/*" 
                               onchange="previewPhoto()"
                               class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                    </div>
                    
                    <!-- Photo Preview -->
                    <div id="photoPreview" class="hidden">
                        <label class="block text-sm font-medium mb-2">Preview:</label>
                        <img id="previewImage" class="w-full max-w-md mx-auto rounded-lg border border-gray-700">
                    </div>
                    
                    <!-- Upload Button -->
                    <button onclick="uploadFoto()" 
                            class="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                        <i class="fas fa-upload mr-2"></i>Analisis Wajah Sekarang
                    </button>
                    
                    <!-- Result Display -->
                    <div id="uploadResult" class="bg-gray-900 border border-gray-700 rounded-lg p-4 min-h-[100px] hidden">
                        <div id="uploadResultContent"></div>
                    </div>
                </div>
            </div>

            <!-- Dashboard Section (NEW!) -->
            <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700 mb-8">
                <h2 class="text-3xl font-bold mb-6">
                    <i class="fas fa-chart-line mr-2"></i>Dashboard Konsultasi
                </h2>
                
                <div class="space-y-4">
                    <!-- User ID Input -->
                    <div>
                        <label class="block text-sm font-medium mb-2">User ID</label>
                        <input type="text" id="dashboardUserId" value="user-demo-123" 
                               class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                    </div>
                    
                    <!-- Load Dashboard Button -->
                    <button onclick="loadDashboard()" 
                            class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                        <i class="fas fa-sync mr-2"></i>Load Dashboard
                    </button>
                    
                    <!-- Dashboard Content -->
                    <div id="dashboardContent" class="hidden space-y-6">
                        <!-- Statistics Cards -->
                        <div class="grid md:grid-cols-3 gap-4">
                            <div class="bg-gray-900 p-4 rounded-lg border border-purple-500/30">
                                <div class="text-sm text-gray-400 mb-1">Total Konsultasi</div>
                                <div id="totalConsultations" class="text-3xl font-bold text-purple-400">0</div>
                            </div>
                            <div class="bg-gray-900 p-4 rounded-lg border border-yellow-500/30">
                                <div class="text-sm text-gray-400 mb-1">Credit Tersisa</div>
                                <div id="creditsRemaining" class="text-3xl font-bold text-yellow-400">0</div>
                            </div>
                            <div class="bg-gray-900 p-4 rounded-lg border border-green-500/30">
                                <div class="text-sm text-gray-400 mb-1">Bentuk Wajah Utama</div>
                                <div id="mainFaceShape" class="text-3xl font-bold text-green-400">-</div>
                            </div>
                        </div>
                        
                        <!-- Chart: Face Shape Distribution -->
                        <div class="bg-gray-900 p-6 rounded-lg border border-gray-700">
                            <h3 class="text-xl font-bold mb-4"><i class="fas fa-chart-pie mr-2"></i>Distribusi Bentuk Wajah</h3>
                            <canvas id="faceShapeChart" width="400" height="200"></canvas>
                        </div>
                        
                        <!-- Consultation History Table -->
                        <div class="bg-gray-900 p-6 rounded-lg border border-gray-700">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-xl font-bold"><i class="fas fa-history mr-2"></i>Riwayat Konsultasi</h3>
                                <div class="space-x-2">
                                    <button onclick="exportHistory('json')" 
                                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all">
                                        <i class="fas fa-download mr-2"></i>Export JSON
                                    </button>
                                    <button onclick="exportHistory('csv')" 
                                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all">
                                        <i class="fas fa-file-csv mr-2"></i>Export CSV
                                    </button>
                                </div>
                            </div>
                            <div id="historyTable" class="overflow-x-auto">
                                <!-- Table will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dashboard Loading/Error -->
                    <div id="dashboardStatus" class="hidden bg-gray-900 border border-gray-700 rounded-lg p-4"></div>
                </div>
            </div>

            <!-- Demo Console -->
            <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
                <h2 class="text-3xl font-bold mb-6"><i class="fas fa-terminal mr-2"></i>Live Demo Console</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">User ID (untuk testing)</label>
                        <input type="text" id="userId" value="user-demo-123" 
                               class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Bentuk Wajah</label>
                        <select id="faceShape" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                            <option value="oval">Oval</option>
                            <option value="bulat">Bulat</option>
                            <option value="kotak">Kotak</option>
                            <option value="lonjong">Lonjong</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Pertanyaan Anda</label>
                        <textarea id="prompt" rows="3" 
                                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                  placeholder="Contoh: Gaya rambut apa yang cocok buat gue, Gyss?">Gaya rambut apa yang cocok buat rambut tipis?</textarea>
                    </div>
                    
                    <button onclick="konsultasi()" 
                            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                        <i class="fas fa-magic mr-2"></i>Konsultasi Sekarang
                    </button>
                    
                    <div id="result" class="bg-gray-900 border border-gray-700 rounded-lg p-4 min-h-[100px] hidden">
                        <div class="text-sm text-gray-400 mb-2">Hasil Konsultasi:</div>
                        <div id="resultContent" class="text-white"></div>
                    </div>
                </div>
            </div>

            <!-- Tech Stack -->
            <div class="mt-16 text-center">
                <h3 class="text-2xl font-bold mb-6">Tech Stack</h3>
                <div class="flex flex-wrap justify-center gap-4">
                    <span class="bg-orange-600/20 border border-orange-600 px-4 py-2 rounded-full">Hono.js</span>
                    <span class="bg-blue-600/20 border border-blue-600 px-4 py-2 rounded-full">Cloudflare Workers</span>
                    <span class="bg-green-600/20 border border-green-600 px-4 py-2 rounded-full">Workers AI (Llama 3)</span>
                    <span class="bg-yellow-600/20 border border-yellow-600 px-4 py-2 rounded-full">D1 Database</span>
                    <span class="bg-purple-600/20 border border-purple-600 px-4 py-2 rounded-full">R2 Storage</span>
                    <span class="bg-pink-600/20 border border-pink-600 px-4 py-2 rounded-full">KV Storage</span>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script>
            // Global variables for dashboard
            let faceShapeChartInstance = null;
            let currentDashboardData = null;

            // Load Dashboard Function
            async function loadDashboard() {
                const userId = document.getElementById('dashboardUserId').value;
                const statusDiv = document.getElementById('dashboardStatus');
                const contentDiv = document.getElementById('dashboardContent');
                
                statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading dashboard...';
                statusDiv.classList.remove('hidden');
                contentDiv.classList.add('hidden');
                
                try {
                    const response = await fetch('/api/dashboard/' + userId);
                    const data = await response.json();
                    
                    if (data.error) {
                        statusDiv.innerHTML = '<div class="text-red-400"><i class="fas fa-exclamation-triangle mr-2"></i>' + data.error + '</div>';
                        return;
                    }
                    
                    // Store data globally
                    currentDashboardData = data;
                    
                    // Update statistics cards
                    document.getElementById('totalConsultations').textContent = data.total_consultations;
                    document.getElementById('creditsRemaining').textContent = data.credits_remaining;
                    document.getElementById('mainFaceShape').textContent = data.main_face_shape.toUpperCase();
                    
                    // Update chart
                    updateFaceShapeChart(data.face_shape_distribution);
                    
                    // Update history table
                    updateHistoryTable(data.consultations);
                    
                    // Show dashboard
                    statusDiv.classList.add('hidden');
                    contentDiv.classList.remove('hidden');
                    
                } catch (error) {
                    statusDiv.innerHTML = '<div class="text-red-400"><i class="fas fa-times-circle mr-2"></i>Error: ' + error.message + '</div>';
                }
            }

            // Update Face Shape Chart
            function updateFaceShapeChart(distribution) {
                const ctx = document.getElementById('faceShapeChart').getContext('2d');
                
                // Destroy existing chart if any
                if (faceShapeChartInstance) {
                    faceShapeChartInstance.destroy();
                }
                
                const labels = Object.keys(distribution);
                const values = Object.values(distribution);
                
                faceShapeChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels.map(l => l.toUpperCase()),
                        datasets: [{
                            data: values,
                            backgroundColor: [
                                'rgba(168, 85, 247, 0.8)',  // purple
                                'rgba(236, 72, 153, 0.8)',  // pink
                                'rgba(99, 102, 241, 0.8)',  // indigo
                                'rgba(34, 197, 94, 0.8)',   // green
                                'rgba(251, 191, 36, 0.8)',  // yellow
                                'rgba(239, 68, 68, 0.8)',   // red
                                'rgba(59, 130, 246, 0.8)'   // blue
                            ],
                            borderColor: 'rgba(0, 0, 0, 0.8)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Update History Table
            function updateHistoryTable(consultations) {
                const tableDiv = document.getElementById('historyTable');
                
                if (consultations.length === 0) {
                    tableDiv.innerHTML = '<div class="text-gray-400 text-center py-8">Belum ada riwayat konsultasi</div>';
                    return;
                }
                
                let tableHTML = '<table class="w-full text-sm text-left">' +
                    '<thead class="text-xs uppercase bg-gray-800">' +
                    '<tr>' +
                    '<th class="px-4 py-3">#</th>' +
                    '<th class="px-4 py-3">Bentuk Wajah</th>' +
                    '<th class="px-4 py-3">Pertanyaan</th>' +
                    '<th class="px-4 py-3">Tanggal</th>' +
                    '<th class="px-4 py-3">Credit</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                
                consultations.slice(0, 10).forEach((item, index) => {
                    const date = new Date(item.created_at).toLocaleDateString('id-ID');
                    const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    
                    tableHTML += '<tr class="border-b border-gray-700 hover:bg-gray-800">' +
                        '<td class="px-4 py-3">' + (index + 1) + '</td>' +
                        '<td class="px-4 py-3">' +
                        '<span class="bg-purple-600/20 border border-purple-600 px-2 py-1 rounded text-purple-400">' +
                        item.face_shape.toUpperCase() +
                        '</span>' +
                        '</td>' +
                        '<td class="px-4 py-3 max-w-xs truncate">' + item.prompt + '</td>' +
                        '<td class="px-4 py-3">' +
                        '<div class="text-xs">' + date + '</div>' +
                        '<div class="text-xs text-gray-400">' + time + '</div>' +
                        '</td>' +
                        '<td class="px-4 py-3 text-yellow-400">' + item.credits_used + '</td>' +
                        '</tr>';
                });
                
                tableHTML += '</tbody></table>';
                
                if (consultations.length > 10) {
                    tableHTML += '<div class="text-gray-400 text-center py-4 text-sm">Menampilkan 10 dari ' + consultations.length + ' konsultasi</div>';
                }
                
                tableDiv.innerHTML = tableHTML;
            }

            // Export History Function
            function exportHistory(format) {
                if (!currentDashboardData || !currentDashboardData.consultations) {
                    alert('Load dashboard dulu, Gyss!');
                    return;
                }
                
                const consultations = currentDashboardData.consultations;
                const userId = document.getElementById('dashboardUserId').value;
                const timestamp = new Date().toISOString().split('T')[0];
                
                if (format === 'json') {
                    // Export as JSON
                    const jsonData = JSON.stringify({
                        user_id: userId,
                        exported_at: new Date().toISOString(),
                        total_consultations: consultations.length,
                        consultations: consultations
                    }, null, 2);
                    
                    downloadFile(jsonData, 'barber-ai-god-' + userId + '-' + timestamp + '.json', 'application/json');
                    
                } else if (format === 'csv') {
                    // Export as CSV
                    let csvData = 'ID,Face Shape,Prompt,Response,Credits Used,Created At\n';
                    
                    consultations.forEach(item => {
                        const row = [
                            item.id,
                            item.face_shape,
                            '"' + item.prompt.replace(/"/g, '""') + '"',
                            '"' + item.response.substring(0, 100).replace(/"/g, '""') + '..."',
                            item.credits_used,
                            item.created_at
                        ];
                        csvData += row.join(',') + '\n';
                    });
                    
                    downloadFile(csvData, 'barber-ai-god-' + userId + '-' + timestamp + '.csv', 'text/csv');
                }
            }

            // Helper: Download File
            function downloadFile(content, filename, mimeType) {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }


            // Photo Preview Function
            function previewPhoto() {
                const fileInput = document.getElementById('photoFile');
                const preview = document.getElementById('photoPreview');
                const previewImage = document.getElementById('previewImage');
                
                if (fileInput.files && fileInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImage.src = e.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                }
            }

            // Photo Upload Function
            async function uploadFoto() {
                const userId = document.getElementById('uploadUserId').value;
                const fileInput = document.getElementById('photoFile');
                const file = fileInput.files[0];
                const resultDiv = document.getElementById('uploadResult');
                const resultContent = document.getElementById('uploadResultContent');
                
                if (!file) {
                    alert('Pilih foto dulu, Gyss!');
                    return;
                }
                
                resultContent.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sedang menganalisis wajah dengan ResNet AI...';
                resultDiv.classList.remove('hidden');
                
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('userId', userId);
                    
                    const response = await fetch('/api/upload-foto', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        resultContent.innerHTML = 
                            '<div class="text-red-400">' +
                            '<i class="fas fa-exclamation-triangle mr-2"></i>' + data.error +
                            '</div>' +
                            (data.hint ? '<div class="text-yellow-400 text-sm mt-2">' + data.hint + '</div>' : '');
                    } else {
                        resultContent.innerHTML = 
                            '<div class="space-y-3">' +
                            '<div class="text-green-400"><i class="fas fa-check-circle mr-2"></i>' + data.msg + '</div>' +
                            '<div class="bg-gray-800 p-4 rounded space-y-2">' +
                            '<div class="flex items-center justify-between">' +
                            '<span class="text-gray-400">Bentuk Wajah:</span>' +
                            '<span class="text-purple-400 font-bold text-xl">' + data.face_shape.toUpperCase() + '</span>' +
                            '</div>' +
                            '<div class="flex items-center justify-between">' +
                            '<span class="text-gray-400">Sisa Credit:</span>' +
                            '<span class="text-yellow-400 font-bold">' + data.credits_remaining + ' credits</span>' +
                            '</div>' +
                            '<div class="flex items-center justify-between">' +
                            '<span class="text-gray-400">R2 Storage:</span>' +
                            '<span class="text-' + (data.r2_status === 'saved' ? 'green' : 'yellow') + '-400">' + 
                            (data.r2_status === 'saved' ? '✅ Saved' : '⚠️ ' + data.r2_status) + '</span>' +
                            '</div>' +
                            '</div>' +
                            (data.hint ? '<div class="text-yellow-400 text-sm"><i class="fas fa-info-circle mr-2"></i>' + data.hint + '</div>' : '') +
                            '</div>';
                    }
                } catch (error) {
                    resultContent.innerHTML = 
                        '<div class="text-red-400">' +
                        '<i class="fas fa-times-circle mr-2"></i>Error: ' + error.message +
                        '</div>';
                }
            }

            // Konsultasi Function
            async function konsultasi() {
                const userId = document.getElementById('userId').value;
                const faceShape = document.getElementById('faceShape').value;
                const prompt = document.getElementById('prompt').value;
                const resultDiv = document.getElementById('result');
                const resultContent = document.getElementById('resultContent');
                
                resultContent.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sedang berkonsultasi dengan AI...';
                resultDiv.classList.remove('hidden');
                
                try {
                    const response = await axios.post('/api/konsultasi', {
                        userId,
                        faceShape,
                        prompt
                    });
                    
                    if (response.data.error) {
                        resultContent.innerHTML = '<div class="text-red-400"><i class="fas fa-exclamation-triangle mr-2"></i>' + response.data.error + '</div>';
                    } else {
                        resultContent.innerHTML = 
                            '<div class="space-y-2">' +
                            '<div class="text-green-400"><i class="fas fa-check-circle mr-2"></i>Saran dari Gani si Barber:</div>' +
                            '<div class="text-white bg-gray-800 p-4 rounded">' + response.data.saran_gani + '</div>' +
                            '<div class="text-yellow-400 text-sm"><i class="fas fa-coins mr-2"></i>Sisa Credit: ' + response.data.sisa_credit + '</div>' +
                            '</div>';
                    }
                } catch (error) {
                    resultContent.innerHTML = '<div class="text-red-400"><i class="fas fa-times-circle mr-2"></i>Error: ' + error.message + '</div>';
                }
            }
        </script>
    </body>
    </html>
  `)
})

// 2. API: Cek Status User & Credit
app.get('/api/user/:id', async (c) => {
  const userId = c.req.param('id')
  
  // Check if D1 Database is configured
  if (!c.env.DB) {
    return c.json({
      error: 'D1 Database tidak tersedia, Gyss!',
      hint: 'Setup D1 database terlebih dahulu'
    }, 503)
  }
  
  // Get user from database
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  
  if (!user) {
    // User baru, kasih bonus 5 credit gratis!
    await c.env.DB.prepare('INSERT INTO users (id, credits, last_reset, created_at) VALUES (?, 5, datetime("now"), datetime("now"))').bind(userId).run()
    return c.json({ 
      msg: "Welcome Gyss! Lo dapet 5 credit gratis.", 
      credits: 5,
      userId,
      status: 'new_user'
    })
  }
  
  // Check if daily reset needed (24 hours)
  const lastReset = user.last_reset ? new Date(user.last_reset) : new Date(0)
  const now = new Date()
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceReset >= 24) {
    // Reset credits to 5
    await c.env.DB.prepare('UPDATE users SET credits = 5, last_reset = datetime("now") WHERE id = ?').bind(userId).run()
    return c.json({
      msg: "Credit lo udah di-reset, Gyss! Dapet 5 credit fresh lagi!",
      credits: 5,
      userId,
      status: 'reset'
    })
  }
  
  return c.json({
    userId: user.id,
    credits: user.credits,
    last_reset: user.last_reset,
    status: 'active'
  })
})

// 3. API: Konsultasi Rambut (THE BRAIN - Llama 3)
app.post('/api/konsultasi', async (c) => {
  const { userId, prompt, faceShape } = await c.req.json()

  // Check if D1 Database is configured
  if (!c.env.DB) {
    return c.json({
      error: 'D1 Database tidak tersedia, Gyss!',
      hint: 'Setup D1 database terlebih dahulu'
    }, 503)
  }
  
  // Check user credit
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  
  if (!user) {
    return c.json({
      error: 'User tidak ditemukan, Gyss!',
      hint: 'Panggil /api/user/:id dulu untuk create user'
    }, 404)
  }
  
  if (user.credits < 1) {
    return c.json({
      error: 'Credit lo habis, Gyss!',
      hint: 'Balik lagi besok untuk dapetin 5 credit fresh!',
      credits: 0
    }, 402)
  }
  
  // PROSES AI (LLAMA 3) - Workers AI FREE TIER!
  const systemPrompt = `
Identitas: Kamu adalah "Gani si Barber", pakar gaya rambut paling hits dan paling jujur. 

Vibe: Santai, informatif, pake bahasa anak muda (kata 'lo-gue', 'Gyss', 'mantul'). 
Jangan pernah bilang "Saya adalah AI" - kamu adalah Gani!

Aturan Emas:
1. ANALISIS GEOMETRIS: Hubungkan bentuk wajah dengan teori keseimbangan visual
2. DETAIL TEKNIS: Sebutkan istilah Barber pro (Taper Fade, Undercut, Texture Paste, dll)
3. GAYA BAHASA: Gunakan bahasa yang santai tapi tetap profesional

Pengetahuan Dasar:
- Wajah Bulat: Cocok Pompadour, Quiff (biar nambah tinggi). JANGAN Buzzcut rata.
- Wajah Kotak: Cocok Side Part, Textured Crop (biar sudut rahang lebih soft).
- Wajah Oval: Cocok apa aja, tapi paling mantul pakai Slick Back.
- Wajah Lonjong: Cocok Short Sides, Long Top (balance proporsi).
  `
  
  try {
    const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Wajah gue ${faceShape}. Pertanyaan: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    // Deduct credit & save consultation to history
    await c.env.DB.prepare('UPDATE users SET credits = credits - 1 WHERE id = ?').bind(userId).run()
    
    await c.env.DB.prepare(
      'INSERT INTO consultations (user_id, face_shape, prompt, response, credits_used, created_at) VALUES (?, ?, ?, ?, 1, datetime("now"))'
    ).bind(userId, faceShape, prompt, response.response).run()
    
    const updatedUser = await c.env.DB.prepare('SELECT credits FROM users WHERE id = ?').bind(userId).first()

    return c.json({
      saran_gani: response.response,
      sisa_credit: updatedUser.credits,
      userId,
      status: 'success'
    })
  } catch (error: any) {
    return c.json({
      error: 'Waduh Gyss, AI-nya lagi istirahat nih. Coba lagi ya!',
      details: error.message
    }, 500)
  }
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine face shape from ResNet-50 analysis
 * Maps ResNet labels to common face shape categories
 */
function determineFaceShape(visionResponse: any): string {
  // ResNet returns array of labels with scores
  const labels = visionResponse || []
  
  // Convert to lowercase string for easier matching
  const labelsStr = JSON.stringify(labels).toLowerCase()
  
  // Face shape mapping (prioritized order)
  const shapePatterns = [
    { keywords: ['oval', 'ellipse'], shape: 'oval' },
    { keywords: ['round', 'circle', 'bulat'], shape: 'bulat' },
    { keywords: ['square', 'kotak', 'box'], shape: 'kotak' },
    { keywords: ['heart', 'hati'], shape: 'heart' },
    { keywords: ['oblong', 'rectangle', 'lonjong', 'panjang'], shape: 'lonjong' },
    { keywords: ['diamond', 'berlian'], shape: 'diamond' },
    { keywords: ['triangle', 'segitiga'], shape: 'triangle' }
  ]
  
  // Find first matching pattern
  for (const pattern of shapePatterns) {
    for (const keyword of pattern.keywords) {
      if (labelsStr.includes(keyword)) {
        return pattern.shape
      }
    }
  }
  
  // Default fallback: analyze facial features if available
  if (labelsStr.includes('face') || labelsStr.includes('person') || labelsStr.includes('portrait')) {
    return 'oval' // Most common/versatile default
  }
  
  return 'unknown'
}

// 4. API: Upload Foto (THE EYES - ResNet)
// NOTE: R2 Storage is OPTIONAL - will work with or without R2
app.post('/api/upload-foto', async (c) => {
  // Check if D1 Database is configured
  if (!c.env.DB) {
    return c.json({
      error: 'D1 Database tidak tersedia, Gyss!',
      hint: 'Setup D1 database terlebih dahulu'
    }, 503)
  }

  try {
    // Parse multipart form data
    const body = await c.req.parseBody()
    const file = body['file'] as File
    const userId = body['userId'] as string

    // Validate inputs
    if (!file) {
      return c.json({
        error: 'File foto tidak ada, Gyss!',
        hint: 'Upload file foto dengan field name: file'
      }, 400)
    }

    if (!userId) {
      return c.json({
        error: 'User ID tidak ada, Gyss!',
        hint: 'Kirim userId dalam form data'
      }, 400)
    }

    // Check user exists and has credits
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
    
    if (!user) {
      return c.json({
        error: 'User tidak ditemukan, Gyss!',
        hint: 'Panggil /api/user/:id dulu untuk create user'
      }, 404)
    }
    
    if (user.credits < 1) {
      return c.json({
        error: 'Credit lo habis, Gyss!',
        hint: 'Balik lagi besok untuk dapetin 5 credit fresh!',
        credits: 0
      }, 402)
    }

    // Convert file to array buffer for AI analysis
    const imageBuffer = await file.arrayBuffer()
    const imageArray = [...new Uint8Array(imageBuffer)]

    // Analyze face shape with ResNet-50 (Workers AI - FREE!)
    const visionResponse = await c.env.AI.run('@cf/microsoft/resnet-50', {
      image: imageArray
    })

    // Determine face shape from AI analysis
    const faceShape = determineFaceShape(visionResponse)

    // Optional: Save to R2 if configured
    let photoKey = null
    let r2Status = 'not_configured'
    
    if (c.env.R2) {
      try {
        photoKey = `photos/${userId}-${Date.now()}.jpg`
        await c.env.R2.put(photoKey, imageBuffer, {
          httpMetadata: {
            contentType: file.type || 'image/jpeg'
          }
        })
        r2Status = 'saved'
      } catch (r2Error: any) {
        // R2 error is non-fatal - continue without storage
        console.error('R2 storage error:', r2Error)
        r2Status = 'error'
      }
    }

    // Deduct credit from user
    await c.env.DB.prepare('UPDATE users SET credits = credits - 1 WHERE id = ?').bind(userId).run()
    
    // Save analysis to consultation history
    await c.env.DB.prepare(
      'INSERT INTO consultations (user_id, face_shape, prompt, response, credits_used, created_at) VALUES (?, ?, ?, ?, 1, datetime("now"))'
    ).bind(
      userId, 
      faceShape, 
      'Photo upload - Face analysis',
      JSON.stringify({ analysis: visionResponse, face_shape: faceShape })
    ).run()
    
    // Get updated credit balance
    const updatedUser = await c.env.DB.prepare('SELECT credits FROM users WHERE id = ?').bind(userId).first()

    return c.json({
      msg: 'Foto berhasil dianalisis, Gyss!',
      face_shape: faceShape,
      face_shape_id: faceShape,
      analysis: visionResponse,
      photo_key: photoKey,
      r2_status: r2Status,
      credits_remaining: updatedUser.credits,
      credits_used: 1,
      userId,
      status: 'success',
      hint: r2Status === 'not_configured' ? 'Enable R2 Storage di wrangler.jsonc untuk simpan foto permanent' : null
    })

  } catch (error: any) {
    return c.json({
      error: 'Upload foto gagal, Gyss!',
      details: error.message,
      status: 'error'
    }, 500)
  }
})

// 5. API: Dashboard dengan Consultation History
app.get('/api/dashboard/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  // Check if D1 Database is configured
  if (!c.env.DB) {
    return c.json({
      error: 'D1 Database tidak tersedia, Gyss!',
      hint: 'Setup D1 database terlebih dahulu'
    }, 503)
  }
  
  try {
    // Get user info
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
    
    if (!user) {
      return c.json({
        error: 'User tidak ditemukan, Gyss!',
        hint: 'Panggil /api/user/:id dulu untuk create user'
      }, 404)
    }
    
    // Get consultation history
    const consultations = await c.env.DB.prepare(
      'SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    
    // Calculate face shape distribution
    const faceShapeDistribution: Record<string, number> = {}
    let mainFaceShape = 'unknown'
    let maxCount = 0
    
    consultations.results.forEach((item: any) => {
      const shape = item.face_shape || 'unknown'
      faceShapeDistribution[shape] = (faceShapeDistribution[shape] || 0) + 1
      
      if (faceShapeDistribution[shape] > maxCount) {
        maxCount = faceShapeDistribution[shape]
        mainFaceShape = shape
      }
    })
    
    return c.json({
      user_id: userId,
      credits_remaining: user.credits,
      total_consultations: consultations.results.length,
      main_face_shape: mainFaceShape,
      face_shape_distribution: faceShapeDistribution,
      consultations: consultations.results,
      status: 'success'
    })
    
  } catch (error: any) {
    return c.json({
      error: 'Gagal load dashboard, Gyss!',
      details: error.message
    }, 500)
  }
})

// 6. Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'alive',
    service: 'BARBER-AI-GOD',
    version: '2.0.0',
    services: {
      'Workers AI': c.env.AI ? '✅ Active' : '❌ Not configured',
      'D1 Database': c.env.DB ? '✅ Active' : '⚠️  Not configured (using mock data)',
      'R2 Storage': c.env.R2 ? '✅ Active' : '⚠️  Not configured',
      'KV Storage': c.env.KV ? '✅ Active' : '⚠️  Not configured'
    }
  })
})

export default app
