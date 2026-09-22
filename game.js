(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const W = canvas.width;
  const H = canvas.height;
  const storeKey = "dodgeballWarsSaveV2";
  const ROUND_TARGET = 5;
  const FRIENDLY_COLOR = "#f29a38";
  const ENEMY_COLOR = "#e35b52";

  const families = [
    ["Blaze", "#ff5a4f", ["Flare Dash", "Meteor Shot", "Heat Ring"], "burn"],
    ["Tide", "#23a7ff", ["Wave Surf", "Bubble Prison", "Riptide Pull"], "bubble"],
    ["Stone", "#d7a447", ["Granite Brace", "Quake Slam", "Boulder Wall"], "quake"],
    ["Volt", "#ffd12f", ["Blink Zap", "Chain Throw", "Static Storm"], "chain"],
    ["Frost", "#68dcff", ["Ice Slide", "Freeze Ball", "Shard Nova"], "freeze"],
    ["Gale", "#70df69", ["Tailwind", "Curve Ball", "Cyclone Zone"], "curve"],
    ["Shadow", "#9b6dff", ["Shadow Step", "Void Mark", "Night Clone"], "void"],
    ["Solar", "#ff9b2f", ["Sun Sprint", "Nova Shot", "Radiant Heal"], "heal"],
    ["Lunar", "#8ea6ff", ["Moon Drift", "Orbit Ball", "Gravity Well"], "orbit"],
    ["Vine", "#25ca85", ["Root Leap", "Thorn Shot", "Bloom Field"], "root"],
    ["Venom", "#9bd63b", ["Toxic Dive", "Venom Ball", "Plague Cloud"], "poison"],
    ["Metal", "#9ec2d8", ["Magnet Rush", "Anvil Ball", "Chrome Shell"], "metal"],
    ["Plasma", "#ff69c8", ["Phase Step", "Ion Burst", "Pulse Overload"], "plasma"]
  ];
  const suffixes = ["Spark", "Fang", "Crown", "Nova", "Pulse", "Rune", "Vortex", "Comet", "Aegis", "Blade", "Echo", "Drift", "Core", "Flare", "Crest", "Surge", "Bloom", "Prism", "Quake", "Final"];
  const modes = [
    ["King of the Hill", "Hold the center ring for bonus XP.", "koth"],
    ["Capture the Flag", "Grab the enemy flag for a coin burst.", "ctf"],
    ["Free For All", "Every player for themselves.", "ffa"],
    ["Team Deathmatch", "Allied NPCs fight by your side.", "tdm"],
    ["1v1", "One skilled rival.", "1v1"],
    ["2v2", "Two teams of two.", "2v2"],
    ["3v3", "Two teams of three.", "3v3"]
  ];
  const mapThemes = [
    ["Skyline", "#1677ff", "#ff3d57", "rooftop"],
    ["Crystal", "#7b4dff", "#28d8ff", "crystal"],
    ["Volcano", "#ff3d57", "#ff8a22", "lava"],
    ["Garden", "#12c985", "#ffd447", "garden"],
    ["Neon Court", "#1677ff", "#12c985", "court"],
    ["Candy Blocks", "#ff4fb3", "#ffd447", "blocks"],
    ["Aqua Deck", "#00a8ff", "#41f2d0", "water"],
    ["Royal Rush", "#7b4dff", "#ffd447", "royal"],
    ["Training Grid", "#14213d", "#1677ff", "grid"],
    ["Sunset Plaza", "#ff8a22", "#ff4fb3", "plaza"],
    ["Toxic Lab", "#12c985", "#7b4dff", "lab"],
    ["Snow Base", "#68dcff", "#8ea6ff", "snow"]
  ];
  const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Invincible"];
  const damageProfiles = {
    burn: { direct: 1.18, burn: 4.2, slow: .7 },
    poison: { direct: .62, poison: 7.5 },
    bubble: { direct: .88, slow: 2.7 },
    freeze: { direct: .9, slow: 3.2 },
    quake: { direct: 1.28, knockback: 1.45 },
    chain: { direct: .92, stun: .48 },
    curve: { direct: 1.02, knockback: 1.1 },
    void: { direct: .82, mark: 5 },
    heal: { direct: 1.04 },
    orbit: { direct: .98, slow: 1.2 },
    root: { direct: .84, root: 1.4 },
    metal: { direct: 1.34, knockback: .55 },
    plasma: { direct: 1.14, shieldBreak: 1.25 },
    omni: { direct: 1.3, burn: 3, slow: 1.5, mark: 3 }
  };
  const ballTypes = [
    { id: "auto", name: "Automatic", damage: .48, delay: .14, speed: 670, life: 3.1, radius: 8, stamina: 3, automatic: true, charge: false, role: "Rapid pressure", detail: "Hold fire for a stream of low-damage throws." },
    { id: "semi", name: "Semi-Auto", damage: 1, delay: .4, speed: 610, life: 3.4, radius: 11, stamina: 7, automatic: false, charge: false, role: "Balanced precision", detail: "One accurate throw for every click." },
    { id: "one", name: "One Shot", damage: 2.5, delay: 1.2, speed: 760, life: 4, radius: 16, stamina: 18, automatic: false, charge: true, role: "Heavy finisher", detail: "Hold right mouse to charge, then left click to fire." }
  ];
  const ballSkins = [
    { id: "standard", name: "Match Standard", rarity: "Common", price: 0, primary: "#d9ddd9", secondary: "#394348", pattern: "panel" },
    { id: "carbon", name: "Carbon Grid", rarity: "Common", price: 250, primary: "#30383c", secondary: "#aab4b7", pattern: "cross" },
    { id: "crimson", name: "Crimson Strike", rarity: "Common", price: 300, primary: "#a83d37", secondary: "#ead9c8", pattern: "split" },
    { id: "arctic", name: "Arctic Line", rarity: "Common", price: 350, primary: "#d8eef2", secondary: "#4f8198", pattern: "ring" },
    { id: "hazard", name: "Hazard Tape", rarity: "Rare", price: 475, primary: "#d4b343", secondary: "#1d2325", pattern: "cross" },
    { id: "neon", name: "Neon Circuit", rarity: "Rare", price: 575, primary: "#2ac9ad", secondary: "#1d315f", pattern: "circuit" },
    { id: "magma", name: "Magma Core", rarity: "Rare", price: 675, primary: "#b8492f", secondary: "#1d1817", pattern: "crack" },
    { id: "toxic", name: "Toxic Spill", rarity: "Rare", price: 725, primary: "#83ae4f", secondary: "#273328", pattern: "dots" },
    { id: "royal", name: "Royal Guard", rarity: "Epic", price: 900, primary: "#cdb369", secondary: "#522b43", pattern: "ring" },
    { id: "void", name: "Void Signal", rarity: "Epic", price: 1050, primary: "#604d85", secondary: "#17151d", pattern: "circuit" },
    { id: "plasma", name: "Plasma Split", rarity: "Epic", price: 1250, primary: "#bd5b92", secondary: "#62d8cf", pattern: "split" },
    { id: "champion", name: "Champion", rarity: "Legendary", price: 1650, primary: "#e2d6ad", secondary: "#8d292b", pattern: "crown" }
  ];
  const crateTypes = [
    { id: "field", name: "Field Crate", cost: 400, accent: "#78918b", chances: { Common: .65, Rare: .28, Epic: .07, Legendary: 0 } },
    { id: "elite", name: "Elite Crate", cost: 950, accent: "#c6a756", chances: { Common: .1, Rare: .45, Epic: .35, Legendary: .1 } }
  ];

  const elementSkillTraits = {
    burn: {
      moveName: "Ignition Ward", shotName: "Detonation Core", ultName: "Wildfire Engine",
      move: "creates a burning defensive ward", shot: "explodes on impact and burns nearby enemies", ult: "covers the fight in expanding fire"
    },
    bubble: {
      moveName: "Tidal Shell", shotName: "Pressure Capsule", ultName: "Abyss Lock",
      move: "adds a temporary shield and slowing bubble", shot: "floats toward targets and creates a slowing bubble", ult: "traps enemies inside a huge pressure field"
    },
    quake: {
      moveName: "Fault Armor", shotName: "Seismic Mass", ultName: "Continental Break",
      move: "adds armor and cracks the nearby ground", shot: "throws a heavy impact ball with brutal knockback", ult: "raises cover and sends out a damaging quake"
    },
    chain: {
      moveName: "Voltage Relay", shotName: "Arc Relay", ultName: "Thunder Network",
      move: "stuns threats inside a short electric pulse", shot: "jumps damage into a second nearby target", ult: "launches tracking lightning through the arena"
    },
    freeze: {
      moveName: "Glacier Ward", shotName: "Shatterpoint", ultName: "Whiteout",
      move: "cleanses slows and freezes the nearby ground", shot: "flies slowly but causes a wide freezing burst", ult: "creates a shard storm and a deep-freeze zone"
    },
    curve: {
      moveName: "Crosswind Guard", shotName: "Bending Gale", ultName: "Tempest Spiral",
      move: "redirects nearby balls and restores stamina", shot: "curves in flight and keeps extra wall bounces", ult: "spins curved volleys in changing directions"
    },
    void: {
      moveName: "Afterimage Veil", shotName: "Phase Mark", ultName: "Eclipse Hunt",
      move: "turns invisible and creates a stationary decoy", shot: "passes through targets and marks them for bonus damage", ult: "creates clones while hiding the caster"
    },
    heal: {
      moveName: "Radiant Recovery", shotName: "Life Transfer", ultName: "Sun Sanctuary",
      move: "restores health and creates a healing pulse", shot: "returns part of its damage as health", ult: "heals, shields, and controls a safe zone"
    },
    orbit: {
      moveName: "Gravity Screen", shotName: "Lunar Satellite", ultName: "Event Horizon",
      move: "bends nearby enemy balls away from the caster", shot: "orbits toward targets with strong guidance", ult: "pulls opponents inward under a tracking barrage"
    },
    root: {
      moveName: "Vinebound Snare", shotName: "Briar Snare", ultName: "Overgrowth",
      move: "roots enemies inside a defensive vine patch", shot: "bursts into a rooting patch on impact", ult: "grows walls and a large entangling field"
    },
    poison: {
      moveName: "Toxic Screen", shotName: "Plague Seed", ultName: "Contagion",
      move: "creates a long-lasting poison cloud", shot: "deals low impact damage but spreads a stronger damage-over-time cloud", ult: "fills a wide area with stacking poison"
    },
    metal: {
      moveName: "Kinetic Guard", shotName: "Iron Crusher", ultName: "Steel Bastion",
      move: "gains armor and reflects nearby incoming balls", shot: "is larger, heavier, and ricochets more", ult: "builds cover and fires crushing projectiles"
    },
    plasma: {
      moveName: "Phase Reactor", shotName: "Ion Rail", ultName: "Fusion Collapse",
      move: "briefly blocks damage and emits a piercing pulse", shot: "travels extremely fast and tears through shields", ult: "crosses the arena with piercing plasma rails"
    },
    omni: {
      moveName: "Transcendence", shotName: "Worldbreaker", ultName: "Absolute Domain",
      move: "combines armor, healing, phasing, and reflection", shot: "combines piercing, homing, blast, and damage-over-time", ult: "uses every elemental field at once"
    }
  };

  const skillDescriptions = {
    "guard-plate": "strong timed shield", "counter-window": "reflects nearby incoming balls", "cleanse-pulse": "removes every negative status", "ammo-surge": "instantly reloads and boosts throw speed",
    "decoy-cast": "creates a stationary combat decoy", "null-dome": "destroys hostile balls nearby", "focus-mode": "temporarily increases damage", "recovery-seal": "restores missing health",
    "reflect-field": "turns incoming balls against their owner", "trap-rune": "places a control field at the crosshair", overcharge: "fills stamina and shortens throw delay", "shock-guard": "shield that stuns nearby attackers",
    "ward-wall": "places solid cover at the crosshair", "ball-recall": "recalls your active projectiles", "power-channel": "large temporary damage increase", "time-lock": "slows every nearby enemy",
    "second-life": "major heal with brief invulnerability", "hunter-mark": "marks the nearest enemy for bonus damage", "perfect-guard": "blocks damage and clears nearby shots", "final-form": "full guard, healing, reflection, and power",
    quick: "instant low-damage fastball", heavy: "slow oversized crusher", scatter: "three-ball close-range spread", pierce: "straight shot through several targets",
    homing: "guided hunter ball", ricochet: "six-bounce bank shot", split: "core that breaks into four shots", "curve-shot": "precision bending shot",
    burst: "tight three-round burst", lob: "slow explosive arc ball", drain: "guided shot with recovery", "chain-shot": "piercing target-to-target driver",
    mine: "slow ball that controls space", "orbit-shot": "paired curving hunter balls", sniper: "tiny high-speed headshot ball", wave: "wide five-ball volley",
    boomerang: "returning curved comet", execution: "single massive finisher", annihilator: "seven-ball piercing fan", worldbreaker: "giant multi-piercing core",
    nova: "six-way projectile ring", field: "persistent control zone", wall: "aimed temporary barricade", barrage: "five-shot forward storm",
    "ground-zero": "close-range blast and shield", healstorm: "full recovery pulse", "cyclone-domain": "curving storm field", fortress: "three-wall defensive fort",
    meteor: "five falling explosive shots", mirror: "decoy-assisted crossfire", orbital: "five tracking satellites", "sniper-storm": "seven high-speed rail shots",
    cataclysm: "triple lane-clearing projectiles", limit: "rush, guard, and volley together", sanctuary: "major heal and protected zone", worldfield: "huge field with a shockwave",
    singularity: "slow tracking gravity core", "total-annihilation": "ten-way piercing ring", judgment: "arena-crossing execution ball", absolute: "full heal, invulnerability, field, and twelve shots"
  };

  const qs = id => document.getElementById(id);
  const ui = {
    home: qs("homeScreen"), game: qs("gameScreen"), coins: qs("coinCount"), level: qs("levelCount"),
    rank: qs("rankText"), selectedCard: qs("selectedElementCard"), selectedBallCard: qs("selectedBallCard"), modeGrid: qs("modeGrid"),
    upgradeGrid: qs("upgradeGrid"), elementGrid: qs("elementGrid"), search: qs("elementSearch"),
    tier: qs("elementTier"), modeHint: qs("modeHint"), matchMode: qs("matchMode"),
    matchStatus: qs("matchStatus"), hpBar: qs("hpBar"), hpText: qs("hpText"),
    score: qs("scoreText"), earned: qs("earnedText"), xp: qs("xpText"), ranked: qs("rankedText"),
    skills: qs("skillList"), rankedGrid: qs("rankedGrid"), rankedHomeText: qs("rankedHomeText"),
    pathGrid: qs("pathGrid"), pathStatus: qs("pathStatus"), mapGrid: qs("mapGrid"),
    mapHint: qs("mapHint"), mapTitle: qs("mapTitle"), onlineStatus: qs("onlineStatus"), hostRoom: qs("hostRoomBtn"),
    joinRoom: qs("joinRoomBtn"), roomCode: qs("roomCodeInput"), voteGrid: qs("voteGrid"),
    refreshVote: qs("refreshVoteBtn"), usernameInput: qs("usernameInput"), userNameText: qs("userNameText"),
    saveUsername: qs("saveUsernameBtn"), onlineRoomCard: qs("onlineRoomCard"),
    droneInspection: qs("droneInspection"), droneView: qs("droneInspectionView"), closeDrone: qs("closeDroneBtn"),
    blueNames: qs("blueTeamNames"), redNames: qs("redTeamNames"), roundScore: qs("roundScore"),
    ballTypeGrid: qs("ballTypeGrid"), skinGrid: qs("skinGrid"), crateGrid: qs("crateGrid"), shopNotice: qs("shopNotice")
  };
  const combatUi = {
    chat: qs("gameChat"), messages: qs("chatMessages"), form: qs("chatForm"), input: qs("chatInput"),
    result: qs("resultOverlay"), resultTitle: qs("resultTitle"), resultDamage: qs("resultDamage"), resultMaps: qs("resultMapsBtn")
  };
  const settingsUi = {
    sensitivity: qs("sensitivitySetting"), sensitivityValue: qs("sensitivityValue"),
    volume: qs("volumeSetting"), volumeValue: qs("volumeValue"),
    fov: qs("fovSetting"), fovValue: qs("fovValue"), quality: qs("qualitySetting"),
    invertY: qs("invertYSetting"), minimap: qs("minimapSetting")
  };

  const defaultSave = () => ({
    coins: 650,
    xp: 0,
    level: 1,
    selected: null,
    unlocked: [],
    activePath: null,
    pathProgress: {},
    pathFinals: [],
    ultimateUnlocked: false,
    upgrades: { speed: 0, power: 0, magnet: 0, hp: 0 },
    ranked: { placements: 0, score: 0, rank: "Unranked" },
    skillRating: 1,
    username: "Player",
    ballType: "semi",
    skins: ["standard"],
    selectedSkin: "standard",
    settings: { sensitivity: 35, volume: 50, fov: 90, quality: "high", invertY: false, minimap: true }
  });

  let elements = buildElements();
  let maps = buildMaps();
  let save = migrateSave(loadSave());
  let selectedMode = "ffa";
  let selectedMap = "random";
  let voteOptions = [];
  let votedMapId = null;
  let voteTimeLeft = 20;
  let voteLocked = false;
  const npcVoters = ["AvaAim", "BoltKid", "SkyDash", "NovaNate", "MiraMax", "ZedZap", "PixelPax", "RiftRae", "JunoJump", "KadeKO", "VexVolley"];
  let rankedQueue = false;
  let crateOpening = false;
  let state = null;
  let keys = new Set();
  let mouse = { x: W / 2, y: H / 2, left: false, right: false, edgeX: 0, edgeY: 0 };
  let lastTime = 0;
  let online = { socket: null, id: null, room: null, connected: false, peers: {}, lastSend: 0, host: false, matchConfig: null };

  function loadSave() {
    try {
      const v2 = localStorage.getItem(storeKey);
      if (v2) return JSON.parse(v2);
      const v1 = localStorage.getItem("dodgeballWarsSaveV1");
      return v1 ? JSON.parse(v1) : defaultSave();
    } catch {
      return defaultSave();
    }
  }

  function migrateSave(raw) {
    const fromOldSave = !Object.prototype.hasOwnProperty.call(raw, "activePath");
    const next = fromOldSave
      ? { ...defaultSave(), coins: raw.coins ?? 650, xp: raw.xp ?? 0, level: raw.level ?? 1, ranked: raw.ranked ?? defaultSave().ranked, skillRating: raw.skillRating ?? 1 }
      : { ...defaultSave(), ...raw };
    next.upgrades = { ...defaultSave().upgrades, ...(raw.upgrades || {}) };
    next.ranked = { ...defaultSave().ranked, ...(raw.ranked || {}) };
    next.settings = { ...defaultSave().settings, ...(raw.settings || {}) };
    next.pathProgress = { ...defaultSave().pathProgress, ...(raw.pathProgress || {}) };
    next.pathFinals = Array.isArray(raw.pathFinals) ? raw.pathFinals : [];
    next.unlocked = Array.isArray(raw.unlocked) ? raw.unlocked : [];
    next.skins = Array.isArray(raw.skins) ? raw.skins.filter(id => ballSkins.some(skin => skin.id === id)) : ["standard"];
    if (!next.skins.includes("standard")) next.skins.unshift("standard");
    if (!ballTypes.some(type => type.id === next.ballType)) next.ballType = "semi";
    if (!next.skins.includes(next.selectedSkin)) next.selectedSkin = "standard";
    if (next.activePath === "Blaze" && (next.pathProgress.Blaze || 0) <= 1 && next.pathFinals.length === 0) {
      next.activePath = null;
      next.pathProgress = {};
      next.unlocked = next.unlocked.filter(id => !id.startsWith("blaze-spark-"));
      next.selected = null;
    }
    if (next.activePath && !next.pathProgress[next.activePath]) next.pathProgress[next.activePath] = 1;
    if (next.selected && !elements.some(e => e.id === next.selected)) next.selected = null;
    return next;
  }

  function persist() {
    localStorage.setItem(storeKey, JSON.stringify(save));
    renderProfile();
  }

  let persistTimer = 0;
  function queuePersist() {
    if (persistTimer) return;
    persistTimer = window.setTimeout(() => {
      persistTimer = 0;
      persist();
    }, 350);
  }

  function applySettings() {
    const s = save.settings;
    settingsUi.sensitivity.value = s.sensitivity;
    settingsUi.sensitivityValue.textContent = s.sensitivity;
    settingsUi.volume.value = s.volume;
    settingsUi.volumeValue.textContent = s.volume;
    settingsUi.fov.value = s.fov;
    settingsUi.fovValue.textContent = s.fov;
    settingsUi.quality.value = s.quality;
    settingsUi.invertY.checked = s.invertY;
    settingsUi.minimap.checked = s.minimap;
  }

  let audioContext = null;
  function playSound(type, strength = 1) {
    const volume = (save.settings.volume || 0) / 100;
    if (!volume) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      const sounds = { throw: [150, 80, .08], hit: [95, 45, .12], jump: [180, 260, .1], skill: [240, 90, .18] };
      const [start, end, duration] = sounds[type] || sounds.throw;
      osc.type = type === "hit" ? "square" : "sine";
      osc.frequency.setValueAtTime(start, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
      gain.gain.setValueAtTime(Math.min(.12, volume * .08 * strength), now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now); osc.stop(now + duration);
    } catch {}
  }

  function buildElements() {
    const list = [];
    let idn = 0;
    const utilityRecipes = [
      ["Guard Plate", "guard-plate"], ["Counter Window", "counter-window"], ["Cleanse Pulse", "cleanse-pulse"], ["Ammo Surge", "ammo-surge"],
      ["Decoy Cast", "decoy-cast"], ["Null Dome", "null-dome"], ["Focus Mode", "focus-mode"], ["Recovery Seal", "recovery-seal"],
      ["Reflect Field", "reflect-field"], ["Trap Rune", "trap-rune"], ["Overcharge", "overcharge"], ["Shock Guard", "shock-guard"],
      ["Ward Wall", "ward-wall"], ["Ball Recall", "ball-recall"], ["Power Channel", "power-channel"], ["Time Lock", "time-lock"],
      ["Second Life", "second-life"], ["Hunter Mark", "hunter-mark"], ["Perfect Guard", "perfect-guard"], ["Final Form", "final-form"]
    ];
    const projectileRecipes = [
      ["Quickshot", "quick"], ["Crusher Ball", "heavy"], ["Tri Scatter", "scatter"], ["Piercing Lance", "pierce"],
      ["Seeking Fang", "homing"], ["Bank Ricochet", "ricochet"], ["Fracture Core", "split"], ["Curve Sniper", "curve-shot"],
      ["Three-Round Burst", "burst"], ["Siege Lob", "lob"], ["Leech Throw", "drain"], ["Chain Driver", "chain-shot"],
      ["Deadweight Mine", "mine"], ["Orbit Hunter", "orbit-shot"], ["Rail Sniper", "sniper"], ["Tidal Volley", "wave"],
      ["Return Comet", "boomerang"], ["Execution Shot", "execution"], ["Annihilator Fan", "annihilator"], ["Worldbreaker", "worldbreaker"]
    ];
    const ultimateRecipes = [
      ["Nova Ring", "nova"], ["Control Field", "field"], ["Guardian Wall", "wall"], ["Meteor Barrage", "barrage"],
      ["Ground Zero", "ground-zero"], ["Second Wind", "healstorm"], ["Cyclone Domain", "cyclone-domain"], ["Iron Fortress", "fortress"],
      ["Falling Stars", "meteor"], ["Mirror Army", "mirror"], ["Orbital Prison", "orbital"], ["Deadeye Storm", "sniper-storm"],
      ["Cataclysm Line", "cataclysm"], ["Limit Overdrive", "limit"], ["Sanctuary", "sanctuary"], ["Worldfield", "worldfield"],
      ["Singularity", "singularity"], ["Total Annihilation", "total-annihilation"], ["Final Judgment", "judgment"], ["Absolute Domain", "absolute"]
    ];
    for (let familyIndex = 0; familyIndex < families.length; familyIndex++) {
      const fam = families[familyIndex];
      for (let i = 0; i < suffixes.length; i++) {
        const suffix = suffixes[i];
        const tier = Math.min(5, 1 + Math.floor(i / 4));
        const power = tier * 12 + i * 3 + (suffix === "Final" ? 30 : 0);
        const cost = i === 0 ? 0 : Math.round(180 * (i + 1) ** 1.28 + tier * tier * 150 + power * 18);
        const id = `${fam[0].toLowerCase()}-${suffix.toLowerCase()}-${idn}`;
        const trait = elementSkillTraits[fam[3]];
        const recipes = [utilityRecipes[i], projectileRecipes[i], ultimateRecipes[i]];
        const traitNames = [trait.moveName, trait.shotName, trait.ultName];
        const traitDescriptions = [trait.move, trait.shot, trait.ult];
        list.push({
          id, index: i, path: fam[0], name: `${fam[0]} ${suffix}`, family: fam[0], color: fam[1],
          tier, power, cost, kind: fam[3], final: suffix === "Final",
          mastery: 1 + i * .045 + (suffix === "Final" ? .18 : 0),
          skills: recipes.map((recipe, n) => ({
            name: `${recipe[0]} ${traitNames[n]}`,
            action: `${fam[3]}-${recipe[1]}-${i}-${n}`,
            pattern: recipe[1],
            description: `${skillDescriptions[recipe[1]]}; ${traitDescriptions[n]}`,
            variant: familyIndex * suffixes.length + i,
            cd: Math.max(2.35 + n * 1.8, 5.4 + n * 2.2 - i * .11 + ((familyIndex + i + n) % 3) * .16),
            slot: ["Q", "E", "R"][n]
          }))
        });
        idn++;
      }
    }
    list.push({
      id: "omni-invincible-final", index: 999, path: "Omni", name: "Omni Invincible Final", family: "Omni",
      color: "#fff0a6", tier: 6, power: 999, cost: 0, kind: "omni", final: true,
      skills: [
        { name: "Final Form Transcendence", action: "omni-final-form", pattern: "final-form", description: "full guard; combines armor, healing, phasing, reflection, and power", variant: 999, cd: 3.5, slot: "Q" },
        { name: "Infinite Worldbreaker", action: "omni-worldbreaker", pattern: "worldbreaker", description: "giant core; combines piercing, homing, blast, and damage-over-time", variant: 999, cd: 5.5, slot: "E" },
        { name: "Invincible Absolute Domain", action: "omni-absolute", pattern: "absolute", description: "full heal and invulnerability; activates every elemental field", variant: 999, cd: 9, slot: "R" }
      ]
    });
    const abilityIds = list.flatMap(element => element.skills.map(skill => skill.action));
    if (new Set(abilityIds).size !== abilityIds.length) throw new Error("Duplicate element ability mechanics");
    return list;
  }

  function buildMaps() {
    const layouts = ["Dash", "Split", "Cross", "Pillars", "Bridges", "Pit", "Stacks", "Ring"];
    const list = [];
    let id = 0;
    for (const theme of mapThemes) {
      for (const layout of layouts) {
        list.push(makeMap(theme, layout, id++));
      }
    }
    return list;
  }

  function makeMap(theme, layout, id) {
    const [themeName, a, b, kind] = theme;
    const obstacles = [];
    const techniques = [];
    const hazards = [];
    const materials = {
      rooftop: ["#555d62", "#3d464b", "#697176"], crystal: ["#40506b", "#53678a", "#33435d"],
      lava: ["#17191c", "#27282c", "#0d1014"], garden: ["#3f5743", "#53644a", "#34483b"],
      court: ["#56606a", "#3f4b52", "#69737a"], blocks: ["#665c54", "#4d5357", "#756b60"],
      water: ["#455c66", "#526d75", "#344d58"], royal: ["#625f67", "#4f5259", "#74706c"],
      grid: ["#454c50", "#32393d", "#596064"], plaza: ["#655f56", "#524f4a", "#777067"],
      lab: ["#4d5856", "#354340", "#65706a"], snow: ["#89949a", "#69767d", "#a4aaab"]
    };
    const palette = materials[kind] || materials.grid;
    const materialColors = { obsidian: "#111318", crystal: "#405f82", ice: "#869aa2", hedge: "#304a35", tank: "#46544f", crate: "#62584d", column: "#73706d", planter: "#55534b", barrier: "#3b4448", vent: "#4c565a", duct: "#434d51", bleachers: "#515a60" };
    const add = (x, y, w, h, z = 28, material = kind) => obstacles.push({ x, y, w, h, z, material, color: materialColors[material] || palette[obstacles.length % palette.length] });
    const addHazard = (type, x, y, w, h, color) => hazards.push({ type, x, y, w, h, color });
    const addTechnique = (type, x, y, opts = {}) => techniques.push({
      type,
      x,
      y,
      r: opts.r || (type === "portal" ? 30 : type === "bank" ? 28 : 34),
      w: opts.w || (type === "lane" ? 160 : 76),
      h: opts.h || (type === "lane" ? 42 : 28),
      angle: opts.angle || 0,
      color: opts.color || (type === "jump" ? "#c3a15b" : type === "lane" ? "#6f7f8b" : type === "portal" ? "#8190a0" : "#9b8060"),
      label: opts.label || (type === "jump" ? "JUMP" : type === "lane" ? "SPEED" : type === "portal" ? "PORTAL" : "BANK"),
      pair: opts.pair || "",
      cool: 0
    });
    if (layout === "Dash") {
      add(310, 170, 90, 110); add(700, 400, 90, 110); add(520, 270, 70, 90, 42);
      add(430, 120, 66, 58, 36); add(610, 500, 66, 58, 36); add(190, 335, 54, 120, 32); add(855, 225, 54, 120, 32);
    } else if (layout === "Split") {
      add(510, 120, 80, 170); add(510, 390, 80, 170); add(260, 310, 95, 80); add(745, 250, 95, 80);
      add(380, 155, 58, 74, 34); add(665, 455, 58, 74, 34); add(155, 125, 74, 48, 28); add(875, 506, 74, 48, 28);
    } else if (layout === "Cross") {
      add(500, 275, 100, 130, 46); add(255, 160, 75, 95); add(770, 425, 75, 95);
      add(500, 105, 100, 52, 30); add(500, 528, 100, 52, 30); add(160, 300, 68, 78, 36); add(872, 300, 68, 78, 36);
    } else if (layout === "Pillars") {
      for (let px of [260, 430, 600, 770]) add(px, 170 + (px % 2 ? 230 : 0), 62, 62, 50);
      for (let px of [185, 345, 685, 845]) add(px, 300 + (px % 3 ? -95 : 95), 48, 48, 42);
    } else if (layout === "Bridges") {
      add(260, 250, 110, 65); add(455, 365, 110, 65); add(650, 250, 110, 65); add(830, 365, 80, 65);
      add(390, 150, 70, 52, 28); add(640, 482, 70, 52, 28); add(155, 438, 76, 48, 28); add(905, 172, 76, 48, 28);
    } else if (layout === "Pit") {
      add(220, 150, 82, 82); add(805, 448, 82, 82); add(485, 150, 130, 60); add(485, 470, 130, 60);
      add(370, 300, 64, 82, 40); add(666, 300, 64, 82, 40); add(140, 296, 70, 58, 28); add(890, 326, 70, 58, 28);
    } else if (layout === "Stacks") {
      add(300, 230, 115, 78, 34); add(690, 230, 115, 78, 34); add(300, 390, 115, 78, 54); add(690, 390, 115, 78, 54);
      add(480, 120, 62, 72, 38); add(558, 488, 62, 72, 38); add(170, 214, 68, 54, 28); add(862, 412, 68, 54, 28);
    } else {
      for (let i = 0; i < 6; i++) {
        const ang = i / 6 * Math.PI * 2;
        add(W / 2 + Math.cos(ang) * 245 - 32, H / 2 + Math.sin(ang) * 155 - 32, 64, 64, 36);
      }
      add(325, 315, 58, 58, 42); add(717, 315, 58, 58, 42); add(520, 122, 60, 48, 32); add(520, 510, 60, 48, 32);
    }
    add(70, 70, 105, 48, 28); add(W - 175, 70, 105, 48, 28);
    add(70, H - 118, 105, 48, 28); add(W - 175, H - 118, 105, 48, 28);
    add(W * .57, H * .76, 145, 58, 36); add(W * .76, H * .34, 62, 155, 48);
    for (let i = 0; i < 3; i++) add(250 + i * 410, H * (.2 + (i % 2) * .58), 70, 52, 32 + i * 8);
    if (kind === "lava") {
      addHazard("lava", W * .42, H * .34, 220, 90, "#b84020");
      addHazard("lava", W * .62, H * .68, 260, 76, "#d05224");
      add(W * .48, H * .18, 54, 54, 92, "obsidian"); add(W * .76, H * .58, 46, 70, 110, "obsidian");
    } else if (kind === "crystal") {
      add(W * .46, H * .28, 42, 42, 120, "crystal"); add(W * .67, H * .62, 48, 48, 136, "crystal");
      addHazard("shards", W * .56, H * .5, 180, 70, "#668fba");
    } else if (kind === "water") {
      addHazard("water", W * .36, H * .42, 370, 70, "#3f7180"); addHazard("water", W * .7, H * .7, 250, 60, "#456d79");
      addHazard("current", W * .55, H * .2, 300, 55, "#508a9b");
    } else if (kind === "snow") {
      addHazard("ice", W * .5, H * .36, 310, 100, "#8da5ad"); add(W * .72, H * .22, 65, 65, 84, "ice");
    } else if (kind === "lab") {
      addHazard("acid", W * .48, H * .45, 210, 82, "#697c45"); add(W * .7, H * .28, 110, 45, 54, "tank");
    } else if (kind === "garden") {
      addHazard("mud", W * .5, H * .58, 260, 82, "#4b4938"); add(W * .24, H * .28, 150, 42, 58, "hedge");
      addHazard("healing", W * .68, H * .3, 120, 70, "#4d7656");
    } else if (kind === "rooftop") {
      add(W * .5, H * .22, 120, 62, 68, "vent"); add(W * .78, H * .62, 84, 84, 82, "duct");
      addHazard("wind", W * .53, H * .52, 340, 64, "#697a82");
    } else if (kind === "court") {
      add(W * .5, H * .13, 280, 54, 62, "bleachers");
      addHazard("boost", W * .5, H * .72, 290, 52, "#3f6f69");
    } else if (kind === "blocks") {
      add(W * .45, H * .25, 74, 74, 74, "crate"); add(W * .52, H * .25, 74, 74, 112, "crate");
      addHazard("conveyor", W * .55, H * .62, 300, 56, "#73664f");
    } else if (kind === "royal") {
      add(W * .42, H * .24, 44, 44, 116, "column"); add(W * .62, H * .68, 44, 44, 116, "column");
      addHazard("healing", W * .52, H * .5, 105, 105, "#756d54");
    } else if (kind === "plaza") {
      add(W * .47, H * .3, 170, 48, 50, "planter"); add(W * .7, H * .65, 130, 48, 50, "planter");
      addHazard("boost", W * .3, H * .68, 210, 50, "#766f5d");
    } else if (kind === "grid") {
      add(W * .46, H * .3, 18, 190, 76, "barrier"); add(W * .67, H * .55, 190, 18, 76, "barrier");
      addHazard("shock", W * .55, H * .48, 150, 90, "#495b67");
    }
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      add(W / 2 + side * (250 + (i > 1 ? 145 : 0)) - 24, H / 2 + (i < 2 ? -115 : 115) - 24, 48, 48, 34 + (i % 2) * 18, palette[i % palette.length]);
    }
    addTechnique("jump", 210, H - 180, { color: "#d6b641", label: "TRAMPOLINE" });
    addTechnique("jump", W - 210, 180, { color: "#d6b641", label: "TRAMPOLINE" });
    if (layout === "Pillars" || layout === "Stacks") addTechnique("jump", W / 2, H / 2, { color: "#d6b641", label: "TRAMPOLINE" });
    addTechnique("lane", W / 2, H / 2 - 190, { w: 360, h: 34, color: "#6f7f8b", angle: 0 });
    addTechnique("lane", W / 2, H / 2 + 190, { w: 360, h: 34, color: "#5b6975", angle: Math.PI });
    return {
      id: `map-${id}`,
      name: `${themeName} ${layout}`,
      theme: themeName,
      kind,
      a,
      b,
      layout,
      obstacles,
      techniques,
      hazards,
      spawns: {
        blue: [.18, .34, .5, .66, .82].map(y => ({ x: 115, y: H * y })),
        red: [.18, .34, .5, .66, .82].map(y => ({ x: W - 115, y: H * y }))
      }
    };
  }

  function mixColor(a, b, t) {
    const pa = hexToRgb(a), pb = hexToRgb(b);
    const r = Math.round(pa.r + (pb.r - pa.r) * t);
    const g = Math.round(pa.g + (pb.g - pa.g) * t);
    const bl = Math.round(pa.b + (pb.b - pa.b) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function rgba(color, alpha) {
    if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
    const c = hexToRgb(color);
    return `rgba(${c.r},${c.g},${c.b},${alpha})`;
  }

  function selectedElement() {
    return elements.find(e => e.id === save.selected) || null;
  }

  function pathElements(path) {
    return elements.filter(e => e.path === path).sort((a, b) => a.index - b.index);
  }

  function pathComplete(path) {
    return save.pathFinals.includes(path);
  }

  function allFinalsUnlocked() {
    return families.every(f => save.pathFinals.includes(f[0]));
  }

  function renderProfile() {
    ui.userNameText.textContent = save.username || "Player";
    ui.usernameInput.value = save.username || "Player";
    ui.coins.textContent = Math.floor(save.coins);
    ui.level.textContent = save.level;
    ui.rank.textContent = save.ranked.rank;
  }

  function showPage(id) {
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    qs(id).classList.add("active");
    if (id === "playScreen" && voteOptions.length === 0) resetVoteOptions();
    renderAll();
  }

  function saveUsername() {
    const oldName = save.username || "Player";
    const clean = ui.usernameInput.value.trim().replace(/[^a-z0-9 _-]/gi, "").slice(0, 16);
    save.username = clean || "Player";
    for (const entry of voteOptions) {
      entry.voters = entry.voters.map(name => name === oldName ? save.username : name);
    }
    persist();
    renderProfile();
    renderVoteMaps();
  }

  function resetVoteOptions() {
    const roomSeed = online.connected && online.room
      ? [...online.room].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
      : null;
    const choices = roomSeed === null
      ? [...maps].sort(() => Math.random() - .5).slice(0, 4)
      : Array.from({ length: 4 }, (_, i) => maps[(roomSeed + i * 17) % maps.length]);
    voteOptions = choices.map(map => ({
      map,
      voters: []
    }));
    voteTimeLeft = 15;
    voteLocked = false;
    votedMapId = null;
    selectedMap = "random";
    renderVoteMaps();
  }

  function renderVoteMaps() {
    if (!ui.voteGrid) return;
    if (voteOptions.length === 0) {
      resetVoteOptions();
      return;
    }
    ui.voteGrid.innerHTML = "";
    const multiplayerVote = online.connected;
    ui.mapTitle.textContent = multiplayerVote ? "Map Vote" : "Choose Map";
    qs("refreshVoteBtn").textContent = multiplayerVote ? "New Vote" : "New Maps";
    qs("startBtn").textContent = "Start Match";
    for (const entry of voteOptions) {
      const btn = document.createElement("button");
      btn.className = `vote-card ${votedMapId === entry.map.id ? "active" : ""}`;
      btn.style.setProperty("--map-a", entry.map.a);
      btn.style.setProperty("--map-b", entry.map.b);
      btn.innerHTML = `${mapPreviewHTML(entry.map)}
        <strong>${entry.map.name}</strong>
        <span>DRONE VIEW  |  ${entry.map.layout.toUpperCase()}</span>
        ${multiplayerVote ? `<div class="voter-list">${entry.voters.slice(0, 5).map(v => `<b>${v}</b>`).join("")}${entry.voters.length > 5 ? `<b>+${entry.voters.length - 5}</b>` : ""}</div><em class="vote-count">${entry.voters.length}</em>` : ""}`;
      btn.addEventListener("click", () => {
        showDroneMap(entry.map);
        if (multiplayerVote && voteLocked) return;
        if (multiplayerVote) {
          castVote(save.username || "Player", entry.map.id, true);
          sendOnline({ type: "mapvote", mapId: entry.map.id, name: save.username || "Player" });
        } else {
          selectedMap = entry.map.id;
          votedMapId = entry.map.id;
          voteLocked = true;
        }
        renderVoteMaps();
      });
      ui.voteGrid.appendChild(btn);
    }
    const leader = winningVote();
    if (multiplayerVote && leader) ui.mapHint.textContent = voteLocked
      ? `${leader.map.name} selected`
      : `${Math.ceil(voteTimeLeft)}s`;
    else {
      const chosen = maps.find(map => map.id === selectedMap);
      ui.mapHint.textContent = chosen ? chosen.name : `Random in ${Math.ceil(voteTimeLeft)}s`;
    }
    updateStartAvailability();
  }

  function updateStartAvailability() {
    const waitingForMap = online.connected ? !voteLocked : selectedMap === "random";
    qs("startBtn").disabled = !selectedElement() || waitingForMap;
  }

  function mapPreviewHTML(map) {
    const blocks = map.obstacles.slice(0, 16).map((block, index) => {
      const left = Math.round(block.x / W * 100);
      const top = Math.round(block.y / H * 100);
      const width = Math.max(8, Math.round(block.w / W * 100));
      const height = Math.max(8, Math.round(block.h / H * 100));
      return `<i class="structure s${index % 4}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;--height:${Math.max(4, block.z / 5)}px;background:${block.color}"></i>`;
    }).join("");
    const hazards = (map.hazards || []).map(hazard => `<u class="terrain ${hazard.type}" style="left:${hazard.x / W * 100}%;top:${hazard.y / H * 100}%;width:${hazard.w / W * 100}%;height:${hazard.h / H * 100}%;background:${hazard.color}"></u>`).join("");
    return `<div class="map-preview drone-view" aria-hidden="true"><span></span><div class="drone-grid"></div>${hazards}${blocks}<b class="drone-reticle"></b></div>`;
  }

  function showDroneMap(map) {
    const features = {
      lava: "Lava pools / obsidian spires", water: "Water channels / dock cover", lab: "Acid pools / containment tanks",
      snow: "Ice fields / frozen pillars", crystal: "Crystal spires / shard cover", garden: "Mud / hedges / planters",
      rooftop: "Vents / ducts / roof cover", court: "Bleachers / open lanes", blocks: "Stacked crates / container cover",
      royal: "Columns / stone arches", grid: "Tactical barriers / firing lanes", plaza: "Planters / concrete cover"
    };
    ui.droneView.innerHTML = `<div class="drone-detail-map">${mapPreviewHTML(map)}</div><div class="drone-caption"><strong>${map.name}</strong><span>${features[map.kind] || map.layout}</span></div>`;
    ui.droneInspection.hidden = false;
  }

  function castVote(voter, mapId, isPlayer = false) {
    for (const entry of voteOptions) {
      entry.voters = entry.voters.filter(name => name !== voter);
    }
    const chosen = voteOptions.find(entry => entry.map.id === mapId) || voteOptions[0];
    chosen.voters.push(voter);
    if (isPlayer) votedMapId = chosen.map.id;
  }

  function winningVote() {
    return voteOptions.reduce((a, b) => a.voters.length >= b.voters.length ? a : b, voteOptions[0]);
  }

  function tickLobbyVotes() {
    const playActive = qs("playScreen")?.classList.contains("active");
    if (!playActive || state || voteOptions.length === 0) return;
    if (!voteLocked) {
      voteTimeLeft = Math.max(0, voteTimeLeft - 1);
      if (voteTimeLeft <= 0) {
        if (online.connected) {
          voteLocked = true;
          votedMapId = voteOptions.some(entry => entry.voters.length)
            ? winningVote().map.id
            : voteOptions[[...(online.room || "PUBLIC")].reduce((sum, char) => sum + char.charCodeAt(0), 0) % voteOptions.length].map.id;
        } else {
          const random = voteOptions[Math.floor(Math.random() * voteOptions.length)].map;
          selectedMap = random.id;
          votedMapId = random.id;
          voteLocked = true;
        }
      }
    }
    renderVoteMaps();
  }

  function xpForLevel(level) {
    const earlyDiscount = level <= 10 ? .58 + level * .022 : level <= 25 ? .82 + (level - 10) * .012 : 1;
    return Math.floor((80 + Math.pow(level, 1.52) * 26) * earlyDiscount);
  }

  function addXp(amount) {
    save.xp += amount;
    while (save.xp >= xpForLevel(save.level)) {
      save.xp -= xpForLevel(save.level);
      save.level++;
    }
  }

  function upgradeCost(stat) {
    const n = save.upgrades[stat];
    return Math.floor(150 * (n + 1) ** 1.75);
  }

  function playerDamage() {
    return 20 + save.upgrades.power * 18;
  }

  function maxPlayerHp() {
    return 100 + save.upgrades.hp * 90;
  }

  function renderModes() {
    ui.modeGrid.innerHTML = "";
    for (const [label, desc, id] of modes) {
      const btn = document.createElement("button");
      btn.className = `mode-btn ${selectedMode === id ? "active" : ""}`;
      btn.innerHTML = `<strong>${label}</strong><small>${desc}</small>`;
      btn.addEventListener("click", () => {
        selectedMode = id;
        ui.modeHint.textContent = `${label} selected`;
        renderModes();
      });
      ui.modeGrid.appendChild(btn);
    }
  }

  function renderMaps() {
    if (!ui.mapGrid) return;
    const chosen = selectedMap === "random" ? null : maps.find(m => m.id === selectedMap);
    ui.mapHint.textContent = chosen ? `${chosen.name} selected` : `${maps.length} maps - random every match`;
    ui.mapGrid.innerHTML = "";
    const randomBtn = document.createElement("button");
    randomBtn.className = `map-btn ${selectedMap === "random" ? "active" : ""}`;
    randomBtn.style.setProperty("--map-a", "#1677ff");
    randomBtn.style.setProperty("--map-b", "#ff3d57");
    randomBtn.innerHTML = `<strong>Random Map</strong><small>Fresh arena every match</small>`;
    randomBtn.addEventListener("click", () => {
      selectedMap = "random";
      renderMaps();
    });
    ui.mapGrid.appendChild(randomBtn);
    for (const map of maps) {
      const btn = document.createElement("button");
      btn.className = `map-btn ${selectedMap === map.id ? "active" : ""}`;
      btn.style.setProperty("--map-a", map.a);
      btn.style.setProperty("--map-b", map.b);
      btn.innerHTML = `<strong>${map.name}</strong><small>${map.layout} layout - ${map.theme}</small>`;
      btn.addEventListener("click", () => {
        selectedMap = map.id;
        renderMaps();
      });
      ui.mapGrid.appendChild(btn);
    }
  }

  function renderRanked() {
    const unlocked = save.level >= 100;
    ui.rankedHomeText.textContent = unlocked
      ? `Placements ${save.ranked.placements}/10 - ${save.ranked.rank}`
      : `Unlocks at level 100 - current level ${save.level}`;
    ui.rankedGrid.innerHTML = "";
    ["1v1", "2v2", "3v3"].forEach(id => {
      const btn = document.createElement("button");
      btn.className = "mode-btn";
      btn.disabled = !unlocked;
      btn.innerHTML = `<strong>Ranked ${id}</strong><small>${unlocked ? "Queue" : "Level 100"}</small>`;
      btn.addEventListener("click", () => {
        selectedMode = id;
        rankedQueue = true;
        startMatch();
      });
      ui.rankedGrid.appendChild(btn);
    });
  }

  function renderPaths() {
    ui.pathStatus.textContent = allFinalsUnlocked()
      ? "All finals unlocked. Omni Invincible Final is available."
      : !save.activePath
        ? "Choose any path. You can switch paths whenever you want."
        : `${save.activePath} selected. Switch paths whenever you want.`;
    ui.pathGrid.innerHTML = "";
    for (const fam of families) {
      const path = fam[0];
      const progress = save.pathProgress[path] || 0;
      const complete = pathComplete(path);
      const active = save.activePath === path && !complete;
      const canChoose = !active;
      const card = document.createElement("article");
      card.className = `path-card ${active ? "active" : ""} ${complete ? "complete" : ""}`;
      card.innerHTML = `<div class="path-head"><strong>${path} Path</strong><span class="element-mark" style="background:${fam[1]}">${path[0]}</span></div>
        <small>${complete ? "Final unlocked" : `${progress}/20 unlocked`}</small>
        <div class="path-meter"><span style="width:${Math.min(100, progress / 20 * 100)}%"></span></div>`;
      const btn = document.createElement("button");
      btn.className = active ? "primary" : "ghost";
      btn.textContent = active ? "Current Path" : complete ? "Use Path" : "Choose Path";
      btn.disabled = active || !canChoose;
      btn.addEventListener("click", () => {
        save.activePath = path;
        if (!save.pathProgress[path]) {
          save.pathProgress[path] = 1;
          const first = pathElements(path)[0];
          if (!save.unlocked.includes(first.id)) save.unlocked.push(first.id);
        }
        const equipped = pathElements(path).filter(el => save.unlocked.includes(el.id)).at(-1);
        if (equipped) save.selected = equipped.id;
        persist();
        renderAll();
      });
      card.appendChild(btn);
      ui.pathGrid.appendChild(card);
    }
  }

  function renderUpgrades() {
    const meta = {
      speed: ["Speed", "Move and dodge faster by level 10."],
      power: ["Power", `Dodgeball damage: ${playerDamage()} / 200.`],
      magnet: ["Magnet", "Coin collection range grows wider."],
      hp: ["HP", `Max HP: ${maxPlayerHp()} / 1000.`]
    };
    ui.upgradeGrid.innerHTML = "";
    for (const [key, [label, desc]] of Object.entries(meta)) {
      const lvl = save.upgrades[key];
      const card = document.createElement("div");
      card.className = "upgrade-card";
      const pips = Array.from({ length: 10 }, (_, i) => `<i class="${i < lvl ? "on" : ""}"></i>`).join("");
      card.innerHTML = `<div class="upgrade-head"><strong>${label}</strong><span>${lvl}/10</span></div><small>${desc}</small><div class="pips">${pips}</div>`;
      const btn = document.createElement("button");
      btn.className = "upgrade-btn";
      btn.textContent = lvl >= 10 ? "Maxed" : `Upgrade - ${upgradeCost(key)} coins`;
      btn.disabled = lvl >= 10 || save.coins < upgradeCost(key);
      btn.addEventListener("click", () => {
        const cost = upgradeCost(key);
        if (save.coins >= cost && save.upgrades[key] < 10) {
          save.coins -= cost;
          save.upgrades[key]++;
          persist();
          renderUpgrades();
        }
      });
      card.appendChild(btn);
      ui.upgradeGrid.appendChild(card);
    }
  }

  function canUnlockElement(el) {
    if (el.path === "Omni") return allFinalsUnlocked();
    if (el.path !== save.activePath) return false;
    if (pathComplete(el.path)) return false;
    return el.index === (save.pathProgress[el.path] || 0);
  }

  function elementHTML(el, large = false) {
    const unlocked = save.unlocked.includes(el.id);
    const strength = el.path === "Omni" ? "ULTIMATE" : `${Math.round((el.mastery || 1) * 100)}%`;
    const pathText = el.path === "Omni"
      ? "Unlocked after every path final."
      : `Path ${el.index + 1}/20${el.final ? " - FINAL" : ""}`;
    return `<div class="element-top"><div class="element-mark" style="background:${el.color}">${el.family[0]}</div><span class="tier-pill">Tier ${el.tier}</span></div>
      <h3>${el.name}</h3>
      <small>${pathText} - Strength ${strength} - Power ${el.power}${unlocked ? " - unlocked" : ` - ${el.cost} coins`}</small>
      <div class="skill-tags ability-preview">${el.skills.map(s => `<span><b>${s.slot}</b><strong>${s.name}</strong><small>${s.description}</small></span>`).join("")}</div>
      ${large ? `<small><span class="path-note">${el.family}</span> style: ${abilitySummary(el.kind)}.</small>` : ""}`;
  }

  function abilitySummary(kind) {
    const map = {
      burn: "burning damage, explosive shots, area pressure",
      bubble: "traps, pull zones, protective movement",
      quake: "armor, shockwaves, temporary walls",
      chain: "voltage counters, arcing throws, stun pressure",
      freeze: "slows, freezes, shard bursts",
      curve: "fast movement, curving balls, wind zones",
      void: "stealth, marks, clone decoys",
      heal: "speed bursts, splash shots, healing",
      orbit: "orbiting balls and gravity control",
      root: "high leaps, rooting shots, overgrowth fields",
      poison: "low impact hits, long poison damage, toxic zones",
      metal: "magnet pulls, heavy balls, armor",
      plasma: "phasing, piercing balls, overload blasts",
      omni: "all element powers"
    };
    return map[kind] || "balanced skills";
  }

  function renderSelected() {
    const el = selectedElement();
    ui.selectedCard.innerHTML = el
      ? elementHTML(el, true)
      : `<div class="element-top"><div class="element-mark" style="background:#f2c14e">?</div><span class="tier-pill">No path</span></div>
        <h3>Choose Your Path</h3>
        <small>Pick any element path below. You can switch paths and keep every path's progress.</small>
        <div class="skill-tags"><span>Choose path</span><span>Switch anytime</span></div>`;
  }

  function selectedBallType() {
    return ballTypes.find(type => type.id === save.ballType) || ballTypes[1];
  }

  function selectedBallSkin() {
    return ballSkins.find(skin => skin.id === save.selectedSkin) || ballSkins[0];
  }

  function ballSwatch(skin, extraClass = "") {
    return `<span class="ball-swatch ${extraClass}" data-pattern="${skin.pattern}" style="--ball-primary:${skin.primary};--ball-secondary:${skin.secondary}"><i></i></span>`;
  }

  function renderSelectedBall() {
    if (!ui.selectedBallCard) return;
    const type = selectedBallType();
    const skin = selectedBallSkin();
    ui.selectedBallCard.innerHTML = `${ballSwatch(skin, "loadout-ball")}<div><small>DODGEBALL</small><strong>${type.name}</strong><span>${skin.name} · ${Math.round(type.damage * 100)}% damage · ${(1 / type.delay).toFixed(1)}/s</span></div>`;
  }

  function renderBallTypes() {
    if (!ui.ballTypeGrid) return;
    ui.ballTypeGrid.innerHTML = "";
    for (const type of ballTypes) {
      const card = document.createElement("article");
      const selected = save.ballType === type.id;
      card.className = `ball-type-card ${selected ? "selected" : ""}`;
      const damageWidth = Math.round(type.damage / 2.5 * 100);
      const fireWidth = Math.round((1 / type.delay) / (1 / ballTypes[0].delay) * 100);
      const range = Math.round(type.speed * type.life);
      card.innerHTML = `<div class="weapon-card-head"><span class="fire-mode-icon">${type.automatic ? "AUTO" : type.charge ? "1" : "SEMI"}</span><span>${type.role}</span></div>
        <h3>${type.name}</h3><p>${type.detail}</p>
        <div class="weapon-stat"><span>Damage <b>${Math.round(type.damage * 100)}%</b></span><i><em style="width:${damageWidth}%"></em></i></div>
        <div class="weapon-stat"><span>Fire rate <b>${(1 / type.delay).toFixed(1)}/s</b></span><i><em style="width:${fireWidth}%"></em></i></div>
        <div class="weapon-stat"><span>Velocity <b>${type.speed}</b></span><i><em style="width:${Math.round(type.speed / 760 * 100)}%"></em></i></div>
        <div class="weapon-stat"><span>Range <b>${range}</b></span><i><em style="width:${Math.round(range / 3040 * 100)}%"></em></i></div>`;
      const button = document.createElement("button");
      button.className = selected ? "ghost" : "primary";
      button.textContent = selected ? "Equipped" : "Equip";
      button.disabled = selected;
      button.addEventListener("click", () => {
        save.ballType = type.id;
        persist();
        renderBallTypes();
        renderSelectedBall();
      });
      card.appendChild(button);
      ui.ballTypeGrid.appendChild(card);
    }
  }

  function crateOddsText(crate) {
    return Object.entries(crate.chances).filter(([, chance]) => chance > 0).map(([rarity, chance]) => `${rarity} ${Math.round(chance * 100)}%`).join(" · ");
  }

  function rollCrate(crate) {
    const unowned = ballSkins.filter(skin => !save.skins.includes(skin.id));
    if (!unowned.length) return null;
    let roll = Math.random();
    let rarity = "Common";
    for (const [name, chance] of Object.entries(crate.chances)) {
      roll -= chance;
      if (roll <= 0) { rarity = name; break; }
    }
    return unowned.filter(skin => skin.rarity === rarity)[Math.floor(Math.random() * unowned.filter(skin => skin.rarity === rarity).length)] || unowned[Math.floor(Math.random() * unowned.length)];
  }

  function openCrate(crate) {
    if (crateOpening || save.coins < crate.cost || save.skins.length >= ballSkins.length) return;
    crateOpening = true;
    save.coins -= crate.cost;
    persist();
    ui.shopNotice.textContent = `Opening ${crate.name}...`;
    renderShop();
    window.setTimeout(() => {
      const reward = rollCrate(crate);
      if (reward) {
        save.skins.push(reward.id);
        save.selectedSkin = reward.id;
        ui.shopNotice.textContent = `${reward.rarity} unlocked: ${reward.name}`;
        playSound("coin", 1.25);
      }
      crateOpening = false;
      persist();
      renderShop();
      renderSelectedBall();
    }, 700);
  }

  function renderShop() {
    if (!ui.crateGrid || !ui.skinGrid) return;
    const collectionComplete = save.skins.length >= ballSkins.length;
    ui.crateGrid.innerHTML = "";
    for (const crate of crateTypes) {
      const card = document.createElement("article");
      card.className = `crate-card ${crateOpening ? "opening" : ""}`;
      card.style.setProperty("--crate-accent", crate.accent);
      card.innerHTML = `<div class="crate-case"><i></i><span>DW</span></div><div class="crate-copy"><h3>${crate.name}</h3><p>${crateOddsText(crate)}</p></div>`;
      const button = document.createElement("button");
      button.className = "primary";
      button.textContent = collectionComplete ? "Collection Complete" : `${crate.cost} Coins`;
      button.disabled = crateOpening || collectionComplete || save.coins < crate.cost;
      button.addEventListener("click", () => openCrate(crate));
      card.appendChild(button);
      ui.crateGrid.appendChild(card);
    }
    ui.skinGrid.innerHTML = "";
    for (const skin of ballSkins) {
      const owned = save.skins.includes(skin.id);
      const equipped = save.selectedSkin === skin.id;
      const card = document.createElement("article");
      card.className = `skin-card rarity-${skin.rarity.toLowerCase()} ${equipped ? "selected" : ""}`;
      card.innerHTML = `${ballSwatch(skin)}<div class="skin-copy"><span>${skin.rarity}</span><h3>${skin.name}</h3></div>`;
      const button = document.createElement("button");
      button.className = owned ? "ghost" : "primary";
      button.textContent = equipped ? "Equipped" : owned ? "Equip" : `${skin.price} Coins`;
      button.disabled = equipped || (!owned && save.coins < skin.price) || crateOpening;
      button.addEventListener("click", () => {
        if (!owned) {
          if (save.coins < skin.price) return;
          save.coins -= skin.price;
          save.skins.push(skin.id);
          ui.shopNotice.textContent = `Purchased ${skin.name}`;
        }
        save.selectedSkin = skin.id;
        persist();
        renderShop();
        renderSelectedBall();
      });
      card.appendChild(button);
      ui.skinGrid.appendChild(card);
    }
  }

  function renderElements() {
    const search = ui.search.value.trim().toLowerCase();
    const tier = ui.tier.value;
    let pool;
    if (!save.activePath) {
      pool = elements.filter(el => el.path !== "Omni" && el.index === 0 && !pathComplete(el.path));
    } else {
      pool = elements.filter(el => el.path === save.activePath || (el.path === "Omni" && allFinalsUnlocked()));
    }
    const shown = pool.filter(el =>
      (!search || el.name.toLowerCase().includes(search) || el.family.toLowerCase().includes(search)) &&
      (tier === "all" || String(el.tier) === tier)
    );
    ui.elementGrid.innerHTML = "";
    for (const el of shown) {
      const unlocked = save.unlocked.includes(el.id);
      const next = canUnlockElement(el);
      const card = document.createElement("article");
      card.className = `element-card ${unlocked ? "" : "locked"} ${save.selected === el.id ? "selected" : ""}`;
      card.innerHTML = elementHTML(el);
      const btn = document.createElement("button");
      btn.className = unlocked ? "primary" : "buy-btn";
      btn.textContent = unlocked ? "Select" : next || el.path === "Omni" ? `Unlock ${el.cost}` : "Path Locked";
      btn.disabled = (!unlocked && (!next || save.coins < el.cost) && el.path !== "Omni") || (el.path === "Omni" && !allFinalsUnlocked());
      btn.addEventListener("click", () => {
        if (!unlocked) {
          if (el.path === "Omni") {
            if (!allFinalsUnlocked()) return;
            save.ultimateUnlocked = true;
          } else {
            if (!next || save.coins < el.cost) return;
            save.coins -= el.cost;
            if (!save.activePath) save.activePath = el.path;
            save.pathProgress[el.path] = Math.max(save.pathProgress[el.path] || 0, el.index + 1);
            if (el.final && !save.pathFinals.includes(el.path)) save.pathFinals.push(el.path);
          }
          save.unlocked.push(el.id);
        }
        save.selected = el.id;
        persist();
        renderAll();
      });
      card.appendChild(btn);
      ui.elementGrid.appendChild(card);
    }
  }

  function makeActor(x, y, team, element, ai = 0, name = "You") {
    const player = team === "player";
    const adaptive = Math.min(6, Math.max(0, save.skillRating || 1));
    const hpMax = player ? maxPlayerHp() : 100 + Math.max(0, element.tier - 1) * 46 + (ai + adaptive) * 18;
    return {
      x, y, px: x, py: y, vx: 0, vy: 0, r: player && element.kind === "omni" ? 21 : 18,
      team, element, ai, name, hp: hpMax, hpMax, alive: true,
      ballType: player ? save.ballType : ballTypes[(element.index + ai) % ballTypes.length].id,
      skinId: player ? save.selectedSkin : ballSkins[(element.index * 3 + ai) % ballSkins.length].id,
      angle: team === "player" ? 0 : Math.PI, pitch: 0,
      lookAngle: team === "player" ? 0 : Math.PI, lookPitch: 0,
      speed: player ? 210 + save.upgrades.speed * 24 : 150 + ai * 20 + adaptive * 8,
      throwCd: 0, skillCd: [0, 0, 0], shield: 0, dash: 0, invuln: 0, stamina: player ? 100 : 80,
      techniqueCd: 0, air: 0, z: 0, vz: 0, jumpCd: 0, dodgeCd: 0, dive: 0, throwAnim: 0, skillAnim: 0, charge: 0,
      counterWindow: 0, nullField: 0, powerBuff: 0, throwHaste: 0, sprinting: false,
      chargeGoal: 0,
      status: { burn: 0, poison: 0, slow: 0, stun: 0, root: 0, mark: 0 }, target: null, invisible: 0, clone: null,
      aimBias: Math.random() * Math.PI * 2
    };
  }

  function startMatch() {
    const el = selectedElement();
    if (!el) {
      alert("Choose an element path first. After that, you are locked into that path until its Final.");
      return;
    }
    const winner = online.connected
      ? (voteOptions.some(entry => entry.voters.length) ? winningVote().map : maps.find(map => map.id === votedMapId))
      : null;
    const syncedMap = online.connected && online.matchConfig ? maps.find(map => map.id === online.matchConfig.mapId) : null;
    const matchMap = syncedMap || winner || (selectedMap === "random"
      ? maps[Math.floor(Math.random() * maps.length)]
      : maps.find(m => m.id === selectedMap) || maps[0]);
    const blueSpawn = matchMap.spawns.blue[0];
    const player = makeActor(blueSpawn.x, blueSpawn.y, "player", el, 0, save.username || "Player");
    player.spawnSide = "blue";
    player.spawnIndex = 0;
    const roster = [player];
    const modeCounts = { "1v1": 1, "2v2": 3, "3v3": 5, tdm: 5, ctf: 4, koth: 4, ffa: 5 };
    const allyCounts = { "2v2": 1, "3v3": 2, tdm: 2, ctf: 2, koth: 2 };
    const realOnlineMatch = online.connected && Object.keys(online.peers).length > 0;
    const count = realOnlineMatch ? 0 : (modeCounts[selectedMode] || 5);
    const allyCount = allyCounts[selectedMode] || 0;
    const baseAi = Math.max(1, Math.round(save.skillRating || 1));
    let allyIndex = 1;
    let enemyIndex = 0;
    for (let i = 0; i < count; i++) {
      const skill = Math.min(7, baseAi + Math.floor(i / 2) + Math.floor(Math.random() * 2));
      const tierMin = Math.min(5, Math.max(1, Math.ceil(skill / 1.6)));
      const available = elements.filter(e => e.path !== "Omni" && e.tier <= Math.min(5, tierMin + 1) && e.tier >= Math.max(1, tierMin - 1));
      const npcEl = available[Math.floor(Math.random() * available.length)];
      const team = i < allyCount ? "ally" : "npc";
      const spawnSide = team === "ally" ? "blue" : "red";
      const spawnIndex = team === "ally" ? allyIndex++ : enemyIndex++;
      const spawn = matchMap.spawns[spawnSide][spawnIndex % matchMap.spawns[spawnSide].length];
      const actor = makeActor(spawn.x, spawn.y, team, npcEl, skill, team === "ally" ? `Ally ${spawnIndex}` : `NPC ${spawnIndex + 1}`);
      actor.throwCd = .8 + Math.random() * 1.8 + enemyIndex * .16;
      actor.spawnSide = spawnSide;
      actor.spawnIndex = spawnIndex;
      roster.push(actor);
    }
    state = {
      player, players: roster, balls: [], coins: [], particles: [], damagePopups: [], walls: [], powerups: [],
      mode: selectedMode, map: matchMap, mapBlocks: matchMap.obstacles.map(o => ({ ...o })),
      techniques: (matchMap.techniques || []).map(t => ({ ...t })),
      hazards: (matchMap.hazards || []).map(h => ({ ...h })),
      ranked: rankedQueue, hill: 0, time: 0, spawnTimer: 5, hitConfirm: 0, round: 1, roundWins: { blue: 0, red: 0 }, roundTransition: 0,
      earnedCoins: 0, earnedXp: 0, hits: 0, throws: 0, dodges: 0, damageTaken: 0, damageDealt: 0, over: false,
      flag: { x: W - 90, y: H / 2, held: false }
    };
    combatUi.result.hidden = true;
    combatUi.messages.innerHTML = "";
    combatUi.chat.classList.toggle("connected", online.connected);
    rankedQueue = false;
    lastTime = 0;
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    ui.game.classList.add("active");
    ui.matchMode.textContent = modes.find(m => m[2] === selectedMode)?.[0] || "Free For All";
    ui.matchStatus.textContent = `${matchMap.name}  |  FIRST TO ${ROUND_TARGET}  |  AI ${save.skillRating.toFixed(1)}`;
    renderRoundScoreboard();
    renderSkillList(true);
    sendOnline({ type: "matchstart", mapId: matchMap.id, mode: selectedMode, name: save.username || "Player" });
    enterImmersiveMode();
    requestAnimationFrame(loop);
  }

  function damageFor(actor) {
    const elementBonus = actor.element.path === "Omni" ? 65 : Math.round(actor.element.power * .22);
    const base = actor.team === "player"
      ? playerDamage() + elementBonus
      : 13 + actor.ai * 7 + actor.element.tier * 4 + elementBonus * .55 + Math.floor((save.skillRating || 1) * 2);
    return base * ((actor.powerBuff || 0) > 0 ? 1.28 : 1);
  }

  function throwBall(owner, tx, ty, special = 0, opts = {}) {
    if (!owner.alive || !state) return null;
    const ballLimit = save.settings.quality === "high" ? 52 : save.settings.quality === "balanced" ? 38 : 28;
    if (state.balls.length >= ballLimit) state.balls.splice(0, state.balls.length - ballLimit + 1);
    const dx = tx - owner.x;
    const dy = ty - owner.y;
    const d = Math.hypot(dx, dy) || 1;
    const speed = opts.speed || (420 + owner.element.tier * 24 + special * 60);
    const skinId = opts.skinId || owner.skinId || (owner.team === "player" ? save.selectedSkin : "standard");
    const ball = {
      x: owner.x + dx / d * 26, y: owner.y + dy / d * 26, px: owner.x, py: owner.y,
      vx: dx / d * speed, vy: dy / d * speed, r: opts.r || (special === 2 ? 15 : 10),
      owner, team: owner.team, damage: opts.rawDamage ? opts.damage : (opts.damage || damageFor(owner)) * (special === 1 ? 1.45 : 1),
      life: opts.life || (1.9 + special * .35), color: opts.color || owner.element.color,
      skinId: ballSkins.some(skin => skin.id === skinId) ? skinId : "standard",
      effect: opts.effect || owner.element.kind, pierce: opts.pierce || 0, homing: opts.homing || 0,
      curve: opts.curve || 0, gravity: opts.gravity || 0, bounces: opts.bounces ?? 0, split: opts.split || false,
      special, leech: opts.leech || 0,
      z: (owner.z || 0) + 30,
      vz: -Math.sin(owner.pitch || 0) * speed * .72,
      remoteHits: new Set(),
      spin: rand(0, Math.PI * 2), spinSpeed: rand(7, 14) * (Math.random() < .5 ? -1 : 1)
    };
    owner.throwAnim = .55;
    owner.recoil = .18;
    owner.lastThrowColor = (ballSkins.find(skin => skin.id === ball.skinId) || ballSkins[0]).primary;
    owner.lastThrowSkin = ball.skinId;
    owner.lastThrowCharge = opts.charge || 0;
    state.balls.push(ball);
    state.throws += owner.team === "player" ? 1 : 0;
    if (owner.team === "player" && !opts.remote) {
      sendOnline({
        type: "throw",
        x: owner.x,
        y: owner.y,
        tx,
        ty,
        special,
        element: owner.element.id,
        color: ball.color,
        skinId: ball.skinId,
        charge: opts.charge || 0,
        pitch: owner.pitch || 0,
        effect: ball.effect,
        damage: ball.damage,
        speed,
        radius: ball.r,
        life: ball.life,
        pierce: ball.pierce,
        homing: ball.homing,
        curve: ball.curve,
        bounces: ball.bounces,
        split: ball.split
      });
    }
    puff(ball.x, ball.y, ball.color, 5);
    if (owner.team === "player") playSound("throw", special ? 1.2 : .7);
    return ball;
  }

  function spawnBallImpact(ball, reason, surfaceColor = "#aeb6b2") {
    if (!state || !ball) return;
    const effectLimit = save.settings.quality === "high" ? 86 : save.settings.quality === "balanced" ? 60 : 40;
    if (state.particles.length >= effectLimit) {
      const disposable = state.particles.findIndex(particle => particle.type !== "field");
      if (disposable >= 0) state.particles.splice(disposable, 1);
      else return;
    }
    state.particles.push({
      type: reason === "fade" ? "vanish" : "impact",
      x: ball.x,
      y: ball.y,
      z: ball.z || 0,
      r: Math.max(10, ball.r * 1.35),
      life: reason === "fade" ? .28 : .42,
      maxLife: reason === "fade" ? .28 : .42,
      color: ball.color,
      surfaceColor,
      reason
    });
    if (reason !== "fade") puff(ball.x, ball.y, ball.color, reason === "wall" ? 3 : 2);
  }

  function markBallGone(ball, reason = "fade", surfaceColor) {
    if (!ball || ball.gone) return;
    ball.gone = true;
    ball.life = 0;
    spawnBallImpact(ball, reason, surfaceColor);
  }

  function useSkill(index) {
    const p = state?.player;
    if (!p || p.skillCd[index] > 0 || !p.alive) return;
    p.skillCd[index] = p.element.skills[index].cd;
    const aim = aimPoint();
    performSkill(p, index, aim.x, aim.y);
    playSound("skill", 1);
  }

  function fireWeaponShot() {
    const p = state?.player;
    if (!p || !p.alive || p.throwCd > 0) return;
    const weapon = ballTypes.find(type => type.id === p.ballType) || selectedBallType();
    const charge = weapon.charge ? clamp(p.charge || 0, 0, 1) : 0;
    const staminaCost = weapon.stamina + charge * 8;
    if (p.stamina < staminaCost) return;
    const aim = aimPoint();
    throwBall(p, aim.x, aim.y, 0, {
      charge,
      damage: damageFor(p) * weapon.damage * (1 + charge * .5),
      speed: weapon.speed + charge * 100,
      r: weapon.radius + charge * 3,
      life: weapon.life + charge * .55,
      pierce: weapon.id === "one" && charge > .92 ? 1 : 0,
      skinId: p.skinId
    });
    p.throwCd = weapon.delay * ((p.throwHaste || 0) > 0 ? .58 : 1);
    p.stamina -= staminaCost;
    p.charge = 0;
  }

  function tuneElementShot(kind, stage, options) {
    const tuned = { ...options };
    const direction = stage % 2 ? 1 : -1;
    const scaleDamage = multiplier => {
      if (Number.isFinite(tuned.damage)) tuned.damage *= multiplier;
    };
    if (kind === "burn") {
      scaleDamage(1.12);
      tuned.r = (tuned.r || 11) + 2;
      tuned.gravity = (tuned.gravity || 0) + 24;
    } else if (kind === "bubble") {
      scaleDamage(.8);
      tuned.homing = Math.max(tuned.homing || 0, .18 + stage * .008);
      tuned.life = (tuned.life || 2.2) + .55;
      tuned.r = (tuned.r || 11) + 3;
    } else if (kind === "quake") {
      scaleDamage(1.08);
      tuned.speed = (tuned.speed || 480) * .78;
      tuned.r = (tuned.r || 11) + 6;
      tuned.bounces = Math.min(tuned.bounces ?? 1, 1);
    } else if (kind === "chain") {
      scaleDamage(.86);
      tuned.speed = (tuned.speed || 480) * 1.12;
      tuned.homing = Math.max(tuned.homing || 0, .12 + stage * .006);
      tuned.pierce = Math.max(tuned.pierce || 0, stage >= 12 ? 2 : 1);
    } else if (kind === "freeze") {
      scaleDamage(.88);
      tuned.speed = (tuned.speed || 480) * .86;
      tuned.r = (tuned.r || 11) + 4;
      tuned.life = (tuned.life || 2.1) + .35;
    } else if (kind === "curve") {
      tuned.curve = (tuned.curve || 0) + direction * (5.5 + stage * .13);
      tuned.bounces = (tuned.bounces ?? 2) + 2;
      tuned.life = (tuned.life || 2.1) + .45;
    } else if (kind === "void") {
      scaleDamage(.9);
      tuned.pierce = (tuned.pierce || 0) + 2;
      tuned.life = (tuned.life || 2.1) + .7;
      tuned.r = Math.max(8, (tuned.r || 11) - 2);
    } else if (kind === "heal") {
      scaleDamage(.9);
      tuned.leech = .22 + stage * .007;
      tuned.speed = (tuned.speed || 480) * 1.04;
    } else if (kind === "orbit") {
      scaleDamage(.92);
      tuned.homing = Math.max(tuned.homing || 0, .42 + stage * .012);
      tuned.curve = (tuned.curve || 0) + direction * 4.5;
      tuned.life = (tuned.life || 2.1) + .8;
    } else if (kind === "root") {
      scaleDamage(.84);
      tuned.r = (tuned.r || 11) + 3;
      tuned.life = (tuned.life || 2.1) + .5;
      tuned.split = tuned.split || stage >= 15;
    } else if (kind === "poison") {
      scaleDamage(.62);
      tuned.speed = (tuned.speed || 480) * .76;
      tuned.life = (tuned.life || 2.1) + 1.2;
      tuned.homing = Math.max(tuned.homing || 0, .1);
    } else if (kind === "metal") {
      scaleDamage(1.18);
      tuned.speed = (tuned.speed || 480) * .72;
      tuned.r = (tuned.r || 11) + 8;
      tuned.bounces = (tuned.bounces ?? 1) + 3;
    } else if (kind === "plasma") {
      scaleDamage(1.06);
      tuned.speed = (tuned.speed || 480) * 1.28;
      tuned.pierce = (tuned.pierce || 0) + 3;
      tuned.r = Math.max(8, (tuned.r || 11) - 1);
    } else if (kind === "omni") {
      scaleDamage(1.25);
      tuned.speed = (tuned.speed || 520) * 1.24;
      tuned.homing = Math.max(tuned.homing || 0, .5);
      tuned.pierce = (tuned.pierce || 0) + 4;
      tuned.bounces = (tuned.bounces ?? 2) + 2;
      tuned.leech = .3;
    }
    return tuned;
  }

  function performSkill(actor, index, tx, ty) {
    const kind = actor.element.kind;
    const skill = actor.element.skills[index];
    const action = skill.action;
    const pattern = skill.pattern || action;
    const stage = Math.max(0, Math.min(20, actor.element.index || 0));
    actor.skillAnim = .75;
    actor.lastSkillIndex = index;
    actor.lastSkillAction = action;
    if (actor.team === "player") sendOnline({ type: "skill", index, action, element: actor.element.id });
    const mastery = actor.element.path === "Omni" ? 2.4 : (actor.element.mastery || 1);
    const tuning = 1 + (skill.variant % 7) * .025;
    const dx = tx - actor.x;
    const dy = ty - actor.y;
    const d = Math.hypot(dx, dy) || 1;
    const forward = { x: dx / d, y: dy / d };
    const aimAngle = Math.atan2(forward.y, forward.x);
    const shoot = (offset = 0, options = {}) => throwBall(
      actor,
      actor.x + Math.cos(aimAngle + offset) * 900,
      actor.y + Math.sin(aimAngle + offset) * 900,
      options.special || 1,
      { effect: kind, color: actor.element.color, ...tuneElementShot(kind, stage, options) }
    );
    const field = (radius, life, effect = kind, x = actor.x, y = actor.y) => state.particles.push({
      type: "field", x, y, r: 20, max: radius * tuning, life, color: actor.element.color, effect, owner: actor
    });

    if (index === 0) {
      const hostileBalls = radius => state.balls.filter(ball =>
        ball.life > 0 && ball.owner !== actor && !friendlyFireBlocked(actor, ball) && dist(actor, ball) < radius
      );
      const reflectBalls = (radius, destroy = false) => {
        for (const ball of hostileBalls(radius)) {
          if (destroy) {
            markBallGone(ball, "blocked");
            continue;
          }
          ball.owner = actor;
          ball.team = actor.team;
          ball.vx *= -1.18;
          ball.vy *= -1.18;
          ball.pierce = Math.max(ball.pierce, 1);
          ball.color = actor.element.color;
        }
      };
      const nearbyEnemies = radius => state.players.filter(target =>
        target.alive && target !== actor && (state.mode === "ffa" || !friendlyTeam(target, actor)) && dist(actor, target) < radius
      );
      switch (pattern) {
        case "guard-plate": actor.shield = Math.max(actor.shield, 1.35 * mastery); break;
        case "counter-window": actor.counterWindow = Math.max(actor.counterWindow || 0, 1.2 + mastery * .18); reflectBalls(105 + stage * 2); break;
        case "cleanse-pulse": for (const key of Object.keys(actor.status)) actor.status[key] = 0; actor.shield = Math.max(actor.shield, .45); break;
        case "ammo-surge": actor.throwCd = 0; actor.throwHaste = Math.max(actor.throwHaste || 0, 3 + mastery); break;
        case "decoy-cast": actor.clone = { x: actor.x + forward.x * 34, y: actor.y + forward.y * 34, life: 3.4 + mastery }; break;
        case "null-dome": actor.nullField = Math.max(actor.nullField || 0, 1.5 + mastery * .2); reflectBalls(125 + stage * 3, true); break;
        case "focus-mode": actor.powerBuff = Math.max(actor.powerBuff || 0, 3.6 + mastery); break;
        case "recovery-seal": actor.hp = Math.min(actor.hpMax, actor.hp + 52 + stage * 4); break;
        case "reflect-field": actor.counterWindow = Math.max(actor.counterWindow || 0, 2 + mastery * .2); reflectBalls(170 + stage * 3); break;
        case "trap-rune": field(82 + stage * 2, 3.2, kind, actor.x + forward.x * (105 + stage * 2), actor.y + forward.y * (105 + stage * 2)); break;
        case "overcharge": actor.stamina = 100; actor.throwHaste = Math.max(actor.throwHaste || 0, 4.2 + mastery); break;
        case "shock-guard": actor.shield = Math.max(actor.shield, 1.8 + mastery * .2); field(105 + stage * 2, 1.6, "chain"); break;
        case "ward-wall": state.walls.push({ x: actor.x + forward.x * 88, y: actor.y + forward.y * 88, w: 120 + stage * 2, h: 26, a: aimAngle, life: 4.8 + mastery, color: actor.element.color }); break;
        case "ball-recall": for (const ball of state.balls.filter(ball => ball.owner === actor)) { const a = Math.atan2(actor.y - ball.y, actor.x - ball.x); const speed = Math.max(520, Math.hypot(ball.vx, ball.vy)); ball.vx = Math.cos(a) * speed; ball.vy = Math.sin(a) * speed; ball.bounces += 2; } break;
        case "power-channel": actor.powerBuff = Math.max(actor.powerBuff || 0, 6 + mastery * .8); actor.shield = Math.max(actor.shield, .65); break;
        case "time-lock": for (const target of nearbyEnemies(215 + stage * 4)) target.status.slow = Math.max(target.status.slow, 2.4 + stage * .05); field(145 + stage * 3, 1.8, "freeze"); break;
        case "second-life": actor.hp = Math.min(actor.hpMax, actor.hp + 125 + stage * 6); actor.invuln = Math.max(actor.invuln, .8); break;
        case "hunter-mark": { const targets = nearbyEnemies(460).sort((a, b) => dist(actor, a) - dist(actor, b)); if (targets[0]) targets[0].status.mark = Math.max(targets[0].status.mark, 5 + stage * .12); } break;
        case "perfect-guard": actor.shield = Math.max(actor.shield, 3 + mastery * .4); actor.invuln = Math.max(actor.invuln, .55); actor.nullField = Math.max(actor.nullField || 0, .9); reflectBalls(210 + stage * 3, true); break;
        case "final-form": actor.shield = Math.max(actor.shield, 4); actor.invuln = Math.max(actor.invuln, .9); actor.counterWindow = Math.max(actor.counterWindow || 0, 3); actor.powerBuff = Math.max(actor.powerBuff || 0, 7); actor.throwHaste = Math.max(actor.throwHaste || 0, 7); actor.hp = Math.min(actor.hpMax, actor.hp + 180); reflectBalls(260); break;
      }
      const identityPower = 1 + stage * .035;
      if (kind === "burn") {
        field(62 + stage * 2, 1.5 + stage * .025, "burn");
      } else if (kind === "bubble") {
        actor.shield = Math.max(actor.shield, .8 + stage * .045);
        field(62 + stage * 2, 1.15, "bubble");
      } else if (kind === "quake") {
        actor.shield = Math.max(actor.shield, .45 + stage * .025);
        shockwave(actor.x, actor.y, 58 + stage * 2.4, actor);
      } else if (kind === "chain") {
        field(72 + stage * 2, 1.15, "chain");
      } else if (kind === "freeze") {
        actor.status.slow = 0;
        field(66 + stage * 2, 1.4 + stage * .03, "freeze");
      } else if (kind === "curve") {
        actor.stamina = Math.min(100, actor.stamina + 14 + stage);
        actor.counterWindow = Math.max(actor.counterWindow || 0, .65 + stage * .015);
        reflectBalls(95 + stage * 2);
      } else if (kind === "void") {
        actor.invisible = Math.max(actor.invisible, .65 + stage * .035);
        actor.clone = { x: actor.x + forward.x * 42, y: actor.y + forward.y * 42, life: 1.8 + stage * .05 };
      } else if (kind === "heal") {
        actor.hp = Math.min(actor.hpMax, actor.hp + 20 + stage * 3.2);
        field(50 + stage, .9, "heal");
      } else if (kind === "orbit") {
        for (const ball of state.balls) {
          if (ball.owner === actor || friendlyFireBlocked(actor, ball) || dist(actor, ball) > 155 + stage * 3) continue;
          const away = Math.atan2(ball.y - actor.y, ball.x - actor.x);
          ball.vx += Math.cos(away) * 260 * identityPower;
          ball.vy += Math.sin(away) * 260 * identityPower;
          ball.curve += stage % 2 ? 4 : -4;
        }
      } else if (kind === "root") {
        field(58 + stage * 2.2, 1.35 + stage * .03, "root");
      } else if (kind === "poison") {
        field(70 + stage * 2.2, 2.1 + stage * .045, "poison");
      } else if (kind === "metal") {
        actor.shield = Math.max(actor.shield, 1.15 + stage * .05);
        reflectBalls(105 + stage * 2);
      } else if (kind === "plasma") {
        actor.invuln = Math.max(actor.invuln, .28 + stage * .012);
        shoot(0, { damage: damageFor(actor) * .32, speed: 940, r: 7, pierce: 4, special: 1 });
      } else if (kind === "omni") {
        actor.invuln = Math.max(actor.invuln, .7);
        actor.shield = Math.max(actor.shield, 2.2);
        actor.hp = Math.min(actor.hpMax, actor.hp + 90);
        actor.invisible = Math.max(actor.invisible, .8);
        actor.powerBuff = Math.max(actor.powerBuff || 0, 5);
        actor.counterWindow = Math.max(actor.counterWindow || 0, 2.5);
        field(110, 2, "omni");
      }
      puff(actor.x, actor.y, actor.element.color, 9);
      return;
    }

    if (index === 1) {
      const base = damageFor(actor) * mastery * tuning;
      switch (pattern) {
        case "quick": shoot(0, { damage: base * .72, speed: 760, special: 0 }); break;
        case "heavy": shoot(0, { damage: base * 1.65, speed: 340, r: 19, bounces: 0 }); break;
        case "scatter": for (const a of [-.16, 0, .16]) shoot(a, { damage: base * .58, speed: 520 }); break;
        case "pierce": shoot(0, { damage: base * 1.08, speed: 650, pierce: 3 }); break;
        case "homing": shoot(0, { damage: base * .9, speed: 430, homing: .72 }); break;
        case "ricochet": shoot(0, { damage: base, speed: 610, bounces: 6, life: 3.4 }); break;
        case "split": shoot(0, { damage: base * .92, speed: 500, split: true, r: 15 }); break;
        case "curve-shot": shoot((skill.variant % 2 ? 1 : -1) * .12, { damage: base * 1.1, speed: 590, curve: (skill.variant % 2 ? 1 : -1) * 8 }); break;
        case "burst": for (const a of [-.05, 0, .05]) shoot(a, { damage: base * .62, speed: 620 + a * 300 }); break;
        case "lob": shoot(0, { damage: base * 1.48, speed: 310, r: 17, life: 3, split: true }); break;
        case "drain": shoot(0, { damage: base * .88, speed: 520, homing: .22 }); actor.hp = Math.min(actor.hpMax, actor.hp + 18 * mastery); break;
        case "chain-shot": shoot(0, { damage: base * .92, speed: 560, homing: .3, pierce: 2, effect: "chain" }); break;
        case "mine": shoot(0, { damage: base * 1.7, speed: 150, r: 22, life: 4.6, bounces: 0, split: true }); break;
        case "orbit-shot": for (const a of [-.24, .24]) shoot(a, { damage: base * .7, speed: 390, homing: .82, curve: a * 12 }); break;
        case "sniper": shoot(0, { damage: base * 1.75, speed: 920, r: 9, pierce: 1, bounces: 0 }); break;
        case "wave": for (const a of [-.28, -.14, 0, .14, .28]) shoot(a, { damage: base * .42, speed: 500 }); break;
        case "boomerang": shoot(.18, { damage: base * 1.12, speed: 560, curve: -11, homing: .24, life: 3.2 }); break;
        case "execution": shoot(0, { damage: base * 2.05, speed: 720, r: 12, bounces: 0 }); break;
        case "annihilator": for (const a of [-.36, -.24, -.12, 0, .12, .24, .36]) shoot(a, { damage: base * .48, speed: 650, pierce: 1 }); break;
        case "worldbreaker": shoot(0, { damage: base * 2.8, speed: 520, r: 27, pierce: 5, split: true, life: 3.5 }); break;
      }
      puff(actor.x + forward.x * 30, actor.y + forward.y * 30, actor.element.color, 12);
      return;
    }

    const base = damageFor(actor) * mastery * tuning;
    const radial = (count, damageScale, options = {}) => {
      for (let i = 0; i < count; i++) shoot(i / count * Math.PI * 2, { damage: base * damageScale, special: 2, ...options });
    };
    switch (pattern) {
      case "nova": radial(6, .68, { speed: 520 }); break;
      case "field": field(120 + mastery * 30, 3.4); actor.shield = Math.max(actor.shield, .7 * mastery); break;
      case "wall": state.walls.push({ x: actor.x + forward.x * 85, y: actor.y + forward.y * 85, w: 150, h: 26, a: aimAngle, life: 6, color: actor.element.color }); break;
      case "barrage": for (const a of [-.26, -.13, 0, .13, .26]) shoot(a, { damage: base * .62, speed: 580, special: 2 }); break;
      case "ground-zero": shockwave(actor.x, actor.y, 145 + mastery * 45, actor); actor.shield = Math.max(actor.shield, 1.2 * mastery); break;
      case "healstorm": actor.hp = Math.min(actor.hpMax, actor.hp + 120 * mastery); actor.stamina = 100; field(105, 2.8, "heal"); break;
      case "cyclone-domain": field(155, 3.8, "curve"); radial(4, .62, { curve: 8, speed: 460 }); break;
      case "fortress": actor.shield = Math.max(actor.shield, 3 * mastery); for (const a of [-.7, 0, .7]) state.walls.push({ x: actor.x + Math.cos(aimAngle + a) * 82, y: actor.y + Math.sin(aimAngle + a) * 82, w: 92, h: 24, a: aimAngle + a, life: 7, color: actor.element.color }); break;
      case "meteor": for (const a of [-.32, -.16, 0, .16, .32]) shoot(a, { damage: base * .85, speed: 300 + Math.abs(a) * 260, r: 18, split: true, special: 2 }); break;
      case "mirror": actor.clone = { x: actor.x - forward.x * 70, y: actor.y - forward.y * 70, life: 5 }; for (const a of [-.2, 0, .2]) shoot(a, { damage: base * .7, homing: .35, special: 2 }); break;
      case "orbital": radial(5, .72, { homing: .9, speed: 390, life: 4 }); break;
      case "sniper-storm": for (const a of [-.12, -.06, 0, .06, .12]) shoot(a, { damage: base * .82, speed: 900, r: 9, pierce: 1, special: 2 }); break;
      case "cataclysm": for (const a of [-.06, 0, .06]) shoot(a, { damage: base * 1.15, speed: 720, pierce: 4, r: 14, special: 2 }); break;
      case "limit": actor.powerBuff = Math.max(actor.powerBuff || 0, 5); actor.throwHaste = Math.max(actor.throwHaste || 0, 5); actor.shield = Math.max(actor.shield, 1.6 * mastery); actor.stamina = 100; for (const a of [-.18, 0, .18]) shoot(a, { damage: base * .72, speed: 650, special: 2 }); break;
      case "sanctuary": actor.hp = Math.min(actor.hpMax, actor.hp + 180 * mastery); actor.shield = Math.max(actor.shield, 2.2 * mastery); field(145, 4.2, "heal"); break;
      case "worldfield": field(220, 5.2); shockwave(actor.x, actor.y, 170, actor); break;
      case "singularity": shoot(0, { damage: base * 1.7, speed: 330, r: 25, homing: 1.15, pierce: 5, life: 5, special: 2 }); field(130, 3, "orbit"); break;
      case "total-annihilation": radial(10, .72, { speed: 610, pierce: 2 }); break;
      case "judgment": shoot(0, { damage: base * 3.1, speed: 820, r: 24, pierce: 8, bounces: 0, special: 2 }); break;
      case "absolute": actor.hp = actor.hpMax; actor.shield = Math.max(actor.shield, 4); actor.invuln = 1.2; radial(12, .88, { speed: 680, homing: .35, pierce: 3 }); field(250, 6, "omni"); break;
    }
    if (kind === "burn") {
      field(135 + stage * 4, 3.4 + stage * .06, "burn");
      radial(2 + Math.floor(stage / 10), .34, { speed: 420, r: 13 });
    } else if (kind === "bubble") {
      actor.shield = Math.max(actor.shield, 1.5 + stage * .08);
      field(150 + stage * 3.5, 4 + stage * .04, "bubble");
    } else if (kind === "quake") {
      shockwave(actor.x, actor.y, 175 + stage * 5, actor);
      state.walls.push({ x: actor.x + forward.x * 100, y: actor.y + forward.y * 100, w: 110 + stage * 3, h: 28, a: aimAngle, life: 4.5, color: actor.element.color });
    } else if (kind === "chain") {
      for (const a of [-.2, 0, .2]) shoot(a, { damage: base * .46, speed: 820, homing: .72, pierce: 2, special: 2 });
    } else if (kind === "freeze") {
      field(145 + stage * 4, 4.5, "freeze");
      radial(3 + Math.floor(stage / 10), .42, { speed: 350, r: 9 });
    } else if (kind === "curve") {
      for (const a of [-.32, 0, .32]) shoot(a, { damage: base * .46, speed: 570, curve: (a >= 0 ? 1 : -1) * (9 + stage * .15), special: 2 });
      actor.stamina = 100;
      actor.throwHaste = Math.max(actor.throwHaste || 0, 4.5);
    } else if (kind === "void") {
      actor.invisible = Math.max(actor.invisible, 2 + stage * .08);
      actor.clone = { x: actor.x - forward.x * 90, y: actor.y - forward.y * 90, life: 4 + stage * .08 };
      field(120 + stage * 3, 3.2, "void");
    } else if (kind === "heal") {
      actor.hp = Math.min(actor.hpMax, actor.hp + 80 + stage * 8);
      actor.shield = Math.max(actor.shield, 1.3 + stage * .08);
      field(145 + stage * 3, 4.6, "heal");
    } else if (kind === "orbit") {
      field(170 + stage * 4, 4.4, "orbit");
      radial(3 + Math.floor(stage / 10), .48, { speed: 400, homing: 1.05, curve: stage % 2 ? 7 : -7, life: 4.5 });
    } else if (kind === "root") {
      field(165 + stage * 3, 4.8, "root");
      for (const a of [-.65, .65]) state.walls.push({ x: actor.x + Math.cos(aimAngle + a) * 92, y: actor.y + Math.sin(aimAngle + a) * 92, w: 80 + stage * 2, h: 24, a: aimAngle + a, life: 5.5, color: actor.element.color });
    } else if (kind === "poison") {
      field(190 + stage * 4, 6 + stage * .06, "poison");
      radial(2 + Math.floor(stage / 10), .3, { speed: 310, homing: .3, life: 5 });
    } else if (kind === "metal") {
      actor.shield = Math.max(actor.shield, 2.8 + stage * .1);
      for (const a of [-.8, -.4, 0, .4, .8]) state.walls.push({ x: actor.x + Math.cos(aimAngle + a) * 105, y: actor.y + Math.sin(aimAngle + a) * 105, w: 70 + stage, h: 26, a: aimAngle + a, life: 6.5, color: actor.element.color });
      shoot(0, { damage: base * 1.1, speed: 390, r: 22, bounces: 4, special: 2 });
    } else if (kind === "plasma") {
      shoot(0, { damage: base * 1.35, speed: 960, r: 9, pierce: 7, special: 2 });
      actor.invuln = Math.max(actor.invuln, .55 + stage * .015);
    } else if (kind === "omni") {
      actor.hp = actor.hpMax;
      actor.shield = Math.max(actor.shield, 5);
      actor.invuln = Math.max(actor.invuln, 1.8);
      for (const effect of ["burn", "bubble", "freeze", "root", "poison", "orbit"]) field(190 + stage * 3, 5.5, effect);
    }
    puff(actor.x, actor.y, actor.element.color, 22);
  }

  function dodgeRoll() {
    const p = state?.player;
    if (!p || p.stamina < 32 || !p.alive || p.dodgeCd > 0) return;
    const mx = (keys.has("a") || keys.has("arrowleft") ? -1 : 0) + (keys.has("d") || keys.has("arrowright") ? 1 : 0);
    const my = (keys.has("w") || keys.has("arrowup") ? -1 : 0) + (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
    const mag = Math.hypot(mx, my) || 1;
    const strafe = mx / mag;
    const forward = my === 0 && mx === 0 ? 1 : -my / mag;
    const dx = Math.cos(p.angle) * forward - Math.sin(p.angle) * strafe;
    const dy = Math.sin(p.angle) * forward + Math.cos(p.angle) * strafe;
    p.vx = dx * 620;
    p.vy = dy * 620;
    p.dive = Math.max(p.dive, .3);
    p.dash = Math.max(p.dash, .28);
    resolveActorBlocks(p);
    p.invuln = .38;
    p.dodgeCd = .55;
    p.stamina -= 32;
    state.dodges++;
    puff(p.x, p.y, "#f2c14e", 7);
  }

  function jumpPlayer() {
    const p = state?.player;
    const grounded = p && ((p.z || 0) <= 1 || isStandingOnStructure(p));
    if (!p || !p.alive || !grounded || p.jumpCd > 0 || p.stamina < 12) return;
    p.vz = 410;
    p.z = Math.max(p.z || 0, 0) + 2;
    p.onPlatform = null;
    p.air = .34;
    p.jumpCd = .42;
    p.stamina -= 12;
    puff(p.x, p.y, "#ffffff", 4);
    playSound("jump", .7);
  }

  function update(dt) {
    if (!state || state.over) return;
    if (state.roundTransition > 0) {
      state.roundTransition -= dt;
      if (state.roundTransition <= 0) resetRound();
      return;
    }
    state.time += dt;
    state.hitConfirm = Math.max(0, (state.hitConfirm || 0) - dt);
    for (const peer of Object.values(online.peers || {})) {
      const blend = 1 - Math.exp(-15 * dt);
      peer.x += ((peer.targetX ?? peer.x) - peer.x) * blend;
      peer.y += ((peer.targetY ?? peer.y) - peer.y) * blend;
      peer.z += ((peer.targetZ ?? peer.z) - peer.z) * blend;
      peer.skillAnim = Math.max(0, (peer.skillAnim || 0) - dt);
    }
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnPowerup();
      state.spawnTimer = 7 + Math.random() * 6;
    }

    const p = state.player;
    const jumpHeld = keys.has("space") || keys.has(" ");
    if (jumpHeld && !p.jumpHeld) jumpPlayer();
    p.jumpHeld = jumpHeld;
    if (document.pointerLockElement !== canvas && (mouse.edgeX || mouse.edgeY)) {
      const sensitivity = save.settings.sensitivity / 100000;
      p.lookAngle = (p.lookAngle ?? p.angle) + mouse.edgeX * sensitivity * 620 * dt;
      p.lookPitch = clamp(
        (p.lookPitch ?? p.pitch) + mouse.edgeY * sensitivity * 465 * dt * (save.settings.invertY ? -1 : 1),
        -.78,
        .78
      );
    }
    p.angle = p.lookAngle ?? p.angle;
    p.pitch = p.lookPitch ?? p.pitch;
    const mx = (keys.has("a") || keys.has("arrowleft") ? -1 : 0) + (keys.has("d") || keys.has("arrowright") ? 1 : 0);
    const my = (keys.has("w") || keys.has("arrowup") ? -1 : 0) + (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
    moveActor(p, mx, my, dt);
    const weapon = ballTypes.find(type => type.id === p.ballType) || selectedBallType();
    if (mouse.right && weapon.charge && p.alive) p.charge = Math.min(1, (p.charge || 0) + dt / 1.35);
    else if (!weapon.charge) p.charge = 0;
    if (mouse.left && weapon.automatic) fireWeaponShot();

    for (const actor of state.players) {
      updateActorTimers(actor, dt);
      if (actor.team !== "player" && actor.alive) updateNpc(actor, dt);
    }
    updateBalls(dt);
    updateTechniques(dt);
    updateHazards(dt);
    updateCoins(dt);
    updatePowerups(dt);
    updateParticles(dt);
    updateDamagePopups(dt);
    updateWalls(dt);
    updateMode(dt);
    updateOnline(dt);
    checkEnd();
  }

  function updateActorTimers(actor, dt) {
    actor.throwCd -= dt;
    actor.shield = Math.max(0, actor.shield - dt);
    actor.dash = Math.max(0, actor.dash - dt);
    actor.invuln = Math.max(0, actor.invuln - dt);
    actor.invisible = Math.max(0, actor.invisible - dt);
    actor.techniqueCd = Math.max(0, (actor.techniqueCd || 0) - dt);
    actor.air = Math.max(0, (actor.air || 0) - dt);
    actor.jumpCd = Math.max(0, (actor.jumpCd || 0) - dt);
    actor.dodgeCd = Math.max(0, (actor.dodgeCd || 0) - dt);
    actor.dive = Math.max(0, (actor.dive || 0) - dt);
    actor.throwAnim = Math.max(0, (actor.throwAnim || 0) - dt);
    actor.recoil = Math.max(0, (actor.recoil || 0) - dt);
    actor.skillAnim = Math.max(0, (actor.skillAnim || 0) - dt);
    actor.counterWindow = Math.max(0, (actor.counterWindow || 0) - dt);
    actor.nullField = Math.max(0, (actor.nullField || 0) - dt);
    actor.powerBuff = Math.max(0, (actor.powerBuff || 0) - dt);
    actor.throwHaste = Math.max(0, (actor.throwHaste || 0) - dt);
    actor.prevZ = actor.z || 0;
    actor.z = Math.max(0, (actor.z || 0) + (actor.vz || 0) * dt);
    actor.vz = (actor.vz || 0) - 1500 * dt;
    if (actor.z <= 0) {
      actor.z = 0;
      actor.vz = 0;
    }
    actor.stamina = Math.min(100, actor.stamina + dt * (actor.team === "player" ? (actor.sprinting ? 0 : 24) : 16));
    actor.skillCd = actor.skillCd.map(v => Math.max(0, v - dt));
    for (const key of Object.keys(actor.status)) actor.status[key] = Math.max(0, actor.status[key] - dt);
    if (actor.status.burn > 0) {
      applyDotDamage(actor, 8 * dt);
    }
    if (actor.status.poison > 0) {
      applyDotDamage(actor, 10 * dt);
    }
    if (actor.clone) {
      actor.clone.life -= dt;
      if (actor.clone.life <= 0) actor.clone = null;
    }
  }

  function applyDotDamage(actor, damage) {
    actor.hp -= damage;
    if (actor.team === "player") state.damageTaken += damage;
    if (actor.dotOwner?.team === "player" && actor.team !== "player") state.damageDealt += damage;
    if (actor.hp <= 0) actor.alive = false;
  }

  function moveActor(actor, mx, my, dt) {
    if (!actor.alive) return;
    actor.px = actor.x;
    actor.py = actor.y;
    if (actor.status.stun > 0 || actor.status.root > 0) {
      actor.vx = 0; actor.vy = 0;
      return;
    }
    const inputMag = Math.hypot(mx, my);
    const mag = inputMag || 1;
    const slow = actor.status.slow > 0 ? .52 : 1;
    const sprinting = actor.team === "player" && keys.has("shift") && inputMag > 0 && actor.stamina > 0 && actor.dive <= 0;
    const boost = actor.dive > 0 ? 2.7 : actor.dash > 0 ? 2.1 : sprinting ? 1.52 : 1;
    actor.sprinting = sprinting;
    if (sprinting) actor.stamina = Math.max(0, actor.stamina - 30 * dt);
    if (actor.team === "player") {
      const strafe = mx / mag;
      const forward = -my / mag;
      const targetVx = inputMag ? (Math.cos(actor.angle) * forward - Math.sin(actor.angle) * strafe) * actor.speed * boost * slow : 0;
      const targetVy = inputMag ? (Math.sin(actor.angle) * forward + Math.cos(actor.angle) * strafe) * actor.speed * boost * slow : 0;
      const response = actor.dive > 0 ? 4.8 : inputMag ? (actor.z > 0 ? 9 : 19) : (actor.z > 0 ? 3.2 : 22);
      const blend = 1 - Math.exp(-response * dt);
      actor.vx += (targetVx - actor.vx) * blend;
      actor.vy += (targetVy - actor.vy) * blend;
    } else {
      actor.vx = mx / mag * actor.speed * boost * slow;
      actor.vy = my / mag * actor.speed * boost * slow;
      if (Math.abs(actor.vx) + Math.abs(actor.vy) > 0.1) actor.angle = Math.atan2(actor.vy, actor.vx);
    }
    actor.x = clamp(actor.x + actor.vx * dt, actor.r, W - actor.r);
    actor.y = clamp(actor.y + actor.vy * dt, actor.r, H - actor.r);
    resolveActorBlocks(actor);
  }

  function aimPoint(distance = 900) {
    const p = state?.player;
    if (!p) return { x: mouse.x, y: mouse.y };
    return {
      x: p.x + Math.cos(p.angle) * distance,
      y: p.y + Math.sin(p.angle) * distance
    };
  }

  function updateNpc(npc, dt) {
    let target = null;
    let targetDistance = Infinity;
    for (const candidate of state.players) {
      if (!candidate.alive || candidate === npc || (state.mode !== "ffa" && candidate.team === npc.team) || (npc.team === "ally" && candidate.team === "player")) continue;
      const distance = dist(npc, candidate);
      if (distance < targetDistance) { target = candidate; targetDistance = distance; }
    }
    target ||= state.player;
    npc.target = target?.clone && npc.ai < save.skillRating ? target.clone : target;
    const aimTarget = npc.target;
    const d = dist(npc, aimTarget);
    const playerAccuracy = state.throws ? state.hits / state.throws : .2;
    const adapt = clamp((save.skillRating || 1) * .55 + playerAccuracy * 1.6 + (state.damageTaken < state.time * 3 ? .35 : 0), .8, 5.5);
    const ideal = 245 - adapt * 8;
    const dx = aimTarget.x - npc.x;
    const dy = aimTarget.y - npc.y;
    const len = Math.hypot(dx, dy) || 1;
    const strafe = Math.sin(state.time * (1.9 + adapt * .1) + npc.aimBias);
    const incoming = nearestThreat(npc);
    const technique = adapt > 3 ? nearestTechniqueSpot(npc, d > ideal ? ["lane", "jump", "portal"] : ["bank", "lane"]) : null;
    if (incoming && dist(npc, incoming) < 96 && npc.stamina > 30) {
      moveNpcSafely(npc, -incoming.vy, incoming.vx, dt);
    } else if (technique && dist(npc, technique) < 260 && Math.random() < dt * (.8 + adapt * .08)) {
      const tx = technique.x - npc.x;
      const ty = technique.y - npc.y;
      const td = Math.hypot(tx, ty) || 1;
      moveNpcSafely(npc, tx / td + -dy / len * strafe * .24, ty / td + dx / len * strafe * .24, dt);
    } else {
      const toward = d > ideal ? 1 : -0.7;
      moveNpcSafely(npc, dx / len * toward + -dy / len * strafe * .62, dy / len * toward + dx / len * strafe * .62, dt);
    }
    const weapon = ballTypes.find(type => type.id === npc.ballType) || ballTypes[1];
    if (npc.chargeGoal > 0 && npc.status.stun <= 0) {
      npc.charge = Math.min(1, npc.charge + dt / npc.chargeGoal);
      if (npc.charge >= 1 || (d < 135 && weapon.id !== "one")) {
        const shotCharge = npc.charge;
        const lead = clamp(d / (650 - adapt * 12), .14, .8) * (.68 + adapt * .045);
        const wobble = Math.max(58, 138 - adapt * 14) * (1 - shotCharge * .2);
        throwBall(npc, aimTarget.x + (aimTarget.vx || 0) * lead + rand(-wobble, wobble), aimTarget.y + (aimTarget.vy || 0) * lead + rand(-wobble, wobble), 0, {
          charge: shotCharge,
          damage: damageFor(npc) * weapon.damage * (1 + (weapon.charge ? shotCharge * .5 : 0)),
          speed: weapon.speed + (weapon.charge ? shotCharge * 100 : 0),
          r: weapon.radius + (weapon.charge ? shotCharge * 3 : 0),
          life: weapon.life + (weapon.charge ? shotCharge * .55 : 0),
          skinId: npc.skinId
        });
        npc.charge = 0;
        npc.chargeGoal = 0;
        npc.throwCd = Math.max(weapon.delay, weapon.delay * (1.55 - adapt * .05));
      }
    } else if (npc.throwCd <= 0 && d < 1120 && npc.status.stun <= 0) {
      const telegraph = weapon.id === "one" ? 1.25 : weapon.id === "auto" ? .2 : .52;
      npc.chargeGoal = telegraph + Math.random() * (weapon.id === "one" ? .38 : .18);
      npc.charge = .02;
    }
    const readySkills = npc.skillCd.map((cooldown, index) => cooldown <= 0 ? index : -1).filter(index => index >= 0);
    if (readySkills.length && Math.random() < dt * .06 * adapt) {
      const skillIndex = readySkills[Math.floor(Math.random() * readySkills.length)];
      performSkill(npc, skillIndex, aimTarget.x, aimTarget.y);
      npc.skillCd[skillIndex] = npc.element.skills[skillIndex].cd;
    }
  }

  function moveNpcSafely(npc, desiredX, desiredY, dt) {
    const base = Math.atan2(desiredY, desiredX);
    const offsets = [0, .55, -.55, 1.05, -1.05, 1.55, -1.55, Math.PI];
    let bestAngle = base;
    let bestScore = -Infinity;
    for (const offset of offsets) {
      const angle = base + offset;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const blocked = [npc.r + 18, npc.r + 48, npc.r + 82].some(distance => {
        const x = npc.x + dx * distance;
        const y = npc.y + dy * distance;
        return x < npc.r || x > W - npc.r || y < npc.r || y > H - npc.r ||
          state.mapBlocks.some(block => npc.z <= block.z + 8 && circleRect(x, y, npc.r + 4, block));
      });
      const score = Math.cos(offset) * 2.4 - Math.abs(offset) * .16 - (blocked ? 20 : 0);
      if (score > bestScore) { bestScore = score; bestAngle = angle; }
    }
    moveActor(npc, Math.cos(bestAngle), Math.sin(bestAngle), dt);
    const moved = Math.hypot(npc.x - (npc.px ?? npc.x), npc.y - (npc.py ?? npc.y));
    npc.stuckTime = moved < .35 ? (npc.stuckTime || 0) + dt : 0;
    if (npc.stuckTime > .45 && (npc.z || 0) <= 1) {
      npc.vz = 470;
      npc.z = 4;
      npc.stuckTime = 0;
    }
  }

  function nearestThreat(actor) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const ball of state.balls) {
      if (ball.owner === actor || friendlyFireBlocked(actor, ball)) continue;
      const distance = dist(actor, ball);
      if (distance < nearestDistance) { nearest = ball; nearestDistance = distance; }
    }
    return nearest;
  }

  function nearestTechniqueSpot(actor, types) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const technique of state.techniques || []) {
      if (!types.includes(technique.type) || (technique.cool || 0) > .2) continue;
      const distance = dist(actor, technique);
      if (distance < nearestDistance) { nearest = technique; nearestDistance = distance; }
    }
    return nearest;
  }

  function updateBalls(dt) {
    const activeBalls = [...state.balls];
    for (const b of activeBalls) {
      b.px = b.x; b.py = b.y; b.pz = b.z || 0;
      b.life -= dt;
      if (b.life <= 0) {
        markBallGone(b, "fade");
        continue;
      }
      if (b.homing > 0) {
        let target = null;
        let targetDistance = Infinity;
        for (const candidate of state.players) {
          if (!candidate.alive || candidate === b.owner || friendlyFireBlocked(candidate, b)) continue;
          const distance = dist(b, candidate);
          if (distance < targetDistance) { target = candidate; targetDistance = distance; }
        }
        if (target) {
          const dx = target.x - b.x, dy = target.y - b.y, d = Math.hypot(dx, dy) || 1;
          b.vx += dx / d * b.homing * 420 * dt;
          b.vy += dy / d * b.homing * 420 * dt;
        }
      }
      if (b.curve) {
        const a = Math.atan2(b.vy, b.vx) + Math.sin(state.time * 7 + b.life) * b.curve * dt * .12;
        const speed = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(a) * speed;
        b.vy = Math.sin(a) * speed;
      }
      const airDrag = Math.exp(-.09 * dt);
      b.vx *= airDrag;
      b.vy *= airDrag;
      b.z = Math.max(0, (b.z || 0) + (b.vz || 0) * dt);
      b.vz = (b.vz || 0) - (360 + (b.gravity || 0)) * dt;
      b.spin += b.spinSpeed * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      const hitEdgeX = b.x < b.r || b.x > W - b.r;
      const hitEdgeY = b.y < b.r || b.y > H - b.r;
      if (hitEdgeX || hitEdgeY) {
        b.x = clamp(b.x, b.r, W - b.r);
        b.y = clamp(b.y, b.r, H - b.r);
        if (b.bounces > 0) {
          if (hitEdgeX) b.vx *= -0.84;
          if (hitEdgeY) b.vy *= -0.84;
          b.bounces--;
          spawnBallImpact(b, "bounce", "#596264");
        } else {
          markBallGone(b, "wall", "#596264");
          continue;
        }
      }
      collideWalls(b);
      if (b.life <= 0) continue;
      applyBallTechniques(b);
      for (const actor of state.players) {
        if (!actor.alive || actor === b.owner || actor.invuln > 0 || friendlyFireBlocked(actor, b)) continue;
        const ballHeight = b.z || 0;
        const withinBodyHeight = ballHeight >= (actor.z || 0) - b.r && ballHeight <= (actor.z || 0) + 72 + b.r;
        if (withinBodyHeight && Math.hypot(actor.x - b.x, actor.y - b.y) < actor.r + b.r) {
          if ((actor.nullField || 0) > 0) {
            markBallGone(b, "blocked", actor.element.color);
            break;
          }
          if ((actor.counterWindow || 0) > 0) {
            const speed = Math.max(480, Math.hypot(b.vx, b.vy) * 1.12);
            const angle = Math.atan2(b.y - actor.y, b.x - actor.x);
            b.owner = actor;
            b.team = actor.team;
            b.vx = Math.cos(angle) * speed;
            b.vy = Math.sin(angle) * speed;
            b.color = actor.element.color;
            b.pierce = Math.max(1, b.pierce);
            actor.counterWindow = Math.max(0, actor.counterWindow - .45);
            spawnBallImpact(b, "counter", actor.element.color);
            continue;
          }
          applyHit(actor, b);
          if (b.pierce > 0) b.pierce--;
          else markBallGone(b, "hit", actor.element.color);
          if (b.life <= 0) break;
        }
      }
      if (b.life <= 0) continue;
      if (b.owner.team === "player" && online.connected) {
        for (const peer of Object.values(online.peers)) {
          if (peer.hp <= 0 || b.remoteHits.has(peer.id)) continue;
          const withinHeight = (b.z || 0) >= (peer.z || 0) - b.r && (b.z || 0) <= (peer.z || 0) + 72 + b.r;
          if (withinHeight && Math.hypot(peer.x - b.x, peer.y - b.y) < 18 + b.r) {
            hitOnlinePeer(peer, b);
            b.remoteHits.add(peer.id);
            if (b.pierce > 0) b.pierce--;
            else markBallGone(b, "hit", peer.color || "#d7d7d2");
            break;
          }
        }
      }
    }
    state.balls = state.balls.filter(b => b.life > 0);
  }

  function hitOnlinePeer(peer, ball) {
    const profile = damageProfiles[ball.effect] || { direct: 1 };
    const headshot = (ball.z || 0) >= (peer.z || 0) + 48;
    const damage = ball.damage * profile.direct * (headshot ? 1.5 : 1);
    peer.hp = Math.max(0, peer.hp - damage);
    rewardHit({ x: peer.x, y: peer.y, z: peer.z, ai: 2, element: elements.find(e => e.id === peer.elementId) || elements[0] }, damage, headshot);
    state.hitConfirm = .2;
    sendOnline({ type: "hit", target: peer.id, damage, headshot, effect: ball.effect });
  }

  function updateTechniques(dt) {
    if (!state?.techniques) return;
    for (const t of state.techniques) t.cool = Math.max(0, (t.cool || 0) - dt);
    for (const actor of state.players) {
      if (!actor.alive) continue;
      for (const t of state.techniques) {
        if (t.type === "lane" && circleRect(actor.x, actor.y, actor.r, techniqueRect(t))) {
          actor.dash = Math.max(actor.dash, .16);
          actor.stamina = Math.min(100, actor.stamina + dt * 18);
          if ((actor.techniqueCd || 0) <= 0) {
            actor.techniqueCd = .32;
            puff(actor.x, actor.y, t.color, 4);
          }
          continue;
        }
        if (dist(actor, t) > actor.r + t.r || (actor.techniqueCd || 0) > 0) continue;
        if (t.type === "jump") {
          actor.vz = 540;
          actor.z = Math.max(actor.z || 0, 6);
          actor.onPlatform = null;
          actor.dash = Math.max(actor.dash, .24);
          actor.air = .85;
          actor.invuln = Math.max(actor.invuln, .22);
          actor.techniqueCd = 1.05;
          puff(actor.x, actor.y, t.color, 18);
        } else if (t.type === "bank") {
          const away = Math.atan2(actor.y - t.y, actor.x - t.x);
          actor.vx += Math.cos(away) * 430;
          actor.vy += Math.sin(away) * 430;
          actor.dash = Math.max(actor.dash, .32);
          actor.invuln = Math.max(actor.invuln, .18);
          actor.techniqueCd = .7;
          resolveActorBlocks(actor);
          puff(actor.x, actor.y, t.color, 14);
        } else if (t.type === "portal") {
          const out = pairedTechnique(t);
          if (out && t.cool <= 0) {
            const a = actor.angle || Math.atan2(actor.vy || 0, actor.vx || 1);
            actor.x = clamp(out.x + Math.cos(a) * 52, actor.r, W - actor.r);
            actor.y = clamp(out.y + Math.sin(a) * 52, actor.r, H - actor.r);
            actor.techniqueCd = 1.1;
            t.cool = 1.1;
            out.cool = 1.1;
            puff(out.x, out.y, out.color, 20);
          }
        }
      }
    }
  }

  function applyBallTechniques(ball) {
    if (!state?.techniques) return;
    for (const t of state.techniques) {
      if (t.type === "lane" && circleRect(ball.x, ball.y, ball.r, techniqueRect(t))) {
        const speed = Math.hypot(ball.vx, ball.vy);
        if (speed < 760) {
          ball.vx *= 1.012;
          ball.vy *= 1.012;
        }
        continue;
      }
      if (dist(ball, t) > ball.r + t.r) continue;
      if (t.type === "bank") {
        const a = Math.atan2(ball.y - t.y, ball.x - t.x);
        const speed = Math.hypot(ball.vx, ball.vy) * 1.08;
        ball.vx = Math.cos(a) * speed;
        ball.vy = Math.sin(a) * speed;
        ball.bounces = Math.max(ball.bounces, 1);
        puff(ball.x, ball.y, t.color, 8);
      } else if (t.type === "portal" && t.cool <= 0) {
        const out = pairedTechnique(t);
        if (out) {
          const a = Math.atan2(ball.vy, ball.vx);
          ball.x = out.x + Math.cos(a) * 48;
          ball.y = out.y + Math.sin(a) * 48;
          t.cool = .75;
          out.cool = .75;
          puff(out.x, out.y, out.color, 12);
        }
      }
    }
  }

  function updateHazards(dt) {
    for (const actor of state.players) {
      if (!actor.alive) continue;
      let touchingPit = false;
      let pitHazard = null;
      for (const hazard of state.hazards || []) {
        const rect = { x: hazard.x - hazard.w / 2, y: hazard.y - hazard.h / 2, w: hazard.w, h: hazard.h };
        if (!circleRect(actor.x, actor.y, actor.r, rect) || (actor.z || 0) > 14) continue;
        if (hazard.type === "lava" || hazard.type === "acid") {
          const damage = (hazard.type === "lava" ? 28 : 15) * dt;
          actor.hp -= damage;
          if (actor.team === "player") state.damageTaken += damage;
          if (hazard.type === "lava") {
            touchingPit = true;
            pitHazard = hazard;
            actor.status.burn = Math.max(actor.status.burn, .3);
            actor.status.slow = Math.max(actor.status.slow, .12);
          } else {
            actor.status.poison = Math.max(actor.status.poison, .4);
          }
        } else if (hazard.type === "water" || hazard.type === "mud") {
          actor.status.slow = Math.max(actor.status.slow, .18);
        } else if (hazard.type === "ice") {
          actor.dash = Math.max(actor.dash, .12);
        } else if (hazard.type === "current" || hazard.type === "wind" || hazard.type === "conveyor") {
          const strength = hazard.type === "wind" ? 115 : 80;
          actor.vx += strength * dt;
          actor.vy += Math.sin(state.time * 2 + actor.x * .01) * strength * .28 * dt;
        } else if (hazard.type === "boost") {
          actor.dash = Math.max(actor.dash, .22);
          actor.stamina = Math.min(100, actor.stamina + 22 * dt);
        } else if (hazard.type === "healing") {
          actor.hp = Math.min(actor.hpMax, actor.hp + 9 * dt);
        } else if (hazard.type === "shards") {
          actor.hp -= 11 * dt;
          actor.status.slow = Math.max(actor.status.slow, .15);
        } else if (hazard.type === "shock") {
          actor.status.stun = Math.max(actor.status.stun, .08);
        }
      }
      actor.hazardSink = touchingPit ? Math.min(1, (actor.hazardSink || 0) + dt * 1.4) : Math.max(0, (actor.hazardSink || 0) - dt * 3);
      if (actor.hazardSink >= 1) {
        const away = Math.atan2(actor.y - pitHazard.y, actor.x - pitHazard.x);
        actor.hp -= 35;
        actor.vx += Math.cos(away) * 520;
        actor.vy += Math.sin(away) * 520;
        actor.vz = 520;
        actor.z = 6;
        actor.hazardSink = 0;
        actor.invuln = .9;
      }
      if (actor.hp <= 0) actor.alive = false;
    }
  }

  function pairedTechnique(t) {
    return state.techniques.find(other => other !== t && other.type === "portal" && other.pair === t.pair);
  }

  function techniqueRect(t) {
    return { x: t.x - t.w / 2, y: t.y - t.h / 2, w: t.w, h: t.h };
  }

  function collideWalls(ball) {
    for (const block of state.mapBlocks || []) {
      if (ball.life <= 0) return;
      if ((ball.z || 0) > block.z + ball.r) continue;
      if (circleRect(ball.x, ball.y, ball.r, block)) {
        const cx = clamp(ball.x, block.x, block.x + block.w);
        const cy = clamp(ball.y, block.y, block.y + block.h);
        const hitHorizontalSide = Math.abs(ball.x - cx) > Math.abs(ball.y - cy);
        if (ball.bounces <= 0) {
          markBallGone(ball, "wall", block.color);
          return;
        }
        ball.x = ball.px;
        ball.y = ball.py;
        if (hitHorizontalSide) ball.vx *= -0.82;
        else ball.vy *= -0.82;
        ball.bounces--;
        spawnBallImpact(ball, "bounce", block.color);
      }
    }
    for (const w of state.walls) {
      if (ball.life <= 0) return;
      if (Math.abs(ball.x - w.x) < w.w / 2 + ball.r && Math.abs(ball.y - w.y) < w.h / 2 + ball.r) {
        if (ball.bounces <= 0) {
          markBallGone(ball, "wall", w.color);
          return;
        }
        ball.x = ball.px;
        ball.y = ball.py;
        ball.vx *= -0.75;
        ball.vy *= -0.75;
        ball.bounces--;
        spawnBallImpact(ball, "bounce", w.color);
      }
    }
  }

  function resolveActorBlocks(actor) {
    if (!state?.mapBlocks) return;
    actor.onPlatform = null;
    for (const block of state.mapBlocks) {
      if (!circleRect(actor.x, actor.y, actor.r, block)) continue;
      const crossedTop = (actor.prevZ ?? actor.z) >= block.z - 10 && actor.z <= block.z + 14;
      const alreadyOnTop = Math.abs(actor.z - block.z) <= 12;
      if ((actor.vz || 0) <= 0 && (crossedTop || alreadyOnTop)) {
        actor.z = block.z;
        actor.vz = 0;
        actor.onPlatform = block;
        continue;
      }
      if (actor.z > block.z + 8) continue;
      const left = Math.abs(actor.x - block.x);
      const right = Math.abs(actor.x - (block.x + block.w));
      const top = Math.abs(actor.y - block.y);
      const bottom = Math.abs(actor.y - (block.y + block.h));
      const min = Math.min(left, right, top, bottom);
      if (min === left) actor.x = block.x - actor.r;
      else if (min === right) actor.x = block.x + block.w + actor.r;
      else if (min === top) actor.y = block.y - actor.r;
      else actor.y = block.y + block.h + actor.r;
      actor.x = clamp(actor.x, actor.r, W - actor.r);
      actor.y = clamp(actor.y, actor.r, H - actor.r);
    }
  }

  function isStandingOnStructure(actor) {
    if (!state?.mapBlocks) return false;
    return state.mapBlocks.some(block =>
      circleRect(actor.x, actor.y, Math.max(4, actor.r - 3), block) &&
      Math.abs((actor.z || 0) - block.z) <= 14 &&
      (actor.vz || 0) <= 20
    );
  }

  function circleRect(cx, cy, cr, rect) {
    const nx = clamp(cx, rect.x, rect.x + rect.w);
    const ny = clamp(cy, rect.y, rect.y + rect.h);
    return Math.hypot(cx - nx, cy - ny) < cr;
  }

  function applyHit(actor, ball) {
    const profile = damageProfiles[ball.effect] || { direct: 1 };
    const headshot = (ball.z || 0) >= (actor.z || 0) + 48;
    let finalDamage = ball.damage * profile.direct * (headshot ? 1.5 : 1);
    if (actor.shield > 0) finalDamage *= .28;
    if (actor.status.mark > 0) finalDamage *= 1.25;
    actor.hp -= finalDamage;
    const impactSpeed = Math.hypot(ball.vx, ball.vy) || 1;
    const knockback = profile.knockback || 1;
    actor.vx += ball.vx / impactSpeed * Math.min(220, finalDamage * 2.2 * knockback);
    actor.vy += ball.vy / impactSpeed * Math.min(220, finalDamage * 2.2 * knockback);
    if (actor.team === "player") state.damageTaken += finalDamage;
    applyEffect(actor, ball);
    applyElementImpact(actor, ball, finalDamage);
    puff(actor.x, actor.y, ball.color, 14);
    if (actor.team === "player" || ball.owner.team === "player") playSound("hit", Math.min(1.5, finalDamage / 40));
    if (ball.owner.team === "player") rewardHit(actor, finalDamage, headshot);
    if (ball.owner.team === "player") state.hitConfirm = .2;
    if (ball.split) {
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI * 2;
        throwBall(ball.owner, ball.x + Math.cos(a) * 80, ball.y + Math.sin(a) * 80, 0, { damage: ball.damage * .42, life: .72, speed: 340, color: ball.color });
      }
    }
    if (actor.hp <= 0) {
      actor.alive = false;
      if (ball.owner.team === "player") rewardKnockout(actor);
    }
  }

  function applyEffect(actor, ball) {
    const e = ball.effect;
    const profile = damageProfiles[e] || {};
    if (profile.burn) actor.status.burn = Math.max(actor.status.burn, profile.burn);
    if (profile.poison) actor.status.poison = Math.max(actor.status.poison, profile.poison);
    if (profile.slow) actor.status.slow = Math.max(actor.status.slow, profile.slow);
    if (profile.stun) actor.status.stun = Math.max(actor.status.stun, profile.stun);
    if (profile.root) actor.status.root = Math.max(actor.status.root, profile.root);
    if (profile.mark) actor.status.mark = Math.max(actor.status.mark, profile.mark);
    actor.dotOwner = ball.owner;
    if (e === "metal") {
      actor.vx *= .2;
      actor.vy *= .2;
    }
    if (profile.shieldBreak) actor.shield = Math.max(0, actor.shield - profile.shieldBreak);
  }

  function applyElementImpact(actor, ball, damage) {
    const owner = ball.owner;
    if (!owner?.element || !state) return;
    const effect = ball.effect;
    const stage = Math.max(0, Math.min(20, owner.element.index || 0));
    const radius = 48 + stage * 2.4 + (ball.special || 0) * 14;
    const enemiesNear = extraRadius => state.players.filter(target =>
      target.alive && target !== actor && target !== owner && (state.mode === "ffa" || !friendlyTeam(target, owner)) &&
      Math.hypot(target.x - ball.x, target.y - ball.y) < radius + extraRadius
    );
    const impactField = (fieldEffect, size, life) => {
      if (state.particles.length > 150) state.particles.splice(0, state.particles.length - 150);
      state.particles.push({
        type: "field", x: ball.x, y: ball.y, r: 12, max: size, life,
        color: ball.color, effect: fieldEffect, owner
      });
    };
    const secondaryDamage = (target, amount, status = null) => {
      target.hp -= amount;
      if (status) target.status[status] = Math.max(target.status[status], .35 + stage * .015);
      if (owner.team === "player") rewardHit(target, amount, false);
      if (target.team === "player") state.damageTaken += amount;
      if (target.hp <= 0 && target.alive) {
        target.alive = false;
        if (owner.team === "player") rewardKnockout(target);
      }
    };

    if (effect === "burn") {
      impactField("burn", radius, 1.2 + stage * .035);
      for (const target of enemiesNear(12)) {
        target.status.burn = Math.max(target.status.burn, .8 + stage * .035);
        target.dotOwner = owner;
        secondaryDamage(target, damage * (.14 + stage * .003));
      }
    } else if (effect === "bubble") {
      impactField("bubble", radius + 28, 2.1 + stage * .05);
      actor.status.slow = Math.max(actor.status.slow, 1.1 + stage * .05);
      actor.vx *= .5; actor.vy *= .5;
    } else if (effect === "quake") {
      for (const target of [actor, ...enemiesNear(22)]) {
        const away = Math.atan2(target.y - ball.y, target.x - ball.x);
        target.vx += Math.cos(away) * (210 + stage * 7);
        target.vy += Math.sin(away) * (210 + stage * 7);
        target.status.stun = Math.max(target.status.stun, .22 + stage * .01);
      }
      impactField("quake", radius + 12, .72);
    } else if (effect === "chain") {
      const arcs = enemiesNear(150).sort((a, b) => dist(a, actor) - dist(b, actor)).slice(0, 1 + Math.floor(stage / 9));
      for (const target of arcs) secondaryDamage(target, damage * (.2 + stage * .004), "stun");
      impactField("chain", radius + 18, .52);
    } else if (effect === "freeze") {
      impactField("freeze", radius + 34, 2.5 + stage * .045);
      for (const target of enemiesNear(38)) target.status.slow = Math.max(target.status.slow, 1.35 + stage * .06);
    } else if (effect === "curve") {
      const side = Math.atan2(ball.vy, ball.vx) + Math.PI / 2;
      actor.vx += Math.cos(side) * (180 + stage * 6);
      actor.vy += Math.sin(side) * (180 + stage * 6);
    } else if (effect === "void") {
      actor.status.mark = Math.max(actor.status.mark, 2.4 + stage * .12);
      owner.invisible = Math.max(owner.invisible || 0, .3 + stage * .025);
      impactField("void", radius + 8, 1.2);
    } else if (effect === "heal") {
      owner.hp = Math.min(owner.hpMax, owner.hp + damage * (.18 + stage * .006) + (ball.leech || 0) * damage);
      impactField("heal", radius, 1.1);
    } else if (effect === "orbit") {
      impactField("orbit", radius + 42, 2.3 + stage * .04);
      for (const target of enemiesNear(55)) {
        const pull = Math.atan2(ball.y - target.y, ball.x - target.x);
        target.vx += Math.cos(pull) * (190 + stage * 6);
        target.vy += Math.sin(pull) * (190 + stage * 6);
      }
    } else if (effect === "root") {
      impactField("root", radius + 30, 2.8 + stage * .05);
      for (const target of enemiesNear(32)) target.status.root = Math.max(target.status.root, .8 + stage * .045);
    } else if (effect === "poison") {
      impactField("poison", radius + 38, 3.8 + stage * .08);
      for (const target of enemiesNear(40)) {
        target.status.poison = Math.max(target.status.poison, 2.3 + stage * .16);
        target.dotOwner = owner;
      }
    } else if (effect === "metal") {
      actor.shield = Math.max(0, actor.shield - .8 - stage * .06);
      actor.vx *= .12; actor.vy *= .12;
      actor.status.stun = Math.max(actor.status.stun, .18 + stage * .008);
    } else if (effect === "plasma") {
      actor.shield = Math.max(0, actor.shield - 1.8 - stage * .09);
      impactField("plasma", radius + 6, .65);
    } else if (effect === "omni") {
      actor.status.burn = Math.max(actor.status.burn, 1.5);
      actor.status.poison = Math.max(actor.status.poison, 1.5);
      actor.status.slow = Math.max(actor.status.slow, 1.5);
      actor.status.mark = Math.max(actor.status.mark, 2.5);
      owner.hp = Math.min(owner.hpMax, owner.hp + damage * .3);
      impactField("omni", radius + 65, 3.5);
    }
  }

  function shockwave(x, y, radius, owner) {
    for (const actor of state.players) {
      if (!actor.alive || actor === owner || friendlyTeam(actor, owner)) continue;
      const d = Math.hypot(actor.x - x, actor.y - y);
      if (d < radius) {
        actor.hp -= damageFor(owner) * .6;
        actor.status.stun = Math.max(actor.status.stun, .45);
        if (owner.team === "player") rewardHit(actor, damageFor(owner) * .6);
      }
    }
  }

  function rewardHit(target, dmg, headshot = false) {
    const coins = Math.ceil((3 + target.ai * 2 + target.element.tier) * (dmg / 20));
    const xp = Math.ceil(8 + target.ai * 3 + target.element.tier * 2);
    state.hits++;
    state.damageDealt += dmg;
    state.damagePopups.push({
      x: target.x,
      y: target.y,
      z: (target.z || 0) + 58,
      value: Math.round(dmg),
      label: headshot ? "HEADSHOT" : "",
      life: .9,
      maxLife: .9
    });
    state.earnedCoins += coins;
    state.earnedXp += xp;
    save.coins += coins;
    addXp(xp);
    burstCoins(target.x, target.y, Math.min(12, coins));
    queuePersist();
  }

  function updateDamagePopups(dt) {
    if (!state?.damagePopups) return;
    for (const popup of state.damagePopups) {
      popup.life -= dt;
      popup.z += 34 * dt;
    }
    state.damagePopups = state.damagePopups.filter(popup => popup.life > 0);
  }

  function rewardKnockout(target) {
    const coins = 20 + target.ai * 9 + target.element.tier * 7;
    const xp = 25 + target.ai * 9;
    state.earnedCoins += coins;
    state.earnedXp += xp;
    save.coins += coins;
    addXp(xp);
    burstCoins(target.x, target.y, 16);
    queuePersist();
  }

  function burstCoins(x, y, amount) {
    if (state.coins.length > 45) state.coins.splice(0, state.coins.length - 45);
    amount = Math.min(amount, 52 - state.coins.length);
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      state.coins.push({ x, y, vx: Math.cos(a) * rand(45, 110), vy: Math.sin(a) * rand(45, 110), life: 5 });
    }
  }

  function updateCoins(dt) {
    const range = 52 + save.upgrades.magnet * 31;
    for (const c of state.coins) {
      const dx = state.player.x - c.x, dy = state.player.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < range) {
        c.vx += dx / d * 390 * dt;
        c.vy += dy / d * 390 * dt;
      }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.life -= dt;
    }
    state.coins = state.coins.filter(c => c.life > 0 && Math.hypot(state.player.x - c.x, state.player.y - c.y) > 15);
  }

  function spawnPowerup() {
    const types = ["heal", "haste", "shield", "multi"];
    state.powerups.push({ x: rand(120, W - 120), y: rand(100, H - 100), type: types[Math.floor(Math.random() * types.length)], life: 10 });
  }

  function updatePowerups(dt) {
    for (const p of state.powerups) {
      p.life -= dt;
      if (Math.hypot(state.player.x - p.x, state.player.y - p.y) < state.player.r + 15) {
        if (p.type === "heal") state.player.hp = Math.min(state.player.hpMax, state.player.hp + 120);
        if (p.type === "haste") state.player.dash = 1.2;
        if (p.type === "shield") state.player.shield = Math.max(state.player.shield, 2.5);
        if (p.type === "multi") for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) throwBall(state.player, state.player.x + Math.cos(a) * 120, state.player.y + Math.sin(a) * 120, 0);
        p.life = 0;
      }
    }
    state.powerups = state.powerups.filter(p => p.life > 0);
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      if (p.type === "spark") {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      if (p.type === "field") {
        p.r += (p.max - p.r) * dt * 2.2;
        for (const actor of state.players) {
          if (!actor.alive) continue;
          const friendly = actor === p.owner || (p.owner && state.mode !== "ffa" && friendlyTeam(actor, p.owner));
          if (p.effect === "heal") {
            if (friendly && Math.hypot(actor.x - p.x, actor.y - p.y) < p.r) actor.hp = Math.min(actor.hpMax, actor.hp + 13 * dt);
            continue;
          }
          if (friendly) continue;
          if (Math.hypot(actor.x - p.x, actor.y - p.y) < p.r) {
            if (["freeze", "bubble", "orbit"].includes(p.effect)) actor.status.slow = Math.max(actor.status.slow, .7);
            if (p.effect === "root") actor.status.root = Math.max(actor.status.root, .45);
            if (p.effect === "burn" || p.effect === "omni") { actor.status.burn = Math.max(actor.status.burn, .65); actor.dotOwner = p.owner; }
            if (p.effect === "poison") { actor.status.poison = Math.max(actor.status.poison, 1.1); actor.dotOwner = p.owner; }
            if (p.effect === "chain") actor.status.stun = Math.max(actor.status.stun, .14);
            if (p.effect === "void") actor.status.mark = Math.max(actor.status.mark, .35);
            if (p.effect === "plasma") actor.shield = Math.max(0, actor.shield - .6 * dt);
            if (p.effect === "quake") { actor.vx += (actor.x - p.x) * dt * 3; actor.vy += (actor.y - p.y) * dt * 3; }
          }
        }
      }
    }
    state.particles = state.particles.filter(p => p.life > 0);
  }

  function updateWalls(dt) {
    state.walls.forEach(w => w.life -= dt);
    state.walls = state.walls.filter(w => w.life > 0);
  }

  function updateMode(dt) {
    if (state.mode === "koth" && Math.hypot(state.player.x - W / 2, state.player.y - H / 2) < 85) {
      state.hill += dt;
      if (state.hill > 2) {
        state.hill = 0;
        state.earnedXp += 10;
        addXp(10);
        queuePersist();
      }
    }
    if (state.mode === "ctf" && !state.flag.held && Math.hypot(state.player.x - state.flag.x, state.player.y - state.flag.y) < 28) {
      state.flag.held = true;
      state.earnedCoins += 80;
      state.earnedXp += 45;
      save.coins += 80;
      addXp(45);
      queuePersist();
    }
  }

  function checkEnd() {
    if (state.roundTransition > 0 || state.over) return;
    const activePeers = Object.values(online.peers || {}).filter(peer => performance.now() - peer.updated < 5000);
    if (online.connected && activePeers.length) {
      if (!state.player.alive || state.player.hp <= 0) finishRound(false);
      else if (activePeers.every(peer => peer.hp <= 0)) finishRound(true);
      return;
    }
    const enemiesAlive = state.players.some(p => p.alive && p.team === "npc");
    if (!state.player.alive) {
      finishRound(false);
    } else if (!enemiesAlive) {
      finishRound(true);
    }
  }

  function finishRound(playerWon) {
    const side = playerWon ? "blue" : "red";
    state.roundWins[side]++;
    renderRoundScoreboard();
    if (state.roundWins[side] >= ROUND_TARGET) {
      state.over = true;
      ui.matchStatus.textContent = playerWon ? "Victory" : "Defeated";
      combatUi.resultTitle.textContent = playerWon ? "VICTORY" : "YOU HAVE BEEN DEFEATED";
      combatUi.resultDamage.textContent = `${Math.round(state.damageDealt)} DAMAGE DEALT  |  ${state.roundWins.blue} - ${state.roundWins.red}`;
      combatUi.result.classList.toggle("victory", playerWon);
      combatUi.result.hidden = false;
      updateSkillRating(playerWon);
      finishRanked(playerWon);
      return;
    }
    ui.matchStatus.textContent = `${playerWon ? "BLUE" : "RED"} WINS ROUND ${state.round}`;
    state.roundTransition = 2;
  }

  function resetRound() {
    state.round++;
    state.balls.length = 0;
    state.coins.length = 0;
    state.particles.length = 0;
    state.damagePopups.length = 0;
    state.walls.length = 0;
    state.powerups.length = 0;
    state.flag = { x: W - 90, y: H / 2, held: false };
    for (const actor of state.players) {
      const spawnList = state.map.spawns[actor.spawnSide] || state.map.spawns.red;
      const spawn = spawnList[actor.spawnIndex % spawnList.length];
      actor.x = actor.px = spawn.x;
      actor.y = actor.py = spawn.y;
      actor.vx = actor.vy = actor.vz = actor.z = 0;
      actor.hp = actor.hpMax;
      actor.alive = true;
      actor.stamina = 100;
      actor.throwCd = .5;
      actor.dodgeCd = 0;
      actor.skillCd = [0, 0, 0];
      actor.charge = actor.chargeGoal = 0;
      actor.shield = actor.dash = actor.invuln = actor.invisible = 0;
      actor.counterWindow = actor.nullField = actor.powerBuff = actor.throwHaste = 0;
      actor.sprinting = false;
      actor.dive = 0;
      actor.status = { burn: 0, poison: 0, slow: 0, stun: 0, root: 0, mark: 0 };
      actor.dotOwner = null;
      actor.onPlatform = null;
      actor.hazardSink = 0;
    }
    ui.matchStatus.textContent = `ROUND ${state.round}`;
    renderRoundScoreboard();
  }

  function renderRoundScoreboard() {
    if (!state) return;
    const blue = state.players.filter(actor => actor.team === "player" || actor.team === "ally").map(actor => actor.name);
    const red = state.players.filter(actor => actor.team === "npc").map(actor => actor.name);
    for (const peer of Object.values(online.peers || {})) if (peer.name && !red.includes(peer.name)) red.push(peer.name);
    ui.blueNames.textContent = blue.join(" + ");
    ui.redNames.textContent = red.join(" + ");
    ui.roundScore.textContent = `${state.roundWins.blue} - ${state.roundWins.red}  |  FIRST TO ${ROUND_TARGET}  |  R${state.round}`;
  }

  function updateSkillRating(win) {
    const accuracy = state.throws ? state.hits / state.throws : 0;
    const survival = state.player.alive ? state.player.hp / state.player.hpMax : 0;
    const performance = (win ? 1.2 : -.55) + accuracy * 1.8 + survival * .8 + Math.min(1, state.dodges / 8) * .35 - Math.min(1, state.damageTaken / 700) * .4;
    save.skillRating = clamp((save.skillRating || 1) * .76 + (1 + performance * 2.2) * .24, .7, 8);
    persist();
  }

  function finishRanked(win) {
    if (!state.ranked || save.level < 100 || !["1v1", "2v2", "3v3"].includes(state.mode)) return;
    if (save.ranked.placements < 10) {
      save.ranked.placements++;
      save.ranked.score += win ? 18 + state.hits * 2 + Math.round(save.skillRating * 2) : Math.max(1, state.hits);
      const avg = save.ranked.score / save.ranked.placements;
      save.ranked.rank = ranks[Math.min(ranks.length - 1, Math.floor(avg / 9))];
      persist();
      renderRanked();
    }
  }

  function draw() {
    if (!state) return;
    ctx.clearRect(0, 0, W, H);
    drawFirstPerson();
    drawHudOverlay();
  }

  function drawFirstPerson() {
    const p = state.player;
    const map = state.map || maps[0];
    const horizon = viewHorizon();
    const looks = {
      lava: ["#241514", "#5a2920", "#211c19", "#100e0d"], crystal: ["#17202b", "#36495a", "#303840", "#15191d"],
      water: ["#15232a", "#3d5962", "#334547", "#101719"], snow: ["#46545d", "#89969c", "#646c69", "#29302f"],
      garden: ["#26332f", "#607269", "#3d493d", "#171d18"], lab: ["#17201f", "#40514c", "#303a35", "#111513"]
    };
    const look = looks[map.kind] || ["#111821", "#3d454b", "#424840", "#171b19"];
    const sky = ctx.createLinearGradient(0, 0, 0, H * .52);
    sky.addColorStop(0, look[0]);
    sky.addColorStop(.52, mixColor(look[0], look[1], .55));
    sky.addColorStop(1, look[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);
    const floor = ctx.createLinearGradient(0, horizon, 0, H);
    floor.addColorStop(0, look[2]);
    floor.addColorStop(.38, mixColor(look[2], look[3], .45));
    floor.addColorStop(1, look[3]);
    ctx.fillStyle = floor;
    ctx.fillRect(0, horizon, W, H - horizon);
    drawDistantBattlefield(map);
    drawThemeLandmarks(map);
    drawPerspectiveGrid(map);
    drawGroundMaterials(map);

    const renderables = [];
    const queueRenderable = (type, obj, x, y) => {
      const depth = objectDepth(x, y);
      if (depth > 18) renderables.push({ type, obj, depth });
    };
    for (const hazard of state.hazards || []) queueRenderable("hazard", hazard, hazard.x, hazard.y);
    for (const block of state.mapBlocks || []) queueRenderable("block", block, block.x + block.w / 2, block.y + block.h / 2);
    for (const technique of state.techniques || []) queueRenderable("technique", technique, technique.x, technique.y);
    for (const w of state.walls) queueRenderable("wall", w, w.x, w.y);
    for (const power of state.powerups) queueRenderable("power", power, power.x, power.y);
    for (const coin of state.coins) queueRenderable("coin", coin, coin.x, coin.y);
    for (const ball of state.balls) queueRenderable("ball", ball, ball.x, ball.y);
    for (let i = 0; i < Math.min(state.particles.length, 70); i++) {
      const particle = state.particles[i];
      queueRenderable("particle", particle, particle.x, particle.y);
    }
    for (const actor of state.players) if (actor !== p) queueRenderable("actor", actor, actor.x, actor.y);
    for (const peer of Object.values(online.peers || {})) queueRenderable("peer", peer, peer.x, peer.y);
    renderables.sort((a, b) => b.depth - a.depth).forEach(item => {
        if (item.type === "hazard") drawFpHazard(item.obj);
        if (item.type === "block") drawFpBlock(item.obj);
        if (item.type === "technique") drawFpTechnique(item.obj);
        if (item.type === "wall") drawFpWall(item.obj);
        if (item.type === "power") drawFpOrb(item.obj.x, item.obj.y, 20, "#ffd447", item.obj.type[0].toUpperCase());
        if (item.type === "coin") drawFpOrb(item.obj.x, item.obj.y, 9, "#ffd447", "");
        if (item.type === "ball") drawFpBall(item.obj);
        if (item.type === "particle") drawFpParticle(item.obj);
        if (item.type === "actor") drawFpActor(item.obj);
        if (item.type === "peer") drawFpPeer(item.obj);
    });
    drawDamagePopups();
    drawFirstPersonHands();
    drawPlayerThrowAnimation();
    drawAbilityAnimation();
    drawCrosshair();
    if (save.settings.minimap) drawMiniMap();
  }

  function viewHorizon() {
    return clamp(H * .53 - (state?.player?.pitch || 0) * H * .42, H * .2, H * .82);
  }

  function drawGroundMaterials(map) {
    const seed = Number(String(map.id).replace(/\D/g, "")) || 1;
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const wx = 90 + ((i * 283 + seed * 97) % (W - 180));
      const wy = 80 + ((i * 167 + seed * 53) % (H - 160));
      const pos = project(wx, wy, 1);
      if (!pos || pos.x < -100 || pos.x > W + 100) continue;
      const size = clamp((18 + (i % 5) * 9) * pos.scale, 3, 62);
      ctx.globalAlpha = .12 + (i % 3) * .035;
      ctx.fillStyle = i % 2 ? map.a : map.b;
      if (["lava", "crystal", "snow"].includes(map.kind)) {
        ctx.beginPath();
        for (let n = 0; n < 6; n++) { const a = n / 6 * Math.PI * 2; const r = size * (.65 + ((n + i) % 2) * .35); ctx.lineTo(pos.x + Math.cos(a) * r, pos.y + Math.sin(a) * r * .32); }
        ctx.closePath(); ctx.fill();
      } else {
        ctx.fillRect(pos.x - size, pos.y - size * .18, size * 2, size * .36);
      }
    }
    ctx.restore();
  }

  function drawDistantBattlefield(map) {
    const horizon = viewHorizon();
    ctx.save();
    ctx.globalAlpha = .72;
    ctx.fillStyle = "rgba(8,12,16,.62)";
    const detail = save.settings.quality === "high" ? 18 : save.settings.quality === "balanced" ? 11 : 6;
    for (let i = 0; i < detail; i++) {
      const x = (i * 137 + Math.sin(state.time * .25 + i) * 18) % W;
      const h = 34 + (i % 5) * 16;
      const w = 34 + (i % 4) * 18;
      ctx.fillRect(x, horizon - h, w, h);
      if (i % 3 === 0) ctx.fillRect(x + w * .35, horizon - h - 22, w * .28, 22);
    }
    ctx.globalAlpha = .3;
    ctx.fillStyle = rgba(map.a, .22);
    ctx.fillRect(0, horizon - 4, W, 8);
    ctx.restore();
  }

  function drawThemeLandmarks(map) {
    const horizon = viewHorizon();
    ctx.save();
    ctx.globalAlpha = .72;
    if (map.kind === "lava") {
      ctx.fillStyle = "#171719";
      for (const x of [W * .12, W * .48, W * .82]) {
        ctx.beginPath(); ctx.moveTo(x - 85, horizon); ctx.lineTo(x, horizon - 150); ctx.lineTo(x + 75, horizon); ctx.fill();
      }
      ctx.fillStyle = "rgba(178,64,30,.35)";
      ctx.fillRect(0, horizon - 10, W, 14);
    } else if (map.kind === "crystal" || map.kind === "snow") {
      ctx.fillStyle = map.kind === "snow" ? "#718087" : "#334b67";
      for (const x of [W * .18, W * .52, W * .8]) {
        ctx.beginPath(); ctx.moveTo(x - 60, horizon); ctx.lineTo(x, horizon - 130); ctx.lineTo(x + 42, horizon); ctx.fill();
      }
    } else if (map.kind === "garden") {
      ctx.fillStyle = "#263b2d";
      for (let i = 0; i < 7; i++) {
        const x = 80 + i * 225;
        ctx.fillRect(x - 8, horizon - 68, 16, 68);
        ctx.beginPath(); ctx.arc(x, horizon - 88, 42, 0, Math.PI * 2); ctx.fill();
      }
    } else if (map.kind === "lab") {
      ctx.strokeStyle = "#52625e"; ctx.lineWidth = 18;
      for (const x of [W * .2, W * .72]) {
        ctx.beginPath(); ctx.moveTo(x, horizon); ctx.lineTo(x, horizon - 120); ctx.lineTo(x + 130, horizon - 120); ctx.stroke();
      }
    } else if (map.kind === "rooftop") {
      ctx.fillStyle = "#232b2f";
      for (let i = 0; i < 8; i++) ctx.fillRect(i * 205, horizon - 45 - (i % 3) * 26, 150, 90);
    } else if (map.kind === "water") {
      ctx.fillStyle = "rgba(88,126,137,.32)";
      ctx.fillRect(0, horizon - 5, W, 18);
    } else if (map.kind === "court") {
      ctx.fillStyle = "#30383c";
      ctx.fillRect(0, horizon - 70, W, 70);
      ctx.fillStyle = "rgba(215,210,190,.16)";
      for (let x = 28; x < W; x += 46) ctx.fillRect(x, horizon - 55, 18, 5);
    } else if (map.kind === "blocks") {
      ctx.fillStyle = "#383d3f";
      for (let i = 0; i < 7; i++) ctx.fillRect(45 + i * 225, horizon - 42 - (i % 2) * 38, 115, 80);
    } else if (map.kind === "royal") {
      ctx.strokeStyle = "#625f60"; ctx.lineWidth = 20;
      for (const x of [W * .18, W * .5, W * .82]) {
        ctx.beginPath(); ctx.arc(x, horizon, 72, Math.PI, Math.PI * 2); ctx.stroke();
      }
    } else if (map.kind === "grid") {
      ctx.fillStyle = "#2b3337";
      for (const x of [W * .12, W * .38, W * .67, W * .88]) ctx.fillRect(x, horizon - 105, 28, 105);
    } else if (map.kind === "plaza") {
      ctx.fillStyle = "#46443f";
      for (let i = 0; i < 6; i++) ctx.fillRect(70 + i * 255, horizon - 62 - (i % 3) * 18, 170, 90);
    }
    ctx.restore();
  }

  function drawPerspectiveGrid(map) {
    const horizon = viewHorizon();
    const shine = ctx.createLinearGradient(0, horizon, W, H);
    shine.addColorStop(0, "rgba(255,255,255,.04)");
    shine.addColorStop(.5, "rgba(255,255,255,.02)");
    shine.addColorStop(1, "rgba(0,0,0,.24)");
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(W * .18, horizon);
    ctx.lineTo(W * .82, horizon);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(185,190,176,.14)";
    ctx.lineWidth = 1.5;
    for (let i = -6; i <= 6; i++) {
      const x = W / 2 + i * 132;
      ctx.beginPath();
      ctx.moveTo(W / 2, horizon);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let i = 1; i < 10; i++) {
      const y = horizon + Math.pow(i / 9, 1.65) * (H - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(226,218,190,.34)";
    ctx.fillRect(W / 2 - 4, horizon, 8, H - horizon);
    ctx.strokeStyle = "rgba(230,225,200,.42)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 12);
    ctx.lineTo(W, horizon + 12);
    ctx.stroke();
  }

  function objectDepth(x, y) {
    const p = state.player;
    return (x - p.x) * Math.cos(p.angle) + (y - p.y) * Math.sin(p.angle);
  }

  function project(x, y, lift = 0) {
    const p = state.player;
    const dx = x - p.x;
    const dy = y - p.y;
    const forward = dx * Math.cos(p.angle) + dy * Math.sin(p.angle);
    const side = dx * -Math.sin(p.angle) + dy * Math.cos(p.angle);
    if (forward <= 12) return null;
    const scale = 760 * (90 / save.settings.fov) / forward;
    return {
      x: W / 2 + side * scale,
      y: viewHorizon() + 15500 / forward - (lift - (p.z || 0)) * scale,
      scale,
      depth: forward
    };
  }

  function drawDamagePopups() {
    if (!state?.damagePopups) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const popup of state.damagePopups) {
      const pos = project(popup.x, popup.y, popup.z);
      if (!pos || pos.x < -80 || pos.x > W + 80) continue;
      const alpha = clamp(popup.life / popup.maxLife, 0, 1);
      const size = clamp(24 + popup.value * .08, 24, 42);
      ctx.globalAlpha = Math.min(1, alpha * 1.6);
      ctx.font = `900 ${size}px system-ui`;
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(10,12,13,.86)";
      ctx.strokeText(`${popup.value}`, pos.x, pos.y);
      ctx.fillStyle = popup.value >= 100 ? "#ffcf4a" : "#ffffff";
      ctx.fillText(`${popup.value}`, pos.x, pos.y);
      if (popup.label) {
        ctx.font = "900 15px system-ui";
        ctx.fillStyle = "#ffcf4a";
        ctx.fillText(popup.label, pos.x, pos.y + size * .9);
      }
    }
    ctx.restore();
  }

  function drawFpHazard(hazard) {
    const pos = project(hazard.x, hazard.y, 0);
    if (!pos || pos.x < -300 || pos.x > W + 300) return;
    const width = clamp(hazard.w * pos.scale, 30, 520);
    const height = clamp(hazard.h * pos.scale * .38, 9, 110);
    ctx.save();
    ctx.fillStyle = hazard.color;
    ctx.globalAlpha = .82;
    ctx.beginPath(); ctx.ellipse(pos.x, pos.y, width / 2, height / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hazard.type === "lava" ? "rgba(238,116,49,.72)" : "rgba(215,220,205,.24)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(state.time * (1.4 + i * .3) + i) * height * .18;
      ctx.beginPath();
      ctx.ellipse(pos.x + offset, pos.y, width * (.25 + i * .08), height * (.16 + i * .06), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFpBlock(block) {
    const center = project(block.x + block.w / 2, block.y + block.h / 2);
    if (!center || center.x < -240 || center.x > W + 240) return;
    const width = Math.max(18, block.w * center.scale);
    const height = Math.max(34, (block.z + block.h * .55) * center.scale);
    const baseY = center.y;
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.beginPath();
    ctx.ellipse(center.x + width * .08, baseY + 10, width * .52, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    if (block.material === "obsidian" || block.material === "crystal" || block.material === "ice") {
      ctx.fillStyle = block.color;
      ctx.beginPath();
      ctx.moveTo(center.x, baseY - height);
      ctx.lineTo(center.x + width * .48, baseY - height * .2);
      ctx.lineTo(center.x + width * .32, baseY);
      ctx.lineTo(center.x - width * .42, baseY);
      ctx.lineTo(center.x - width * .5, baseY - height * .32);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = block.material === "obsidian" ? "rgba(189,79,44,.35)" : "rgba(218,232,236,.48)";
      ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(center.x, baseY - height); ctx.lineTo(center.x - width * .08, baseY); ctx.stroke();
      return;
    }
    ctx.fillStyle = "rgba(22,25,27,.78)";
    ctx.fillRect(center.x - width / 2 + 12, baseY - height + 14, width, height);
    ctx.fillStyle = block.color;
    ctx.fillRect(center.x - width / 2, baseY - height, width, height);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(center.x - width / 2 + 5, baseY - height + 5, width - 10, Math.max(3, height * .08));
    ctx.strokeStyle = "rgba(218,214,196,.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(center.x - width / 2, baseY - height, width, height);
    ctx.strokeStyle = "rgba(20,22,21,.3)";
    ctx.lineWidth = 1;
    const seams = Math.min(5, Math.floor(height / 34));
    for (let i = 1; i <= seams; i++) {
      const sy = baseY - height + i * height / (seams + 1);
      ctx.beginPath(); ctx.moveTo(center.x - width / 2, sy); ctx.lineTo(center.x + width / 2, sy); ctx.stroke();
    }
    ctx.fillStyle = "rgba(235,232,214,.09)";
    ctx.fillRect(center.x - width / 2, baseY - height, width, Math.max(5, height * .09));
    ctx.fillStyle = "rgba(8,10,10,.16)";
    const panels = Math.min(6, Math.max(2, Math.floor(width / 70)));
    for (let i = 1; i < panels; i++) ctx.fillRect(center.x - width / 2 + width * i / panels, baseY - height, 2, height);
    if (["crate", "vent", "tank", "barrier", "bleachers"].includes(block.material)) {
      ctx.strokeStyle = "rgba(10,12,12,.42)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(center.x - width / 2, baseY - height); ctx.lineTo(center.x + width / 2, baseY);
      ctx.moveTo(center.x + width / 2, baseY - height); ctx.lineTo(center.x - width / 2, baseY);
      ctx.stroke();
    }
  }

  function drawFpWall(w) {
    const pos = project(w.x, w.y);
    if (!pos) return;
    const width = Math.max(28, w.w * pos.scale);
    const height = Math.max(28, 70 * pos.scale);
    ctx.fillStyle = w.color;
    ctx.globalAlpha = Math.min(.8, w.life / 2);
    ctx.fillRect(pos.x - width / 2, pos.y - height, width, height);
    ctx.globalAlpha = 1;
  }

  function drawFpTechnique(t) {
    const pos = project(t.x, t.y, t.type === "portal" ? 28 : 8);
    if (!pos || pos.x < -160 || pos.x > W + 160) return;
    const base = clamp(t.r * pos.scale, 12, 92);
    ctx.save();
    ctx.globalAlpha = t.cool > 0 ? .72 : 1;
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.beginPath();
    ctx.ellipse(pos.x + base * .18, pos.y + base * .78, base * 1.1, base * .32, 0, 0, Math.PI * 2);
    ctx.fill();
    if (t.type === "lane") {
      const width = clamp(t.w * pos.scale, 46, 280);
      const height = clamp(t.h * pos.scale, 12, 58);
      ctx.fillStyle = "#343a3c";
      ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);
      ctx.strokeStyle = "rgba(220,214,190,.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - width / 2, pos.y - height / 2, width, height);
      for (let i = -1; i <= 1; i++) {
        ctx.strokeStyle = "rgba(205,196,165,.5)";
        ctx.beginPath();
        ctx.moveTo(pos.x + i * width * .22 - 10, pos.y - height * .28);
        ctx.lineTo(pos.x + i * width * .22 + 12, pos.y);
        ctx.lineTo(pos.x + i * width * .22 - 10, pos.y + height * .28);
        ctx.stroke();
      }
    } else if (t.type === "portal") {
      ctx.strokeStyle = "#4c5357";
      ctx.lineWidth = clamp(13 * pos.scale, 7, 22);
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y - base * .22, base * .72, base * 1.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(185,161,105,.45)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (t.type === "jump") {
      ctx.fillStyle = "#272b2b";
      ctx.beginPath(); ctx.ellipse(pos.x, pos.y + base * .26, base, base * .42, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = t.color;
      ctx.lineWidth = clamp(7 * pos.scale, 3, 11);
      for (let i = 0; i < 3; i++) {
        const lift = i * base * .19 + Math.sin(state.time * 6 + i) * 2;
        ctx.beginPath(); ctx.ellipse(pos.x, pos.y + base * .1 - lift, base * (.82 - i * .1), base * .28, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = rgba(t.color, .38);
      ctx.beginPath(); ctx.ellipse(pos.x, pos.y - base * .35, base * .72, base * .25, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = t.type === "jump" ? "#555b58" : "#494e50";
      ctx.beginPath();
      ctx.moveTo(pos.x - base, pos.y + base * .45);
      ctx.lineTo(pos.x + base, pos.y + base * .45);
      ctx.lineTo(pos.x + base * .72, pos.y - base * .35);
      ctx.lineTo(pos.x - base * .72, pos.y - base * .35);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(220,214,190,.34)"; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }

  function drawFpOrb(x, y, radius, color, label) {
    const pos = project(x, y, radius * .4);
    if (!pos || pos.x < -100 || pos.x > W + 100) return;
    const r = clamp(radius * pos.scale, 4, 80);
    ctx.fillStyle = "rgba(20,33,61,.16)";
    ctx.beginPath();
    ctx.ellipse(pos.x + r * .25, pos.y + r * .78, r * .82, r * .28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.beginPath();
    ctx.arc(pos.x - r * .32, pos.y - r * .35, r * .32, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.fillStyle = "#14213d";
      ctx.font = `900 ${clamp(r, 11, 22)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, pos.x, pos.y + 1);
    }
  }

  function drawBallPattern(x, y, radius, skin, rotation = 0, weight = 3) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius * .96, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = skin.secondary;
    ctx.fillStyle = rgba(skin.secondary, .82);
    ctx.lineWidth = weight;
    ctx.lineCap = "round";
    if (skin.pattern === "split") {
      ctx.translate(x, y); ctx.rotate(rotation);
      ctx.fillRect(-radius * 1.2, 0, radius * 2.4, radius * 1.2);
      ctx.beginPath(); ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0); ctx.stroke();
    } else if (skin.pattern === "cross") {
      for (const angle of [rotation, rotation + Math.PI / 2]) {
        ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * -radius, y + Math.sin(angle) * -radius); ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius); ctx.stroke();
      }
    } else if (skin.pattern === "ring") {
      ctx.beginPath(); ctx.ellipse(x, y, radius * .92, radius * .3, rotation, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, radius * .45, radius * .92, rotation, 0, Math.PI * 2); ctx.stroke();
    } else if (skin.pattern === "dots") {
      for (let i = 0; i < 7; i++) { const a = rotation + i * 2.4; const d = radius * (.2 + (i % 3) * .25); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, radius * .1, 0, Math.PI * 2); ctx.fill(); }
    } else if (skin.pattern === "circuit") {
      for (let i = -1; i <= 1; i++) { const offset = i * radius * .35; ctx.beginPath(); ctx.moveTo(x - radius, y + offset); ctx.lineTo(x - radius * .25, y + offset); ctx.lineTo(x, y + offset * .3); ctx.lineTo(x + radius, y + offset * .3); ctx.stroke(); }
    } else if (skin.pattern === "crack") {
      for (let i = 0; i < 5; i++) { const a = rotation + i * Math.PI * .4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a + .18) * radius * .42, y + Math.sin(a + .18) * radius * .42); ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius); ctx.stroke(); }
    } else if (skin.pattern === "crown") {
      ctx.beginPath(); ctx.moveTo(x - radius, y + radius * .25); ctx.lineTo(x - radius * .5, y - radius * .45); ctx.lineTo(x, y + radius * .08); ctx.lineTo(x + radius * .5, y - radius * .45); ctx.lineTo(x + radius, y + radius * .25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - radius, y + radius * .42); ctx.lineTo(x + radius, y + radius * .42); ctx.stroke();
    } else {
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(x, y, radius * .72, radius * (.2 + Math.abs(i) * .05), rotation + i * .75, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.restore();
  }

  function drawFpBall(ball) {
    const pos = project(ball.x, ball.y, (ball.z || 0) + (ball.r + 8) * .45 + Math.sin(ball.spin) * 4);
    if (!pos || pos.x < -120 || pos.x > W + 120) return;
    const r = clamp((ball.r + 10) * pos.scale, 11, 92);
    const skin = ballSkins.find(entry => entry.id === ball.skinId) || ballSkins[0];
    const flightColor = ball.team === "player" || ball.team === "ally" ? FRIENDLY_COLOR : ENEMY_COLOR;
    const trailTime = .09;
    const previous = project(
      ball.x - ball.vx * trailTime,
      ball.y - ball.vy * trailTime,
      (ball.z || 0) - (ball.vz || 0) * trailTime + (ball.r + 8) * .45
    );
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = .2;
    ctx.strokeStyle = flightColor;
    ctx.lineWidth = clamp(24 * pos.scale, 10, 34);
    ctx.beginPath();
    ctx.moveTo(previous?.x ?? pos.x, previous?.y ?? pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalAlpha = .82;
    ctx.lineWidth = clamp(8 * pos.scale, 4, 14);
    ctx.beginPath();
    ctx.moveTo(previous?.x ?? pos.x, previous?.y ?? pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalAlpha = .75;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = clamp(2.2 * pos.scale, 1.5, 4);
    ctx.beginPath();
    ctx.moveTo(previous?.x ?? pos.x, previous?.y ?? pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(skin.primary, .18);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 1.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(20,33,61,.18)";
    ctx.beginPath();
    ctx.ellipse(pos.x + r * .22, pos.y + r * .84, r * .9, r * .28, 0, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(pos.x - r * .35, pos.y - r * .35, r * .12, pos.x, pos.y, r);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(.22, rgba(skin.primary, .96));
    g.addColorStop(1, rgba(skin.primary, .7));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = clamp(4 * pos.scale, 2, 7);
    ctx.stroke();
    ctx.strokeStyle = flightColor;
    ctx.lineWidth = clamp(3 * pos.scale, 2, 5);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 1.24, ball.spin, ball.spin + Math.PI * 1.55);
    ctx.stroke();
    drawBallPattern(pos.x, pos.y, r, skin, ball.spin, clamp(3 * pos.scale, 1.5, 5));
    drawProjectileEffect(ball, pos, r);
    ctx.restore();
  }

  function drawProjectileEffect(ball, pos, r) {
    const effect = ball.effect;
    ctx.strokeStyle = ball.color;
    ctx.fillStyle = rgba(ball.color, .35);
    ctx.lineWidth = Math.max(2, r * .1);
    if (effect === "burn") {
      for (let i = 0; i < 4; i++) {
        const a = ball.spin + i * Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(pos.x + Math.cos(a) * r, pos.y + Math.sin(a) * r);
        ctx.lineTo(pos.x + Math.cos(a + .3) * r * 1.8, pos.y + Math.sin(a + .3) * r * 1.8); ctx.lineTo(pos.x + Math.cos(a - .3) * r * 1.25, pos.y + Math.sin(a - .3) * r * 1.25); ctx.closePath(); ctx.fill();
      }
    } else if (effect === "poison" || effect === "bubble") {
      for (let i = 0; i < 4; i++) { const a = ball.spin + i * 1.7; ctx.beginPath(); ctx.arc(pos.x + Math.cos(a) * r * 1.35, pos.y + Math.sin(a) * r * 1.35, r * (.16 + i * .035), 0, Math.PI * 2); ctx.stroke(); }
    } else if (effect === "freeze") {
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + ball.spin; ctx.beginPath(); ctx.moveTo(pos.x + Math.cos(a) * r * .7, pos.y + Math.sin(a) * r * .7); ctx.lineTo(pos.x + Math.cos(a) * r * 1.55, pos.y + Math.sin(a) * r * 1.55); ctx.stroke(); }
    } else if (effect === "chain" || effect === "plasma") {
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) { const a = ball.spin + i * 2.1; ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(pos.x + Math.cos(a) * r * .8, pos.y + Math.sin(a) * r * .4); ctx.lineTo(pos.x + Math.cos(a + .2) * r * 1.65, pos.y + Math.sin(a + .2) * r * 1.65); ctx.stroke(); }
      ctx.globalCompositeOperation = "source-over";
    } else if (effect === "quake" || effect === "metal") {
      ctx.lineWidth = Math.max(3, r * .14);
      ctx.strokeRect(pos.x - r * .86, pos.y - r * .86, r * 1.72, r * 1.72);
    } else if (effect === "root") {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.28, ball.spin, ball.spin + Math.PI * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.55, -ball.spin, -ball.spin + Math.PI); ctx.stroke();
    } else if (effect === "void" || effect === "orbit") {
      ctx.beginPath(); ctx.ellipse(pos.x, pos.y, r * 1.65, r * .5, ball.spin, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(pos.x, pos.y, r * 1.65, r * .5, -ball.spin, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawFpParticle(particle) {
    const lift = particle.type === "field" ? 7 : 24;
    const pos = project(particle.x, particle.y, particle.z ?? lift);
    if (!pos || pos.x < -80 || pos.x > W + 80) return;
    ctx.save();
    const lifeRatio = clamp(particle.life / (particle.maxLife || 1), 0, 1);
    ctx.globalAlpha = clamp(particle.life, 0, 1) * (particle.type === "field" ? .32 : .7);
    ctx.strokeStyle = particle.color;
    ctx.fillStyle = particle.color;
    if (particle.type === "field") {
      ctx.lineWidth = clamp(5 * pos.scale, 2, 9);
      ctx.beginPath(); ctx.ellipse(pos.x, pos.y, clamp(particle.r * pos.scale, 12, 230), clamp(particle.r * pos.scale * .3, 5, 70), 0, 0, Math.PI * 2); ctx.stroke();
    } else if (particle.type === "impact") {
      const progress = 1 - lifeRatio;
      const radius = clamp(particle.r * pos.scale * (1 + progress * 1.65), 10, 72);
      ctx.globalAlpha = lifeRatio;
      ctx.lineWidth = clamp(7 * pos.scale * lifeRatio, 2, 10);
      ctx.strokeStyle = particle.surfaceColor || particle.color;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = clamp(4 * pos.scale, 1.5, 7);
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2 + progress * .25;
        ctx.beginPath();
        ctx.moveTo(pos.x + Math.cos(a) * radius * .45, pos.y + Math.sin(a) * radius * .45);
        ctx.lineTo(pos.x + Math.cos(a) * radius * (1.05 + (i % 2) * .12), pos.y + Math.sin(a) * radius * (1.05 + (i % 2) * .12));
        ctx.stroke();
      }
    } else if (particle.type === "vanish") {
      const progress = 1 - lifeRatio;
      const radius = clamp(particle.r * pos.scale * (1.7 - progress * 1.25), 4, 90);
      ctx.globalAlpha = lifeRatio * .75;
      ctx.lineWidth = clamp(5 * pos.scale, 2, 8);
      ctx.setLineDash([5, 7]);
      ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, progress * 3, progress * 3 + Math.PI * 1.7); ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, clamp(particle.r * pos.scale, 2, 12), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawFpActor(actor) {
    if (!actor.alive) return;
    const pos = project(actor.x, actor.y, 22 + (actor.z || 0) * .42);
    if (!pos || pos.x < -120 || pos.x > W + 120) return;
    const crouch = actor.dive > 0 ? .86 : 1;
    const size = clamp(34 * pos.scale, 20, 150);
    const color = actor.team === "ally" || actor.team === "player" ? FRIENDLY_COLOR : ENEMY_COLOR;
    const actorSkin = ballSkins.find(skin => skin.id === actor.skinId) || ballSkins[0];
    const stride = Math.sin(state.time * 10 + actor.x * .02) * size * .18;
    ctx.fillStyle = "rgba(20,33,61,.18)";
    ctx.beginPath();
    ctx.ellipse(pos.x + size * .15, pos.y + size * .65, size * .5, size * .16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(color, .95);
    ctx.lineWidth = clamp(size * .12, 4, 15);
    ctx.lineCap = "round";
    const shoulderY = pos.y - size * .02;
    const hipY = pos.y + size * .45 * crouch;
    const throwPose = clamp((actor.throwAnim || 0) / .55, 0, 1);
    const skillPose = clamp((actor.skillAnim || 0) / .75, 0, 1);
    const attackCharge = clamp(actor.charge || 0, 0, 1);
    ctx.beginPath();
    ctx.moveTo(pos.x, shoulderY);
    ctx.lineTo(pos.x, hipY);
    ctx.moveTo(pos.x, shoulderY + size * .08);
    ctx.lineTo(pos.x - size * (.48 + skillPose * .22), shoulderY + size * (.3 - skillPose * .48) + stride * .25);
    ctx.moveTo(pos.x, shoulderY + size * .08);
    ctx.lineTo(pos.x + size * (.48 + throwPose * .4), shoulderY + size * (.22 - throwPose * .7) - stride * .25);
    ctx.moveTo(pos.x, hipY);
    ctx.lineTo(pos.x - size * .3, pos.y + size * .82 + stride);
    ctx.moveTo(pos.x, hipY);
    ctx.lineTo(pos.x + size * .3, pos.y + size * .82 - stride);
    ctx.stroke();
    if (throwPose > .08 || attackCharge > 0) {
      const handX = pos.x + size * (.48 + throwPose * .4);
      const handY = shoulderY + size * (.22 - throwPose * .7) - stride * .25;
      const release = throwPose > 0 && attackCharge === 0 ? clamp((1 - throwPose) / .78, 0, 1) : 0;
      const ballX = handX + (W / 2 - handX) * release;
      const ballY = handY + (H / 2 - handY) * release;
      ctx.fillStyle = actorSkin.primary;
      if (release > 0) {
        ctx.strokeStyle = rgba(actorSkin.primary, .42 * (1 - release));
        ctx.lineWidth = clamp(size * .1, 3, 12);
        ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(ballX, ballY); ctx.stroke();
      }
      const heldRadius = size * (.15 + attackCharge * .1 + release * .08);
      ctx.beginPath(); ctx.arc(ballX, ballY, heldRadius, 0, Math.PI * 2); ctx.fill();
      drawBallPattern(ballX, ballY, heldRadius, actorSkin, state.time * 5, Math.max(1.5, size * .025));
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 2; ctx.stroke();
      if (throwPose > .15) {
        ctx.strokeStyle = `rgba(255,255,255,${throwPose * .42})`;
        ctx.lineWidth = clamp(size * .08, 3, 10);
        ctx.beginPath(); ctx.arc(pos.x + size * .12, shoulderY, size * .72, -.9, .35); ctx.stroke();
      }
    }
    const body = ctx.createLinearGradient(pos.x, pos.y - size, pos.x, pos.y + size * .7);
    body.addColorStop(0, rgba(color, .9));
    body.addColorStop(1, rgba("#14213d", .22));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(pos.x - size * .22, pos.y - size * .1, size * .44, size * .58 * crouch, size * .1);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.82)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - size * .36, size * .38 * crouch, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(pos.x - size * .13, pos.y - size * .42, size * .055, 0, Math.PI * 2);
    ctx.arc(pos.x + size * .13, pos.y - size * .42, size * .055, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = actor.team === "npc" || actor.team === "remote" ? ENEMY_COLOR : FRIENDLY_COLOR;
    ctx.fillRect(pos.x - size * .42, pos.y - size * .96, size * .84 * Math.max(0, actor.hp / actor.hpMax), 6);
    if (attackCharge > 0) {
      ctx.fillStyle = "rgba(8,10,11,.8)";
      ctx.fillRect(pos.x - size * .42, pos.y - size * .86, size * .84, 5);
      ctx.fillStyle = actor.element.color;
      ctx.fillRect(pos.x - size * .42, pos.y - size * .86, size * .84 * attackCharge, 5);
    }
    ctx.fillStyle = "#14213d";
    ctx.font = "900 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(actor.name || actor.element.family, pos.x, pos.y - size * 1.05);
  }

  function drawFpPeer(peer) {
    const element = elements.find(e => e.id === peer.elementId) || elements[0];
    drawFpActor({
      x: peer.x,
      y: peer.y,
      r: 18,
      hp: peer.hp || 100,
      hpMax: peer.hpMax || 100,
      team: "remote",
      element: { ...element, color: peer.color || element.color },
      alive: true,
      name: peer.name || "Player",
      z: peer.z || 0,
      dive: peer.dive || 0,
      charge: peer.charge || 0,
      throwAnim: peer.throwAnim || 0,
      skillAnim: peer.skillAnim || 0,
      lastSkillIndex: peer.lastSkillIndex || 0,
      skinId: peer.skinId || "standard"
    });
  }

  function drawFirstPersonHands() {
    const p = state.player;
    const skin = ballSkins.find(entry => entry.id === p.skinId) || selectedBallSkin();
    const throwPhase = clamp((p.throwAnim || 0) / .55, 0, 1);
    const charge = clamp(p.charge || 0, 0, 1);
    const throwKick = Math.sin(throwPhase * Math.PI) * 145;
    const skillKick = Math.sin(clamp((p.skillAnim || 0) / .75, 0, 1) * Math.PI) * 24;
    const bob = Math.sin(state.time * 9) * (Math.abs(p.vx) + Math.abs(p.vy) > 20 ? 2.5 : .6) - (p.z || 0) * .065 + (p.dive > 0 ? 10 : 0) + (p.hazardSink || 0) * 42 - skillKick;
    ctx.fillStyle = "rgba(20,33,61,.25)";
    ctx.beginPath();
    ctx.ellipse(W * .5, H * .97, W * .18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(FRIENDLY_COLOR, .94);
    ctx.beginPath();
    ctx.roundRect(W * .2, H * .82 + bob, W * .145, H * .095, 18);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(W * .655 + throwKick, H * .82 + bob - throwKick * .45, W * .145, H * .095, 18);
    ctx.fill();
    if (!p.throwAnim) {
      const ballGradient = ctx.createRadialGradient(W * .48, H * .75 + bob, 3, W * .5, H * .8 + bob, 36);
      ballGradient.addColorStop(0, "#ffffff");
      ballGradient.addColorStop(.28, rgba(skin.primary, .96));
      ballGradient.addColorStop(1, rgba(skin.primary, .72));
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(W * .5, H * .8 + bob, 28 + charge * 10 + Math.sin(state.time * (8 + charge * 8)) * (2 + charge * 1.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = "rgba(20,33,61,.38)";
      ctx.lineWidth = 3;
      drawBallPattern(W * .5, H * .8 + bob, 28 + charge * 10, skin, state.time * 2.2, 3);
    }
  }

  function drawPlayerThrowAnimation() {
    const p = state.player;
    if (!p.throwAnim) return;
    const progress = clamp(1 - p.throwAnim / .55, 0, 1);
    const release = clamp(progress / .72, 0, 1);
    const ease = 1 - Math.pow(1 - release, 3);
    const startX = W * .72;
    const startY = H * .82;
    const endX = W * .5;
    const endY = H * .5;
    const x = startX + (endX - startX) * ease;
    const y = startY + (endY - startY) * ease - Math.sin(release * Math.PI) * 58;
    const radius = (36 + (p.lastThrowCharge || 0) * 10) * (1 - ease * .72);
    const skin = ballSkins.find(entry => entry.id === p.lastThrowSkin) || selectedBallSkin();
    const color = skin.primary;
    ctx.save();
    ctx.strokeStyle = rgba(color, .5 * (1 - release));
    ctx.lineWidth = Math.max(5, radius * .42);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    const gradient = ctx.createRadialGradient(x - radius * .3, y - radius * .35, 2, x, y, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(.24, color);
    gradient.addColorStop(1, rgba(color, .76));
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    drawBallPattern(x, y, radius, skin, progress * 8, 3);
    ctx.strokeStyle = "rgba(255,255,255,.82)";
    ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }

  function drawAbilityAnimation() {
    const p = state.player;
    if (!p.skillAnim) return;
    const progress = clamp(1 - p.skillAnim / .75, 0, 1);
    const fade = Math.sin(progress * Math.PI);
    const radius = 30 + progress * (62 + (p.lastSkillIndex || 0) * 26);
    const kind = p.element.kind;
    const action = p.lastSkillAction || p.element.skills[p.lastSkillIndex || 0].action || "skill";
    const actionHash = [...action].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const count = 5 + ((p.element.index || 0) % 5) + (p.lastSkillIndex || 0) * 2;
    const x = W / 2;
    const y = H / 2;
    ctx.save();
    ctx.globalAlpha = fade * .48;
    ctx.strokeStyle = p.element.color;
    ctx.fillStyle = rgba(p.element.color, .22);
    ctx.lineWidth = 10 * (1 - progress) + 2;
    if (kind === "burn") {
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2 + progress;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * radius * .25, y + Math.sin(a) * radius * .25);
        ctx.quadraticCurveTo(x + Math.cos(a + .3) * radius, y + Math.sin(a + .3) * radius, x + Math.cos(a) * radius * 1.28, y + Math.sin(a) * radius * 1.28); ctx.stroke();
      }
    } else if (kind === "poison" || kind === "bubble") {
      for (let i = 0; i < count; i++) {
        const a = i * 2.399 + progress * 3;
        const r = radius * (.2 + (i / count) * .85);
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 8 + (i % 3) * 7 + progress * 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    } else if (kind === "freeze") {
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2 + progress;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius); ctx.lineTo(x + Math.cos(a + .15) * radius * .72, y + Math.sin(a + .15) * radius * .72); ctx.closePath(); ctx.stroke();
      }
    } else if (kind === "chain" || kind === "plasma") {
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let j = 1; j <= 4; j++) ctx.lineTo(x + Math.cos(a) * radius * j / 4 + Math.sin(i + j * 7) * 14, y + Math.sin(a) * radius * j / 4 + Math.cos(i + j * 5) * 14);
        ctx.stroke();
      }
    } else if (kind === "quake" || kind === "metal") {
      ctx.beginPath();
      for (let i = 0; i < count; i++) { const a = i / count * Math.PI * 2; const r = radius * (.72 + (i % 2) * .28); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === "curve" || kind === "orbit") {
      for (let i = 0; i < 3 + (p.lastSkillIndex || 0); i++) { ctx.beginPath(); ctx.arc(x, y, radius * (.45 + i * .22), progress * 5 + i, progress * 5 + i + Math.PI * 1.25); ctx.stroke(); }
    } else if (kind === "root") {
      for (let i = 0; i < count; i++) { const a = i / count * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x, H); ctx.bezierCurveTo(x + Math.cos(a) * radius, y + radius, x - Math.sin(a) * radius, y, x + Math.cos(a) * radius, y - radius * .45); ctx.stroke(); }
    } else if (kind === "heal") {
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillRect(x - 12, y - radius * .65, 24, radius * 1.3); ctx.fillRect(x - radius * .65, y - 12, radius * 1.3, 24);
    } else if (kind === "void") {
      ctx.lineWidth = 18;
      ctx.beginPath(); ctx.ellipse(x, y, radius * .72, radius, progress * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath(); ctx.ellipse(x, y, radius * .35, radius * .72, -progress * 3, 0, Math.PI * 2); ctx.stroke();
    } else {
      for (let i = 0; i < count; i++) { const a = i / count * Math.PI * 2 + progress * 4; ctx.beginPath(); ctx.arc(x + Math.cos(a) * radius, y + Math.sin(a) * radius, 10 + (i % 2) * 8, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = fade * .5;
    ctx.strokeStyle = "rgba(255,255,255,.82)";
    ctx.lineWidth = 2;
    ctx.setLineDash(actionHash % 2 ? [8, 9] : [3, 10]);
    const turn = progress * (2 + actionHash % 3);
    ctx.beginPath();
    ctx.arc(x, y, radius * .68, turn, turn + Math.PI * (1.05 + (actionHash % 3) * .18));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawCrosshair() {
    const x = W / 2;
    const y = H / 2;
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(20,33,61,.9)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.stroke();
    if (state.hitConfirm > 0) {
      const spread = 11 + (1 - state.hitConfirm / .2) * 8;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - spread, y - spread); ctx.lineTo(x - 4, y - 4);
      ctx.moveTo(x + spread, y - spread); ctx.lineTo(x + 4, y - 4);
      ctx.moveTo(x - spread, y + spread); ctx.lineTo(x - 4, y + 4);
      ctx.moveTo(x + spread, y + spread); ctx.lineTo(x + 4, y + 4);
      ctx.stroke();
    }
    const charge = clamp(state.player.charge || 0, 0, 1);
    if (charge > 0) {
      ctx.strokeStyle = state.player.element.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charge);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x - 24, y);
    ctx.lineTo(x - 9, y);
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 24, y);
    ctx.moveTo(x, y - 24);
    ctx.lineTo(x, y - 9);
    ctx.moveTo(x, y + 9);
    ctx.lineTo(x, y + 24);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(20,33,61,.72)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawMiniMap() {
    const s = 138;
    const x = 18;
    const y = 18;
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.fillRect(x, y, s, s * H / W);
    ctx.strokeStyle = "rgba(20,33,61,.25)";
    ctx.strokeRect(x, y, s, s * H / W);
    for (const block of state.mapBlocks || []) {
      ctx.fillStyle = rgba(block.color, .75);
      ctx.fillRect(x + block.x / W * s, y + block.y / H * (s * H / W), block.w / W * s, block.h / H * (s * H / W));
    }
    for (const t of state.techniques || []) {
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(x + t.x / W * s, y + t.y / H * (s * H / W), t.type === "lane" ? 3 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const actor of state.players) {
      if (!actor.alive) continue;
      ctx.fillStyle = actor.team === "player" || actor.team === "ally" ? FRIENDLY_COLOR : ENEMY_COLOR;
      ctx.beginPath();
      ctx.arc(x + actor.x / W * s, y + actor.y / H * (s * H / W), actor.team === "player" ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawArena() {
    const map = state.map || maps[0];
    const court = ctx.createLinearGradient(0, 0, W, H);
    court.addColorStop(0, "#f8fbff");
    court.addColorStop(.45, rgba(map.a, .18));
    court.addColorStop(.72, rgba(map.b, .16));
    court.addColorStop(1, "#ffffff");
    ctx.fillStyle = court;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.62)";
    ctx.beginPath();
    ctx.moveTo(110, 70);
    ctx.lineTo(W - 110, 70);
    ctx.lineTo(W - 45, H - 60);
    ctx.lineTo(45, H - 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(map.a, .2);
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const topX = 110 + (W - 220) * t;
      const botX = 45 + (W - 90) * t;
      ctx.beginPath(); ctx.moveTo(topX, 70); ctx.lineTo(botX, H - 60); ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const y = 70 + Math.pow(i / 9, 1.25) * (H - 130);
      const inset = 110 - (65 * (i / 9));
      ctx.beginPath(); ctx.moveTo(inset, y); ctx.lineTo(W - inset, y); ctx.stroke();
    }
    ctx.strokeStyle = rgba(map.b, .72);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(W / 2, 28);
    ctx.lineTo(W / 2, H - 28);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 9;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = map.a;
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = rgba(map.a, .62);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    if (state.mode === "koth") {
      ctx.strokeStyle = "rgba(255,143,61,.9)";
      ctx.fillStyle = "rgba(255,200,61,.18)";
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 85 + Math.sin(state.time * 3) * 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 72, 0, Math.PI * 2); ctx.fill();
    }
    if (state.mode === "ctf") {
      ctx.fillStyle = state.flag.held ? "#61c48f" : "#e65f5c";
      ctx.fillRect(state.flag.x - 10, state.flag.y - 24, 20, 48);
    }
  }

  function drawMapBlock(block) {
    const z = block.z || 30;
    const side = rgba(block.color, .72);
    ctx.save();
    ctx.fillStyle = "rgba(20,33,61,.16)";
    ctx.beginPath();
    ctx.ellipse(block.x + block.w / 2 + 10, block.y + block.h / 2 + 18, block.w * .68, block.h * .48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.moveTo(block.x, block.y + block.h);
    ctx.lineTo(block.x + z * .45, block.y + block.h + z);
    ctx.lineTo(block.x + block.w + z * .45, block.y + block.h + z);
    ctx.lineTo(block.x + block.w, block.y + block.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba("#14213d", .18);
    ctx.beginPath();
    ctx.moveTo(block.x + block.w, block.y);
    ctx.lineTo(block.x + block.w + z * .45, block.y + z);
    ctx.lineTo(block.x + block.w + z * .45, block.y + block.h + z);
    ctx.lineTo(block.x + block.w, block.y + block.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(block.x + 2, block.y + 2, block.w - 4, block.h - 4);
    ctx.restore();
  }

  function drawWall(w) {
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.rotate(w.a);
    ctx.fillStyle = w.color;
    ctx.globalAlpha = Math.min(.85, w.life / 2);
    ctx.fillRect(-w.w / 2, -w.h / 2, w.w, w.h);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawPowerup(p) {
    const colors = { heal: "#61c48f", haste: "#f2c14e", shield: "#9be7ff", multi: "#ff7bd5" };
    ctx.fillStyle = colors[p.type];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 13 + Math.sin(state.time * 6) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#25304d";
    ctx.font = "900 12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.type[0].toUpperCase(), p.x, p.y);
  }

  function drawBall(b) {
    ctx.fillStyle = "rgba(20,33,61,.18)";
    ctx.beginPath();
    ctx.ellipse(b.x + 5, b.y + b.r + 7, b.r * 1.15, b.r * .42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = .35;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(b.px, b.py); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawParticle(p) {
    if (p.type === "field") {
      ctx.globalAlpha = Math.max(0, p.life / 2.6) * .45;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawActor(actor) {
    if (!actor.alive) return;
    if (actor.clone) {
      ctx.globalAlpha = .45;
      drawActorShape(actor.clone.x, actor.clone.y, actor.r, actor.element.color, "CL");
      ctx.globalAlpha = 1;
    }
    const alpha = actor.invisible > 0 && actor.team !== "player" ? .25 : 1;
    ctx.globalAlpha = alpha;
    if (actor.shield > 0 || actor.invuln > 0) {
      ctx.strokeStyle = actor.invuln > 0 ? "rgba(255,255,255,.95)" : "rgba(40,168,255,.85)";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r + 8 + Math.sin(state.time * 10) * 2, 0, Math.PI * 2); ctx.stroke();
    }
    const color = actor.team === "player" || actor.team === "ally" ? FRIENDLY_COLOR : ENEMY_COLOR;
    drawActorShape(actor.x, actor.y, actor.r, color, actor.team === "player" ? "YOU" : actor.element.family[0]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,.88)";
    ctx.fillRect(actor.x - 26, actor.y - 36, 52, 7);
    ctx.fillStyle = actor.team === "npc" ? ENEMY_COLOR : FRIENDLY_COLOR;
    ctx.fillRect(actor.x - 26, actor.y - 36, 52 * Math.max(0, actor.hp / actor.hpMax), 7);
    if (actor.status.burn > 0 || actor.status.poison > 0 || actor.status.slow > 0 || actor.status.stun > 0 || actor.status.root > 0) {
      ctx.fillStyle = "#25304d";
      ctx.font = "900 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(actor.status.stun > 0 ? "STUN" : actor.status.root > 0 ? "ROOT" : actor.status.poison > 0 ? "POISON" : actor.status.slow > 0 ? "SLOW" : "BURN", actor.x, actor.y + 36);
    }
  }

  function drawActorShape(x, y, r, color, label) {
    ctx.fillStyle = "rgba(20,33,61,.18)";
    ctx.beginPath(); ctx.ellipse(x + 8, y + r + 12, r * 1.25, r * .48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(color, .62);
    ctx.beginPath(); ctx.ellipse(x, y + 9, r * .92, r * 1.02, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - 3, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.42)";
    ctx.beginPath(); ctx.arc(x - r * .33, y - r * .45, r * .34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#25304d";
    ctx.font = "900 12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y - 2);
  }

  function drawHudOverlay() {
    const p = state.player;
    const now = performance.now();
    if (state.lastHudUpdate && now - state.lastHudUpdate < 80) return;
    state.lastHudUpdate = now;
    const hp = Math.max(0, Math.ceil(p.hp));
    const hpMax = Math.ceil(p.hpMax);
    const hpRatio = clamp(p.hp / p.hpMax, 0, 1);
    ui.hpBar.style.width = `${hpRatio * 100}%`;
    ui.hpBar.classList.toggle("low", hpRatio <= .3);
    ui.hpText.textContent = `${hp} / ${hpMax} HP`;
    ui.score.textContent = `${Math.round(state.damageDealt)} DAMAGE  |  ${state.hits} HITS  |  ${state.throws} THROWS`;
    ui.earned.textContent = `+${state.earnedCoins} COINS  |  +${state.earnedXp} XP`;
    ui.xp.style.display = "none";
    ui.ranked.textContent = state.ranked
      ? `${save.ranked.rank.toUpperCase()}  |  ${save.ranked.placements}/10`
      : `LEVEL ${save.level}  |  AI ${save.skillRating.toFixed(1)}`;
    renderSkillList(false);
  }

  function renderSkillList(force = true) {
    if (!state) return;
    if (!force && ui.skills.children.length) {
      [...ui.skills.children].forEach((node, i) => {
        const remaining = state.player.skillCd[i];
        const total = state.player.element.skills[i].cd;
        node.querySelector(".cooldown").textContent = remaining > 0 ? `${remaining.toFixed(1)}s` : "READY";
        node.style.setProperty("--cooldown", `${clamp(remaining / total, 0, 1) * 100}%`);
        node.classList.toggle("cooling", remaining > 0);
      });
      return;
    }
    ui.skills.innerHTML = state.player.element.skills.map((s, i) =>
      `<div class="skill-item" style="--cooldown:${clamp(state.player.skillCd[i] / s.cd, 0, 1) * 100}%"><span><strong>${s.slot}</strong> ${s.name}</span><span class="cooldown">${state.player.skillCd[i] > 0 ? `${state.player.skillCd[i].toFixed(1)}s` : "READY"}</span></div>`
    ).join("");
  }

  function loop(t) {
    const rawDt = (t - lastTime) / 1000 || .016;
    const dt = Math.min(.033, rawDt);
    lastTime = t;
    update(dt);
    draw();
    if (state && !state.over) requestAnimationFrame(loop);
  }

  function friendlyTeam(actor, owner) {
    return actor.team === owner.team || (actor.team === "player" && owner.team === "ally") || (actor.team === "ally" && owner.team === "player");
  }

  function friendlyFireBlocked(actor, ball) {
    if (state.mode === "ffa") return actor.team === ball.team && ball.team !== "npc";
    return friendlyTeam(actor, ball.owner);
  }

  function puff(x, y, color, amount) {
    if (!state) return;
    const limit = save.settings.quality === "high" ? 86 : save.settings.quality === "balanced" ? 60 : 40;
    if (state.particles.length >= limit) return;
    amount = Math.min(amount, limit - state.particles.length);
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      state.particles.push({ type: "spark", x, y, vx: Math.cos(a) * rand(25, 130), vy: Math.sin(a) * rand(25, 130), r: rand(2, 5), life: rand(.25, .75), color });
    }
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function resetSave() {
    if (!confirm("Reset Dodgeball Wars save data?")) return;
    save = defaultSave();
    persist();
    renderAll();
  }

  function connectOnline(room, host = false) {
    const code = String(room || "PUBLIC").trim().toUpperCase() || "PUBLIC";
    if (online.socket) online.socket.close();
    const wsUrl = location.protocol === "file:" ? "ws://localhost:8787" : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
    try {
      const socket = new WebSocket(wsUrl);
      online = { socket, id: null, room: code, connected: false, peers: {}, lastSend: 0, host, matchConfig: null };
      ui.roomCode.value = code;
      updateRoomCard(`Room ${code}`, "Connecting...");
      ui.onlineStatus.textContent = `Connecting to room ${code}...`;
      socket.addEventListener("open", () => {
        online.connected = true;
        combatUi.chat.classList.add("connected");
        socket.send(JSON.stringify({ type: "join", room: code, name: save.username || "Player" }));
        ui.onlineStatus.textContent = `Connected to room ${code}. Share this code with players on the same server.`;
        updateRoomCard(`Room ${code}`, "Waiting for players...");
      });
      socket.addEventListener("message", event => handleOnlineMessage(event.data));
      socket.addEventListener("close", () => {
        online.connected = false;
        combatUi.chat.classList.remove("connected");
        ui.onlineStatus.textContent = "Disconnected. Start server.js to play online.";
        updateRoomCard("Multiplayer code", "Not connected yet");
      });
      socket.addEventListener("error", () => {
        ui.onlineStatus.textContent = "Could not connect. Run server.js, then host or join.";
        updateRoomCard("Multiplayer code", "Server offline");
      });
    } catch {
      ui.onlineStatus.textContent = "WebSocket unavailable in this browser.";
      updateRoomCard("Multiplayer code", "Unavailable");
    }
  }

  function handleOnlineMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type === "hello") {
      online.id = msg.id;
      online.room = msg.room;
      ui.onlineStatus.textContent = `Connected as ${save.username || msg.id} in room ${msg.room}. Start a match and anyone with the same code will appear in-game.`;
      const roomCount = Array.isArray(msg.players) ? msg.players.length : Object.keys(online.peers).length + 1;
      updateRoomCard(`Room ${msg.room}`, `${roomCount} ${roomCount === 1 ? "player" : "players"} online`);
      resetVoteOptions();
      return;
    }
    if (msg.type === "system") {
      const roomCount = Array.isArray(msg.players) ? msg.players.length : Object.keys(online.peers).length + 1;
      updateRoomCard(`Room ${online.room || "PUBLIC"}`, `${roomCount} ${roomCount === 1 ? "player" : "players"} online`);
      return;
    }
    if (msg.type === "chat") {
      appendChat(msg.name || msg.from || "Player", msg.text || "");
      return;
    }
    if (msg.type === "mapvote") {
      castVote(msg.name || msg.from || "Player", msg.mapId);
      renderVoteMaps();
      return;
    }
    if (msg.type === "matchstart") {
      online.matchConfig = { mapId: msg.mapId, mode: msg.mode };
      selectedMap = msg.mapId;
      selectedMode = msg.mode || selectedMode;
      ui.onlineStatus.textContent = `${msg.name || "Host"} selected the match. Press Start Match to join.`;
      return;
    }
    if (msg.type === "hit" && msg.target === online.id && state?.player) {
      const damage = clamp(Number(msg.damage) || 0, 0, 500);
      state.player.hp = Math.max(0, state.player.hp - damage);
      state.damageTaken += damage;
      applyRemoteEffect(state.player, msg.effect, msg.from);
      if (state.player.hp <= 0) state.player.alive = false;
      return;
    }
    if (msg.type === "skill") {
      const peer = online.peers[msg.from];
      if (peer) { peer.skillAnim = .75; peer.lastSkillIndex = clamp(Number(msg.index) || 0, 0, 2); peer.lastSkillAction = msg.action || "skill"; }
      return;
    }
    if (msg.type === "leave") {
      delete online.peers[msg.from];
      const roomCount = Array.isArray(msg.players) ? msg.players.length : Object.keys(online.peers).length + 1;
      updateRoomCard(`Room ${online.room || "PUBLIC"}`, `${roomCount} ${roomCount === 1 ? "player" : "players"} online`);
      return;
    }
    if (msg.type === "snapshot") {
      const previous = online.peers[msg.from];
      online.peers[msg.from] = {
        ...(previous || {}),
        id: msg.from,
        x: previous?.x ?? msg.x,
        y: previous?.y ?? msg.y,
        targetX: msg.x,
        targetY: msg.y,
        hp: msg.hp,
        hpMax: msg.hpMax,
        elementId: msg.element,
        color: msg.color,
        skinId: msg.skinId || previous?.skinId || "standard",
        name: msg.name || "Player",
        z: previous?.z ?? (msg.z || 0),
        targetZ: msg.z || 0,
        dive: msg.dive || 0,
        charge: msg.charge || 0,
        throwAnim: msg.throwAnim || 0,
        skillAnim: Math.max(previous?.skillAnim || 0, msg.skillAnim || 0),
        lastSkillIndex: msg.lastSkillIndex || previous?.lastSkillIndex || 0,
        lastSkillAction: msg.lastSkillAction || previous?.lastSkillAction || "skill",
        updated: performance.now()
      };
      if (state) renderRoundScoreboard();
      updateRoomCard(`Room ${online.room || "PUBLIC"}`, `${Object.keys(online.peers).length + 1} players online`);
      return;
    }
    if (msg.type === "throw" && state) {
      const element = elements.find(e => e.id === msg.element) || selectedElement() || elements[0];
      const owner = {
        x: msg.x,
        y: msg.y,
        team: "remote",
        alive: true,
        element,
        pitch: clamp(Number(msg.pitch) || 0, -.78, .78),
        ai: Math.max(1, save.skillRating || 1)
      };
      const charge = clamp(Number(msg.charge) || 0, 0, 1);
      throwBall(owner, msg.tx, msg.ty, msg.special || 0, {
        remote: true,
        rawDamage: true,
        charge,
        color: msg.color || element.color,
        skinId: msg.skinId || "standard",
        effect: msg.effect || element.kind,
        damage: clamp(Number(msg.damage) || damageFor(owner), 1, 1200),
        speed: clamp(Number(msg.speed) || 430 + charge * 390, 80, 1200),
        r: clamp(Number(msg.radius) || 10 + charge * 8, 6, 32),
        life: clamp(Number(msg.life) || 1.9 + charge * .55, .2, 6),
        pierce: clamp(Number(msg.pierce) || 0, 0, 8),
        homing: clamp(Number(msg.homing) || 0, 0, 1.3),
        curve: clamp(Number(msg.curve) || 0, -14, 14),
        bounces: clamp(Number(msg.bounces) || 0, 0, 8),
        split: Boolean(msg.split)
      });
    }
  }

  function applyRemoteEffect(actor, effect, ownerId) {
    const profile = damageProfiles[effect] || {};
    if (profile.burn) actor.status.burn = Math.max(actor.status.burn, profile.burn);
    if (profile.poison) actor.status.poison = Math.max(actor.status.poison, profile.poison);
    if (profile.slow) actor.status.slow = Math.max(actor.status.slow, profile.slow);
    if (profile.stun) actor.status.stun = Math.max(actor.status.stun, profile.stun);
    if (profile.root) actor.status.root = Math.max(actor.status.root, profile.root);
    if (profile.mark) actor.status.mark = Math.max(actor.status.mark, profile.mark);
    actor.remoteDotOwner = ownerId;
  }

  function sendOnline(msg) {
    if (!online.connected || !online.socket || online.socket.readyState !== WebSocket.OPEN) return;
    online.socket.send(JSON.stringify(msg));
  }

  function appendChat(name, message) {
    const text = String(message).trim().slice(0, 120);
    if (!text) return;
    const row = document.createElement("p");
    const user = document.createElement("strong");
    user.textContent = `${String(name).slice(0, 16)}: `;
    row.append(user, document.createTextNode(text));
    combatUi.messages.appendChild(row);
    while (combatUi.messages.children.length > 8) combatUi.messages.firstElementChild.remove();
    combatUi.messages.scrollTop = combatUi.messages.scrollHeight;
  }

  function sendChat() {
    const message = combatUi.input.value.trim();
    if (!message || !online.connected) return;
    appendChat(save.username || "Player", message);
    sendOnline({ type: "chat", name: save.username || "Player", text: message });
    combatUi.input.value = "";
    combatUi.input.blur();
    enterImmersiveMode();
  }

  function updateOnline(dt) {
    if (!online.connected || !state?.player) return;
    online.lastSend -= dt;
    if (online.lastSend > 0) return;
    online.lastSend = .08;
    const p = state.player;
    sendOnline({
      type: "snapshot",
      x: Math.round(p.x),
      y: Math.round(p.y),
      hp: Math.round(p.hp),
      hpMax: p.hpMax,
      element: p.element.id,
      color: p.element.color,
      skinId: p.skinId || save.selectedSkin,
      name: save.username || "Player",
      z: Math.round(p.z || 0),
      dive: p.dive || 0,
      charge: p.charge || 0,
      throwAnim: p.throwAnim || 0,
      skillAnim: p.skillAnim || 0,
      lastSkillIndex: p.lastSkillIndex || 0,
      lastSkillAction: p.lastSkillAction || "skill"
    });
  }

  function updateRoomCard(title, detail) {
    if (!ui.onlineRoomCard) return;
    ui.onlineRoomCard.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
  }

  async function enterImmersiveMode() {
    if (!state) return;
    if (!document.fullscreenElement && ui.game.requestFullscreen) {
      try { await ui.game.requestFullscreen(); } catch {}
    }
    if (canvas.requestPointerLock && document.pointerLockElement !== canvas) {
      try { canvas.requestPointerLock(); } catch {}
    }
  }

  function leaveImmersiveMode() {
    if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
    if (document.exitFullscreen && document.fullscreenElement) {
      const leave = document.exitFullscreen();
      if (leave?.catch) leave.catch(() => {});
    }
  }

  function drawOnlinePeers() {
    if (!online.connected) return;
    for (const peer of Object.values(online.peers)) {
      if (performance.now() - peer.updated > 5000) continue;
      const element = elements.find(e => e.id === peer.elementId) || elements[0];
      const actor = {
        x: peer.x,
        y: peer.y,
        r: 18,
        hp: peer.hp,
        hpMax: peer.hpMax,
        team: "remote",
        element: { ...element, color: peer.color || element.color },
        alive: true,
        shield: 0,
        invuln: 0,
        invisible: 0,
        clone: null,
        status: { burn: 0, poison: 0, slow: 0, stun: 0, root: 0 }
      };
      drawActor(actor);
    }
  }

  function showOnlineStatus(action) {
    const code = ui.roomCode.value.trim().toUpperCase();
    if (action === "host") connectOnline(code || Math.random().toString(36).slice(2, 7).toUpperCase(), true);
    else if (code) connectOnline(code, false);
    else ui.onlineStatus.textContent = "Enter a room code first.";
  }

  document.addEventListener("mousemove", ev => {
    if (state?.player && (document.pointerLockElement === canvas || ui.game.classList.contains("active"))) {
      mouse.x = W / 2;
      mouse.y = H / 2;
      const sensitivity = save.settings.sensitivity / 100000;
      const smoothX = clamp(ev.movementX, -80, 80);
      const smoothY = clamp(ev.movementY, -80, 80);
      state.player.lookAngle = (state.player.lookAngle ?? state.player.angle) + smoothX * sensitivity * 10;
      const vertical = smoothY * sensitivity * 7.5 * (save.settings.invertY ? -1 : 1);
      state.player.lookPitch = clamp((state.player.lookPitch ?? state.player.pitch) + vertical, -.78, .78);
      if (document.pointerLockElement === canvas) {
        mouse.edgeX = 0;
        mouse.edgeY = 0;
      } else {
        const edge = 30;
        mouse.edgeX = ev.clientX <= edge ? -1 : ev.clientX >= innerWidth - edge ? 1 : 0;
        mouse.edgeY = ev.clientY <= edge ? -1 : ev.clientY >= innerHeight - edge ? 1 : 0;
      }
    }
  });
  document.addEventListener("mouseleave", () => {
    mouse.edgeX = 0;
    mouse.edgeY = 0;
  });
  canvas.addEventListener("mousedown", ev => {
    canvas.focus({ preventScroll: true });
    if (state) enterImmersiveMode();
    if (ev.button === 2) mouse.right = true;
    if (ev.button === 0) {
      mouse.left = true;
      fireWeaponShot();
    }
  });
  canvas.addEventListener("contextmenu", ev => ev.preventDefault());
  ui.game.addEventListener("mousedown", ev => {
    if (ev.target !== canvas && !ev.target.closest("button, input, select")) enterImmersiveMode();
  });
  window.addEventListener("mouseup", ev => {
    if (ev.button === 2) mouse.right = false;
    if (ev.button === 0) mouse.left = false;
  });
  window.addEventListener("keydown", ev => {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLSelectElement) return;
    if (state && online.connected && ev.key === "Enter") {
      ev.preventDefault();
      if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
      combatUi.input.focus();
      return;
    }
    keys.add(ev.key.toLowerCase());
    keys.add(ev.code.toLowerCase());
    if (!state) return;
    if (ev.key.toLowerCase() === "q") useSkill(0);
    if (ev.key.toLowerCase() === "e") useSkill(1);
    if (ev.key.toLowerCase() === "r") useSkill(2);
    if (ev.code === "Space") { ev.preventDefault(); jumpPlayer(); }
    if (ev.key.toLowerCase() === "f") dodgeRoll();
  });
  window.addEventListener("keyup", ev => {
    keys.delete(ev.key.toLowerCase());
    keys.delete(ev.code.toLowerCase());
  });
  document.addEventListener("pointerlockchange", () => {
    document.body.classList.toggle("cursor-locked", document.pointerLockElement === canvas);
    if (document.pointerLockElement === canvas) {
      mouse.edgeX = 0;
      mouse.edgeY = 0;
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === ui.game && state && document.pointerLockElement !== canvas) {
      try { canvas.requestPointerLock(); } catch {}
    }
  });

  qs("playPageBtn").addEventListener("click", () => showPage("playScreen"));
  qs("profilePageBtn").addEventListener("click", () => showPage("profileScreen"));
  qs("elementsPageBtn").addEventListener("click", () => showPage("elementsScreen"));
  qs("ballPageBtn").addEventListener("click", () => showPage("ballScreen"));
  qs("shopPageBtn").addEventListener("click", () => showPage("shopScreen"));
  qs("upgradesPageBtn").addEventListener("click", () => showPage("upgradesScreen"));
  qs("rankedPageBtn").addEventListener("click", () => showPage("rankedScreen"));
  qs("onlinePageBtn").addEventListener("click", () => showPage("onlineScreen"));
  qs("settingsPageBtn").addEventListener("click", () => showPage("settingsScreen"));
  document.querySelectorAll(".back-btn").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page || "homeScreen")));
  qs("saveUsernameBtn").addEventListener("click", saveUsername);
  qs("refreshVoteBtn").addEventListener("click", resetVoteOptions);
  qs("startBtn").addEventListener("click", startMatch);
  qs("restartBtn").addEventListener("click", () => {
    state = null;
    leaveImmersiveMode();
    resetVoteOptions();
    showPage("playScreen");
  });
  qs("homeBtn").addEventListener("click", () => {
    state = null;
    leaveImmersiveMode();
    showPage("homeScreen");
  });
  qs("resetBtn").addEventListener("click", resetSave);
  ui.hostRoom.addEventListener("click", () => {
    ui.roomCode.value = Math.random().toString(36).slice(2, 7).toUpperCase();
    showOnlineStatus("host");
  });
  ui.joinRoom.addEventListener("click", () => showOnlineStatus("join"));
  ui.closeDrone.addEventListener("click", () => { ui.droneInspection.hidden = true; });
  combatUi.form.addEventListener("submit", ev => { ev.preventDefault(); sendChat(); });
  combatUi.resultMaps.addEventListener("click", () => {
    state = null;
    leaveImmersiveMode();
    resetVoteOptions();
    showPage("playScreen");
  });
  ui.search.addEventListener("input", renderElements);
  ui.tier.addEventListener("change", renderElements);
  settingsUi.sensitivity.addEventListener("input", () => { save.settings.sensitivity = Number(settingsUi.sensitivity.value); settingsUi.sensitivityValue.textContent = save.settings.sensitivity; persist(); });
  settingsUi.volume.addEventListener("input", () => { save.settings.volume = Number(settingsUi.volume.value); settingsUi.volumeValue.textContent = save.settings.volume; persist(); });
  settingsUi.fov.addEventListener("input", () => { save.settings.fov = Number(settingsUi.fov.value); settingsUi.fovValue.textContent = save.settings.fov; persist(); });
  settingsUi.quality.addEventListener("change", () => { save.settings.quality = settingsUi.quality.value; persist(); });
  settingsUi.invertY.addEventListener("change", () => { save.settings.invertY = settingsUi.invertY.checked; persist(); });
  settingsUi.minimap.addEventListener("change", () => { save.settings.minimap = settingsUi.minimap.checked; persist(); });
  setInterval(tickLobbyVotes, 1000);

  function renderAll() {
    applySettings();
    if (allFinalsUnlocked() && !save.unlocked.includes("omni-invincible-final")) {
      save.ultimateUnlocked = true;
    }
    renderProfile();
    renderModes();
    renderMaps();
    renderVoteMaps();
    renderRanked();
    renderPaths();
    renderUpgrades();
    renderSelected();
    renderSelectedBall();
    renderBallTypes();
    renderShop();
    renderElements();
    updateStartAvailability();
  }

  persist();
  renderAll();
})();
