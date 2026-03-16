// ── SUBCLASS DATA ──

const SUBCLASSES = {
  Bard: {
    tagline: 'As a bard, you know how to get people to talk, bring attention to yourself, and use words or music to influence the world around you.',
    subclasses: [
      {
        name: 'Troubadour',
        spellcast: 'Presence',
        foundation: '<em>Gifted Performer:</em> Describe how you perform for others. You can play each song once per long rest:\n• <em>Relaxing Song:</em> You and all allies within Close range clear a Stress.\n• <em>Epic Song:</em> Make a target within Close range temporarily <em>Vulnerable</em>.\n• <em>Heartbreaking Song:</em> You and all allies within Close range gain a Hope.',
        specialization: '<em>Maestro:</em> Your rallying songs steel the courage of those who listen. When you give a Rally Die to an ally, they can gain a Hope or clear a Stress.',
        mastery: '<em>Virtuoso:</em> You are among the greatest of your craft and your skill is boundless. You can perform each of your "Gifted Performer" feature\'s songs twice instead of once per long rest.',
      },
      {
        name: 'Wordsmith',
        spellcast: 'Presence',
        foundation: '<em>Rousing Speech:</em> Once per long rest, you can give a heartfelt, inspiring speech. All allies within Far range clear 2 Stress.\n\n<em>Heart of a Poet:</em> After you make an action roll to impress, persuade, or offend someone, you can <strong>spend a Hope</strong> to add a <strong>d4</strong> to the roll.',
        specialization: '<em>Eloquent:</em> Your moving words boost morale. Once per session, when you encourage an ally, you can do one of the following:\n• Allow them to find a mundane object or tool they need.\n• Help an Ally without spending Hope.\n• Give them an additional downtime move during their next rest.',
        mastery: '<em>Epic Poetry:</em> Your Rally Die increases to a <strong>d10</strong>. Additionally, when you Help an Ally, you can narrate the moment as if you were writing the tale of their heroism in a memoir. When you do, roll a <strong>d10</strong> as your advantage die.',
      },
    ],
  },
  Druid: {
    tagline: 'As a druid, you are a force of nature, preserving the balance of life and death by channeling the wilds themselves through you.',
    subclasses: [
      {
        name: 'Warden of the Elements',
        spellcast: 'Instinct',
        foundation: '<em>Elemental Incarnation:</em> <strong>Mark a Stress</strong> to <em>Channel</em> one of the following elements until you take Severe damage or until your next rest:\n• <em>Fire:</em> When an adversary within Melee range deals damage to you, they take <strong>1d10</strong> magic damage.\n• <em>Earth:</em> Gain a bonus to your damage thresholds equal to your Proficiency.\n• <em>Water:</em> When you deal damage to an adversary within Melee range, all other adversaries within Very Close range must mark a Stress.\n• <em>Air:</em> You can hover, gaining advantage on Agility Rolls.',
        specialization: '<em>Elemental Aura:</em> Once per rest while <em>Channeling</em>, you can assume an aura matching your element. The aura affects targets within Close range until your <em>Channeling</em> ends.\n• <em>Fire:</em> When an adversary marks 1 or more Hit Points, they must also mark a Stress.\n• <em>Earth:</em> Your allies gain a +1 bonus to Strength.\n• <em>Water:</em> When an adversary deals damage to you, you can <strong>mark a Stress</strong> to move them anywhere within Very Close range of where they are.\n• <em>Air:</em> When you or an ally takes damage from an attack beyond Melee range, reduce the damage by <strong>1d8</strong>.',
        mastery: '<em>Elemental Dominion:</em> You further embody your element. While <em>Channeling</em>, you gain the following benefit:\n• <em>Fire:</em> You gain a +1 bonus to your Proficiency for attacks and spells that deal damage.\n• <em>Earth:</em> When you would mark Hit Points, roll a <strong>d6</strong> per Hit Point marked. For each result of 6, reduce the number of Hit Points you mark by 1.\n• <em>Water:</em> When an attack against you succeeds, you can <strong>mark a Stress</strong> to make the attacker temporarily <em>Vulnerable</em>.\n• <em>Air:</em> You gain a +1 bonus to your Evasion and can fly.',
      },
      {
        name: 'Warden of Renewal',
        spellcast: 'Instinct',
        foundation: '<em>Clarity of Nature:</em> Once per long rest, you can create a space of natural serenity within Close range. When you spend a few minutes resting within the space, clear Stress equal to your Instinct, distributed as you choose between you and your allies.\n\n<em>Regeneration:</em> Touch a creature and <strong>spend 3 Hope</strong>. That creature clears <strong>1d4</strong> Hit Points.',
        specialization: '<em>Regenerative Reach:</em> You can target creatures within Very Close range with your "Regeneration" feature.\n\n<em>Warden\'s Protection:</em> Once per long rest, <strong>spend 2 Hope</strong> to clear 2 Hit Points on <strong>1d4</strong> allies within Close range.',
        mastery: '<em>Defender:</em> Your animal transformation embodies a healing guardian spirit. When you\'re in Beastform and an ally within Close range marks 2 or more Hit Points, you can <strong>mark a Stress</strong> to reduce the number of Hit Points they mark by 1.',
      },
    ],
    beastforms: [
      // Tier 1
      { tier: 1, name: 'Agile Scout', examples: 'Fox, Mouse, Weasel', stats: 'Agility +1 | Evasion +2 | Melee Agility d4 phy', text: '<em>Advantage on:</em> deceive, locate, sneak\n<em>Agile:</em> Your movement is silent, and you can spend a Hope to move up to Far range without rolling.\n<em>Fragile:</em> When you take Major or greater damage, you drop out of Beastform.' },
      { tier: 1, name: 'Household Friend', examples: 'Cat, Dog, Rabbit', stats: 'Instinct +1 | Evasion +2 | Melee Instinct d6 phy', text: '<em>Advantage on:</em> climb, locate, protect\n<em>Companion:</em> When you Help an Ally, you can roll a d8 as your advantage die.\n<em>Fragile:</em> When you take Major or greater damage, you drop out of Beastform.' },
      { tier: 1, name: 'Nimble Grazer', examples: 'Deer, Gazelle, Goat', stats: 'Agility +1 | Evasion +3 | Melee Agility d6 phy', text: '<em>Advantage on:</em> leap, sneak, sprint\n<em>Elusive Prey:</em> When an attack roll against you would succeed, you can mark a Stress and roll a d4. Add the result to your Evasion against this attack.\n<em>Fragile:</em> When you take Major or greater damage, you drop out of Beastform.' },
      { tier: 1, name: 'Pack Predator', examples: 'Coyote, Hyena, Wolf', stats: 'Strength +2 | Evasion +1 | Melee Strength d8+2 phy', text: '<em>Advantage on:</em> attack, sprint, track\n<em>Hobbling Strike:</em> When you succeed on an attack against a target within Melee range, you can mark a Stress to make the target temporarily Vulnerable.\n<em>Pack Hunting:</em> When you succeed on an attack against the same target as an ally who acts immediately before you, add a d8 to your damage roll.' },
      { tier: 1, name: 'Aquatic Scout', examples: 'Eel, Fish, Octopus', stats: 'Agility +1 | Evasion +2 | Melee Agility d4 phy', text: '<em>Advantage on:</em> navigate, sneak, swim\n<em>Aquatic:</em> You can breathe and move naturally underwater.\n<em>Fragile:</em> When you take Major or greater damage, you drop out of Beastform.' },
      { tier: 1, name: 'Stalking Arachnid', examples: 'Tarantula, Wolf Spider', stats: 'Finesse +1 | Evasion +2 | Melee Finesse d6+1 phy', text: '<em>Advantage on:</em> attack, climb, sneak\n<em>Venomous Bite:</em> When you succeed on an attack within Melee range, the target becomes temporarily Poisoned. A Poisoned creature takes 1d10 direct physical damage each time they act.\n<em>Webslinger:</em> You can create a strong web material useful for both adventuring and battle. You can temporarily Restrain a target within Close range by succeeding on a Finesse Roll against them.' },
      // Tier 2
      { tier: 2, name: 'Armored Sentry', examples: 'Armadillo, Pangolin, Turtle', stats: 'Strength +1 | Evasion +1 | Melee Strength d8+2 phy', text: '<em>Advantage on:</em> dig, locate, protect\n<em>Armored Shell:</em> Your hardened exterior gives you resistance to physical damage. Additionally, mark an Armor Slot to retract into your shell. While in your shell, physical damage is reduced by a number equal to your Armor Score (after applying resistance), but you can\'t perform other actions without leaving this form.\n<em>Cannonball:</em> Mark a Stress to allow an ally to throw or launch you at an adversary. The ally makes an attack roll (Agility or Strength) against a target within Close range. On a success, the adversary takes d12+2 physical damage using the thrower\'s Proficiency.' },
      { tier: 2, name: 'Powerful Beast', examples: 'Bear, Bull, Moose', stats: 'Strength +1 | Evasion +3 | Melee Strength d10+4 phy', text: '<em>Advantage on:</em> navigate, protect, scare\n<em>Rampage:</em> When you roll a 1 on a damage die, you can roll a d10 and add the result to the damage roll. Before you make an attack roll, you can mark a Stress to gain a +1 bonus to your Proficiency for that attack.\n<em>Thick Hide:</em> You gain a +2 bonus to your damage thresholds.' },
      { tier: 2, name: 'Mighty Strider', examples: 'Camel, Horse, Zebra', stats: 'Agility +1 | Evasion +2 | Melee Agility d8+1 phy', text: '<em>Advantage on:</em> leap, navigate, sprint\n<em>Carrier:</em> You can carry up to two willing allies with you when you move.\n<em>Trample:</em> Mark a Stress to move up to Close range in a straight line and make an attack against all targets within Melee range of the line. Targets you succeed against take d8+1 physical damage and are temporarily Vulnerable.' },
      { tier: 2, name: 'Striking Serpent', examples: 'Cobra, Rattlesnake, Viper', stats: 'Finesse +1 | Evasion +2 | Very Close Finesse d8+4 phy', text: '<em>Advantage on:</em> climb, deceive, sprint\n<em>Venomous Strike:</em> Make an attack against any number of targets within Very Close range. On a success, a target is temporarily Poisoned. A Poisoned creature takes 1d10 physical direct damage each time they act.\n<em>Warning Hiss:</em> Mark a Stress to force any number of targets within Melee range to move back to Very Close range.' },
      { tier: 2, name: 'Pouncing Predator', examples: 'Cheetah, Lion, Panther', stats: 'Instinct +1 | Evasion +3 | Melee Instinct d8+6 phy', text: '<em>Advantage on:</em> attack, climb, sneak\n<em>Fleet:</em> Spend a Hope to move up to Far range without rolling.\n<em>Takedown:</em> Mark a Stress to move into Melee range of a target and make an attack roll against them. On a success, you gain a +2 bonus to your Proficiency for this attack and the target must mark a Stress.' },
      { tier: 2, name: 'Winged Beast', examples: 'Hawk, Owl, Raven', stats: 'Finesse +1 | Evasion +3 | Melee Finesse d4+2 phy', text: '<em>Advantage on:</em> deceive, locate, scare\n<em>Bird\'s-Eye View:</em> You can fly at will. Once per rest while airborne, you can ask the GM a question about the scene below you without needing to roll. The first time a character makes a roll to act on this information, they gain advantage.\n<em>Hollow Bones:</em> You gain a −2 penalty to your damage thresholds.' },
      // Tier 3
      { tier: 3, name: 'Great Predator', examples: 'Dire Wolf, Velociraptor, Sabertooth', stats: 'Strength +2 | Evasion +2 | Melee Strength d12+8 phy', text: '<em>Advantage on:</em> attack, sneak, sprint\n<em>Carrier:</em> You can carry up to two willing allies with you when you move.\n<em>Vicious Maul:</em> When you succeed on an attack against a target, you can spend a Hope to make them temporarily Vulnerable and gain a +1 bonus to your Proficiency for this attack.' },
      { tier: 3, name: 'Mighty Lizard', examples: 'Alligator, Crocodile, Gila Monster', stats: 'Instinct +2 | Evasion +1 | Melee Instinct d10+7 phy', text: '<em>Advantage on:</em> attack, sneak, track\n<em>Physical Defense:</em> You gain a +3 bonus to your damage thresholds.\n<em>Snapping Strike:</em> When you succeed on an attack within Melee range, you can spend a Hope to clamp that opponent in your jaws, making them temporarily Restrained and Vulnerable.' },
      { tier: 3, name: 'Great Winged Beast', examples: 'Giant Eagle, Falcon', stats: 'Finesse +2 | Evasion +3 | Melee Finesse d8+6 phy', text: '<em>Advantage on:</em> deceive, distract, locate\n<em>Bird\'s-Eye View:</em> You can fly at will. Once per rest while airborne, you can ask the GM a question about the scene below you without needing to roll.\n<em>Carrier:</em> You can carry up to two willing allies with you when you move.' },
      { tier: 3, name: 'Aquatic Predator', examples: 'Dolphin, Orca, Shark', stats: 'Agility +2 | Evasion +4 | Melee Agility d10+6 phy', text: '<em>Advantage on:</em> attack, swim, track\n<em>Aquatic:</em> You can breathe and move naturally underwater.\n<em>Vicious Maul:</em> When you succeed on an attack, you can spend a Hope to make them temporarily Vulnerable and gain a +1 bonus to your Proficiency for this attack.' },
      { tier: 3, name: 'Legendary Beast', examples: 'Upgraded Tier 1 Option', stats: 'Pick a Tier 1 form — see bonuses below', text: '<em>Evolved:</em> Pick a Tier 1 Beastform option and become a larger, more powerful version of that creature. You retain all traits and features from the original form and gain:\n• A +6 bonus to damage rolls\n• A +1 bonus to the trait used by this form\n• A +2 bonus to Evasion' },
      { tier: 3, name: 'Legendary Hybrid', examples: 'Griffon, Sphinx', stats: 'Strength +2 | Evasion +3 | Melee Strength d10+8', text: '<em>Hybrid Features:</em> To transform into this creature, mark an additional Stress. Choose any two Beastform options from Tiers 1–2. Choose a total of four advantages and two features from those options.' },
      // Tier 4
      { tier: 4, name: 'Massive Behemoth', examples: 'Elephant, Mammoth, Rhinoceros', stats: 'Strength +3 | Evasion +1 | Melee Strength d12+12 phy', text: '<em>Advantage on:</em> locate, protect, scare, sprint\n<em>Carrier:</em> You can carry up to four willing allies with you when you move.\n<em>Demolish:</em> Spend a Hope to move up to Far range in a straight line and make an attack against all targets within Melee range of the line. Targets you succeed against take d8+10 physical damage and are temporarily Vulnerable.\n<em>Undaunted:</em> You gain a +2 bonus to all your damage thresholds.' },
      { tier: 4, name: 'Terrible Lizard', examples: 'Brachiosaurus, Tyrannosaurus', stats: 'Strength +3 | Evasion +2 | Melee Strength d12+10 phy', text: '<em>Advantage on:</em> attack, deceive, scare, track\n<em>Devastating Strikes:</em> When you deal Severe damage to a target within Melee range, you can mark a Stress to force them to mark an additional Hit Point.\n<em>Massive Stride:</em> You can move up to Far range without rolling. You ignore rough terrain due to your size.' },
      { tier: 4, name: 'Mythic Aerial Hunter', examples: 'Dragon, Pterodactyl, Roc, Wyvern', stats: 'Finesse +3 | Evasion +4 | Melee Finesse d10+11 phy', text: '<em>Advantage on:</em> attack, deceive, locate, navigate\n<em>Carrier:</em> You can carry up to three willing allies with you when you move.\n<em>Deadly Raptor:</em> You can fly at will and move up to Far range as part of your action. When you move in a straight line into Melee range of a target from at least Close range and make an attack in the same action, you can reroll all damage dice that rolled a result lower than your Proficiency.' },
      { tier: 4, name: 'Epic Aquatic Beast', examples: 'Giant Squid, Whale', stats: 'Agility +3 | Evasion +3 | Melee Agility d10+10 phy', text: '<em>Advantage on:</em> locate, protect, scare, track\n<em>Ocean Master:</em> You can breathe and move naturally underwater. When you succeed on an attack within Melee range, you can temporarily Restrain them.\n<em>Unyielding:</em> When you would mark an Armor Slot, roll a d6. On a result of 5 or higher, reduce the severity by one threshold without marking an Armor Slot.' },
      { tier: 4, name: 'Mythic Beast', examples: 'Upgraded Tier 1 or Tier 2 Option', stats: 'Pick a Tier 1 or Tier 2 form — see bonuses below', text: '<em>Evolved:</em> Pick a Tier 1 or Tier 2 Beastform option and become a larger, more powerful version. You retain all traits and features and gain:\n• A +9 bonus to damage rolls\n• A +2 bonus to the trait used by this form\n• A +3 bonus to Evasion\n• Your damage die increases by one size (d6→d8, d8→d10, etc.)' },
      { tier: 4, name: 'Mythic Hybrid', examples: 'Chimera, Cockatrice, Manticore', stats: 'Strength +3 | Evasion +2 | Strength Melee d12+10 phy', text: '<em>Hybrid Features:</em> To transform, mark 2 additional Stress. Choose any three Beastform options from Tiers 1–3. Choose a total of five advantages and three features from those options.' },
    ],
  },
  Guardian: {
    tagline: 'As a guardian, you run into danger to protect your party, keeping watch over those who might not survive without you there.',
    subclasses: [
      {
        name: 'Stalwart',
        spellcast: null,
        foundation: '<em>Unwavering:</em> Gain a permanent +1 bonus to your damage thresholds.\n\n<em>Iron Will:</em> When you take physical damage, you can <strong>mark an additional Armor Slot</strong> to reduce the severity.',
        specialization: '<em>Unrelenting:</em> Gain a permanent +2 bonus to your damage thresholds.\n\n<em>Partners-in-Arms:</em> When an ally within Very Close range takes damage, you can <strong>mark an Armor Slot</strong> to reduce the severity by one threshold.',
        mastery: '<em>Undaunted:</em> Gain a permanent +3 bonus to your damage thresholds.\n\n<em>Loyal Protector:</em> When an ally within Close range has 2 or fewer Hit Points and would take damage, you can <strong>mark a Stress</strong> to sprint to their side and take the damage instead.',
      },
      {
        name: 'Vengeance',
        spellcast: null,
        foundation: '<em>At Ease:</em> Gain an additional Stress slot.\n\n<em>Revenge:</em> When an adversary within Melee range succeeds on an attack against you, you can <strong>mark 2 Stress</strong> to force the attacker to mark a Hit Point.',
        specialization: '<em>Act of Reprisal:</em> When an adversary damages an ally within Melee range, you gain a +1 bonus to your Proficiency for the next successful attack you make against that adversary.',
        mastery: '<em>Nemesis:</em> <strong>Spend 2 Hope</strong> to <em>Prioritize</em> an adversary until your next rest. When you make an attack against your <em>Prioritized</em> adversary, you can swap the results of your Hope and Fear Dice. You can only <em>Prioritize</em> one adversary at a time.',
      },
    ],
  },
  Ranger: {
    tagline: "As a ranger, your keen eyes and graceful haste make you indispensable when tracking down enemies and navigating the wilds.",
    subclasses: [
      {
        name: 'Beastbound',
        spellcast: 'Agility',
        foundation: '<em>Companion:</em> You have an animal companion of your choice (at the GM\'s discretion). They stay by your side unless you tell them otherwise.\n\nTake the Ranger Companion sheet. When you level up your character, choose a level-up option for your companion from that sheet as well.',
        specialization: '<em>Expert Training:</em> Choose an additional level-up option for your companion.\n\n<em>Battle-Bonded:</em> When an adversary attacks you while they\'re within your companion\'s Melee range, you gain a +2 bonus to your Evasion against the attack.',
        mastery: '<em>Advanced Training:</em> Choose two additional level-up options for your companion.\n\n<em>Loyal Friend:</em> Once per long rest, when the damage from an attack would mark your companion\'s last Stress or your last Hit Point and you\'re within Close range of each other, you or your companion can sprint to the other\'s side and take that damage instead.',
      },
      {
        name: 'Wayfinder',
        spellcast: 'Agility',
        foundation: '<em>Ruthless Predator:</em> When you make a damage roll, you can <strong>mark a Stress</strong> to gain a +1 bonus to your Proficiency. When you deal Severe damage to an adversary, they must mark a Stress.\n\n<em>Path Forward:</em> When you\'re traveling to a place you\'ve previously visited or you carry an object that has been at the location before, you can identify the shortest, most direct path to your destination.',
        specialization: '<em>Elusive Predator:</em> When your Focus makes an attack against you, you gain a +2 bonus to your Evasion against the attack.',
        mastery: '<em>Apex Predator:</em> Before you make an attack roll against your Focus, you can <strong>spend a Hope</strong>. On a successful attack, you remove a Fear from the GM\'s Fear pool.',
      },
    ],
  },
  Rogue: {
    tagline: 'As a rogue, you have experience fighting with your blade as well as your wit, preferring to move quickly and fight quietly.',
    subclasses: [
      {
        name: 'Nightwalker',
        spellcast: 'Finesse',
        foundation: '<em>Shadow Stepper:</em> You can move from shadow to shadow. When you move into an area of darkness or a shadow cast by another creature or object, you can <strong>mark a Stress</strong> to disappear from where you are and reappear inside another shadow within Far range. When you reappear, you are <em>Cloaked</em>.',
        specialization: '<em>Dark Cloud:</em> Make a <strong>Spellcast Roll (15)</strong>. On a success, create a temporary dark cloud that covers any area within Close range. Anyone in this cloud can\'t see outside of it, and anyone outside of it can\'t see in. You\'re considered <em>Cloaked</em> from any adversary for whom the cloud blocks line of sight.\n\n<em>Adrenaline:</em> While you\'re <em>Vulnerable</em>, add your level to your damage rolls.',
        mastery: '<em>Fleeting Shadow:</em> Gain a permanent +1 bonus to your Evasion. You can use your "Shadow Stepper" feature to move within Very Far range.\n\n<em>Vanishing Act:</em> <strong>Mark a Stress</strong> to become <em>Cloaked</em> at any time. When <em>Cloaked</em> from this feature, you automatically clear the <em>Restrained</em> condition if you have it. You remain <em>Cloaked</em> in this way until you roll with Fear or until your next rest.',
      },
      {
        name: 'Syndicate',
        spellcast: 'Finesse',
        foundation: '<em>Well-Connected:</em> When you arrive in a prominent town or environment, you know somebody who calls this place home. Give them a name, note how you think they could be useful, and choose one fact from the following list:\n• They owe me a favor, but they\'ll be hard to find.\n• They\'re going to ask for something in exchange.\n• They\'re always in a great deal of trouble.\n• We used to be together. It\'s a long story.\n• We didn\'t part on great terms.',
        specialization: '<em>Contacts Everywhere:</em> Once per session, you can briefly call on a shady contact. Choose one of the following benefits and describe what brought them here to help you in this moment:\n• They provide 1 handful of gold, a unique tool, or a mundane object that the situation requires.\n• On your next action roll, their help provides a +3 bonus to the result of your Hope or Fear Die.\n• The next time you deal damage, they snipe from the shadows, adding <strong>2d8</strong> to your damage roll.',
        mastery: '<em>Reliable Backup:</em> You can use your "Contacts Everywhere" feature three times per session. The following options are added to the list of benefits you can choose from when you use that feature:\n• When you mark 1 or more Hit Points, they can rush out to shield you, reducing the Hit Points marked by 1.\n• When you make a Presence Roll in conversation, they back you up. You can roll a <strong>d20</strong> as your Hope Die.',
      },
    ],
  },
  Seraph: {
    tagline: "As a seraph, you've taken a vow to a god who helps you channel sacred arcane power to keep your party on their feet.",
    subclasses: [
      {
        name: 'Divine Wielder',
        spellcast: 'Strength',
        foundation: '<em>Spirit Weapon:</em> When you have an equipped weapon with a range of Melee or Very Close, it can fly from your hand to attack an adversary within Close range and then return to you. You can <strong>mark a Stress</strong> to target an additional adversary within range with the same attack roll.\n\n<em>Sparing Touch:</em> Once per long rest, touch a creature and clear 2 Hit Points or 2 Stress from them.',
        specialization: '<em>Devout:</em> When you roll your Prayer Dice, you can roll an additional die and discard the lowest result. Additionally, you can use your "Sparing Touch" feature twice instead of once per long rest.',
        mastery: '<em>Sacred Resonance:</em> When you roll damage for your "Spirit Weapon" feature, if any of the die results match, double the value of each matching die. For example, if you roll two 5s, they count as two 10s.',
      },
      {
        name: 'Winged Sentinel',
        spellcast: 'Strength',
        foundation: '<em>Wings of Light:</em> You can fly. While flying, you can do the following:\n• <strong>Mark a Stress</strong> to pick up and carry another willing creature approximately your size or smaller.\n• <strong>Spend a Hope</strong> to deal an extra <strong>1d8</strong> damage on a successful attack.',
        specialization: '<em>Ethereal Visage:</em> Your supernatural visage strikes awe and fear. While flying, you have advantage on Presence Rolls. When you succeed with Hope on a Presence Roll, you can remove a Fear from the GM\'s Fear pool instead of gaining Hope.',
        mastery: '<em>Ascendant:</em> Gain a permanent +4 bonus to your Severe damage threshold.\n\n<em>Power of the Gods:</em> While flying, you deal an extra <strong>1d12</strong> damage instead of 1d8 from your "Wings of Light" feature.',
      },
    ],
  },
  Sorcerer: {
    tagline: "As a sorcerer, you were born with innate magical power, and you've learned how to wield that power to get what you want.",
    subclasses: [
      {
        name: 'Elemental Origin',
        spellcast: 'Instinct',
        foundation: '<em>Elementalist:</em> Choose one of the following elements at character creation: <strong>Air · Earth · Fire · Lightning · Water</strong>\n\nYou can shape this element into harmless effects. Additionally, <strong>spend a Hope</strong> and describe how you use your control over this element to help an action roll you\'re about to make, then either gain a +2 bonus to the roll or a +3 bonus to the roll\'s damage.',
        specialization: '<em>Natural Evasion:</em> You can call forth your element to protect you from harm. When an attack roll against you succeeds, you can <strong>mark a Stress</strong> and describe how you use your element to defend yourself. When you do, roll a <strong>d6</strong> and add its result to your Evasion against the attack.',
        mastery: '<em>Transcendence:</em> Once per long rest, you can transform into a physical manifestation of your element. When you do, describe your transformation and choose two of the following benefits to gain until your next rest:\n• +4 bonus to your Severe threshold\n• +1 bonus to a character trait of your choice\n• +1 bonus to your Proficiency\n• +2 bonus to your Evasion',
      },
      {
        name: 'Primal Origin',
        spellcast: 'Instinct',
        foundation: '<em>Manipulate Magic:</em> Your primal origin allows you to modify the essence of magic itself. After you cast a spell or make an attack using a weapon that deals magic damage, you can <strong>mark a Stress</strong> to do one of the following:\n• Extend the spell or attack\'s reach by one range\n• Gain a +2 bonus to the action roll\'s result\n• Double a damage die of your choice\n• Hit an additional target within range',
        specialization: '<em>Enchanted Aid:</em> You can enhance the magic of others with your essence. When you Help an Ally with a Spellcast Roll, you can roll a <strong>d8</strong> as your advantage die. Once per long rest, after an ally has made a Spellcast Roll with your help, you can swap the results of their Duality Dice.',
        mastery: '<em>Arcane Charge:</em> You can gather magical energy to enhance your capabilities. When you take magic damage, you become <em>Charged</em>. Alternatively, you can <strong>spend 2 Hope</strong> to become <em>Charged</em>. When you successfully make an attack that deals magic damage while <em>Charged</em>, you can clear your <em>Charge</em> to either gain a +10 bonus to the damage roll or gain a +3 bonus to the Difficulty of a reaction roll the spell causes the target to make. You stop being <em>Charged</em> at your next long rest.',
      },
    ],
  },
  Warrior: {
    tagline: 'As a warrior, you run into battle without hesitation or caution, knowing you can strike down whatever enemy stands in your path.',
    subclasses: [
      {
        name: 'Call of the Brave',
        spellcast: null,
        foundation: '<em>Courage:</em> When you fail a roll with Fear, you gain a Hope.\n\n<em>Battle Ritual:</em> Once per long rest, before you attempt something incredibly dangerous or face off against a foe who clearly outmatches you, describe what ritual you perform or preparations you make. When you do, clear 2 Stress and gain 2 Hope.',
        specialization: '<em>Rise to the Challenge:</em> You are vigilant in the face of mounting danger. While you have 2 or fewer Hit Points unmarked, you can roll a <strong>d20</strong> as your Hope Die.',
        mastery: '<em>Camaraderie:</em> Your unwavering bravery is a rallying point for your allies. You can initiate a Tag Team Roll one additional time per session. Additionally, when an ally initiates a Tag Team Roll with you, they only need to spend 2 Hope to do so.',
      },
      {
        name: 'Call of the Slayer',
        spellcast: null,
        foundation: '<em>Slayer:</em> You gain a pool of dice called Slayer Dice. On a roll with Hope, you can place a <strong>d6</strong> on this card instead of gaining a Hope, adding the die to the pool. You can store a number of Slayer Dice equal to your Proficiency. When you make an attack roll or damage roll, you can spend any number of these Slayer Dice, rolling them and adding their result to the roll. At the end of each session, clear all unspent Slayer Dice and gain a Hope per die cleared.',
        specialization: '<em>Weapon Specialist:</em> You can wield multiple weapons with dangerous ease. When you succeed on an attack, you can <strong>spend a Hope</strong> to add one of the damage dice from your secondary weapon to the damage roll. Additionally, once per long rest when you roll your Slayer Dice, reroll any 1s.',
        mastery: '<em>Martial Preparation:</em> You\'re an inspirational warrior to all who travel with you. Your party gains access to the Martial Preparation downtime move. To use this move during a rest, describe how you instruct and train with your party. You and each one who chooses this downtime move gain a <strong>d6</strong> Slayer Die. A PC with a Slayer Die can spend it to roll the die and add the result to an attack or damage roll of their choice.',
      },
    ],
  },
  Wizard: {
    tagline: "As a wizard, you've become familiar with the arcane through the relentless study of grimoires and other tools of magic.",
    subclasses: [
      {
        name: 'School of Knowledge',
        spellcast: 'Knowledge',
        foundation: '<em>Prepared:</em> Take an additional domain card of your level or lower from a domain you have access to.\n\n<em>Adept:</em> When you Utilize an Experience, you can <strong>mark a Stress</strong> instead of spending a Hope. If you do, double your Experience modifier for that roll.',
        specialization: '<em>Accomplished:</em> Take an additional domain card of your level or lower from a domain you have access to.\n\n<em>Perfect Recall:</em> Once per rest, when you recall a domain card in your vault, you can reduce its Recall Cost by 1.',
        mastery: '<em>Brilliant:</em> Take an additional domain card of your level or lower from a domain you have access to.\n\n<em>Honed Expertise:</em> When you use an Experience, roll a <strong>d6</strong>. On a result of 5 or higher, you can use it without spending Hope.',
      },
      {
        name: 'School of War',
        spellcast: 'Knowledge',
        foundation: '<em>Battlemage:</em> You\'ve focused your studies on becoming an unconquerable force on the battlefield. Gain an additional Hit Point slot.\n\n<em>Face Your Fear:</em> When you succeed with Fear on an attack roll, you deal an extra <strong>1d10</strong> magic damage.',
        specialization: '<em>Conjure Shield:</em> You can maintain a protective barrier of magic. While you have at least 2 Hope, you add your Proficiency to your Evasion.\n\n<em>Fueled by Fear:</em> The extra magic damage from your "Face Your Fear" feature increases to <strong>2d10</strong>.',
        mastery: '<em>Thrive in Chaos:</em> When you succeed on an attack, you can <strong>mark a Stress</strong> after rolling damage to force the target to mark an additional Hit Point.\n\n<em>Have No Fear:</em> The extra magic damage from your "Face Your Fear" feature increases to <strong>3d10</strong>.',
      },
    ],
  },
};

// ─────────────────────────────────────────────
// CLASS REFERENCE RENDERER
// ─────────────────────────────────────────────
