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
        <script>
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
  
  // Fase 1: Tanpa database, return mock data
  // TODO: Implement with D1 database
  if (!c.env.DB) {
    return c.json({
      userId,
      credits: 5,
      status: 'mock_data',
      message: 'D1 Database belum dikonfigurasi. Ini mock data untuk testing.'
    })
  }
  
  // Fase 2: Dengan D1 Database
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  
  if (!user) {
    // User baru, kasih bonus 5 credit gratis!
    await c.env.DB.prepare('INSERT INTO users (id, credits) VALUES (?, 5)').bind(userId).run()
    return c.json({ 
      msg: "Welcome Gyss! Lo dapet 5 credit gratis.", 
      credits: 5,
      userId 
    })
  }
  
  return c.json(user)
})

// 3. API: Konsultasi Rambut (THE BRAIN - Llama 3)
app.post('/api/konsultasi', async (c) => {
  const { userId, prompt, faceShape } = await c.req.json()

  // Fase 1: Tanpa credit check (untuk testing)
  // TODO: Implement credit check dengan D1
  
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

    // Fase 1: Tanpa update credit (untuk testing)
    // TODO: Implement dengan D1
    // await c.env.DB.prepare('UPDATE users SET credits = credits - 1 WHERE id = ?').bind(userId).run()

    return c.json({
      saran_gani: response.response,
      sisa_credit: 4, // Mock data
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

// 4. API: Upload Foto (THE EYES - ResNet)
// NOTE: Memerlukan R2 bucket aktif
app.post('/api/upload-foto', async (c) => {
  if (!c.env.R2) {
    return c.json({
      error: 'R2 Storage belum dikonfigurasi, Gyss!',
      hint: 'Aktifkan R2 bucket di wrangler.jsonc'
    }, 503)
  }

  try {
    const body = await c.req.parseBody()
    const file = body['file'] as File
    const userId = body['userId'] as string

    // Simpan ke R2
    const key = `photos/${userId}-${Date.now()}.jpg`
    await c.env.R2.put(key, await file.arrayBuffer())

    // Analisis Bentuk Wajah pake AI Gratisan (ResNet)
    const visionResp = await c.env.AI.run('@cf/microsoft/resnet-50', {
      image: [...new Uint8Array(await file.arrayBuffer())]
    })

    return c.json({
      msg: "Foto udah masuk gudang, Gyss!",
      analysis: visionResp,
      photoKey: key,
      status: 'success'
    })
  } catch (error: any) {
    return c.json({
      error: 'Upload foto gagal, Gyss!',
      details: error.message
    }, 500)
  }
})

// 5. Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'alive',
    service: 'BARBER-AI-GOD',
    version: '1.0.0',
    services: {
      'Workers AI': c.env.AI ? '✅ Active' : '❌ Not configured',
      'D1 Database': c.env.DB ? '✅ Active' : '⚠️  Not configured (using mock data)',
      'R2 Storage': c.env.R2 ? '✅ Active' : '⚠️  Not configured',
      'KV Storage': c.env.KV ? '✅ Active' : '⚠️  Not configured'
    }
  })
})

export default app
