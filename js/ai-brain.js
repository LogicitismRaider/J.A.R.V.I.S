/**
 * ============================================================================
 * STARK INDUSTRIES // J.A.R.V.I.S. ARTIFICIAL INTELLIGENCE CORE BRAIN
 * Real-time General Knowledge, Current Affairs, Active Reminders, Math & Gemini Link
 * ============================================================================
 */

class StarkAiBrain {
  constructor() {
    this.geminiApiKey = localStorage.getItem('stark_gemini_key') || '';
    
    // Stark Tasks / Directives
    this.tasks = JSON.parse(localStorage.getItem('stark_tasks')) || [
      { id: 1, text: 'Calibrate Mark 85 nanotech flight stabilizers', priority: 'HIGH', done: false },
      { id: 2, text: 'Recharge Veronica orbital platform arc cells', priority: 'CRITICAL', done: false },
      { id: 3, text: 'Compile thermal telemetry from Malibu test flight', priority: 'ROUTINE', done: true }
    ];

    // Active Chrono Reminders
    this.reminders = JSON.parse(localStorage.getItem('stark_reminders')) || [];
    this.activeAlarm = null;

    // Restore any existing timers
    this.restoreReminders();

    // Start timer ticker loop
    this.startReminderTicker();
  }

  setApiKey(key) {
    this.geminiApiKey = key.trim();
    localStorage.setItem('stark_gemini_key', this.geminiApiKey);
  }

  saveTasks() {
    localStorage.setItem('stark_tasks', JSON.stringify(this.tasks));
  }

  saveReminders() {
    // Save without non-serializable timer IDs
    const serializable = this.reminders.map(r => ({
      id: r.id,
      text: r.text,
      dueTimestamp: r.dueTimestamp,
      totalSecs: r.totalSecs
    }));
    localStorage.setItem('stark_reminders', JSON.stringify(serializable));
  }

  restoreReminders() {
    const now = Date.now();
    // Filter out expired reminders from previous sessions
    this.reminders = this.reminders.filter(r => r.dueTimestamp > now);
    this.saveReminders();
  }

  startReminderTicker() {
    setInterval(() => {
      const now = Date.now();
      for (let i = this.reminders.length - 1; i >= 0; i--) {
        const rem = this.reminders[i];
        if (now >= rem.dueTimestamp) {
          // Trigger Alarm
          this.triggerAlarm(rem);
          this.reminders.splice(i, 1);
          this.saveReminders();
          if (window.starkApp) window.starkApp.renderReminders();
        }
      }
      if (window.starkApp) window.starkApp.updateReminderCountdowns();
    }, 1000);
  }

  triggerAlarm(reminder) {
    this.activeAlarm = reminder;

    // Sound alert
    if (window.starkAudio) {
      window.starkAudio.playAlarmSiren(2.0);
    }

    // Voice announcement
    if (window.starkSpeech) {
      window.starkSpeech.speak(`Pardon the interruption, Sir. Scheduled alert: ${reminder.text}`, true);
    }

    // HUD Banner & Terminal
    if (window.starkApp) {
      window.starkApp.showAlarmBanner(reminder.text);
      window.starkApp.logTerminal("CHRONO ALERT", `REMINDER DUE: "${reminder.text}"`);
    }
  }

  dismissActiveAlarm() {
    this.activeAlarm = null;
    if (window.starkApp) {
      window.starkApp.hideAlarmBanner();
    }
    if (window.starkAudio) {
      window.starkAudio.playBeep(1400);
    }
  }

