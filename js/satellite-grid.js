/**
 * ============================================================================
 * STARK INDUSTRIES // E.D.I.T.H. ORBITAL SATELLITE RADAR & DEFENSE GRID
 * Global vector telemetry, target acquisition & orbital strike simulator
 * ============================================================================
 */

class StarkSatelliteGrid {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resize();

    // Radar scan state
    this.radarAngle = 0;
    this.scanSpeed = 0.025;

    // Satellites
    this.satellites = [
      { id: 'STARK-SAT-01', name: 'Veronica Prime', radius: 190, angle: 0.2, speed: 0.006, type: 'Heavy Orbital Frame' },
      { id: 'STARK-SAT-02', name: 'Edith Relay Alpha', radius: 160, angle: 1.5, speed: 0.009, type: 'Tactical Drone Carrier' },
      { id: 'STARK-SAT-03', name: 'Arc Net Comms 3', radius: 125, angle: 2.8, speed: 0.012, type: 'Quantum Communications' },
      { id: 'STARK-SAT-04', name: 'Helios Strike Platform', radius: 215, angle: 4.1, speed: 0.005, type: 'Kinetic Rod Launcher' },
      { id: 'STARK-SAT-05', name: 'Recon Spectre 5', radius: 140, angle: 5.3, speed: 0.010, type: 'Sub-Orbital Sensor Grid' }
    ];

    // Threat / Interest Targets
    this.targets = [
      { id: 'T-01', name: 'Avengers Compound, NY', lat: '41.3° N', lon: '73.9° W', x: 0, y: 0, threat: 'LOW', normDist: 0.35, normAngle: 5.4 },
      { id: 'T-02', name: 'Point Dume, Malibu', lat: '34.0° N', lon: '118.8° W', x: 0, y: 0, threat: 'SECURE', normDist: 0.55, normAngle: 4.8 },
      { id: 'T-03', name: 'Sokovia Anomaly Site', lat: '48.2° N', lon: '16.3° E', x: 0, y: 0, threat: 'HIGH', normDist: 0.45, normAngle: 1.2 },
      { id: 'T-04', name: 'Wakanda Border Outpost', lat: '0.0° N', lon: '30.0° E', x: 0, y: 0, threat: 'MONITORED', normDist: 0.65, normAngle: 2.3 }
    ];

    // Currently selected / locked target
    this.lockedTarget = this.targets[0];

    // Strike animation queue
    this.strikes = [];

    this.setupEvents();
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

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Calculate polar coordinates from center
      const dx = clickX - this.centerX;
      const dy = clickY - this.centerY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Create new manual target
      const newTarget = {
        id: `T-${Math.floor(10 + Math.random() * 89)}`,
        name: `Acquired Coordinate [${Math.round(dist)}px]`,
        lat: `${(Math.random() * 80).toFixed(1)}° ${Math.random() > 0.5 ? 'N' : 'S'}`,
        lon: `${(Math.random() * 170).toFixed(1)}° ${Math.random() > 0.5 ? 'E' : 'W'}`,
        x: clickX,
        y: clickY,
        threat: dist > 150 ? 'MEDIUM' : 'CRITICAL',
        normDist: dist / Math.min(this.centerX, this.centerY),
        normAngle: angle < 0 ? angle + Math.PI * 2 : angle
      };

      this.lockedTarget = newTarget;

      if (window.starkAudio) {
        window.starkAudio.playTargetLock();
      }

