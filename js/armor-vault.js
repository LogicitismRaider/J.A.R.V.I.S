/**
 * ============================================================================
 * STARK INDUSTRIES // HALL OF ARMOR & HOUSE PARTY PROTOCOL
 * Comprehensive Iron Man Suit Database, Telemetry & Deployment Routines
 * ============================================================================
 */

const STARK_SUITS_DATABASE = [
  {
    id: 'MK-1',
    name: 'MARK I',
    codename: 'THE PROTOTYPE',
    role: 'Tactical Escape Chassis',
    power: 28,
    integrity: 45,
    speed: 'Mach 0.3',
    weapons: ['Dual Flamer Systems', 'Manual Missile Launch Tube', 'Pneumatic Exoskeleton'],
    description: 'Forged from missile casings in Afghanistan. Manually fired crude miniature arc reactor.',
    color: '#8b9bb4'
  },
  {
    id: 'MK-3',
    name: 'MARK III',
    codename: 'HOT-ROD RED',
    role: 'Combat Superiority',
    power: 74,
    integrity: 82,
    speed: 'Mach 2.8',
    weapons: ['Forearm Micro-Guns', 'Twin Repulsors', 'Unibeam Chest Emitter', 'Flare Countermeasures'],
    description: 'First titanium-gold alloy armor with integrated Jarvis telemetry and repulsor flight stabilizers.',
    color: '#e62429'
  },
  {
    id: 'MK-5',
    name: 'MARK V',
    codename: 'THE FOOTBALL',
    role: 'Emergency Rapid Deployment',
    power: 58,
    integrity: 60,
    speed: 'Mach 1.2',
    weapons: ['Pulse Repulsors', 'Compact Unibeam'],
    description: 'Collapsible briefcase suit engineered for rapid emergency deployment without gantry.',
    color: '#c0c0c0'
  },
  {
    id: 'MK-7',
    name: 'MARK VII',
    codename: 'THE AVENGERS',
    role: 'Heavy Infiltration & War',
    power: 85,
    integrity: 90,
    speed: 'Mach 3.5',
    weapons: ['Shoulder Triple-Missile Pods', 'Laser Cutting Cartridges', 'High-Output Chest Unibeam'],
    description: 'Pod-deployed mid-air laser-guided latching suit utilized in the Defense of New York.',
    color: '#e62429'
  },
  {
    id: 'MK-42',
    name: 'MARK XLII',
    codename: 'THE PRODIGAL SON',
    role: 'Autonomous Prehensile',
    power: 88,
    integrity: 84,
    speed: 'Mach 3.2',
    weapons: ['Omni-Directional Repulsors', 'Target Tracking Micro-Darts'],
    description: 'Subdermal micro-repeater chips enable individual armor pieces to fly and assemble onto Tony autonomously.',
    color: '#ffb800'
  },
  {
    id: 'MK-44',
    name: 'MARK XLIV',
    codename: 'VERONICA / HULKBUSTER',
    role: 'Titan Suppression Frame',
    power: 98,
    integrity: 99,
    speed: 'Mach 1.5',
    weapons: ['Pneumatic Jackhammer Fist', 'Electrified Capture Cage', 'Orbital Repair Pods', 'Quad Arc Cores'],
    description: 'Heavy modular containment frame deployed from low-earth orbit satellite Veronica.',
    color: '#ff9900'
  },
  {
    id: 'MK-50',
    name: 'MARK L',
    codename: 'BLEEDING EDGE',
    role: 'Nanotech Synthesis',
    power: 96,
    integrity: 94,
    speed: 'Mach 8.0',
    weapons: ['Nanotech Cannons', 'Energy Blades', 'Battering Rams', 'Zero-G Wing Boosters'],
    description: 'Millions of nanites stored in an RT chest housing that rearrange into any offensive or defensive tool on command.',
    color: '#ff2a5f'
  },
  {
    id: 'MK-85',
    name: 'MARK LXXXV',
    codename: 'ENDGAME APEX',
    role: 'Ultimate Nanotech Apex',
    power: 100,
    integrity: 98,
    speed: 'Mach 10+',
    weapons: ['Lightning Refocuser', 'Nano-Shield Energy Deflector', 'Vibranium Nanoweave', 'Infinity Matrix'],
    description: 'The pinnacle of Stark engineering. Combines Mark 50 nanotech with classic Mark 3 muscle and Vibranium weave.',
    color: '#00f0ff'
  }
];

class StarkArmorVault {
  constructor() {
    this.suits = STARK_SUITS_DATABASE;
    this.activeSuit = this.suits[7]; // Default to Mark 85
    this.container = null;
  }

  renderVaultCards(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.innerHTML = this.suits.map(suit => `
      <div class="suit-card ${suit.id === this.activeSuit.id ? 'is-active-suit' : ''}" data-suit-id="${suit.id}">
        <div class="suit-header">
          <div class="suit-name">${suit.name}</div>
          <div class="suit-codename">${suit.codename}</div>
        </div>
        <div class="suit-specs">
          <div><strong style="color:var(--accent-color)">Role:</strong> ${suit.role}</div>
          <div><strong style="color:var(--arc-gold)">Speed:</strong> ${suit.speed}</div>
          <div><strong style="color:var(--stark-green)">Power Output:</strong> ${suit.power}%</div>
          <div><strong style="color:var(--stark-red)">Armor Integrity:</strong> ${suit.integrity}%</div>
        </div>
        <p style="font-size:11px; color:rgba(224,247,252,0.6); margin-top:4px;">${suit.description}</p>
        <div style="margin-top:auto; padding-top:8px;">
          <button class="stark-btn btn-accent deploy-suit-btn" style="width:100%" data-suit-id="${suit.id}">
            ${suit.id === this.activeSuit.id ? 'CURRENTLY ACTIVE' : 'DEPLOY PROTOCOL'}
          </button>
        </div>
      </div>
    `).join('');

    // Attach listeners
    this.container.querySelectorAll('.deploy-suit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-suit-id');
        this.deploySuit(id);
      });
    });
  }

  deploySuit(suitId) {
    const suit = this.suits.find(s => s.id === suitId);
    if (!suit) return;

    this.activeSuit = suit;

    // Play sounds
    if (window.starkAudio) {
      window.starkAudio.playProtocolDeploy();
      setTimeout(() => window.starkAudio.playRepulsorBlast(), 400);
    }

    // Announce via speech
    if (window.starkSpeech) {
      window.starkSpeech.speak(`Deploying ${suit.name}, ${suit.codename}. Subsystems online and calibrated, Sir.`);
    }

    // Update active HUD elements
    if (window.starkApp) {
      window.starkApp.onSuitDeployed(suit);
    }

    // Re-render cards if modal is open
    if (this.container) {
      this.renderVaultCards(this.container.id);
    }
  }
}

// Global instance
window.starkArmorVault = new StarkArmorVault();