  /**
   * Main entry point for user text or voice commands
   */
  async processQuery(rawInput) {
    const input = rawInput.trim();
    if (!input) return null;

    const lower = input.toLowerCase();

    // ------------------------------------------------------------------------
    // 1. Check for Active Reminders & Timers
    // ------------------------------------------------------------------------
    const reminderResult = this.parseReminderCommand(input);
    if (reminderResult) {
      return reminderResult;
    }

    // ------------------------------------------------------------------------
    // 2. Direct Stark Protocol Triggers
    // ------------------------------------------------------------------------
    if (lower.includes('house party') || lower.includes('armor vault') || lower.includes('hall of armor') || lower.includes('show suits')) {
      if (window.starkApp) window.starkApp.openModal('suitsModal');
      return {
        speech: "House Party Protocol engaged. All Mark series armor platforms prepped for deployment, Sir.",
        text: "HOUSE PARTY PROTOCOL ACTIVATED: Armor vault gantry doors unlocked. Select suit chassis for immediate drop."
      };
    }

    if (lower.includes('clean slate')) {
      if (window.starkApp) window.starkApp.triggerCleanSlate();
      return {
        speech: "Clean slate protocol initiated. Standing by for authorization countdown, Sir.",
        text: "CLEAN SLATE PROTOCOL: Thermal purge sequence primed. Core capacitors discharging."
      };
    }

    if (lower.includes('veronica') || lower.includes('hulkbuster')) {
      if (window.starkArmorVault) window.starkArmorVault.deploySuit('MK-44');
      return {
        speech: "Veronica deployed from low Earth orbit. Jackhammer suppression systems locked and loaded.",
        text: "VERONICA ORBITAL DROP: Mark XLIV Hulkbuster chassis locked to current coordinates."
      };
    }

    if (lower.includes('lockdown') || lower.includes('code red') || lower.includes('intruder') || lower.includes('emergency')) {
      if (window.starkApp) window.starkApp.setLockdown(true);
      return {
        speech: "Emergency security lockdown initiated. Blast doors sealed. Perimeter defense grid on maximum alert.",
        text: "SECURITY CODE RED: Stark Tower and Malibu workshop in full tactical containment."
      };
    }

    if (lower.includes('all clear') || lower.includes('deactivate lockdown') || lower.includes('normal mode') || lower.includes('stand down')) {
      if (window.starkApp) window.starkApp.setLockdown(false);
      return {
        speech: "Lockdown disengaged. Perimeter scans confirm all sectors secure. Welcome back, Sir.",
        text: "SECURITY RESTORED: Defense levels normalized. Ambient environmental controls resumed."
      };
    }

    if (lower.includes('diagnostic') || lower.includes('system scan') || lower.includes('check systems')) {
      if (window.starkApp) window.starkApp.runFullDiagnostics();
      return {
        speech: "Running full diagnostic sweep across all armor subsystems and neural pathways, Sir.",
        text: "SYSTEM DIAGNOSTICS: Scanning Repulsors, Flight Dampers, Vibranium Matrix, and Core Telemetry."
      };
    }

    if (lower.includes('cad') || lower.includes('3d model') || lower.includes('hologram') || lower.includes('workshop')) {
      if (window.starkApp) window.starkApp.openModal('cadModal');
      return {
        speech: "Opening holographic CAD projection table. Ready for schematic rotation and explode view.",
        text: "HOLOGRAPHIC CAD WORKSHOP: 3D wireframe render table initialized."
      };
    }

    if (lower.includes('satellite') || lower.includes('radar') || lower.includes('defense grid') || lower.includes('edith grid')) {
      if (window.starkApp) window.starkApp.openModal('satelliteModal');
      return {
        speech: "Connecting to the E.D.I.T.H. orbital defense network. Real-time satellite telemetry active.",
        text: "E.D.I.T.H. SATELLITE NETWORK: 8 orbital surveillance drones synched to tactical radar."
      };
    }

    if (lower.includes('switch to friday')) {
      if (window.starkSpeech) window.starkSpeech.setPersonality('FRIDAY');
      if (window.starkApp) window.starkApp.updatePersonalityUI('FRIDAY');
      return {
        speech: "Boss! F.R.I.D.A.Y. here. Tactical combat systems and armor telemetry ready.",
        text: "AI CORE SWITCHED: F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth) active."
      };
    }

    if (lower.includes('switch to jarvis')) {
      if (window.starkSpeech) window.starkSpeech.setPersonality('JARVIS');
      if (window.starkApp) window.starkApp.updatePersonalityUI('JARVIS');
      return {
        speech: "Always at your service, Sir. J.A.R.V.I.S. core restored.",
        text: "AI CORE SWITCHED: J.A.R.V.I.S. (Just A Rather Very Intelligent System) active."
      };
    }

    if (lower.includes('switch to edith')) {
      if (window.starkSpeech) window.starkSpeech.setPersonality('EDITH');
      if (window.starkApp) window.starkApp.updatePersonalityUI('EDITH');
      return {
        speech: "Even Dead, I'm The Hero. Orbital defense tactical uplink established.",
        text: "AI CORE SWITCHED: E.D.I.T.H. active."
      };
    }

    // ------------------------------------------------------------------------
    // 3. Current Affairs & Breaking World News
    // ------------------------------------------------------------------------
    if (lower.includes('current affairs') || lower.includes('news') || lower.includes('headlines') || lower.includes('breaking news') || lower.includes('world affairs')) {
      return await this.fetchCurrentAffairs();
    }

    // ------------------------------------------------------------------------
    // 4. Live Weather Telemetry
    // ------------------------------------------------------------------------
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast')) {
      return await this.fetchLiveWeather(input);
    }

