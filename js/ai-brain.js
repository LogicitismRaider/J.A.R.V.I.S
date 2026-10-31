/**
 * ============================================================================
 * STARK INDUSTRIES // J.A.R.V.I.S. ARTIFICIAL INTELLIGENCE CORE BRAIN
 * Natural Language Processing, Protocol Automation, Math Solver, Live Weather & Gemini Link
 * ============================================================================
 */

class StarkAiBrain {
  constructor() {
    this.geminiApiKey = localStorage.getItem('stark_gemini_key') || '';
    this.tasks = JSON.parse(localStorage.getItem('stark_tasks')) || [
      { id: 1, text: 'Calibrate Mark 85 nanotech flight stabilizers', priority: 'HIGH', done: false },
      { id: 2, text: 'Recharge Veronica orbital platform arc cells', priority: 'CRITICAL', done: false },
      { id: 3, text: 'Compile thermal telemetry from Malibu test flight', priority: 'ROUTINE', done: true }
    ];
  }

  setApiKey(key) {
    this.geminiApiKey = key.trim();
    localStorage.setItem('stark_gemini_key', this.geminiApiKey);
  }

  saveTasks() {
    localStorage.setItem('stark_tasks', JSON.stringify(this.tasks));
  }

  /**
   * Main entry point for user text or voice command
   */
  async processQuery(rawInput) {
    const input = rawInput.trim();
    if (!input) return null;

    const lower = input.toLowerCase();

    // 1. Check for Direct Stark Protocol Triggers
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

    // 2. Weather Inquiries
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast')) {
      return await this.fetchLiveWeather(input);
    }

    // 3. Time & Chrono
    if (lower.includes('time') || lower.includes('date') || lower.includes('clock')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return {
        speech: `The current time is ${timeStr}, Sir. Today is ${dateStr}.`,
        text: `STARK CHRONOMETER: ${timeStr} | ${dateStr} (Malibu / Stark Tower Synced)`
      };
    }

    // 4. Math & Calculations
    const mathMatch = lower.match(/(?:calculate|what is|compute|evaluate)\s+([0-9\+\-\*\/\^\(\)\.\s\%\bsqrt\b]+)/i);
    if (mathMatch && mathMatch[1]) {
      try {
        const expr = mathMatch[1].replace(/sqrt/g, 'Math.sqrt');
        // Safe evaluation of simple arithmetic only
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

    // 5. Task & Mission Log commands
    if (lower.startsWith('add task') || lower.startsWith('new task') || lower.startsWith('remind me to')) {
      const taskText = input.replace(/^(add task|new task|remind me to)\s*/i, '').trim();
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

    // 6. Conversational Lore & Easter Eggs
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

    // 7. If Gemini API Key is configured, use live LLM
    if (this.geminiApiKey) {
      try {
        const geminiRes = await this.queryGemini(input);
        if (geminiRes) return geminiRes;
      } catch (err) {
        console.warn("Gemini query failed, falling back to neural logic", err);
      }
    }

    // 8. Default Intelligent Fallback
    const genericResponses = [
      `Processing query regarding "${input}". Telemetry analysis indicates optimal operational parameters, Sir.`,
      `Acknowledged, Sir. All Stark systems are fully functional. Repulsor power at 100%, Arc Core output nominal.`,
      `Telemetry updated for "${input}". Shall I prepare the gantry or deploy a satellite reconnaissance drone, Sir?`,
      `Command registered: "${input}". Running background simulations on quantum sub-routines.`
    ];
    const picked = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    return {
      speech: picked,
      text: `J.A.R.V.I.S.: ${picked}`
    };
  }

  /**
   * Fetch Live Weather from Open-Meteo API
   */
  async fetchLiveWeather(input) {
    try {
      // Default to Malibu or New York if city not detected
      let lat = 34.0259;
      let lon = -118.7798;
      let cityName = "Malibu, CA";

      if (input.toLowerCase().includes('new york')) {
        lat = 40.7128; lon = -74.0060; cityName = "New York (Stark Tower)";
      } else if (input.toLowerCase().includes('tokyo')) {
        lat = 35.6762; lon = 139.6503; cityName = "Tokyo";
      } else if (input.toLowerCase().includes('london')) {
        lat = 51.5074; lon = -0.1278; cityName = "London";
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

    const systemInstruction = "You are J.A.R.V.I.S., Tony Stark's legendary AI assistant. Speak with refined British politeness, wit, supreme intelligence, and call the user 'Sir'. Keep answers crisp, highly functional, and under 3 sentences for tactical voice response.";

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
