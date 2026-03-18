// ── ANCESTRY & COMMUNITY DATA ──

const ANCESTRY_DATA = {
  'Mixed Ancestry': {
    description: 'Take the first feature of one ancestry and the second feature of another.',
    features: [
      { name: 'Mixed Heritage', text: 'Choose two ancestries. Take the first (top) feature from one and the second (bottom) feature from the other. Record both ancestries in your Heritage field.' }
    ]
  },
  Clank: {
    description: 'Clanks are sentient mechanical beings built from a variety of materials, including metal, wood, and stone.',
    features: [
      { name: 'Purposeful Design', text: 'Decide who made you and for what purpose. At character creation, choose one of your Experiences that best aligns with this purpose and gain a permanent +1 bonus to it.' },
      { name: 'Efficient', text: 'When you take a short rest, you can choose a long rest move instead of a short rest move.' },
    ]
  },
  Drakona: {
    description: 'Drakona resemble wingless dragons in humanoid form and possess a powerful elemental breath.',
    features: [
      { name: 'Scales', text: 'Your scales act as natural protection. When you would take Severe damage, you can mark a Stress to mark 1 fewer Hit Points.' },
      { name: 'Elemental Breath', text: 'Choose an element for your breath (such as electricity, fire, or ice). You can use this breath against a target or group of targets within Very Close range, treating it as an instinct weapon that deals d8 magic damage using your Proficiency.' },
    ]
  },
  Dwarf: {
    description: 'Dwarves are most easily recognized as short humanoids with square frames, dense musculature, and thick hair.',
    features: [
      { name: 'Thick Skin', text: 'When you take Minor damage, you can mark 2 Stress instead of marking a Hit Point.' },
      { name: 'Increased Fortitude', text: 'Spend 3 Hope to halve incoming physical damage.' },
    ]
  },
  Elf: {
    description: 'Elves are typically tall humanoids with pointed ears and acutely attuned senses.',
    features: [
      { name: 'Quick Reactions', text: 'Mark a Stress to gain advantage on a reaction roll.' },
      { name: 'Celestial Trance', text: 'During a rest, you can drop into a trance to choose an additional downtime move.' },
    ]
  },
  Faerie: {
    description: 'Faeries are winged humanoid creatures with insectile features.',
    features: [
      { name: 'Luckbender', text: 'Once per session, after you or a willing ally within Close range makes an action roll, you can spend 3 Hope to reroll the Duality Dice.' },
      { name: 'Wings', text: 'You can fly. While flying, you can mark a Stress after an adversary makes an attack against you to gain a +2 bonus to your Evasion against that attack.' },
    ]
  },
  Faun: {
    description: 'Fauns resemble humanoid goats with curving horns, square pupils, and cloven hooves.',
    features: [
      { name: 'Caprine Leap', text: 'You can leap anywhere within Close range as though you were using normal movement, allowing you to vault obstacles, jump across gaps, or scale barriers with ease.' },
      { name: 'Kick', text: 'When you succeed on an attack against a target within Melee range, you can mark a Stress to kick yourself off them, dealing an extra 2d6 damage and knocking back either yourself or the target to Very Close range.' },
    ]
  },
  Firbolg: {
    description: 'Firbolgs are bovine humanoids typically recognized by their broad noses and long, drooping ears.',
    features: [
      { name: 'Charge', text: 'When you succeed on an Agility Roll to move from Far or Very Far range with one or more targets into Melee range, you can mark a Stress to deal 1d12 physical damage to all targets within Melee range.' },
      { name: 'Unshakable', text: 'When you would mark a Stress, roll a d6. On a result of 6, don\'t mark it.' },
    ]
  },
  Fungril: {
    description: 'Fungril resemble humanoid mushrooms.',
    features: [
      { name: 'Fungril Network', text: 'Make an Instinct Roll (12) to use your mycelial array to speak with others of your ancestry. On a success, you can communicate across any distance.' },
      { name: 'Death Connection', text: 'While touching a corpse that died recently, you can mark a Stress to extract one memory from the corpse related to a specific emotion or sensation of your choice.' },
    ]
  },
  Galapa: {
    description: 'Galapa resemble anthropomorphic turtles with large, domed shells into which they can retract.',
    features: [
      { name: 'Shell', text: 'Gain a bonus to your damage thresholds equal to your Proficiency.' },
      { name: 'Retract', text: 'Mark a Stress to retract into your shell. While in your shell, you have resistance to physical damage, you have disadvantage on action rolls, and you can\'t move.' },
    ]
  },
  Giant: {
    description: 'Giants are towering humanoids with broad shoulders, long arms, and one to three eyes.',
    features: [
      { name: 'Endurance', text: 'Gain an additional Hit Point slot at character creation.' },
      { name: 'Reach', text: 'Treat any weapon, ability, spell, or other feature that has a Melee range to have a Very Close range instead.' },
    ]
  },
  Goblin: {
    description: 'Goblins are small humanoids easily recognizable by their large eyes and massive membranous ears.',
    features: [
      { name: 'Surefooted', text: 'You ignore disadvantage on Agility Rolls.' },
      { name: 'Danger Sense', text: 'Once per rest, mark a Stress to force an adversary to reroll an attack against you or an ally within Very Close range.' },
    ]
  },
  Halfling: {
    description: 'Halflings are small humanoids with large hairy feet and prominent rounded ears.',
    features: [
      { name: 'Luckbringer', text: 'At the start of each session, everyone in your party gains a Hope.' },
      { name: 'Internal Compass', text: 'When you roll a 1 on your Hope Die, you can reroll it.' },
    ]
  },
  Human: {
    description: 'Humans are most easily recognized by their dexterous hands, rounded ears, and bodies built for endurance.',
    features: [
      { name: 'High Stamina', text: 'Gain an additional Stress slot at character creation.' },
      { name: 'Adaptability', text: 'When you fail a roll that utilized one of your Experiences, you can mark a Stress to reroll.' },
    ]
  },
  Infernis: {
    description: 'Infernis are humanoids who possess sharp canine teeth, pointed ears, and horns. They are the descendants of demons from the Circles Below.',
    features: [
      { name: 'Fearless', text: 'When you roll with Fear, you can mark 2 Stress to change it into a roll with Hope instead.' },
      { name: 'Dread Visage', text: 'You have advantage on rolls to intimidate hostile creatures.' },
    ]
  },
  Katari: {
    description: 'Katari are feline humanoids with retractable claws, vertically slit pupils, and high, triangular ears.',
    features: [
      { name: 'Feline Instincts', text: 'When you make an Agility Roll, you can spend 2 Hope to reroll your Hope Die.' },
      { name: 'Retracting Claws', text: 'Make an Agility Roll to scratch a target within Melee range. On a success, they become temporarily Vulnerable.' },
    ]
  },
  Orc: {
    description: 'Orcs are humanoids most easily recognized by their square features and boar-like tusks that protrude from their lower jaw.',
    features: [
      { name: 'Sturdy', text: 'When you have 1 Hit Point remaining, attacks against you have disadvantage.' },
      { name: 'Tusks', text: 'When you succeed on an attack against a target within Melee range, you can spend a Hope to gore the target with your tusks, dealing an extra 1d6 damage.' },
    ]
  },
  Ribbet: {
    description: 'Ribbets resemble anthropomorphic frogs with protruding eyes and webbed hands and feet.',
    features: [
      { name: 'Amphibious', text: 'You can breathe and move naturally underwater.' },
      { name: 'Long Tongue', text: 'You can use your long tongue to grab onto things within Close range. Mark a Stress to use your tongue as a Finesse Close weapon that deals d12 physical damage using your Proficiency.' },
    ]
  },
  Simiah: {
    description: 'Simiah resemble anthropomorphic monkeys and apes with long limbs and prehensile feet.',
    features: [
      { name: 'Natural Climber', text: 'You have advantage on Agility Rolls that involve balancing and climbing.' },
      { name: 'Nimble', text: 'Gain a permanent +1 bonus to your Evasion at character creation.' },
    ]
  },
};

