/**
 * ============================================================================
 * STARK INDUSTRIES // HOLOGRAPHIC ARC REACTOR CANVAS VISUALIZER
 * Dynamic multi-layered rotating reactor with particle flux & audio reactivity
 * ============================================================================
 */

class StarkArcReactor {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = this.canvas.width = 320;
    this.height = this.canvas.height = 320;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Animation & State
    this.angle1 = 0;
    this.angle2 = 0;
    this.angle3 = 0;
    this.pulse = 0;
    this.state = 'IDLE'; // IDLE | LISTENING | PROCESSING | SPEAKING | ALERT

    // Audio reactivity multiplier
    this.audioIntensity = 0;

    // Sparks / Energy Particles
    this.particles = [];
    this.maxParticles = 45;
    this.initParticles();

    // Pulse shockwave on click
    this.shockwaves = [];

    // Bind event listeners
    this.setupInteractivity();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setState(newState) {
    this.state = newState;
  }

  initParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 85;
    return {
      x: this.centerX + Math.cos(angle) * dist,
      y: this.centerY + Math.sin(angle) * dist,
      angle: angle,
      dist: dist,
      speed: 0.015 + Math.random() * 0.035,
      size: 1 + Math.random() * 2,
      opacity: Math.random() * 0.8 + 0.2,
      life: Math.random() * 100
    };
  }

  setupInteractivity() {
    this.canvas.addEventListener('click', (e) => {
      // Trigger repulsor shockwave
      this.triggerShockwave();
      if (window.starkAudio) {
        window.starkAudio.playRepulsorBlast();
      }
      if (window.starkApp) {
        window.starkApp.onReactorClick();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.audioIntensity = Math.min(1.0, this.audioIntensity + 0.05);
    });
  }

  triggerShockwave() {
    this.shockwaves.push({
      radius: 20,
      maxRadius: 150,
      opacity: 1.0,
      speed: 6
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Compute speeds based on state
    let speedMult = 1.0;
    let baseColor = '#00f0ff';
    let glowColor = 'rgba(0, 240, 255, 0.45)';

    if (this.state === 'LISTENING') {
      speedMult = 1.6;
      baseColor = '#00ff88';
      glowColor = 'rgba(0, 255, 136, 0.5)';
    } else if (this.state === 'PROCESSING') {
      speedMult = 2.4;
      baseColor = '#ffb800';
      glowColor = 'rgba(255, 184, 0, 0.6)';
    } else if (this.state === 'SPEAKING') {
      speedMult = 1.8;
      // Pulse violently with voice
      this.audioIntensity = 0.5 + Math.sin(Date.now() * 0.02) * 0.45;
    } else if (this.state === 'ALERT') {
      speedMult = 3.0;
      baseColor = '#ff2a5f';
      glowColor = 'rgba(255, 42, 95, 0.7)';
    } else {
      // Natural decay in idle
      this.audioIntensity = Math.max(0, this.audioIntensity - 0.02);
    }

    // Step angles
    this.angle1 += 0.012 * speedMult;
    this.angle2 -= 0.018 * speedMult;
    this.angle3 += 0.025 * speedMult;
    this.pulse += 0.04 * speedMult;

    const dynamicPulse = Math.sin(this.pulse) * 4 * (1 + this.audioIntensity);

    // 1. Draw Background Glow
    const bgGlow = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 10,
      this.centerX, this.centerY, 130 + dynamicPulse
    );
    bgGlow.addColorStop(0, glowColor);
    bgGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.08)');
    bgGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bgGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 140, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Draw Outer Segmented HUD Ring
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.angle1);
    this.ctx.strokeStyle = baseColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = 10;

    const outerRadius = 135;
    const segments = 24;
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * Math.PI * 2) / segments;
      const endAngle = startAngle + (Math.PI / segments) * 0.65;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      this.ctx.stroke();

      // Outer tick mark
      const tx1 = Math.cos(startAngle) * (outerRadius + 4);
      const ty1 = Math.sin(startAngle) * (outerRadius + 4);
      const tx2 = Math.cos(startAngle) * (outerRadius + 8);
      const ty2 = Math.sin(startAngle) * (outerRadius + 8);
      this.ctx.beginPath();
      this.ctx.moveTo(tx1, ty1);
      this.ctx.lineTo(tx2, ty2);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // 3. Draw Counter-Rotating Mid Track & Coils
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.angle2);

    // Track circle
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 105, 0, Math.PI * 2);
    this.ctx.stroke();

    // 10 Induction Coils (Classic Stark Arc Reactor 10 Coils)
    const coils = 10;
    for (let i = 0; i < coils; i++) {
      const coilAngle = (i * Math.PI * 2) / coils;
      this.ctx.save();
      this.ctx.rotate(coilAngle);

      // Copper Induction Block
      this.ctx.fillStyle = 'rgba(255, 184, 0, 0.85)';
      this.ctx.fillRect(85, -9, 24, 18);

      // Inner glowing core aperture of the coil
      this.ctx.fillStyle = baseColor;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 12;
      this.ctx.fillRect(90, -5, 14, 10);

      // Wire wrap ticks
      this.ctx.strokeStyle = '#030811';
      this.ctx.lineWidth = 1.5;
      for (let w = 88; w <= 104; w += 4) {
        this.ctx.beginPath();
        this.ctx.moveTo(w, -9);
        this.ctx.lineTo(w, 9);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
    this.ctx.restore();

    // 4. Draw Inner High-Speed Optical Ring
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.angle3);
    this.ctx.strokeStyle = baseColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([8, 12]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 68, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();

    // 5. Draw Orbiting Energy Flux Particles
    this.particles.forEach(p => {
      p.angle += p.speed * speedMult;
      p.x = this.centerX + Math.cos(p.angle) * p.dist;
      p.y = this.centerY + Math.sin(p.angle) * p.dist;

      this.ctx.fillStyle = baseColor;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 6. Draw Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.opacity -= 0.03;

      if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = `rgba(0, 240, 255, ${sw.opacity})`;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 7. Center Palladium / Vibranium Core Core
    const coreRadius = 40 + dynamicPulse;
    const coreGrad = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, coreRadius
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, baseColor);
    coreGrad.addColorStop(0.8, glowColor);
    coreGrad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = coreGrad;
    this.ctx.shadowColor = baseColor;
    this.ctx.shadowBlur = 24 + dynamicPulse * 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, coreRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner Metallic Lens
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 20, 0, Math.PI * 2);
    this.ctx.stroke();

    requestAnimationFrame(this.animate);
  }
}

// Attach to global window
window.StarkArcReactor = StarkArcReactor;
