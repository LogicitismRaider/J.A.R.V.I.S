/**
 * ============================================================================
 * STARK INDUSTRIES // 3D HOLOGRAPHIC CAD WORKSHOP & WIREFRAME ENGINE
 * Full 3D perspective projection, orbital rotation, zoom & explode-assembly
 * ============================================================================
 */

class StarkCadViewer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Resize canvas
    this.resize();

    // 3D Camera / Transform State
    this.rotX = 0.4;
    this.rotY = 0.6;
    this.zoom = 1.0;
    this.explodeFactor = 0.0;
    this.renderMode = 'wireframe'; // wireframe | points | solid
    this.autoRotate = true;
    this.currentModelKey = 'ARC_REACTOR';

    // Drag Interaction State
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Load 3D Models
    this.models = this.initModels();

    // Setup Event Listeners
    this.setupEvents();

    // Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width || 560;
    this.height = this.canvas.height = rect.height || 480;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  initModels() {
    return {
      ARC_REACTOR: this.buildArcReactor3D(),
      REPULSOR: this.buildRepulsor3D(),
      HELMET: this.buildHelmet3D(),
      TESSERACT: this.buildTesseract3D()
    };
  }

  // Model 1: 3D Arc Reactor
  buildArcReactor3D() {
    const parts = [];

    // Part 1: Outer Armor Ring
    const outerVerts = [];
    const outerEdges = [];
    const segs = 18;
    for (let i = 0; i < segs; i++) {
      const a = (i * Math.PI * 2) / segs;
      const x = Math.cos(a) * 120;
      const y = Math.sin(a) * 120;
      outerVerts.push({ x, y, z: -15, origZ: -15 });
      outerVerts.push({ x, y, z: 15, origZ: 15 });
    }
    for (let i = 0; i < segs; i++) {
      const curr = i * 2;
      const next = ((i + 1) % segs) * 2;
      outerEdges.push([curr, next]);
      outerEdges.push([curr + 1, next + 1]);
      outerEdges.push([curr, curr + 1]);
    }
    parts.push({ name: 'Outer Casing', explodeDir: { x: 0, y: 0, z: -1 }, vertices: outerVerts, edges: outerEdges, color: '#00f0ff' });

    // Part 2: Induction Coils (10 Coils)
    const coilVerts = [];
    const coilEdges = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10;
      const cx = Math.cos(a) * 85;
      const cy = Math.sin(a) * 85;
      const baseIdx = coilVerts.length;

      // Small 3D box for each coil
      [-10, 10].forEach(dx => {
        [-8, 8].forEach(dy => {
          [-12, 12].forEach(dz => {
            coilVerts.push({ x: cx + dx, y: cy + dy, z: dz, origX: cx, origY: cy });
          });
        });
      });

      // Box edges
      const b = baseIdx;
      coilEdges.push([b+0, b+1], [b+1, b+3], [b+3, b+2], [b+2, b+0]); // bottom
      coilEdges.push([b+4, b+5], [b+5, b+7], [b+7, b+6], [b+6, b+4]); // top
      coilEdges.push([b+0, b+4], [b+1, b+5], [b+2, b+6], [b+3, b+7]); // pillars
    }
    parts.push({ name: 'Coil Array', explodeDir: { x: 0, y: 0, z: 0, radial: true }, vertices: coilVerts, edges: coilEdges, color: '#ffb800' });

    // Part 3: Inner Core Vibranium Sphere
    const coreVerts = [];
    const coreEdges = [];
    for (let ring = -3; ring <= 3; ring++) {
      const z = ring * 12;
      const r = Math.sqrt(Math.max(0, 45*45 - z*z));
      const startIdx = coreVerts.length;
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        coreVerts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z, origZ: z });
      }
      for (let i = 0; i < 12; i++) {
        coreEdges.push([startIdx + i, startIdx + ((i + 1) % 12)]);
      }
    }
    parts.push({ name: 'Palladium Core', explodeDir: { x: 0, y: 0, z: 1 }, vertices: coreVerts, edges: coreEdges, color: '#ffffff' });

    return parts;
  }

  // Model 2: Repulsor Gauntlet
  buildRepulsor3D() {
    const parts = [];

    // Forearm Barrel
    const forearmVerts = [];
    const forearmEdges = [];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      forearmVerts.push({ x: Math.cos(a) * 55, y: Math.sin(a) * 45, z: -100 });
      forearmVerts.push({ x: Math.cos(a) * 45, y: Math.sin(a) * 35, z: 10 });
    }
    for (let i = 0; i < 12; i++) {
      const c = i * 2;
      const n = ((i + 1) % 12) * 2;
      forearmEdges.push([c, n], [c+1, n+1], [c, c+1]);
    }
    parts.push({ name: 'Forearm Bracer', explodeDir: { x: 0, y: 0, z: -1 }, vertices: forearmVerts, edges: forearmEdges, color: '#ff2a5f' });

    // Palm & Repulsor Emitter Node
    const palmVerts = [];
    const palmEdges = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      palmVerts.push({ x: Math.cos(a) * 35, y: Math.sin(a) * 35, z: 35 });
      palmVerts.push({ x: Math.cos(a) * 15, y: Math.sin(a) * 15, z: 45 });
    }
    for (let i = 0; i < 16; i++) {
      const c = i * 2;
      const n = ((i + 1) % 16) * 2;
      palmEdges.push([c, n], [c+1, n+1], [c, c+1]);
    }
    parts.push({ name: 'Repulsor Emitter', explodeDir: { x: 0, y: 0, z: 1 }, vertices: palmVerts, edges: palmEdges, color: '#00f0ff' });

    return parts;
  }

  // Model 3: Iron Man Mark 85 Helmet Wireframe
  buildHelmet3D() {
    const parts = [];
    const verts = [
      // Cranial Dome
      { x: 0, y: -90, z: 10 },    // 0: top apex
      { x: -45, y: -65, z: -20 }, // 1: top left
      { x: 45, y: -65, z: -20 },  // 2: top right
      { x: -55, y: -30, z: 30 },  // 3: temple left
      { x: 55, y: -30, z: 30 },   // 4: temple right
      { x: 0, y: -45, z: 60 },    // 5: brow center

      // Eye Slits
      { x: -35, y: -15, z: 55 },  // 6: left eye outer
      { x: -10, y: -15, z: 58 },  // 7: left eye inner
      { x: 10, y: -15, z: 58 },   // 8: right eye inner
      { x: 35, y: -15, z: 55 },   // 9: right eye outer

      // Cheek & Faceplate
      { x: -45, y: 20, z: 45 },   // 10: left cheek
      { x: 45, y: 20, z: 45 },    // 11: right cheek
      { x: 0, y: 30, z: 55 },     // 12: nose / mouth plate

      // Jaw & Chin
      { x: -30, y: 70, z: 35 },   // 13: left jaw
      { x: 30, y: 70, z: 35 },    // 14: right jaw
      { x: 0, y: 85, z: 40 },     // 15: chin apex

      // Occipital / Base
      { x: -50, y: 40, z: -40 },  // 16: ear base L
      { x: 50, y: 40, z: -40 },   // 17: ear base R
      { x: 0, y: 60, z: -50 }     // 18: neck back
    ];

    const edges = [
      [0, 1], [0, 2], [1, 3], [2, 4], [0, 5], [5, 3], [5, 4],
      // Eyes
      [6, 7], [8, 9], [7, 8],
      // Faceplate
      [3, 6], [4, 9], [6, 10], [9, 11], [10, 12], [11, 12],
      // Jaw
      [10, 13], [11, 14], [13, 15], [14, 15], [12, 15],
      // Ears & Cranium
      [3, 16], [4, 17], [16, 18], [17, 18], [13, 16], [14, 17], [1, 16], [2, 17]
    ];

    parts.push({ name: 'Helmet Faceplate & Chassis', explodeDir: { x: 0, y: 0, z: 0 }, vertices: verts, edges: edges, color: '#ffb800' });
    return parts;
  }

  // Model 4: 4D Tesseract Matrix
  buildTesseract3D() {
    const parts = [];
    const v = [];
    const e = [];

    // Outer Cube
    const s1 = 80;
    [-s1, s1].forEach(x => {
      [-s1, s1].forEach(y => {
        [-s1, s1].forEach(z => {
          v.push({ x, y, z });
        });
      });
    });

    // Inner Cube
    const s2 = 40;
    [-s2, s2].forEach(x => {
      [-s2, s2].forEach(y => {
        [-s2, s2].forEach(z => {
          v.push({ x, y, z });
        });
      });
    });

    // Cube 1 edges (0-7)
    const cube1Edges = [
      [0,1],[1,3],[3,2],[2,0], [4,5],[5,7],[7,6],[6,4],
      [0,4],[1,5],[2,6],[3,7]
    ];
    e.push(...cube1Edges);

    // Cube 2 edges (8-15)
    cube1Edges.forEach(([a, b]) => {
      e.push([a + 8, b + 8]);
      // Connect inner and outer vertices
      e.push([a, a + 8]);
    });

    parts.push({ name: 'Hypercube Singularity', explodeDir: { x: 0, y: 0, z: 0 }, vertices: v, edges: e, color: '#00f0ff' });
    return parts;
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.autoRotate = false;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.rotY += dx * 0.008;
      this.rotX += dy * 0.008;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom - e.deltaY * 0.0015));
    }, { passive: false });
  }

  setModel(modelKey) {
    if (this.models[modelKey]) {
      this.currentModelKey = modelKey;
      this.explodeFactor = 0;
    }
  }

  setExplode(factor) {
    this.explodeFactor = Math.max(0, Math.min(1.0, factor));
  }

  setRenderMode(mode) {
    this.renderMode = mode;
  }

  project(x, y, z) {
    // 3D Rotation around X axis
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // 3D Rotation around Y axis
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    // Perspective Projection
    const fov = 400;
    const distance = 450;
    const pz = z2 + distance;
    const scale = (fov / (pz > 10 ? pz : 10)) * this.zoom;

    return {
      x: this.centerX + x2 * scale,
      y: this.centerY + y1 * scale,
      scale,
      depth: z2
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.autoRotate && !this.isDragging) {
      this.rotY += 0.01;
    }

    // Draw Subtle Grid plane
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    this.ctx.lineWidth = 1;
    const gridHalf = 150;
    for (let g = -gridHalf; g <= gridHalf; g += 30) {
      const p1 = this.project(g, 100, -gridHalf);
      const p2 = this.project(g, 100, gridHalf);
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();

      const p3 = this.project(-gridHalf, 100, g);
      const p4 = this.project(gridHalf, 100, g);
      this.ctx.beginPath();
      this.ctx.moveTo(p3.x, p3.y);
      this.ctx.lineTo(p4.x, p4.y);
      this.ctx.stroke();
    }

    // Render active model
    const currentParts = this.models[this.currentModelKey] || [];
    currentParts.forEach(part => {
      const projectedVerts = [];
      const explodeDist = this.explodeFactor * 90;

      // Calculate exploded positions
      part.vertices.forEach(v => {
        let vx = v.x;
        let vy = v.y;
        let vz = v.z;

        if (part.explodeDir) {
          if (part.explodeDir.radial && v.origX !== undefined) {
            const mag = Math.hypot(v.origX, v.origY) || 1;
            vx += (v.origX / mag) * explodeDist;
            vy += (v.origY / mag) * explodeDist;
          } else {
            vx += (part.explodeDir.x || 0) * explodeDist;
            vy += (part.explodeDir.y || 0) * explodeDist;
            vz += (part.explodeDir.z || 0) * explodeDist;
          }
        }

        projectedVerts.push(this.project(vx, vy, vz));
      });

      // Draw Edges (Wireframe)
      if (this.renderMode === 'wireframe' || this.renderMode === 'solid') {
        this.ctx.strokeStyle = part.color || '#00f0ff';
        this.ctx.lineWidth = 1.4;
        this.ctx.shadowColor = part.color || '#00f0ff';
        this.ctx.shadowBlur = 8;

        part.edges.forEach(([idx1, idx2]) => {
          const p1 = projectedVerts[idx1];
          const p2 = projectedVerts[idx2];
          if (!p1 || !p2) return;

          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        });
      }

      // Draw Nodes / Point Cloud
      if (this.renderMode === 'points' || this.renderMode === 'solid') {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = part.color || '#00f0ff';
        this.ctx.shadowBlur = 6;
        projectedVerts.forEach(p => {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, Math.max(1, 2.5 * p.scale), 0, Math.PI * 2);
          this.ctx.fill();
        });
      }
    });

    requestAnimationFrame(this.animate);
  }
}

// Global instance
window.StarkCadViewer = StarkCadViewer;