      if (window.starkApp) {
        window.starkApp.onTargetSelected(newTarget);
      }
    });
  }

  fireOrbitalStrike() {
    if (!this.lockedTarget) return;

    // Pick closest satellite
    const sat = this.satellites[0];
    const satX = this.centerX + Math.cos(sat.angle) * sat.radius;
    const satY = this.centerY + Math.sin(sat.angle) * sat.radius;

    const targetX = this.lockedTarget.x || (this.centerX + Math.cos(this.lockedTarget.normAngle) * (this.lockedTarget.normDist * Math.min(this.centerX, this.centerY)));
    const targetY = this.lockedTarget.y || (this.centerY + Math.sin(this.lockedTarget.normAngle) * (this.lockedTarget.normDist * Math.min(this.centerX, this.centerY)));

    this.strikes.push({
      fromX: satX,
      fromY: satY,
      toX: targetX,
      toY: targetY,
      progress: 0,
      alpha: 1.0
    });

    if (window.starkAudio) {
      window.starkAudio.playRepulsorBlast();
    }

    if (window.starkSpeech) {
      window.starkSpeech.speak(`Orbital kinetic strike initiated from ${sat.name}. Target neutralized.`);
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const maxR = Math.min(this.centerX, this.centerY) * 0.9;

    // 1. Draw Radar Range Rings
    const ringSteps = [0.25, 0.5, 0.75, 1.0];
    ringSteps.forEach((step, idx) => {
      const r = maxR * step;
      this.ctx.strokeStyle = idx === ringSteps.length - 1 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 240, 255, 0.15)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      this.ctx.stroke();

      // Range text
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      this.ctx.font = '9px Share Tech Mono';
      this.ctx.fillText(`${Math.round(step * 4000)} KM`, this.centerX + 6, this.centerY - r + 12);
    });

    // 2. Crosshair Grid Lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX - maxR, this.centerY);
    this.ctx.lineTo(this.centerX + maxR, this.centerY);
    this.ctx.moveTo(this.centerX, this.centerY - maxR);
    this.ctx.lineTo(this.centerX, this.centerY + maxR);
    this.ctx.stroke();

    // 3. Radar Sweep Beam
    this.radarAngle += this.scanSpeed;
    if (this.radarAngle >= Math.PI * 2) this.radarAngle = 0;

    const sweepGrad = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, maxR
    );
    sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.arc(this.centerX, this.centerY, maxR, this.radarAngle - 0.4, this.radarAngle);
    this.ctx.closePath();
    this.ctx.fillStyle = sweepGrad;
    this.ctx.fill();

    // Leading sweep line
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(
      this.centerX + Math.cos(this.radarAngle) * maxR,
      this.centerY + Math.sin(this.radarAngle) * maxR
    );
    this.ctx.stroke();
    this.ctx.restore();

    // 4. Draw Satellites in Orbit
    this.satellites.forEach(sat => {
      sat.angle += sat.speed;
      const r = (sat.radius / 220) * maxR;
      const sx = this.centerX + Math.cos(sat.angle) * r;
      const sy = this.centerY + Math.sin(sat.angle) * r;

      // Orbit path
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      this.ctx.stroke();

      // Satellite Icon
      this.ctx.fillStyle = '#ffb800';
      this.ctx.shadowColor = '#ffb800';
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(sx - 3, sy - 3, 6, 6);

      // Label
      this.ctx.fillStyle = '#e0f7fc';
      this.ctx.font = '9px Share Tech Mono';
      this.ctx.fillText(sat.name, sx + 8, sy + 3);
    });

    // 5. Draw Targets
    this.targets.forEach(tgt => {
      const tr = tgt.normDist * maxR;
      const tx = this.centerX + Math.cos(tgt.normAngle) * tr;
      const ty = this.centerY + Math.sin(tgt.normAngle) * tr;
      tgt.x = tx;
      tgt.y = ty;

      const isLocked = this.lockedTarget && this.lockedTarget.id === tgt.id;

      this.ctx.fillStyle = tgt.threat === 'HIGH' ? '#ff2a5f' : '#00ff88';
      this.ctx.shadowColor = this.ctx.fillStyle;
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(tx, ty, isLocked ? 5 : 3, 0, Math.PI * 2);
      this.ctx.fill();

      // If locked, draw crosshair reticle
      if (isLocked) {
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(tx, ty, 12, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeRect(tx - 16, ty - 16, 32, 32);

        this.ctx.fillStyle = '#00f0ff';
        this.ctx.font = '10px Orbitron';
        this.ctx.fillText(`LOCKED: ${tgt.name}`, tx + 18, ty - 8);
      }
    });

    // 6. Draw Kinetic Orbital Strikes
    for (let i = this.strikes.length - 1; i >= 0; i--) {
      const strike = this.strikes[i];
      strike.progress += 0.05;
      strike.alpha -= 0.02;

      if (strike.alpha <= 0) {
        this.strikes.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = `rgba(0, 240, 255, ${strike.alpha})`;
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 20;

      this.ctx.beginPath();
      this.ctx.moveTo(strike.fromX, strike.fromY);
      this.ctx.lineTo(strike.toX, strike.toY);
      this.ctx.stroke();

      // Impact explosion ring
      this.ctx.strokeStyle = `rgba(255, 42, 95, ${strike.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(strike.toX, strike.toY, (1 - strike.alpha) * 45, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    requestAnimationFrame(this.animate);
  }
}

// Global instance
window.StarkSatelliteGrid = StarkSatelliteGrid;