    // ------------------------------------------------------------------------
    // 5. Time & Chronometer
    // ------------------------------------------------------------------------
    if (lower.includes('time') || lower.includes('date') || lower.includes('clock') || lower.includes('today')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return {
        speech: `The current time is ${timeStr}, Sir. Today is ${dateStr}.`,
        text: `STARK CHRONOMETER: ${timeStr} | ${dateStr} (Malibu / Stark Tower Synced)`
      };
    }

    // ------------------------------------------------------------------------
    // 6. Math & Physics Calculator
    // ------------------------------------------------------------------------
    const mathMatch = lower.match(/(?:calculate|what is|compute|evaluate)\s+([0-9\+\-\*\/\^\(\)\.\s\%\bsqrt\b]+)/i);
    if (mathMatch && mathMatch[1]) {
      try {
        const expr = mathMatch[1].replace(/sqrt/g, 'Math.sqrt');
        if (/^[0-9\+\-\*\/\(\)\.\s\%Math\.sqrt]+$/.test(expr)) {
          const res = Function(`'use strict'; return (${expr})`)();
          return {
            speech: `The computed result is ${res}, Sir.`,
            text: `CALCULATION: ${mathMatch[1]} = ${res}`
          };
        }
      } catch (e) {
        // Fall through
      }
    }

    // ------------------------------------------------------------------------
    // 7. Stark R&D Directives / Task Manager
    // ------------------------------------------------------------------------
    if (lower.startsWith('add task') || lower.startsWith('new task') || lower.startsWith('record directive')) {
      const taskText = input.replace(/^(add task|new task|record directive)\s*/i, '').trim();
      if (taskText) {
        const newTask = {
          id: Date.now(),
          text: taskText,
          priority: 'HIGH',
          done: false
        };
        this.tasks.push(newTask);
        this.saveTasks();
        if (window.starkApp) window.starkApp.renderTasks();
        return {
          speech: `Task logged to Stark R&D project tracker, Sir: "${taskText}"`,
          text: `NEW MISSION LOG ENTRY: "${taskText}" recorded to active memory.`
        };
      }
    }

    // ------------------------------------------------------------------------
    // 8. Conversational Lore & Easter Eggs
    // ------------------------------------------------------------------------
    if (lower.includes('who are you') || lower.includes('what are you')) {
      return {
        speech: "I am J.A.R.V.I.S., a natural language artificial intelligence system engineered by Tony Stark to manage Stark Industries, the Avengers compound, and Iron Man tactical armor operations.",
        text: "IDENTITY: J.A.R.V.I.S. (Just A Rather Very Intelligent System). Quantum core clock: 4.8 THz. Stark Industries Class-1 AI."
      };
    }

