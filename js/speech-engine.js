/**
 * ============================================================================
 * STARK INDUSTRIES // ADVANCED SPEECH SYNTHESIS & RECOGNITION ENGINE
 * Natural Neural Voice Selection, Formant Tuning & Robust Speech Recognition
 * ============================================================================
 */

class StarkSpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.currentPersonality = localStorage.getItem('stark_personality') || 'JARVIS'; // JARVIS | FRIDAY | EDITH | CYBER_STARK | CUSTOM

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

      // Score and sort voices by naturalness & quality
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

      // Populate voice picker in settings UI
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

    // Natural / Neural online voices (Edge & Chrome natural voices sound 10x better than local SAPI5)
    if (name.includes('natural')) score += 60;
    if (name.includes('online')) score += 40;
    if (name.includes('neural')) score += 50;
    if (name.includes('google')) score += 35;
    if (name.includes('premium') || name.includes('enhanced')) score += 30;

    // English language bonus
    if (lang.startsWith('en')) score += 20;
    if (lang === 'en-gb' || lang.startsWith('en_gb')) score += 15; // British accent preference for JARVIS

    // Penalize legacy robotic Windows Desktop SAPI5 voices
    if (name.includes('desktop')) score -= 45;
    if (name.includes('david')) score -= 30;
    if (name.includes('microsoft mark')) score -= 30;

    return score;
  }

  populateVoicePicker() {
    const select = document.getElementById('voicePickerSelect');
    if (!select || !this.voices) return;

    const currentVal = this.selectedVoiceURI || (this.jarvisVoice ? this.jarvisVoice.voiceURI : '');
    
    // Sort for display: English first, then by natural score
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

    // Cancel active speech if priority
    if (priority || this.synth.speaking) {
      this.synth.cancel();
    }

    // Clean text of markdown asterisks/symbols for natural speech
    const cleanText = text
      .replace(/[\*\#\_\[\]\(\)\>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick active voice
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

    // Rate and pitch tuning for authentic, non-robotic warmth
    let rate = this.voiceRate;
    let pitch = this.voicePitch;

    if (this.currentPersonality === 'JARVIS') {
      rate = this.voiceRate * 0.98; // Slightly deliberate, calm British cadence
      pitch = this.voicePitch * 0.94; // Deeper, confident, warm tone
    } else if (this.currentPersonality === 'FRIDAY') {
      rate = this.voiceRate * 1.04;
      pitch = this.voicePitch * 1.08;
    }

    utterance.rate = Math.max(0.7, Math.min(1.4, rate));
    utterance.pitch = Math.max(0.6, Math.min(1.4, pitch));
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.renderSubtitle(cleanText);
      if (this.onSpeechStart) this.onSpeechStart();
    };

    utterance.onend = () => {
      if (this.onSpeechEnd) this.onSpeechEnd();
    };

    utterance.onerror = (e) => {
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
    if (this.onSpeechEnd) this.onSpeechEnd();
  }

  // ==========================================================================
  // SPEECH RECOGNITION (VOICE INPUT) WITH PERMISSION RECOVERY
  // ==========================================================================
  initRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Speech Recognition API is not supported in this browser engine.");
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (window.starkAudio) window.starkAudio.playBeep(1800, 'sine', 0.05);
        if (window.starkApp) {
          window.starkApp.updateMicUI(true);
          window.starkApp.logTerminal("VOICE MIC", "LISTENING ACTIVE: Speak your command now...");
        }
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            const interim = event.results[i][0].transcript;
            if (window.starkApp) {
              window.starkApp.setLiveInput(interim);
            }
          }
        }

        if (finalTranscript.trim()) {
          const cleaned = finalTranscript.trim();
          if (this.onCommandHeard) {
            this.onCommandHeard(cleaned);
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isListening = false;
        if (window.starkApp) window.starkApp.updateMicUI(false);

        let helpMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          helpMsg = "MICROPHONE PERMISSION BLOCKED: Please click the lock or camera icon in your browser address bar and grant Microphone permission.";
          if (window.starkApp) window.starkApp.showAlarmBanner("Microphone blocked. Click the lock icon in address bar to allow.");
        } else if (event.error === 'no-speech') {
          helpMsg = "No speech detected before timeout. Click the mic button again and speak clearly.";
        } else if (event.error === 'network') {
          helpMsg = "Speech recognition network timeout. Ensure internet connectivity for Chromium speech engine, or type directly in the prompt.";
        }

        if (window.starkApp) {
          window.starkApp.logTerminal("VOICE ALERT", helpMsg);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (window.starkApp) window.starkApp.updateMicUI(false);
      };
    } catch (err) {
      console.warn("Could not instantiate SpeechRecognition", err);
    }
  }

  async toggleListening() {
    // 1. Check if browser supports SpeechRecognition
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec || !this.recognition) {
      const msg = "Speech recognition is supported natively in Google Chrome and Microsoft Edge. You can also type any command or question directly into the prompt below!";
      if (window.starkApp) {
        window.starkApp.logTerminal("VOICE ALERT", msg);
        window.starkApp.showAlarmBanner(msg);
      } else {
        alert(msg);
      }
      return;
    }

    // 2. If already listening, stop
    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.isListening = false;
      if (window.starkApp) window.starkApp.updateMicUI(false);
      return;
    }

    // 3. Request Microphone permission explicitly via getUserMedia first if needed
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Quick permission check / prompt
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close test tracks immediately
        stream.getTracks().forEach(track => track.stop());
      } catch (micErr) {
        console.warn("Microphone access denied via getUserMedia:", micErr);
        const errMsg = "MICROPHONE ACCESS DENIED: Please allow microphone access in your browser to speak commands.";
        if (window.starkApp) {
          window.starkApp.logTerminal("VOICE ALERT", errMsg);
          window.starkApp.showAlarmBanner(errMsg);
        }
        return;
      }
    }

    // 4. Start recognition safely
    try {
      this.recognition.start();
    } catch (startErr) {
      console.warn("Recognition start failed, restarting instance:", startErr);
      try {
        this.recognition.stop();
        setTimeout(() => this.recognition.start(), 200);
      } catch (e) {
        this.isListening = false;
      }
    }
  }
}

// Global instance
window.starkSpeech = new StarkSpeechEngine();
