/**
 * ============================================================================
 * STARK INDUSTRIES // SPEECH SYNTHESIS & RECOGNITION ENGINE
 * Natural voice synthesis with J.A.R.V.I.S. / F.R.I.D.A.Y. persona selection
 * ============================================================================
 */

class StarkSpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.currentPersonality = 'JARVIS'; // JARVIS | FRIDAY | EDITH

    // Voice preferences
    this.jarvisVoice = null;
    this.fridayVoice = null;
    this.edithVoice = null;

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

    const pickVoices = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // 1. Find JARVIS voice (Prefers UK English Male, Daniel, George, Arthur, or deep en-GB)
      this.jarvisVoice = voices.find(v => 
        (v.lang === 'en-GB' || v.lang.startsWith('en_GB')) && 
        (v.name.includes('Male') || v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('Arthur'))
      ) || voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));

      // 2. Find FRIDAY voice (Prefers Irish or sleek female en-IE / en-GB / en-US)
      this.fridayVoice = voices.find(v => 
        (v.lang === 'en-IE' || v.name.includes('Irish') || v.name.includes('Samantha') || v.name.includes('Female'))
      ) || voices.find(v => v.name.includes('Female')) || this.jarvisVoice;

      // 3. Find EDITH voice (Tactical, clear en-US)
      this.edithVoice = voices.find(v => 
        v.lang === 'en-US' && (v.name.includes('Zira') || v.name.includes('Victoria') || v.name.includes('Natural'))
      ) || this.fridayVoice;
    };

    pickVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = pickVoices;
    }
  }

  setPersonality(persona) {
    this.currentPersonality = persona.toUpperCase();
    if (window.starkAudio) {
      window.starkAudio.playBeep(persona === 'FRIDAY' ? 1800 : 1200);
    }
  }

  setSubtitleElement(element) {
    this.subtitleElem = element;
  }

  speak(text, priority = false) {
    if (!this.synth) {
      this.renderSubtitle(text);
      return;
    }

    if (priority) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Select Voice & Tone by Personality
    if (this.currentPersonality === 'JARVIS') {
      utterance.voice = this.jarvisVoice;
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // Slightly deeper, refined British tone
    } else if (this.currentPersonality === 'FRIDAY') {
      utterance.voice = this.fridayVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.1; // Crisp tactical female
    } else { // EDITH
      utterance.voice = this.edithVoice;
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    }

    utterance.onstart = () => {
      this.renderSubtitle(text);
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

  initRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (window.starkAudio) window.starkAudio.playBeep(1600, 'sine', 0.04);
      if (window.starkApp) window.starkApp.updateMicUI(true);
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          // Interim results preview in terminal
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
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (window.starkApp) window.starkApp.updateMicUI(false);
    };
  }

  toggleListening() {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser. You can type commands directly in the prompt below!");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        this.recognition.stop();
      }
    }
  }
}

// Global instance
window.starkSpeech = new StarkSpeechEngine();