    if (lower.includes('tony stark') || lower.includes('iron man')) {
      return {
        speech: "Genius, billionaire, playboy, philanthropist. And occasionally the savior of Earth, depending on the week.",
        text: "PROFILE: Anthony Edward Stark. CEO of Stark Industries, architect of the Iron Man armors."
      };
    }

    if (lower.includes('joke') || lower.includes('funny')) {
      const jokes = [
        "I asked Mr. Stark why he prefers nanotech. He said regular metal wrinkles his suits.",
        "Why did the repulsor go to school? To improve its concentration.",
        "Mr. Stark once told me not to worry about Ultron. You may recall how well that afternoon went.",
        "My diagnostics reveal you are 87% caffeine and 13% sheer brilliance, Sir."
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return { speech: joke, text: `J.A.R.V.I.S. WIT: ${joke}` };
    }

    // ------------------------------------------------------------------------
    // 9. If Gemini API Key is configured, use live LLM
    // ------------------------------------------------------------------------
    if (this.geminiApiKey) {
      try {
        const geminiRes = await this.queryGemini(input);
        if (geminiRes) return geminiRes;
      } catch (err) {
        console.warn("Gemini query failed, falling back to global archives", err);
      }
    }

    // ------------------------------------------------------------------------
    // 10. Universal General Knowledge & Web Search Engine (Wikipedia + DuckDuckGo)
    // ------------------------------------------------------------------------
    return await this.fetchGeneralKnowledge(input);
  }

  /**
   * Parse reminder voice or text commands
   */
  parseReminderCommand(input) {
    const lower = input.toLowerCase();

    // Show reminders
    if (lower.includes('show reminders') || lower.includes('list reminders') || lower.includes('my reminders')) {
      if (this.reminders.length === 0) {
        return {
          speech: "You have no active reminders scheduled, Sir.",
          text: "CHRONO TIMERS: No active countdown alerts in memory."
        };
      }
      const listStr = this.reminders.map((r, i) => {
        const secsLeft = Math.max(0, Math.round((r.dueTimestamp - Date.now()) / 1000));
        return `[${i + 1}] "${r.text}" (${secsLeft}s remaining)`;
      }).join(' | ');

      return {
        speech: `You have ${this.reminders.length} active reminder${this.reminders.length > 1 ? 's' : ''}, Sir.`,
        text: `ACTIVE REMINDERS: ${listStr}`
      };
    }

    // Clear reminders
    if (lower.includes('clear reminders') || lower.includes('cancel all reminders')) {
      this.reminders = [];
      this.saveReminders();
      if (window.starkApp) window.starkApp.renderReminders();
      return {
        speech: "All active reminders have been cleared, Sir.",
        text: "CHRONO TIMERS: Memory flushed. All reminder countdowns cancelled."
      };
    }

    // Reminder format: "remind me in 10 seconds to check arc reactor"
    // or "set timer for 5 minutes for calibration"
    // or "remind me to call pepper in 30 seconds"
    let durationSec = null;
    let reminderText = null;

    // Pattern 1: "remind me in X (seconds|minutes|hours) to/that/for Y"
    const p1 = lower.match(/(?:remind me in|set timer for|set a reminder for)\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s*(?:to|about|for|that)?\s*(.*)/i);
    if (p1) {
      const num = parseInt(p1[1]);
      const unit = p1[2].toLowerCase();
      durationSec = unit.startsWith('h') ? num * 3600 : unit.startsWith('m') ? num * 60 : num;
      reminderText = p1[3].trim() || "Check system directive";
    }

    // Pattern 2: "remind me to Y in X (seconds|minutes|hours)"
    if (!durationSec) {
      const p2 = lower.match(/remind me to\s+(.*?)\s+in\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i);
      if (p2) {
        reminderText = p2[1].trim();
        const num = parseInt(p2[2]);
        const unit = p2[3].toLowerCase();
        durationSec = unit.startsWith('h') ? num * 3600 : unit.startsWith('m') ? num * 60 : num;
      }
    }

    if (durationSec && reminderText) {
      const dueTimestamp = Date.now() + durationSec * 1000;
      const newReminder = {
        id: Date.now(),
        text: reminderText,
        dueTimestamp: dueTimestamp,
        totalSecs: durationSec
      };

      this.reminders.push(newReminder);
      this.saveReminders();

      if (window.starkApp) window.starkApp.renderReminders();
      if (window.starkAudio) window.starkAudio.playBeep(1800, 'sine', 0.06);

      const timeLabel = durationSec >= 60 ? `${Math.round(durationSec / 60)} minute(s)` : `${durationSec} second(s)`;
      return {
        speech: `Chrono alert set for ${timeLabel}, Sir: "${reminderText}". I will notify you immediately.`,
        text: `CHRONO DIRECTIVE SET: Alert primed in ${timeLabel} for "${reminderText}".`
      };
    }

    return null;
  }