// ─────────────────────────────────────────────
// COMMUNITY DATA
// ─────────────────────────────────────────────
const COMMUNITY_DATA = {
  Highborne: {
    description: 'Being part of a highborne community means you\'re accustomed to a life of elegance, opulence, and prestige within the upper echelons of society.',
    features: [
      { name: 'Privilege', text: 'You have advantage on rolls to consort with nobles, negotiate prices, or leverage your reputation to get what you want.' },
    ]
  },
  Loreborne: {
    description: 'Being part of a loreborne community means you\'re from a society that favors strong academic or political prowess.',
    features: [
      { name: 'Well-Read', text: 'You have advantage on rolls that involve the history, culture, or politics of a prominent person or place.' },
    ]
  },
  Orderborne: {
    description: 'Being part of an orderborne community means you\'re from a collective that focuses on discipline or faith, and you uphold a set of principles that reflect your experience there.',
    features: [
      { name: 'Dedicated', text: 'Record three sayings or values your upbringing instilled in you. Once per rest, when you describe how you\'re embodying one of these principles through your current action, you can roll a d20 as your Hope Die.' },
    ]
  },
  Ridgeborne: {
    description: 'Being part of a ridgeborne community means you\'ve called the rocky peaks and sharp cliffs of the mountainside home.',
    features: [
      { name: 'Steady', text: 'You have advantage on rolls to traverse dangerous cliffs and ledges, navigate harsh environments, and use your survival knowledge.' },
    ]
  },
  Seaborne: {
    description: 'Being part of a seaborne community means you lived on or near a large body of water.',
    features: [
      { name: 'Know the Tide', text: 'You can sense the ebb and flow of life. When you roll with Fear, place a token on this card equal to your level. Before you make an action roll, you can spend any number of these tokens to gain a +1 bonus to the roll for each token spent. At the end of each session, clear all unspent tokens.' },
    ]
  },
  Slyborne: {
    description: 'Being part of a slyborne community means you come from a group that operates outside the law, including all manner of criminals, grifters, and con artists.',
    features: [
      { name: 'Scoundrel', text: 'You have advantage on rolls to negotiate with criminals, detect lies, or find a safe place to hide.' },
    ]
  },
  Underborne: {
    description: 'Being part of an underborne community means you\'re from a subterranean society.',
    features: [
      { name: 'Low-Light Living', text: 'When you\'re in an area with low light or heavy shadow, you have advantage on rolls to hide, investigate, or perceive details within that area.' },
    ]
  },
  Wanderborne: {
    description: 'Being part of a wanderborne community means you\'ve lived as a nomad, forgoing a permanent home and experiencing a wide variety of cultures.',
    features: [
      { name: 'Nomadic Pack', text: 'Add a Nomadic Pack to your inventory. Once per session, you can spend a Hope to reach into this pack and pull out a mundane item that\'s useful to your situation. Work with the GM to figure out what item you take out.' },
    ]
  },
  Wildborne: {
    description: 'Being part of a wildborne community means you lived deep within the forest.',
    features: [
      { name: 'Lightfoot', text: 'Your movement is naturally silent. You have advantage on rolls to move without being heard.' },
    ]
  },
};

// CLASS DATA
// ─────────────────────────────────────────────
