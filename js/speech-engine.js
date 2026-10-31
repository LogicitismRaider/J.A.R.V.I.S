/**
 * ============================================================================
 * STARK INDUSTRIES // ADVANCED SPEECH SYNTHESIS & RECOGNITION ENGINE
 * Natural Neural Voice Selection, Always-On "Hey Jarvis" Background Wake-Word Detection
 * ============================================================================
 */

class StarkSpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.isWakeWordActive = localStorage.getItem('stark_wake_word_active') !== 'false'; // Default TRUE
    this.currentPersonality = localStorage.getItem('stark_personality') || 'JARVIS'; // JARVIS | FRIDAY | EDITH

    // Custom Voice Preferences
    this.selectedVoiceURI = localStorage.getItem('stark_voice_uri') || '';
    this.voiceRate = parseFloat(localStorage.getItem('stark_voice_rate')) || 1.0;
    this.voicePitch = parseFloat(localStorage.getItem('stark_voice_pitch')) || 0.95;

    // Resolved Voice References
    this.voices = [];
    this.jarvisVoice = null;
    this.fridayVoice = null;
    this.edithVoice = null;
    this.customVoice = null;

    // Wake Word State
    this.wakeWordDebounce = 0;
    this.restartTimeout = null;
    this.hasAwaitingDirective = false;

    // Subtitle DOM reference
    this.subtitleElem = null;

    // Callbacks
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onCommandHeard = null;

    this.initVoices();
    this.initRecognition();
  }

  initVoices() {
    if (!this.synth) return;

    const loadAndRankVoices = () => {
      this.voices = this.synth.getVoices();
      if (!this.voices || this.voices.length === 0) return;

      console.log(`[STARK AUDIO] Loaded ${this.voices.length} system voices.`);

      const scoredVoices = this.voices.map(v => ({
        voice: v,
        score: this.scoreVoiceQuality(v)
      })).sort((a, b) => b.score - a.score);

      // 1. Pick Top Natural J.A.R.V.I.S. Voice (Prefers Natural/Neural British Male or high quality en-GB)
      const jarvisCandidates = scoredVoices.filter(item => {
        const lang = item.voice.lang.toLowerCase();
        const name = item.voice.name.toLowerCase();
        const isBritish = lang === 'en-gb' || lang.startsWith('en_gb');
        const isMaleOrNeutral = !name.includes('female') && !name.includes('zira') && !name.includes('susan') && !name.includes('hazel');
        return isBritish && isMaleOrNeutral;
      });

      this.jarvisVoice = (jarvisCandidates[0] ? jarvisCandidates[0].voice : null) ||
        this.voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
        this.voices.find(v => v.name.includes('Google UK English Male')) ||
        this.voices.find(v => v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Arthur')) ||
        this.voices.find(v => v.lang === 'en-GB') ||
        scoredVoices[0].voice;

      // 2. Pick Top Natural F.R.I.D.A.Y. Voice (Irish or Natural female)
      const fridayCandidates = scoredVoices.filter(item => {
        const lang = item.voice.lang.toLowerCase();
        const name = item.voice.name.toLowerCase();
        const isFemale = name.includes('female') || name.includes('natural') || name.includes('online') || name.includes('samantha') || name.includes('sonia') || name.includes('jenny');
        return (lang === 'en-ie' || lang === 'en-gb' || lang === 'en-us') && isFemale;
      });
      this.fridayVoice = (fridayCandidates[0] ? fridayCandidates[0].voice : null) || this.jarvisVoice;

      // 3. Pick Top E.D.I.T.H. Voice (Tactical clear en-US)
      const edithCandidates = scoredVoices.filter(item => {
        const lang = item.voice.lang.toLowerCase();
        return lang === 'en-us' || lang.startsWith('en_us');
      });
      this.edithVoice = (edithCandidates[0] ? edithCandidates[0].voice : null) || this.jarvisVoice;

      // 4. Resolve Custom Voice if user selected one
      if (this.selectedVoiceURI) {
        this.customVoice = this.voices.find(v => v.voiceURI === this.selectedVoiceURI) || null;
      }

      this.populateVoicePicker();
    };

    loadAndRankVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadAndRankVoices;
    }
  }

  scoreVoiceQuality(v) {
    let score = 0;
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    if (name.includes('natural')) score += 60;
    if (name.includes('online')) score += 40;
    if (name.includes('neural')) score += 50;
    if (name.includes('google')) score += 35;
    if (name.includes('premium') || name.includes('enhanced')) score += 30;

    if (lang.startsWith('en')) score += 20;
    if (lang === 'en-gb' || lang.startsWith('en_gb')) score += 15;

    if (name.includes('desktop')) score -= 45;
    if (name.includes('david')) score -= 30;
    if (name.includes('microsoft mark')) score -= 30;

    return score;
  }

  populateVoicePicker() {
    const select = document.getElementById('voicePickerSelect');
    if (!select || !this.voices) return;

    const currentVal = this.selectedVoiceURI || (this.jarvisVoice ? this.jarvisVoice.voiceURI : '');
    const sorted = [...this.voices].sort((a, b) => this.scoreVoiceQuality(b) - this.scoreVoiceQuality(a));

    select.innerHTML = sorted.map(v => {
      const isNatural = v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google');
      const tag = isNatural ? ' ★ [NATURAL]' : '';
      return `<option value="${v.voiceURI}" ${v.voiceURI === currentVal ? 'selected' : ''}>${v.name} (${v.lang})${tag}</option>`;
    }).join('');
  }

  setCustomVoice(voiceURI) {
    this.selectedVoiceURI = voiceURI;
    localStorage.setItem('stark_voice_uri', voiceURI);
    this.customVoice = this.voices.find(v => v.voiceURI === voiceURI) || null;
    if (window.starkAudio) window.starkAudio.playBeep(1600);
  }

  setRate(rate) {
    this.voiceRate = Math.max(0.6, Math.min(1.5, rate));
    localStorage.setItem('stark_voice_rate', this.voiceRate.toString());
  }

  setPitch(pitch) {
    this.voicePitch = Math.max(0.5, Math.min(1.5, pitch));
    localStorage.setItem('stark_voice_pitch', this.voicePitch.toString());
  }

  setPersonality(persona) {
    this.currentPersonality = persona.toUpperCase();
    localStorage.setItem('stark_personality', this.currentPersonality);
    if (window.starkAudio) {
      window.starkAudio.playBeep(persona === 'FRIDAY' ? 1800 : 1200);
    }
  }

  setSubtitleElement(element) {
    this.subtitleElem = element;
  }

  testVoice() {
    const phrases = {
      JARVIS: "Good evening, Sir. All Mark 85 armor telemetry and quantum subroutines are fully calibrated. How may I assist you today?",
      FRIDAY: "Boss! F.R.I.D.A.Y. here. All flight stabilizers and repulsor combat matrices are primed and ready.",
      EDITH: "Even Dead, I'm The Hero. Orbital defense platform initialized. Standing by for target coordinates."
    };
    const phrase = phrases[this.currentPersonality] || "Voice synthesizer operational, Sir. Natural speech engine active.";
    this.speak(phrase, true);
  }

  speak(text, priority = false) {
    if (!this.synth) {
      this.renderSubtitle(text);
      return;
    }

    if (priority || this.synth.speaking) {
      this.synth.cancel();
    }

    const cleanText = text
      .replace(/[\*\#\_\[\]\(\)\>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    let activeVoice = this.customVoice;
    if (!activeVoice) {
      if (this.currentPersonality === 'FRIDAY') {
        activeVoice = this.fridayVoice || this.jarvisVoice;
      } else if (this.currentPersonality === 'EDITH') {
        activeVoice = this.edithVoice || this.jarvisVoice;
      } else {
        activeVoice = this.jarvisVoice;
      }
    }

    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    let rate = this.voiceRate;
    let pitch = this.voicePitch;

    if (this.currentPersonality === 'JARVIS') {
      rate = this.voiceRate * 0.98;
      pitch = this.voicePitch * 0.94;
    } else if (this.currentPersonality === 'FRIDAY') {
      rate = this.voiceRate * 1.04;
      pitch = this.voicePitch * 1.08;
    }

    utterance.rate = Math.max(0.7, Math.min(1.4, rate));
    utterance.pitch = Math.max(0.6, Math.min(1.4, pitch));
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.renderSubtitle(cleanText);
      if (this.onSpeechStart) this.onSpeechStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      console.warn("Speech synthesis error", e);
      if (this.onSpeechEnd) this.onSpeechEnd();
    };

    this.synth.speak(utterance);
  }

  renderSubtitle(text) {
    if (!this.subtitleElem) return;
    this.subtitleElem.innerHTML = `&ldquo;${text}&rdquo;`;
    this.subtitleElem.style.opacity = '1';
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    if (this.onSpeechEnd) this.onSpeechEnd();
  }

  // ==========================================================================
  // ALWAYS-ON BACKGROUND "HEY JARVIS" WAKE-WORD DETECTION ENGINE
  // ==========================================================================
  initRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Speech Recognition API is not supported in this browser engine.");
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true; // Stay active across pauses
      this.recognition.interimResults = true; // Rapid wake-word detection
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (window.starkApp) {
          window.starkApp.updateMicUI(true, this.isWakeWordActive);
        }
      };

      this.recognition.onresult = (event) => {
        // Do not process speech while Jarvis himself is speaking (prevents self-trigger loop)
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const candidate = (finalTranscript || interimTranscript).trim().toLowerCase();

        // 1. Check for Wake Word: "hey jarvis", "jarvis", "hey friday", "friday", "edith"
        const wakePattern = /\b(?:hey\s+)?(jarvis|friday|edith)\b/i;
        const wakeMatch = candidate.match(wakePattern);

        if (wakeMatch) {
          const now = Date.now();
          // Debounce wake activation
          if (now - this.wakeWordDebounce > 2500) {
            this.wakeWordDebounce = now;

            // Trigger wake chime & reactor pulse
            if (window.starkAudio) window.starkAudio.playActivationChime();
            if (window.starkApp && window.starkApp.reactor) {
              window.starkApp.reactor.setState('LISTENING');
            }

            // Extract trailing command if user said: "Hey Jarvis [do something]"
            const trailingCommand = candidate.replace(/^.*?\b(?:hey\s+)?(?:jarvis|friday|edith)\b[\,\:\s]*/i, '').trim();

            if (trailingCommand.length > 2) {
              // Direct command attached to wake word
              if (window.starkApp) {
                window.starkApp.logTerminal("WAKE TRIGGER", `HEARD: "${candidate}" -> EXECUTING DIRECTIVE`);
              }
              if (this.onCommandHeard) {
                this.onCommandHeard(trailingCommand);
              }
              return;
            } else {
              // User just said "Hey Jarvis" -> Prompt for directive
              this.hasAwaitingDirective = true;
              const greetings = {
                JARVIS: "At your service, Sir. What is your command?",
                FRIDAY: "Right here, Boss! What do you need?",
                EDITH: "Standing by, Sir. Defense grid ready."
              };
              const ack = greetings[this.currentPersonality] || "Yes, Sir?";
              
              if (window.starkApp) {
                window.starkApp.logTerminal("WAKE TRIGGER", `WAKE WORD ACKNOWLEDGED: "${wakeMatch[0].toUpperCase()}" -> AWAITING DIRECTIVE`);
              }
              this.speak(ack, true);
              return;
            }
          }
        }

        // 2. If already awaiting directive from previous "Hey Jarvis" prompt
        if (this.hasAwaitingDirective && finalTranscript.trim().length > 1) {
          this.hasAwaitingDirective = false;
          if (this.onCommandHeard) {
            this.onCommandHeard(finalTranscript.trim());
          }
          return;
        }

        // 3. If standard push-to-talk was used without wake word
        if (finalTranscript.trim() && !this.isWakeWordActive) {
          if (this.onCommandHeard) {
            this.onCommandHeard(finalTranscript.trim());
          }
        }
      };

      this.recognition.onerror = (event) => {
        // Silent recovery for ambient background listening
        if (event.error === 'no-speech') {
          // Normal background silence, onend will auto-restart
          return;
        }

        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isWakeWordActive = false;
          this.isListening = false;
          if (window.starkApp) {
            window.starkApp.updateMicUI(false, false);
            window.starkApp.logTerminal("VOICE ALERT", "MICROPHONE PERMISSION BLOCKED: Please click the lock icon in your address bar and allow microphone access.");
            window.starkApp.showAlarmBanner("Microphone blocked. Click the lock icon in browser address bar to allow.");
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;

        // Auto-restart in background if wake-word detection is enabled!
        if (this.isWakeWordActive) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            this.startListeningSafely();
          }, 300);
        } else {
          if (window.starkApp) window.starkApp.updateMicUI(false, false);
        }
      };
    } catch (err) {
      console.warn("Could not instantiate SpeechRecognition", err);
    }
  }

  async startListeningSafely() {
    if (!this.recognition || this.isListening) return;

    try {
      this.recognition.start();
    } catch (e) {
      // If busy, retry briefly
      clearTimeout(this.restartTimeout);
      this.restartTimeout = setTimeout(() => {
        try { this.recognition.start(); } catch (err) { /* ignore */ }
      }, 500);
    }
  }

  async toggleWakeWordMode() {
    this.isWakeWordActive = !this.isWakeWordActive;
    localStorage.setItem('stark_wake_word_active', this.isWakeWordActive.toString());

    if (window.starkAudio) window.starkAudio.playBeep(this.isWakeWordActive ? 1800 : 1000);

    if (this.isWakeWordActive) {
      // Request mic permission if not already granted
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        } catch (e) {
          console.warn("Mic access blocked", e);
        }
      }

      this.startListeningSafely();
      if (window.starkApp) {
        window.starkApp.logTerminal("SYSTEM", "ALWAYS-ON AMBIENT MIC ENGAGED: Listening for 'Hey Jarvis' in background...");
        window.starkApp.updateWakeWordUI(true);
      }
    } else {
      if (this.recognition) {
        try { this.recognition.stop(); } catch (e) { /* ignore */ }
      }
      this.isListening = false;
      if (window.starkApp) {
        window.starkApp.logTerminal("SYSTEM", "ALWAYS-ON WAKE WORD DISABLED: Switched to Push-To-Talk mode.");
        window.starkApp.updateWakeWordUI(false);
      }
    }
  }

  async toggleListening() {
    // When user explicitly clicks mic button or presses Spacebar
    if (!this.recognition) {
      const msg = "Speech recognition is supported natively in Google Chrome and Microsoft Edge.";
      if (window.starkApp) window.starkApp.showAlarmBanner(msg);
      return;
    }

    if (this.isListening && !this.isWakeWordActive) {
      try { this.recognition.stop(); } catch (e) { /* ignore */ }
      this.isListening = false;
      if (window.starkApp) window.starkApp.updateMicUI(false, false);
      return;
    }

    // Explicit push-to-talk check
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {
        const errMsg = "MICROPHONE ACCESS DENIED: Please allow microphone access in your browser to speak.";
        if (window.starkApp) {
          window.starkApp.logTerminal("VOICE ALERT", errMsg);
          window.starkApp.showAlarmBanner(errMsg);
        }
        return;
      }
    }

    this.startListeningSafely();
    if (window.starkApp) window.starkApp.logTerminal("VOICE MIC", "PUSH-TO-TALK ACTIVE: Speak your command now...");
  }
}

// Global instance
window.starkSpeech = new StarkSpeechEngine();