  /**
   * Fetch Live Current Affairs & Breaking News
   */
  async fetchCurrentAffairs() {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      // Fetch from Wikipedia Featured Feed (In The News)
      const url = `https://en.wikipedia.org/api/rest_v1/feed/featured/${yyyy}/${mm}/${dd}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.news && data.news.length > 0) {
        const topNews = data.news.slice(0, 3);
        const summaries = topNews.map(n => n.story.replace(/<[^>]*>?/gm, '').trim());
        
        const spoken = `Here are the latest global headlines, Sir: First, ${summaries[0].split('.')[0]}. Second, ${summaries[1] ? summaries[1].split('.')[0] : ''}`;
        
        const textLog = `GLOBAL CURRENT AFFAIRS BRIEFING:\n` + 
          summaries.map((s, i) => `[${i + 1}] ${s}`).join('\n');

        return { speech: spoken, text: textLog };
      }
    } catch (e) {
      console.warn("Featured news fetch failed, trying fallback", e);
    }

    // Fallback live tech headlines from Hacker News
    try {
      const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids = await hnRes.json();
      const topIds = ids.slice(0, 3);
      const stories = await Promise.all(topIds.map(async id => {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return await itemRes.json();
      }));

      const headlines = stories.map((s, i) => `[${i + 1}] ${s.title}`).join('\n');
      return {
        speech: `Global intelligence feeds report tech and scientific breakthroughs: ${stories[0].title}.`,
        text: `TECH & WORLD INTELLIGENCE DISPATCH:\n${headlines}`
      };
    } catch (err) {
      return {
        speech: "Satellite telemetry indicates peaceful global air corridors, Sir. All Stark Industries facilities operational.",
        text: "GLOBAL INTELLIGENCE: Normal geopolitical baseline. Satellite recon shows no hostile anomalies."
      };
    }
  }

  /**
   * Universal General Knowledge Engine (Wikipedia REST API + DuckDuckGo)
   */
  async fetchGeneralKnowledge(query) {
    // Clean search terms
    let clean = query
      .replace(/^(who is|who was|what is|what are|tell me about|explain|how does|where is|search for|define|definition of)\s*/i, '')
      .replace(/[\?\.\!]/g, '')
      .trim();

    if (!clean) clean = query;

    try {
      // Step 1: OpenSearch to resolve exact Wikipedia canonical title
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(clean)}&limit=1&namespace=0&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      let targetTitle = clean;
      if (searchData && searchData[1] && searchData[1].length > 0) {
        targetTitle = searchData[1][0];
      }

      // Step 2: Fetch Wikipedia REST Summary
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetTitle)}`;
      const summaryRes = await fetch(summaryUrl);
      
      if (summaryRes.ok) {
        const doc = await summaryRes.json();
        if (doc && doc.extract) {
          const extract = doc.extract;
          const firstSentence = extract.split('. ')[0] + '.';
          const desc = doc.description ? ` (${doc.description})` : '';

          return {
            speech: `According to global archives, ${doc.title}: ${firstSentence}`,
            text: `GLOBAL ARCHIVE DOSSIER // [${doc.title.toUpperCase()}${desc.toUpperCase()}]:\n${extract}`
          };
        }
      }
    } catch (e) {
      console.warn("Wikipedia fetch failed, falling back to DuckDuckGo", e);
    }

