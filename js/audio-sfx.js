/**
 * ============================================================================
 * STARK INDUSTRIES // PROCEDURAL AUDIO & SOUND FX SYNTHESIZER
 * Synthesizes sci-fi holographic interface sounds using Web Audio API
 * ============================================================================
 */

class StarkAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isMuted = false;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;

    // Default volume (0.0 to 1.0)
    this.volume = 0.6;
  }

  /**
   * Initializes the AudioContext on first user interaction (browser policy)
   */
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Master Analyser Node for visualizers
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Get FFT frequency data array for visualizer bars
   */
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(32);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Toggle mute
   */
  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Set overall volume
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Crisp UI Click / Beep
   */
  playBeep(freq = 1200, type = 'sine', duration = 0.05) {
    if (this.isMuted) return;
    this.init();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playBeep failed", e);
    }
  }

  /**
   * Stark Activation Harmonic Chime (JARVIS wake / confirm chime)
   */
  playActivationChime() {
    if (this.isMuted) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      const freqs = [587.33, 880.00, 1174.66]; // D5, A5, D6 harmonic arpeggio

      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch (e) {
      console.warn("Audio activation chime failed", e);
    }
  }

  /**
   * Repulsor Charge & Blast Sound Effect
   */
  playRepulsorBlast() {
    if (this.isMuted) return;
    this.init();

    try {
      const now = this.ctx.currentTime;

      // Charge phase: Rising sweep
      const chargeOsc = this.ctx.createOscillator();
      const chargeGain = this.ctx.createGain();
      chargeOsc.type = 'sawtooth';
      chargeOsc.frequency.setValueAtTime(200, now);
      chargeOsc.frequency.exponentialRampToValueAtTime(2800, now + 0.35);

      chargeGain.gain.setValueAtTime(0.05, now);
      chargeGain.gain.linearRampToValueAtTime(0.25, now + 0.35);
      chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      chargeOsc.connect(chargeGain);
      chargeGain.connect(this.masterGain);
      chargeOsc.start(now);
      chargeOsc.stop(now + 0.4);

      // Blast phase: Noise burst + Sub drop
      setTimeout(() => {
        if (!this.ctx) return;
        const blastNow = this.ctx.currentTime;

        // Sub blast
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(140, blastNow);
        subOsc.frequency.exponentialRampToValueAtTime(35, blastNow + 0.4);

        subGain.gain.setValueAtTime(0.4, blastNow);
        subGain.gain.exponentialRampToValueAtTime(0.001, blastNow + 0.5);

        subOsc.connect(subGain);
        subGain.connect(this.masterGain);
        subOsc.start(blastNow);
        subOsc.stop(blastNow + 0.5);

        // White noise transient
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(2000, blastNow);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, blastNow + 0.25);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, blastNow);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, blastNow + 0.25);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(blastNow);
      }, 350);
    } catch (e) {
      console.warn("Repulsor blast failed", e);
    }
  }

  /**
   * Tactical Target Lock Double-Chirp
   */
  playTargetLock() {
    if (this.isMuted) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      [0, 0.08].forEach(offset => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2400, now + offset);

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
    } catch (e) {
      console.warn("Target lock failed", e);
    }
  }

  /**
   * Protocol Deployment Sci-Fi Swell
   */
  playProtocolDeploy() {
    if (this.isMuted) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("Protocol deploy failed", e);
    }
  }

  /**
   * Emergency Alert / Siren Warble
   */
  playAlarmSiren(duration = 2.0) {
    if (this.isMuted) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // LFO modulated frequency
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(3.5, now); // 3.5 Hz warble
      lfoGain.gain.setValueAtTime(250, now);
      lfo.connect(osc.frequency);
      osc.frequency.setValueAtTime(750, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + duration);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Alarm siren failed", e);
    }
  }

  /**
   * Continuous Ambient Arc Reactor Quantum Hum (toggleable)
   */
  toggleAmbientHum(enable) {
    if (enable) {
      if (this.isAmbientPlaying) return;
      this.init();

      try {
        const now = this.ctx.currentTime;
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientGain = this.ctx.createGain();

        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.setValueAtTime(55, now); // 55Hz low harmonic drone

        this.ambientGain.gain.setValueAtTime(0.001, now);
        this.ambientGain.gain.linearRampToValueAtTime(0.035, now + 2); // Very subtle

        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGain);

        this.ambientOsc.start();
        this.isAmbientPlaying = true;
      } catch (e) {
        console.warn("Ambient hum failed", e);
      }
    } else {
      if (!this.isAmbientPlaying || !this.ambientGain) return;
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc.disconnect();
            this.ambientOsc = null;
          }
          this.isAmbientPlaying = false;
        }, 1100);
      } catch (e) {
        this.isAmbientPlaying = false;
      }
    }
  }
}

// Global instance
window.starkAudio = new StarkAudioEngine();
