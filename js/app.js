/**
 * ============================================================================
 * STARK INDUSTRIES // J.A.R.V.I.S. MARK-LXXXV OS MASTER CONTROLLER
 * Telemetry loop, event wiring, diagnostic runner, modal managers & terminal log
 * ============================================================================
 */

class StarkApp {
  constructor() {
    this.isBooted = false;
    this.isLockdown = false;
    this.isCleanSlateActive = false;
    this.cleanSlateTimer = null;
    this.cleanSlateCount = 5;

    // Telemetry state
    this.reactorOutputMW = 3240;
    this.coreTempC = 42.4;
    this.nanotechIntegrity = 99.8;
    this.repulsorPower = 100;
  }

  init() {
    console.log("%c[STARK INDUSTRIES] INITIALIZING J.A.R.V.I.S. MARK-LXXXV OS", "color:#00f0ff; font-weight:bold; font-size:14px;");

    // Initialize Subsystems
    this.reactor = new window.StarkArcReactor('arcReactorCanvas');
    this.cadViewer = new window.StarkCadViewer('cadCanvas3D');
    this.satelliteGrid = new window.StarkSatelliteGrid('satelliteRadarCanvas');

    // Link Speech callbacks
    if (window.starkSpeech) {
      window.starkSpeech.setSubtitleElement(document.getElementById('jarvisSubtitles'));

      window.starkSpeech.onSpeechStart = () => {
        if (this.reactor) this.reactor.setState('SPEAKING');
      };

      window.starkSpeech.onSpeechEnd = () => {
        if (this.reactor && !this.isLockdown) this.reactor.setState('IDLE');
      };

      window.starkSpeech.onCommandHeard = (cmd) => {
        this.handleUserCommand(cmd);
      };
    }

    // Render Initial UI Elements
    if (window.starkArmorVault) {
      window.starkArmorVault.renderVaultCards('suitsVaultGrid');
    }
    this.renderTasks();
    this.renderReminders();
    this.initLeftArmorMiniWireframe();
    this.setupEventListeners();
    this.startTelemetryLoop();
    this.startEqVisualizerLoop();

    // Welcome Chime and Speech
    setTimeout(() => {
      this.bootSequence();
    }, 500);
  }

  bootSequence() {
    if (this.isBooted) return;
    this.isBooted = true;

    if (window.starkAudio) {
      window.starkAudio.playActivationChime();
    }

    this.logTerminal("SYSTEM", "STARK INDUSTRIES OS BOOTED. QUANTUM CORE STABLE.");
    this.logTerminal("JARVIS", "Good evening, Sir. All Mark LXXXV telemetry and defense subroutines are online.");

    if (window.starkSpeech) {
      window.starkSpeech.speak("Good evening, Sir. All Stark Industries systems are online and functioning within normal parameters.");
    }
  }

