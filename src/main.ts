import './style.css'
import * as THREE from 'three'

type GridCell = {
  x: number
  y: number
  occupied: boolean
}

class Bomber3DGame {
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private clock: THREE.Clock
  private player: THREE.Mesh
  private grid: GridCell[][]
  private gridSize: number
  private cellSize: number
  private keys: Record<string, boolean>
  private activeBombs: Array<{ gx: number; gy: number; mesh: THREE.Mesh; timer: number }>
  private blocks: Array<{ gx: number; gy: number; mesh: THREE.Mesh }>

  constructor(container: HTMLElement) {
    this.gridSize = 13
    this.cellSize = 1
    this.keys = {}
    this.activeBombs = []
    this.blocks = []

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0b0f1a)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    const half = (this.gridSize * this.cellSize) / 2
    this.camera.position.set(half, half * 1.2 + 5, half + 6)
    this.camera.lookAt(half, 0, half)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(6, 10, 4)
    dir.castShadow = true
    dir.shadow.mapSize.set(1024, 1024)
    this.scene.add(dir)

    // Ground
    const groundGeo = new THREE.PlaneGeometry(this.gridSize * this.cellSize, this.gridSize * this.cellSize)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2235, metalness: 0.1, roughness: 0.9 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Grid helper pattern tiles
    const tileMat1 = new THREE.MeshStandardMaterial({ color: 0x243251 })
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

