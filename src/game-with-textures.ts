import './style.css'
import * as THREE from 'three'

type GridCell = {
  x: number
  y: number
  occupied: boolean
}

class Bomber3DGameWithTextures {
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private clock!: THREE.Clock
  private player!: THREE.Mesh
  private grid!: GridCell[][]
  private gridSize: number
  private cellSize: number
  private keys: Record<string, boolean>
  private activeBombs: Array<{ gx: number; gy: number; mesh: THREE.Mesh; timer: number }>
  private blocks: Array<{ gx: number; gy: number; mesh: THREE.Mesh }>
  private textures: Map<string, THREE.Texture> = new Map()
  private materials: Map<string, THREE.Material> = new Map()
  private _moveAccumulator: number = 0
  private loadingProgress: number = 0
  private totalLoadingSteps: number = 0

  constructor(container: HTMLElement) {
    this.gridSize = 13
    this.cellSize = 1
    this.keys = {}
    this.activeBombs = []
    this.blocks = []

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0b0f1a)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      document.documentElement.clientWidth / document.documentElement.clientHeight,
      0.1,
      200
    )
    const half = (this.gridSize * this.cellSize) / 2
    this.camera.position.set(half, half * 1.8 + 10, half + 10)
    this.camera.lookAt(half, 0, half)
    
    this.adjustCameraForViewport()

    // Initialize textures and materials
    this.initializeTextures().then(() => {
      this.loadingProgress++
      this.updateLoadingStatus('初始化遊戲場景...', Math.round((this.loadingProgress / this.totalLoadingSteps) * 100))
      this.setupScene()
      this.setupInput()
      this.clock = new THREE.Clock()
      this.onResize()
      requestAnimationFrame(() => this.onResize())
      this.animate()
      
      this.loadingProgress++
      this.updateLoadingStatus('載入完成！', 100)
      
      // Dispatch initialization complete event
      window.dispatchEvent(new CustomEvent('gameInitialized'))
      console.log('🎮 Game initialization completed!')
    }).catch((error) => {
      console.error('❌ Game initialization failed:', error)
      // Still dispatch event to show game even if textures failed
      this.updateLoadingStatus('載入完成！', 100)
      window.dispatchEvent(new CustomEvent('gameInitialized'))
    })
  }

  private async initializeTextures(): Promise<void> {
    const textureLoader = new THREE.TextureLoader()
    
    // Define texture paths - using JPG files that actually exist
    const texturePaths = {
      ground: '/textures/ground/base.jpg',
      grass: '/textures/ground/grass.jpg',
      concrete: '/textures/ground/concrete.jpg',
      stone: '/textures/blocks/stone.jpg',
      metal: '/textures/blocks/metal.jpg',
      player: '/textures/player/player.jpg',
      bomb: '/textures/bomb/bomb.jpg',
      fire: '/textures/fire/fire.jpg',
      wall: '/textures/walls/wall.jpg',
      explosion: '/textures/particles/explosion.png'
    }

    // Calculate total loading steps
    this.totalLoadingSteps = Object.keys(texturePaths).length + 4 // textures + setup steps
    this.loadingProgress = 0
    
    // Update loading status
    this.updateLoadingStatus('初始化Three.js渲染器...', 0)
    
    // Load all textures with progress tracking
    const loadPromises = Object.entries(texturePaths).map(([name, path]) => 
      new Promise<void>((resolve) => {
        textureLoader.load(
          path,
          (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(2, 2) // Repeat pattern for better coverage
            this.textures.set(name, texture)
            console.log(`✅ Loaded texture: ${name}`)
            
            // Update progress
            this.loadingProgress++
            const progressPercent = Math.round((this.loadingProgress / this.totalLoadingSteps) * 100)
            
            // Update loading status based on texture type
            let statusMessage = ''
            if (name === 'ground' || name === 'grass' || name === 'concrete') {
              statusMessage = '載入地面紋理...'
            } else if (name === 'stone' || name === 'metal') {
              statusMessage = '載入方塊紋理...'
            } else if (name === 'player') {
              statusMessage = '載入玩家紋理...'
            } else if (name === 'bomb') {
              statusMessage = '載入炸彈紋理...'
            } else if (name === 'wall') {
              statusMessage = '載入牆壁紋理...'
            } else {
              statusMessage = '載入特效紋理...'
            }
            
            this.updateLoadingStatus(statusMessage, progressPercent)
            resolve()
          },
          undefined,
          (error) => {
            console.warn(`⚠️ Failed to load texture: ${name} from ${path}`, error)
            // Create a fallback texture
            const canvas = document.createElement('canvas')
            canvas.width = 64
            canvas.height = 64
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = name === 'ground' ? '#1a2235' : 
                          name === 'stone' ? '#5f6e91' :
                          name === 'player' ? '#6ee7ff' :
                          name === 'bomb' ? '#222831' :
                          name === 'fire' ? '#ff4500' :
                          name === 'wall' ? '#3a4a6f' : '#ffffff'
            ctx.fillRect(0, 0, 64, 64)
            const fallbackTexture = new THREE.CanvasTexture(canvas)
            this.textures.set(name, fallbackTexture)
            console.log(`✅ Created fallback texture for: ${name}`)
            
            // Update progress even for fallback textures
            this.loadingProgress++
            const progressPercent = Math.round((this.loadingProgress / this.totalLoadingSteps) * 100)
            this.updateLoadingStatus('創建備用紋理...', progressPercent)
            resolve()
          }
        )
      })
    )

    await Promise.all(loadPromises)
    this.updateLoadingStatus('創建材質系統...', Math.round((this.loadingProgress / this.totalLoadingSteps) * 100))
    this.createMaterials()
    this.loadingProgress++
    this.updateLoadingStatus('設置光照效果...', Math.round((this.loadingProgress / this.totalLoadingSteps) * 100))
  }

  private updateLoadingStatus(message: string, progress: number = 0): void {
    const loadingStatus = document.getElementById('loadingStatus')
    const progressBar = document.getElementById('progressBar')
    const progressText = document.getElementById('progressText')
    
    if (loadingStatus) {
      loadingStatus.textContent = message
    }
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`
    }
    
    if (progressText) {
      progressText.textContent = `${progress}%`
    }
  }

  private createMaterials(): void {
    // Ground materials
    if (this.textures.has('ground')) {
      this.materials.set('ground', new THREE.MeshStandardMaterial({
        map: this.textures.get('ground'),
        roughness: 0.8,
        metalness: 0.2
      }))
    }

    // Grass material for tiles
    if (this.textures.has('grass')) {
      this.materials.set('grass', new THREE.MeshStandardMaterial({
        map: this.textures.get('grass'),
        roughness: 0.9,
        metalness: 0.1
      }))
    }

    // Stone material for blocks
    if (this.textures.has('stone')) {
      this.materials.set('stone', new THREE.MeshStandardMaterial({
        map: this.textures.get('stone'),
        roughness: 0.9,
        metalness: 0.1
      }))
    }

    // Player material
    if (this.textures.has('player')) {
      this.materials.set('player', new THREE.MeshStandardMaterial({
        map: this.textures.get('player'),
        roughness: 0.6,
        metalness: 0.3,
        emissive: new THREE.Color(0x001122),
        emissiveIntensity: 0.1
      }))
    }

    // Bomb material
    if (this.textures.has('bomb')) {
      this.materials.set('bomb', new THREE.MeshStandardMaterial({
        map: this.textures.get('bomb'),
        roughness: 0.8,
        metalness: 0.2,
        emissive: new THREE.Color(0x220000),
        emissiveIntensity: 0.2
      }))
    }

    // Wall material
    if (this.textures.has('wall')) {
      this.materials.set('wall', new THREE.MeshStandardMaterial({
        map: this.textures.get('wall'),
        roughness: 0.9,
        metalness: 0.1
      }))
    }

    console.log(`✅ Created ${this.materials.size} materials`)
  }

  private setupScene(): void {
    // Enhanced lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambient)
    
    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(6, 10, 4)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.near = 0.1
    dir.shadow.camera.far = 50
    dir.shadow.camera.left = -10
    dir.shadow.camera.right = 10
    dir.shadow.camera.top = 10
    dir.shadow.camera.bottom = -10
    this.scene.add(dir)

    // Create ground with texture
    const groundGeo = new THREE.PlaneGeometry(this.gridSize * this.cellSize, this.gridSize * this.cellSize)
    const groundMat = this.materials.get('ground') || new THREE.MeshStandardMaterial({ 
      color: 0x1a2235, 
      metalness: 0.1, 
      roughness: 0.9 
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Create textured tiles
    const tileMat1 = this.materials.get('grass') || new THREE.MeshStandardMaterial({ color: 0x243251 })
    const tileMat2 = new THREE.MeshStandardMaterial({ color: 0x1d2944 })
    const tileGeo = new THREE.BoxGeometry(this.cellSize, 0.05, this.cellSize)
    
    for (let gx = 0; gx < this.gridSize; gx++) {
      for (let gy = 0; gy < this.gridSize; gy++) {
        const tile = new THREE.Mesh(tileGeo, (gx + gy) % 2 === 0 ? tileMat1 : tileMat2)
        tile.position.set(
          gx * this.cellSize + this.cellSize / 2 - this.cellSize * this.gridSize / 2,
          0.025,
          gy * this.cellSize + this.cellSize / 2 - this.cellSize * this.gridSize / 2
        )
        tile.receiveShadow = true
        this.scene.add(tile)
      }
    }

    // Grid data
    this.grid = []
    for (let x = 0; x < this.gridSize; x++) {
      const row: GridCell[] = []
      for (let y = 0; y < this.gridSize; y++) {
        row.push({ x, y, occupied: false })
      }
      this.grid.push(row)
    }

    // Destructible blocks placement
    this.spawnBlocks()

    // Create player with texture
    const playerGeo = new THREE.SphereGeometry(0.35, 24, 24)
    const playerMat = this.materials.get('player') || new THREE.MeshStandardMaterial({ 
      color: 0x6ee7ff, 
      emissive: 0x0, 
      metalness: 0.2, 
      roughness: 0.6 
    })
    this.player = new THREE.Mesh(playerGeo, playerMat)
    this.player.castShadow = true
    this.scene.add(this.player)
    this.setPlayerGridPosition(1, 1)

    // Create walls with texture
    const wallMat = this.materials.get('wall') || new THREE.MeshStandardMaterial({ color: 0x3a4a6f })
    const wallGeo = new THREE.BoxGeometry(this.gridSize * this.cellSize + 1, 1.5, 0.5)
    const wallNorth = new THREE.Mesh(wallGeo, wallMat)
    wallNorth.position.set(0, 0.75, -this.gridSize * this.cellSize / 2 - 0.25)
    const wallSouth = new THREE.Mesh(wallGeo, wallMat)
    wallSouth.position.set(0, 0.75, this.gridSize * this.cellSize / 2 + 0.25)
    const wallGeoSide = new THREE.BoxGeometry(0.5, 1.5, this.gridSize * this.cellSize + 1)
    const wallWest = new THREE.Mesh(wallGeoSide, wallMat)
    wallWest.position.set(-this.gridSize * this.cellSize / 2 - 0.25, 0.75, 0)
    const wallEast = new THREE.Mesh(wallGeoSide, wallMat)
    wallEast.position.set(this.gridSize * this.cellSize / 2 + 0.25, 0.75, 0)
    
    for (const w of [wallNorth, wallSouth, wallWest, wallEast]) {
      w.castShadow = false
      w.receiveShadow = true
      this.scene.add(w)
    }
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()
      this.keys[key] = true
      if (key === ' ') {
        this.placeBomb()
      }
      if (key === 'r') {
        this.reset()
      }
    })
    window.addEventListener('keyup', (e) => (this.keys[e.key.toLowerCase()] = false))
    window.addEventListener('resize', () => this.onResize())
  }

  private spawnBlocks(): void {
    const blockGeo = new THREE.BoxGeometry(this.cellSize * 0.9, this.cellSize * 0.9, this.cellSize * 0.9)
    const blockMat = this.materials.get('stone') || new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    
    for (let gx = 2; gx < this.gridSize - 2; gx += 2) {
      for (let gy = 2; gy < this.gridSize - 2; gy += 2) {
        if (Math.random() < 0.7) {
          const block = new THREE.Mesh(blockGeo, blockMat)
          const worldX = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
          const worldZ = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
          block.position.set(worldX, this.cellSize * 0.45, worldZ)
          block.castShadow = true
          block.receiveShadow = true
          this.scene.add(block)
          this.blocks.push({ gx, gy, mesh: block })
          this.grid[gx][gy].occupied = true
        }
      }
    }
  }

  private setPlayerGridPosition(gx: number, gy: number): void {
    const worldX = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
    const worldZ = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
    this.player.position.set(worldX, 0.35, worldZ)
  }

  private tryMovePlayer(dx: number, dy: number): void {
    const gx = Math.round((this.player.position.x + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const gy = Math.round((this.player.position.z + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const nx = THREE.MathUtils.clamp(gx + dx, 0, this.gridSize - 1)
    const ny = THREE.MathUtils.clamp(gy + dy, 0, this.gridSize - 1)
    if (!this.grid[nx][ny].occupied) {
      this.setPlayerGridPosition(nx, ny)
    }
  }

  private placeBomb(): void {
    const gx = Math.round((this.player.position.x + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const gy = Math.round((this.player.position.z + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    
    if (!this.grid[gx][gy].occupied) {
      const bombGeo = new THREE.SphereGeometry(0.3, 16, 16)
      const bombMat = this.materials.get('bomb') || new THREE.MeshStandardMaterial({ 
        color: 0x2f2f2f, 
        emissive: 0x220000, 
        emissiveIntensity: 0.2 
      })
      const bomb = new THREE.Mesh(bombGeo, bombMat)
      const worldX = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
      const worldZ = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
      bomb.position.set(worldX, 0.3, worldZ)
      bomb.castShadow = true
      this.scene.add(bomb)
      this.activeBombs.push({ gx, gy, mesh: bomb, timer: 3.0 })
      this.grid[gx][gy].occupied = true
    }
  }

  private explodeBomb(bomb: { gx: number; gy: number; mesh: THREE.Mesh; timer: number }): void {
    const { gx, gy } = bomb
    
    // Create explosion effect
    this.createExplosionEffect(gx, gy)
    
    // Clear bomb position
    this.grid[gx][gy].occupied = false
    
    // Destroy blocks in explosion radius
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    for (const [dx, dy] of directions) {
      for (let i = 1; i <= 2; i++) {
        const nx = gx + dx * i
        const ny = gy + dy * i
        if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
          if (this.grid[nx][ny].occupied) {
            // Find and remove block
            const blockIndex = this.blocks.findIndex(b => b.gx === nx && b.gy === ny)
            if (blockIndex !== -1) {
              this.scene.remove(this.blocks[blockIndex].mesh)
              this.blocks.splice(blockIndex, 1)
              this.grid[nx][ny].occupied = false
            }
            break // Stop explosion in this direction after hitting a block
          }
        }
      }
    }
  }

  private createExplosionEffect(gx: number, gy: number): void {
    // Create fire particles
    const fireGeo = new THREE.SphereGeometry(0.2, 8, 8)
    const fireMat = this.materials.get('fire') || new THREE.MeshStandardMaterial({ 
      color: 0xff4500, 
      emissive: 0xff2200, 
      emissiveIntensity: 0.5 
    })
    
    for (let i = 0; i < 8; i++) {
      const fire = new THREE.Mesh(fireGeo, fireMat)
      const worldX = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
      const worldZ = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
      fire.position.set(
        worldX + (Math.random() - 0.5) * 2,
        0.2,
        worldZ + (Math.random() - 0.5) * 2
      )
      this.scene.add(fire)
      
      // Remove fire after animation
      setTimeout(() => {
        this.scene.remove(fire)
      }, 1000)
    }
  }

  private update(delta: number): void {
    const speed = 8 * delta
    let dx = 0
    let dy = 0
    if (this.keys['w'] || this.keys['arrowup']) dy -= 1
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1
    if (this.keys['d'] || this.keys['arrowright']) dx += 1
    if (dx !== 0 || dy !== 0) {
      this._moveAccumulator += speed
      while (this._moveAccumulator >= 1) {
        this.tryMovePlayer(dx, dy)
        this._moveAccumulator -= 1
      }
    } else {
      this._moveAccumulator = 0
    }

    // Update bombs
    if (this.activeBombs.length > 0) {
      for (let i = this.activeBombs.length - 1; i >= 0; i--) {
        const b = this.activeBombs[i]
        b.timer -= delta
        if (b.mesh.material instanceof THREE.MeshStandardMaterial) {
          b.mesh.material.emissiveIntensity = 0.2 + Math.max(0, Math.sin(performance.now() * 0.01)) * 0.8
        }
        if (b.timer <= 0) {
          this.explodeBomb(b)
          this.scene.remove(b.mesh)
          this.activeBombs.splice(i, 1)
        }
      }
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate())
    const delta = this.clock.getDelta()
    this.update(delta)
    this.renderer.render(this.scene, this.camera)
  }

  private reset(): void {
    // Clear bombs
    this.activeBombs.forEach(bomb => this.scene.remove(bomb.mesh))
    this.activeBombs = []
    
    // Clear blocks
    this.blocks.forEach(block => this.scene.remove(block.mesh))
    this.blocks = []
    
    // Reset grid
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        this.grid[x][y].occupied = false
      }
    }
    
    // Respawn blocks and reset player
    this.spawnBlocks()
    this.setPlayerGridPosition(1, 1)
  }

  private adjustCameraForViewport(): void {
    const aspect = document.documentElement.clientWidth / document.documentElement.clientHeight
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  private onResize(): void {
    this.adjustCameraForViewport()
    this.renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app')!
  new Bomber3DGameWithTextures(container)
})