  setupEventListeners() {
    // Unlock Web Audio on first click anywhere
    document.addEventListener('click', () => {
      if (window.starkAudio) window.starkAudio.init();
    }, { once: true });

    // Voice Mic button
    const micBtn = document.getElementById('micToggleBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (window.starkSpeech) window.starkSpeech.toggleListening();
      });
    }

    // Terminal Input
    const termInput = document.getElementById('terminalInput');
    const termSend = document.getElementById('terminalSendBtn');
    if (termInput) {
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = termInput.value.trim();
          if (val) {
            this.handleUserCommand(val);
            termInput.value = '';
          }
        }
      });
    }
    if (termSend && termInput) {
      termSend.addEventListener('click', () => {
        const val = termInput.value.trim();
        if (val) {
          this.handleUserCommand(val);
          termInput.value = '';
        }
      });
    }

    // Global Hotkeys
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if typing inside an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (window.starkSpeech) window.starkSpeech.toggleListening();
      } else if (e.key === 'Escape') {
        this.closeAllModals();
        if (window.starkBrain) window.starkBrain.dismissActiveAlarm();
      } else if (e.key === 'l' || e.key === 'L') {
        this.toggleLockdown();
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleMute();
      } else if (e.key === '1') {
        this.openModal('suitsModal');
      } else if (e.key === '2') {
        this.openModal('cadModal');
      } else if (e.key === '3') {
        this.openModal('satelliteModal');
      } else if (e.key === '4') {
        this.runFullDiagnostics();
      } else if (e.key === '5') {
        this.triggerCleanSlate();
      }
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.stark-modal-overlay');
        if (modal) modal.classList.remove('active');
        if (window.starkAudio) window.starkAudio.playBeep(900, 'sine', 0.04);
      });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.stark-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          if (window.starkAudio) window.starkAudio.playBeep(900, 'sine', 0.04);
        }
      });
    });

    // CAD Controls
    const modelSelect = document.getElementById('cadModelSelect');
    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        if (this.cadViewer) this.cadViewer.setModel(e.target.value);
        if (window.starkAudio) window.starkAudio.playBeep(1400);
      });
    }
    const explodeSlider = document.getElementById('cadExplodeSlider');
    if (explodeSlider) {
      explodeSlider.addEventListener('input', (e) => {
        if (this.cadViewer) this.cadViewer.setExplode(parseFloat(e.target.value));
      });
    }
    const renderModeSelect = document.getElementById('cadRenderModeSelect');
    if (renderModeSelect) {
      renderModeSelect.addEventListener('change', (e) => {
        if (this.cadViewer) this.cadViewer.setRenderMode(e.target.value);
      });
    }

    // Satellite Strike Fire button
    const fireStrikeBtn = document.getElementById('fireOrbitalStrikeBtn');
    if (fireStrikeBtn) {
      fireStrikeBtn.addEventListener('click', () => {
        if (this.satelliteGrid) this.satelliteGrid.fireOrbitalStrike();
      });
    }

    // Personality Switcher Radio / Select
    const personalitySelect = document.getElementById('personalitySelect');
    if (personalitySelect) {
      personalitySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (window.starkSpeech) window.starkSpeech.setPersonality(val);
        this.updatePersonalityUI(val);
      });
    }

    // Ambient Hum Toggle
    const ambientHumCheck = document.getElementById('ambientHumCheck');
    if (ambientHumCheck) {
      ambientHumCheck.addEventListener('change', (e) => {
        if (window.starkAudio) window.starkAudio.toggleAmbientHum(e.target.checked);
      });
    }

    // Gemini Key Save
    const geminiKeyInput = document.getElementById('geminiKeyInput');
    const saveKeyBtn = document.getElementById('saveGeminiKeyBtn');
    if (saveKeyBtn && geminiKeyInput) {
      geminiKeyInput.value = window.starkBrain ? window.starkBrain.geminiApiKey : '';
      saveKeyBtn.addEventListener('click', () => {
        if (window.starkBrain) {
          window.starkBrain.setApiKey(geminiKeyInput.value);
          this.logTerminal("SYSTEM", "STARK NEURAL LINK: Gemini API Key verified & stored in encrypted storage.");
          if (window.starkAudio) window.starkAudio.playActivationChime();
          this.closeAllModals();
        }
      });
    }
  }

  async handleUserCommand(text) {
    this.logTerminal("USER", text);

    if (this.reactor) this.reactor.setState('PROCESSING');
    if (window.starkAudio) window.starkAudio.playBeep(1600, 'sine', 0.04);

    if (!window.starkBrain) return;

    try {
      const response = await window.starkBrain.processQuery(text);
      if (response) {
        this.logTerminal(window.starkSpeech.currentPersonality, response.text);
        if (window.starkSpeech) {
          window.starkSpeech.speak(response.speech);
        }
      }
    } catch (err) {
      console.error(err);
      this.logTerminal("SYSTEM", "NEURAL SUBROUTINE EXCEPTION: Query fallback engaged.");
    }
  }

  logTerminal(sender, text) {
    const box = document.getElementById('starkTerminalBox');
    if (!box) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    let senderClass = 'sender-jarvis';
    if (sender === 'USER') senderClass = 'sender-user';
    else if (sender === 'SYSTEM') senderClass = 'sender-system';
    else if (sender === 'FRIDAY') senderClass = 'sender-friday';

    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-sender ${senderClass}">${sender}:</span>
      <span class="log-text">${text}</span>
    `;

    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
  }

  updateMicUI(isListening) {
    const micBtn = document.getElementById('micToggleBtn');
    if (!micBtn) return;

    if (isListening) {
      micBtn.classList.add('is-listening');
      if (this.reactor) this.reactor.setState('LISTENING');
    } else {
      micBtn.classList.remove('is-listening');
      if (this.reactor && !this.isLockdown) this.reactor.setState('IDLE');
    }
  }

  setLiveInput(text) {
    const input = document.getElementById('terminalInput');
    if (input) input.placeholder = `Listening: "${text}"...`;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    if (window.starkAudio) window.starkAudio.playBeep(1800, 'sine', 0.05);

    // Refresh canvases if inside modal
    if (modalId === 'cadModal' && this.cadViewer) {
      setTimeout(() => this.cadViewer.resize(), 100);
    } else if (modalId === 'satelliteModal' && this.satelliteGrid) {
      setTimeout(() => this.satelliteGrid.resize(), 100);
    }
  }

  closeAllModals() {
    document.querySelectorAll('.stark-modal-overlay').forEach(m => m.classList.remove('active'));
  }

  toggleLockdown() {
    this.setLockdown(!this.isLockdown);
  }

  setLockdown(active) {
    this.isLockdown = active;
    if (active) {
      document.body.classList.add('mode-lockdown');
      if (this.reactor) this.reactor.setState('ALERT');
      if (window.starkAudio) window.starkAudio.playAlarmSiren(3.0);
      this.logTerminal("SYSTEM", "TACTICAL RED ALERT: PROTOCOL 9-DEFENSE ACTIVE.");
    } else {
      document.body.classList.remove('mode-lockdown');
      if (this.reactor) this.reactor.setState('IDLE');
      if (window.starkAudio) window.starkAudio.playActivationChime();
      this.logTerminal("SYSTEM", "ALERT CLEARED. STARK FACILITY SECURE.");
    }
  }

  toggleMute() {
    if (!window.starkAudio) return;
    const isMuted = !window.starkAudio.isMuted;
    window.starkAudio.setMute(isMuted);

    const muteBtn = document.getElementById('muteToggleBtn');
    if (muteBtn) {
      muteBtn.textContent = isMuted ? 'AUDIO: MUTED' : 'AUDIO: ON';
      muteBtn.classList.toggle('btn-accent', !isMuted);
    }
    this.logTerminal("SYSTEM", `AUDIO HARDWARE: ${isMuted ? 'MUTED' : 'UNMUTED'}`);
  }

  updatePersonalityUI(persona) {
    const chip = document.getElementById('aiPersonalityChip');
    if (chip) chip.textContent = persona;

    const select = document.getElementById('personalitySelect');
    if (select) select.value = persona;

    const titleElem = document.getElementById('aiCoreTitle');
    if (titleElem) titleElem.textContent = `${persona} CORE v85.4`;
  }

  onSuitDeployed(suit) {
    const tag = document.getElementById('activeArmorTag');
    if (tag) tag.textContent = `${suit.name} [${suit.codename}]`;

    const integrityTag = document.getElementById('armorIntegrityTag');
    if (integrityTag) integrityTag.textContent = `${suit.integrity}% INTEGRITY`;

    const repulsorBar = document.getElementById('repulsorGaugeBar');
    if (repulsorBar) repulsorBar.style.width = `${suit.power}%`;

    this.logTerminal("SYSTEM", `CHASSIS SWAP: ${suit.name} deployed. Power: ${suit.power}%, Speed: ${suit.speed}.`);
  }

  onTargetSelected(tgt) {
    const readout = document.getElementById('lockedTargetReadout');
    if (readout) {
      readout.innerHTML = `
        <div><strong>TARGET:</strong> ${tgt.name}</div>
        <div><strong>COORDINATES:</strong> ${tgt.lat}, ${tgt.lon}</div>
        <div><strong>THREAT LEVEL:</strong> <span style="color:${tgt.threat === 'HIGH' ? 'var(--stark-red)' : 'var(--stark-green)'}">${tgt.threat}</span></div>
      `;
    }
  }

  onReactorClick() {
    this.reactorOutputMW += 450;
    this.coreTempC += 2.5;
    this.logTerminal("SYSTEM", "ARC REACTOR DISCHARGE: Overclock pulse +450 MW recorded.");
    setTimeout(() => {
      this.reactorOutputMW = 3240;
      this.coreTempC = 42.4;
    }, 2000);
  }

  triggerCleanSlate() {
    this.openModal('cleanSlateModal');
    this.cleanSlateCount = 5;
    const countElem = document.getElementById('cleanSlateCountdown');
    if (countElem) countElem.textContent = this.cleanSlateCount;

    if (window.starkAudio) window.starkAudio.playAlarmSiren(1.0);
    if (window.starkSpeech) window.starkSpeech.speak("Clean Slate Protocol initiated. 5 seconds to core purge. Press abort to cancel.");

    clearInterval(this.cleanSlateTimer);
    this.cleanSlateTimer = setInterval(() => {
      this.cleanSlateCount--;
      if (countElem) countElem.textContent = this.cleanSlateCount;
      if (window.starkAudio) window.starkAudio.playBeep(800 + (5 - this.cleanSlateCount) * 200, 'sawtooth', 0.1);

      if (this.cleanSlateCount <= 0) {
        clearInterval(this.cleanSlateTimer);
        this.executeCleanSlatePurge();
      }
    }, 1000);
  }

  abortCleanSlate() {
    clearInterval(this.cleanSlateTimer);
    this.closeAllModals();
    if (window.starkSpeech) window.starkSpeech.speak("Clean Slate Protocol aborted. Core purge cancelled.");
    this.logTerminal("SYSTEM", "CLEAN SLATE PURGE CANCELLED BY USER AUTHORIZATION.");
  }

  executeCleanSlatePurge() {
    this.closeAllModals();
    if (window.starkAudio) window.starkAudio.playRepulsorBlast();
    if (window.starkSpeech) window.starkSpeech.speak("Thermal purge complete. Active caches flushed. All suits reset to default gantry locks.");

    const termBox = document.getElementById('starkTerminalBox');
    if (termBox) termBox.innerHTML = '';
    this.logTerminal("SYSTEM", "THERMAL CACHE PURGED. CLEAN SLATE EXECUTION CONFIRMED.");
  }

  runFullDiagnostics() {
    const list = document.getElementById('diagnosticsList');
    if (!list) return;

    const items = list.querySelectorAll('.diag-item');
    let idx = 0;

    if (window.starkAudio) window.starkAudio.playProtocolDeploy();
    if (window.starkSpeech) window.starkSpeech.speak("Initiating full seven point system diagnostic, Sir.");

    const interval = setInterval(() => {
      if (idx < items.length) {
        const item = items[idx];
        item.classList.remove('status-alert');
        item.classList.add('status-ok');
        const valSpan = item.querySelector('span:last-child');
        if (valSpan) valSpan.textContent = 'CHECK [OK]';
        if (window.starkAudio) window.starkAudio.playBeep(1200 + idx * 150, 'sine', 0.04);
        idx++;
      } else {
        clearInterval(interval);
        this.logTerminal("JARVIS", "Diagnostics complete. All subsystems optimal.");
        if (window.starkSpeech) window.starkSpeech.speak("Diagnostic complete, Sir. All armor matrices, repulsors, and neural links are 100 percent functional.");
      }
    }, 450);
  }

  initLeftArmorMiniWireframe() {
    const canvas = document.getElementById('armorMiniCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 140;

    let angle = 0;
    const drawMiniWireframe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.015;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw stylized wireframe torso & arc reactor
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;

      const cos = Math.cos(angle);

      // Shoulders
      ctx.beginPath();
      ctx.moveTo(cx - 50 * cos, cy - 45);
      ctx.lineTo(cx + 50 * cos, cy - 45);
      ctx.lineTo(cx + 35 * cos, cy + 20);
      ctx.lineTo(cx - 35 * cos, cy + 20);
      ctx.closePath();
      ctx.stroke();

      // Chest plate split
      ctx.beginPath();
      ctx.moveTo(cx, cy - 45);
      ctx.lineTo(cx, cy - 10);
      ctx.stroke();

      // Center glowing arc reactor node
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 6, 0, Math.PI * 2);
      ctx.fill();

      // Collar line
      ctx.beginPath();
      ctx.moveTo(cx - 20 * cos, cy - 55);
      ctx.lineTo(cx + 20 * cos, cy - 55);
      ctx.lineTo(cx + 10 * cos, cy - 45);
      ctx.lineTo(cx - 10 * cos, cy - 45);
      ctx.closePath();
      ctx.stroke();

      requestAnimationFrame(drawMiniWireframe);
    };

    drawMiniWireframe();
  }

  startTelemetryLoop() {
    setInterval(() => {
      // Gentle realistic micro-fluctuations
      const jitterPower = (Math.random() * 8 - 4).toFixed(1);
      const outputElem = document.getElementById('reactorOutputVal');
      if (outputElem) outputElem.textContent = `${(this.reactorOutputMW + parseFloat(jitterPower)).toFixed(1)} MW`;

      const tempJitter = (Math.random() * 0.4 - 0.2).toFixed(1);
      const tempElem = document.getElementById('reactorTempVal');
      if (tempElem) tempElem.textContent = `${(this.coreTempC + parseFloat(tempJitter)).toFixed(1)} °C`;
    }, 1200);
  }

  startEqVisualizerLoop() {
    const strip = document.getElementById('eqVisualizerStrip');
    if (!strip) return;

    // Create 32 EQ bars
    strip.innerHTML = '';
    const barCount = 28;
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      const b = document.createElement('div');
      b.className = 'eq-bar';
      strip.appendChild(b);
      bars.push(b);
    }

    const updateBars = () => {
      let freqData = window.starkAudio ? window.starkAudio.getFrequencyData() : [];
      const hasAudio = freqData && freqData.some(v => v > 0);

      bars.forEach((bar, idx) => {
        let height = 4;
        if (hasAudio && freqData[idx] !== undefined) {
          height = Math.max(4, (freqData[idx] / 255) * 26);
        } else if (this.reactor && (this.reactor.state === 'SPEAKING' || this.reactor.state === 'LISTENING')) {
          // Synthetic speech wave pattern
          height = 4 + Math.sin(Date.now() * 0.015 + idx * 0.3) * 12 + Math.random() * 6;
        }
        bar.style.height = `${height}px`;
      });

      requestAnimationFrame(updateBars);
    };

    updateBars();
  }

  renderTasks() {
    const list = document.getElementById('starkTaskList');
    if (!list || !window.starkBrain) return;

    list.innerHTML = window.starkBrain.tasks.map(t => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:rgba(3,10,22,0.7); border-left:2px solid var(--accent-color); font-size:11px; font-family:var(--font-mono); text-decoration:${t.done ? 'line-through' : 'none'}; opacity:${t.done ? 0.6 : 1}">
        <span style="color:#e0f7fc">${t.text}</span>
        <button class="stark-btn" style="padding:2px 6px; font-size:9px" onclick="window.starkApp.toggleTask(${t.id})">
          ${t.done ? 'UNDO' : 'DONE'}
        </button>
      </div>
    `).join('');
  }

  toggleTask(id) {
    if (!window.starkBrain) return;
    const t = window.starkBrain.tasks.find(x => x.id === id);
    if (t) {
      t.done = !t.done;
      window.starkBrain.saveTasks();
      this.renderTasks();
      if (window.starkAudio) window.starkAudio.playBeep(1400);
    }
  }

  showAlarmBanner(text) {
    const banner = document.getElementById('reminderAlarmBanner');
    const bannerText = document.getElementById('alarmBannerText');
    if (banner && bannerText) {
      bannerText.textContent = text;
      banner.classList.add('active');
    }
  }

  hideAlarmBanner() {
    const banner = document.getElementById('reminderAlarmBanner');
    if (banner) {
      banner.classList.remove('active');
    }
  }

  renderReminders() {
    const list = document.getElementById('starkReminderList');
    if (!list || !window.starkBrain) return;

    if (window.starkBrain.reminders.length === 0) {
      list.innerHTML = `
        <div style="font-size:10px; color:rgba(224,247,252,0.4); font-family:var(--font-mono); padding:4px 0;">
          No active chrono timers. Speak or type: "Remind me in 10s to..."
        </div>
      `;
      return;
    }

    list.innerHTML = window.starkBrain.reminders.map(r => {
      const remainingSecs = Math.max(0, Math.round((r.dueTimestamp - Date.now()) / 1000));
      return `
        <div class="reminder-item ${remainingSecs <= 0 ? 'is-due' : ''}" id="rem-${r.id}">
          <div style="display:flex; flex-direction:column; gap:2px; overflow:hidden;">
            <span style="color:#fff; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.text}</span>
            <span class="reminder-time-badge" id="rem-badge-${r.id}">${this.formatDuration(remainingSecs)} remaining</span>
          </div>
          <button class="stark-btn btn-danger" style="padding:2px 6px; font-size:9px" onclick="window.starkApp.cancelReminder(${r.id})">
            CANCEL
          </button>
        </div>
      `;
    }).join('');
  }

  updateReminderCountdowns() {
    if (!window.starkBrain) return;
    window.starkBrain.reminders.forEach(r => {
      const badge = document.getElementById(`rem-badge-${r.id}`);
      if (badge) {
        const remainingSecs = Math.max(0, Math.round((r.dueTimestamp - Date.now()) / 1000));
        badge.textContent = `${this.formatDuration(remainingSecs)} remaining`;
      }
    });
  }

  formatDuration(secs) {
    if (secs >= 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      return `${h}h ${m}m`;
    }
    if (secs >= 60) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}m ${s}s`;
    }
    return `${secs}s`;
  }

  cancelReminder(id) {
    if (!window.starkBrain) return;
    window.starkBrain.reminders = window.starkBrain.reminders.filter(r => r.id !== id);
    window.starkBrain.saveReminders();
    this.renderReminders();
    if (window.starkAudio) window.starkAudio.playBeep(1200);
    this.logTerminal("SYSTEM", "CHRONO DIRECTIVE CANCELLED.");
  }
}

// Global instance initialized on DOMContentLoaded
window.starkApp = new StarkApp();
window.addEventListener('DOMContentLoaded', () => {
  window.starkApp.init();
});