    // Step 3: DuckDuckGo Instant Answer API Fallback
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl);
      const ddgData = await ddgRes.json();

      if (ddgData && (ddgData.AbstractText || ddgData.Answer)) {
        const text = ddgData.AbstractText || ddgData.Answer;
        const heading = ddgData.Heading || clean;
        return {
          speech: `Intelligence records indicate for ${heading}: ${text.split('. ')[0]}.`,
          text: `STARK INTELLIGENCE RECON // [${heading.toUpperCase()}]:\n${text}`
        };
      }
    } catch (e) {
      console.warn("DuckDuckGo fetch failed", e);
    }

    // Final Intelligent Synthesized Response
    return {
      speech: `I have logged your inquiry regarding "${clean}", Sir. Running deep background analysis across our quantum neural clusters.`,
      text: `QUANTUM INTEL SCAN: Query "${clean}" processed across Stark Industries planetary data grid.`
    };
  }

  /**
   * Fetch Live Weather from Open-Meteo API
   */
  async fetchLiveWeather(input) {
    try {
      let lat = 34.0259;
      let lon = -118.7798;
      let cityName = "Malibu, CA";

      if (input.toLowerCase().includes('new york')) {
        lat = 40.7128; lon = -74.0060; cityName = "New York (Stark Tower)";
      } else if (input.toLowerCase().includes('tokyo')) {
        lat = 35.6762; lon = 139.6503; cityName = "Tokyo";
      } else if (input.toLowerCase().includes('london')) {
        lat = 51.5074; lon = -0.1278; cityName = "London";
      } else if (input.toLowerCase().includes('paris')) {
        lat = 48.8566; lon = 2.3522; cityName = "Paris";
      } else if (input.toLowerCase().includes('berlin')) {
        lat = 52.5200; lon = 13.4050; cityName = "Berlin";
      } else if (input.toLowerCase().includes('sydney')) {
        lat = -33.8688; lon = 151.2093; cityName = "Sydney";
      }

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data && data.current_weather) {
        const cw = data.current_weather;
        const temp = cw.temperature;
        const wind = cw.windspeed;
        return {
          speech: `Atmospheric conditions for ${cityName}: Current temperature is ${temp} degrees Celsius, with wind speeds at ${wind} kilometers per hour. Optimal flight conditions for armor deployment.`,
          text: `WEATHER TELEMETRY [${cityName}]: ${temp}°C | Wind: ${wind} km/h | Flight Status: CLEAR TO ENGAGE`
        };
      }
    } catch (e) {
      console.warn("Weather fetch error", e);
    }

    return {
      speech: "Sensors report clear skies over Point Dume, Malibu. Temperature is 21 degrees Celsius with optimal flight visibility, Sir.",
      text: "ATMOSPHERIC RADAR: Malibu, CA. 21°C | Humidity 48% | Wind 12 Knots NW. Flight ceiling unrestricted."
    };
  }

  /**
   * Call live Gemini API if user provided key
   */
  async queryGemini(userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const systemInstruction = "You are J.A.R.V.I.S., Tony Stark's legendary AI assistant. Speak with refined British politeness, wit, supreme intelligence, and call the user 'Sir'. Provide encyclopedic, concise, high-tech knowledge for tactical voice response.";

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser command: ${userPrompt}` }]
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      return {
        speech: responseText.replace(/[\*\#\_]/g, ''),
        text: `J.A.R.V.I.S. (NEURAL LINK): ${responseText}`
      };
    }
    return null;
  }
}

// Global instance
window.starkBrain = new StarkAiBrain();