    // Player
    const playerGeo = new THREE.SphereGeometry(0.35, 24, 24)
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x6ee7ff, emissive: 0x0, metalness: 0.2, roughness: 0.6 })
    this.player = new THREE.Mesh(playerGeo, playerMat)
    this.player.castShadow = true
    this.scene.add(this.player)
    this.setPlayerGridPosition(1, 1)

    // Walls around
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a4a6f })
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

    // Input
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

    // Clock and start
    this.clock = new THREE.Clock()
    // Ensure correct initial sizing after layout stabilizes
    this.onResize()
    requestAnimationFrame(() => this.onResize())
    this.animate()
  }

  private setPlayerGridPosition(gx: number, gy: number) {
    const worldX = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
    const worldZ = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
    this.player.position.set(worldX, 0.35, worldZ)
  }

  private tryMovePlayer(dx: number, dy: number) {
    const gx = Math.round((this.player.position.x + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const gy = Math.round((this.player.position.z + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const nx = THREE.MathUtils.clamp(gx + dx, 0, this.gridSize - 1)
    const ny = THREE.MathUtils.clamp(gy + dy, 0, this.gridSize - 1)
    if (!this.grid[nx][ny].occupied) {
      this.setPlayerGridPosition(nx, ny)
    }
  }

  private update(delta: number) {
    const speed = 8 * delta
    let dx = 0
    let dy = 0
    if (this.keys['w'] || this.keys['arrowup']) dy -= 1
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1
    if (this.keys['d'] || this.keys['arrowright']) dx += 1
    if (dx !== 0 || dy !== 0) {
      // step by time to feel responsive on grid
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
        ;(b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.max(0, Math.sin(performance.now() * 0.01)) * 0.8
        if (b.timer <= 0) {
          this.explodeBomb(b)
          this.scene.remove(b.mesh)
          this.activeBombs.splice(i, 1)
        }
      }
    }
  }

  private _moveAccumulator = 0

  private animate = () => {
    const delta = this.clock.getDelta()
    this.update(delta)
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate)
  }

  private onResize() {
    const width = Math.max(1, Math.floor(window.innerWidth))
    const height = Math.max(1, Math.floor(window.innerHeight))
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  private placeBomb() {
    const gx = Math.round((this.player.position.x + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const gy = Math.round((this.player.position.z + (this.gridSize * this.cellSize) / 2 - this.cellSize / 2) / this.cellSize)
    const cell = this.grid[gx][gy]
    if (cell.occupied) return
    cell.occupied = true

    const bombGeo = new THREE.SphereGeometry(0.28, 20, 20)
    const bombMat = new THREE.MeshStandardMaterial({ color: 0x222831, emissive: 0x4b5563, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.4 })
    const bomb = new THREE.Mesh(bombGeo, bombMat)
    const worldX = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
    const worldZ = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
    bomb.position.set(worldX, 0.28, worldZ)
    bomb.castShadow = true
    this.scene.add(bomb)

    this.activeBombs.push({ gx, gy, mesh: bomb, timer: 2.0 })
  }

  private explodeBomb(bomb: { gx: number; gy: number; mesh: THREE.Mesh }) {
    // Free the origin cell
    this.grid[bomb.gx][bomb.gy].occupied = false
    const origin = new THREE.Vector3(bomb.mesh.position.x, 0.4, bomb.mesh.position.z)

    const flameMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xff7b00, emissiveIntensity: 1.2 })
    const flameGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12)

    const arms: THREE.Mesh[] = []
    const range = 3
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ]

    // Spawn center
    const center = new THREE.Mesh(flameGeo, flameMat)
    center.position.copy(origin)
    center.castShadow = false
    center.receiveShadow = false
    this.scene.add(center)
    arms.push(center)

    for (const d of dirs) {
      for (let step = 1; step <= range; step++) {
        const gx = bomb.gx + d.dx * step
        const gy = bomb.gy + d.dy * step
        if (gx < 0 || gy < 0 || gx >= this.gridSize || gy >= this.gridSize) break
        const x = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
        const z = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
        const flame = new THREE.Mesh(flameGeo, flameMat)
        flame.position.set(x, 0.4, z)
        this.scene.add(flame)
        arms.push(flame)

        // Destroy blocks if present and stop propagation
        const blockIndex = this.blocks.findIndex(b => b.gx === gx && b.gy === gy)
        if (blockIndex !== -1) {
          const destroyed = this.blocks[blockIndex]
          this.scene.remove(destroyed.mesh)
          this.blocks.splice(blockIndex, 1)
          this.grid[gx][gy].occupied = false
          break
        }
      }
    }

    // Animate fade-out
    const start = performance.now()
    const animateFlames = () => {
      const t = (performance.now() - start) / 350
      for (const f of arms) {
        f.scale.setScalar(1 - t)
        ;(f.material as THREE.MeshStandardMaterial).opacity = 1 - t
        ;(f.material as THREE.MeshStandardMaterial).transparent = true
      }
      if (t < 1) requestAnimationFrame(animateFlames)
      else {
        for (const f of arms) this.scene.remove(f)
      }
    }
    requestAnimationFrame(animateFlames)
  }

  private reset() {
    // Remove bombs
    for (const b of this.activeBombs) this.scene.remove(b.mesh)
    this.activeBombs = []
    // Clear occupancy
    for (let x = 0; x < this.gridSize; x++) for (let y = 0; y < this.gridSize; y++) this.grid[x][y].occupied = false
    // Reset player
    this.setPlayerGridPosition(1, 1)

    // Remove blocks and respawn
    for (const b of this.blocks) this.scene.remove(b.mesh)
    this.blocks = []
    this.spawnBlocks()
  }

  private spawnBlocks() {
    const blockGeo = new THREE.BoxGeometry(this.cellSize * 0.9, 0.7, this.cellSize * 0.9)
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x5f6e91, metalness: 0.1, roughness: 0.9 })
    for (let gx = 0; gx < this.gridSize; gx++) {
      for (let gy = 0; gy < this.gridSize; gy++) {
        // Leave starting area free and create a simple pattern
        const isStart = (gx <= 2 && gy <= 2)
        const isPillar = gx % 2 === 1 && gy % 2 === 1
        if (isStart || isPillar) continue
        if (Math.random() < 0.5) {
          const block = new THREE.Mesh(blockGeo, blockMat)
          const x = gx * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
          const z = gy * this.cellSize - (this.gridSize * this.cellSize) / 2 + this.cellSize / 2
          block.position.set(x, 0.35, z)
          block.castShadow = true
          block.receiveShadow = true
          this.scene.add(block)
          this.blocks.push({ gx, gy, mesh: block })
          this.grid[gx][gy].occupied = true
        }
      }
    }
  }
}

const container = document.querySelector<HTMLDivElement>('#app')!
new Bomber3DGame(container)
