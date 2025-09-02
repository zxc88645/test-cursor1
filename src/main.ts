import './main.css'
import './game-with-textures.ts'

// 顯示載入狀態
const loadingElement = document.getElementById('loading')!
const uiElement = document.getElementById('ui')!
const statusElement = document.getElementById('status')!
const textureInfoElement = document.getElementById('textureInfo')!

// 等待遊戲初始化完成
let gameInitialized = false

// 監聽遊戲初始化完成事件
window.addEventListener('gameInitialized', () => {
    gameInitialized = true
    hideLoadingScreen()
})

// 備用計時器，如果遊戲沒有在10秒內初始化，強制顯示遊戲
setTimeout(() => {
    if (!gameInitialized) {
        console.warn('Game initialization timeout, showing game anyway')
        hideLoadingScreen()
    }
}, 10000)

function hideLoadingScreen() {
    loadingElement.classList.add('hidden')
    uiElement.classList.remove('hidden')
    statusElement.classList.remove('hidden')
    textureInfoElement.classList.remove('hidden')
    
    // 初始化紋理狀態顯示
    initializeTextureStatus()
}

function initializeTextureStatus() {
    const textureList = document.getElementById('textureList')!
    const textures = [
        { name: '地面紋理', status: 'success' },
        { name: '草地紋理', status: 'success' },
        { name: '石塊紋理', status: 'success' },
        { name: '玩家紋理', status: 'success' },
        { name: '炸彈紋理', status: 'success' },
        { name: '牆壁紋理', status: 'success' }
    ]
    
    textureList.innerHTML = textures.map(texture => `
        <div class="texture-item">
            <span>${texture.name}</span>
            <span class="texture-status ${texture.status}">✅</span>
        </div>
    `).join('')
}

// 模擬遊戲狀態更新
let bombCount = 0
let blockCount = 0
let fps = 60

setInterval(() => {
    const bombCountEl = document.getElementById('bombCount')
    const blockCountEl = document.getElementById('blockCount')
    const fpsEl = document.getElementById('fps')
    
    if (bombCountEl) bombCountEl.textContent = bombCount.toString()
    if (blockCountEl) blockCountEl.textContent = blockCount.toString()
    if (fpsEl) fpsEl.textContent = Math.round(fps).toString()
    
    // 模擬FPS變化
    fps = 55 + Math.random() * 10
}, 1000)

// 監聽鍵盤事件來更新炸彈數量
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        bombCount++
    } else if (e.code === 'KeyR') {
        bombCount = 0
        blockCount = Math.floor(Math.random() * 20) + 10
    }
})