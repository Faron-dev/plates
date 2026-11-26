/* ---------- reference data: muscles, exercises, built-in program ---------- */
const MUSCLES = [
  ['biceps', 'Biceps'], ['calves', 'Calves'], ['sideDelts', 'Lateral delts'], ['rearDelts', 'Rear delts'], ['abs', 'Abs'],
  ['quads', 'Quads'], ['glutes', 'Glutes'], ['pecs', 'Pecs'], ['frontDelts', 'Front delts'], ['lats', 'Lats'],
  ['triceps', 'Triceps'], ['hams', 'Hamstrings'], ['erectors', 'Erectors'], ['traps', 'Traps']
];
const MUSCLE_NAME = Object.fromEntries(MUSCLES);

/* load: bar = barbell (plate math), db = dumbbells (per hand), stack = machine or cable,
   added = bodyweight plus or minus added weight, bw = bodyweight only.
   m = share of a hard set each muscle gets (1, .75, .5 or .25), following the program write-up's counting. */
const EX = {
  'deadlift': { n: 'Deadlift (Barbell)', g: 'Pull', load: 'bar', m: { erectors: 1, quads: .5, calves: .5 } },
  'pullup': { n: 'Pull-Up (Weighted)', g: 'Pull', load: 'added', body: 1, m: { lats: 1, biceps: 1 } },
  'assisted-pullup': { n: 'Pull-Up (Assisted)', g: 'Pull', load: 'added', body: 1, m: { lats: 1, biceps: 1 } },
  'chinup': { n: 'Chin-Up', g: 'Pull', load: 'added', body: 1, m: { lats: 1, biceps: 1 } },
  'pulldown-underhand': { n: 'Underhand Lat Pulldown', g: 'Pull', load: 'stack', m: { lats: 1, biceps: 1 } },
  'pulldown': { n: 'Lat Pulldown', g: 'Pull', load: 'stack', m: { lats: 1, biceps: 1 } },
  'pulldown-single': { n: 'Lat Pulldown (Single Arm)', g: 'Pull', load: 'stack', m: { lats: 1, biceps: 1 } },
  'pullover-cable': { n: 'Pullover (Cable)', g: 'Pull', load: 'stack', m: { lats: 1 } },
  'row-chest': { n: 'Chest Supported Row (Machine)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-wide': { n: 'Seated Wide-Grip Row (Cable)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-seated': { n: 'Seated Row (Cable, D-handles)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-db': { n: 'Single-Arm Row (Dumbbell)', g: 'Pull', load: 'db', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-meadow': { n: 'Single-Arm Row (Meadow Row)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'reverse-pec-deck': { n: 'Reverse Pec Deck', g: 'Pull', load: 'stack', m: { rearDelts: 1 } },
  'rear-delt-fly': { n: 'Rear Delt Fly (Dumbbell)', g: 'Pull', load: 'db', m: { rearDelts: 1 } },
  'face-pull': { n: 'Face Pull', g: 'Pull', load: 'stack', m: { rearDelts: 1 } },
  'shrug-db': { n: 'Shrug (Dumbbell)', g: 'Pull', load: 'db', m: { traps: 1 } },
  'shrug-bb': { n: 'Shrug (Barbell)', g: 'Pull', load: 'bar', m: { traps: 1 } },
  'back-extension': { n: 'Back Extension (Weighted)', g: 'Pull', load: 'added', m: { erectors: 1, glutes: .5, hams: .5 } },
  'preacher-curl': { n: 'Preacher Curl (Dumbbell)', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'incline-curl': { n: 'Incline Curl (Dumbbell)', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'hammer-curl': { n: 'Hammer Curl', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'db-curl': { n: 'Bicep Curl (Dumbbell)', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'bayesian-curl': { n: 'Bayesian Curl (Cable)', g: 'Pull', load: 'stack', m: { biceps: 1 } },

  'bench-db': { n: 'Bench Press (Dumbbell)', g: 'Push', load: 'db', m: { pecs: 1, frontDelts: 1, triceps: .25 } },
  'bench-bb': { n: 'Bench Press (Barbell)', g: 'Push', load: 'bar', m: { pecs: 1, frontDelts: 1, triceps: .5 } },
  'incline-bench-db': { n: 'Incline Bench Press (Dumbbell)', g: 'Push', load: 'db', m: { pecs: 1, frontDelts: 1, triceps: .25 } },
  'ohp': { n: 'Overhead Press (Barbell)', g: 'Push', load: 'bar', m: { frontDelts: 1, sideDelts: .5, triceps: .5 } },
  'db-shoulder-press': { n: 'Seated Shoulder Press (Dumbbell)', g: 'Push', load: 'db', m: { frontDelts: 1, sideDelts: .5, triceps: .25 } },
  'cable-fly': { n: 'Chest Fly (Cable)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'incline-cable-fly': { n: 'Incline Chest Fly (Cable)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'machine-fly': { n: 'Chest Fly (Machine)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'pec-deck': { n: 'Pec Deck (Machine)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'lateral-raise-db': { n: 'Lateral Raise (Dumbbell)', g: 'Push', load: 'db', m: { sideDelts: 1 } },
  'lateral-raise-cable': { n: 'Lateral Raise (Cable)', g: 'Push', load: 'stack', m: { sideDelts: 1 } },
  'pushdown-rope': { n: 'Tricep Pushdown (Rope)', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'pushdown-v': { n: 'Tricep Pushdown (V-Handle)', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'pushdown-bar': { n: 'Tricep Pushdown (Straight Bar)', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'french-press': { n: 'French Press', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'skull-crusher': { n: 'Skull Crusher', g: 'Push', load: 'stack', m: { triceps: 1 } },

  'squat': { n: 'Squat (Barbell)', g: 'Legs', load: 'bar', m: { quads: 1, glutes: 1, erectors: .5 } },
  'rdl': { n: 'Romanian Deadlift (Barbell)', g: 'Legs', load: 'bar', m: { hams: 1, glutes: 1, erectors: .5 } },
  'leg-press': { n: 'Leg Press', g: 'Legs', load: 'stack', m: { quads: 1, glutes: 1 } },
  'split-squat-smith': { n: 'Split Squat (Smith Machine)', g: 'Legs', load: 'stack', m: { quads: 1, glutes: 1 } },
  'bulgarian-split-squat': { n: 'Bulgarian Split Squat (Dumbbell)', g: 'Legs', load: 'db', m: { quads: 1, glutes: 1 } },
  'leg-extension': { n: 'Leg Extension', g: 'Legs', load: 'stack', m: { quads: 1 } },
  'leg-curl': { n: 'Leg Curl', g: 'Legs', load: 'stack', m: { hams: 1 } },
  'ghr': { n: 'Glute Ham Raise (Weighted)', g: 'Legs', load: 'added', m: { hams: 1 } },
  'calf-standing': { n: 'Standing Calf Raise', g: 'Legs', load: 'stack', m: { calves: 1 } },
  'calf-seated': { n: 'Seated Calf Raise', g: 'Legs', load: 'stack', m: { calves: 1 } },

  'crunch-weighted': { n: 'Abs Crunch (Weighted)', g: 'Abs', load: 'added', m: { abs: 1 } },
  'reverse-crunch': { n: 'Reverse Crunch', g: 'Abs', load: 'bw', m: { abs: 1 } },
  'dragon-flag': { n: 'Upright Dragon Flag', g: 'Abs', load: 'bw', m: { abs: 1 } },
  'hanging-leg-raise': { n: 'Hanging Leg Raise', g: 'Abs', load: 'bw', m: { abs: 1 } }
};

/* Built-in program. A program saved to the account under the same id replaces it. */
const TEMPLATES = {
  'ppl-ptc': {
    id: 'ppl-ptc',
    name: 'PPL Powerbuilder PTC',
    about: 'Six days: pull, push and legs, twice. Main lifts run a 3-week wave by percent of max. Everything else goes to about RPE 9 inside a rep range, with one weight for all sets.',
    priority: ['sideDelts', 'rearDelts', 'biceps', 'abs', 'calves'],
    wave: [
      { top: [80, 5], back: [70, 10], warm: [{ p: 50, r: 5 }, { p: 65, r: 3 }] },
      { top: [85, 3], back: [75, 8], warm: [{ p: 50, r: 5 }, { p: 65, r: 3 }, { p: 75, r: 1 }] },
      { top: [90, 1], back: [80, 6], warm: [{ p: 50, r: 5 }, { p: 65, r: 3 }, { p: 75, r: 1 }] }
    ],
    days: [
      { id: 'pull1', name: 'Pull 1', focus: 'Deadlift', items: [
        { ex: 'deadlift', pair: 'A1', wave: 1, back: 2, cap: 8, note: 'Straps if grip limits. Stop the back-offs about 3 reps short.' },
        { ex: 'lateral-raise-cable', pair: 'A2', sets: 3, lo: 12, hi: 20, alt: ['lateral-raise-db'], note: 'Between deadlift sets.' },
        { ex: 'pulldown-underhand', pair: 'B1', sets: 3, lo: 8, hi: 12, alt: ['pulldown'] },
        { ex: 'calf-standing', pair: 'B2', sets: 4, lo: 10, hi: 15 },
        { ex: 'row-chest', pair: 'C1', sets: 3, lo: 8, hi: 12 },
        { ex: 'preacher-curl', pair: 'C2', sets: 3, lo: 10, hi: 15 },
        { ex: 'reverse-pec-deck', pair: 'D', sets: 3, lo: 12, hi: 20 }
      ] },
      { id: 'push1', name: 'Push 1', focus: 'Bench press', items: [
        { ex: 'bench-db', pair: 'A1', wave: 1, note: 'Nearest dumbbell pair.' },
        { ex: 'hammer-curl', pair: 'A2', sets: 3, lo: 10, hi: 15 },
        { ex: 'lateral-raise-db', pair: 'B1', sets: 4, lo: 12, hi: 20 },
        { ex: 'french-press', pair: 'B2', sets: 3, lo: 10, hi: 15 },
        { ex: 'cable-fly', pair: 'C1', sets: 3, lo: 10, hi: 15, alt: ['pec-deck'] },
        { ex: 'crunch-weighted', pair: 'C2', sets: 3, lo: 10, hi: 15, note: 'Decline bench.' },
        { ex: 'rear-delt-fly', pair: 'D', sets: 3, lo: 12, hi: 20, alt: ['face-pull'] }
      ] },
      { id: 'legs1', name: 'Legs 1', focus: 'Squat', items: [
        { ex: 'squat', pair: 'A', wave: 1, rest: 240, note: 'No pair. Rest 3 to 5 minutes.' },
        { ex: 'rdl', pair: 'B1', sets: 3, lo: 8, hi: 12, alt: ['ghr'], note: '45 lb plates, straps.' },
        { ex: 'leg-extension', pair: 'B2', sets: 3, lo: 10, hi: 15, note: 'Lean back about 45°.' },
        { ex: 'leg-curl', pair: 'C1', sets: 3, lo: 10, hi: 15, note: 'Seated if possible.' },
        { ex: 'calf-standing', pair: 'C2', sets: 4, lo: 10, hi: 15 },
        { ex: 'reverse-crunch', pair: 'D', sets: 4, lo: 10, hi: 15, alt: ['dragon-flag', 'hanging-leg-raise'] }
      ] },
      { id: 'pull2', name: 'Pull 2', focus: 'Weighted pull-up', items: [
        { ex: 'pullup', pair: 'A1', wave: 1 },
        { ex: 'lateral-raise-cable', pair: 'A2', sets: 3, lo: 12, hi: 20, alt: ['lateral-raise-db'] },
        { ex: 'pulldown-single', pair: 'B1', sets: 3, lo: 8, hi: 12, alt: ['pulldown'], note: 'Weight is per arm.' },
        { ex: 'crunch-weighted', pair: 'B2', sets: 3, lo: 10, hi: 15, note: 'Decline bench.' },
        { ex: 'row-wide', pair: 'C1', sets: 3, lo: 8, hi: 12, alt: ['row-chest', 'row-db'], note: 'Chest-supported row if the lower back is tired.' },
        { ex: 'calf-standing', pair: 'C2', sets: 4, lo: 10, hi: 15 },
        { ex: 'reverse-pec-deck', pair: 'D', sets: 3, lo: 12, hi: 20 }
      ] },
      { id: 'push2', name: 'Push 2', focus: 'Overhead press', items: [
        { ex: 'ohp', pair: 'A1', wave: 1 },
        { ex: 'incline-curl', pair: 'A2', sets: 3, lo: 10, hi: 15 },
        { ex: 'lateral-raise-db', pair: 'B1', sets: 4, lo: 12, hi: 20 },
        { ex: 'pushdown-rope', pair: 'B2', sets: 3, lo: 10, hi: 15 },
        { ex: 'incline-bench-db', pair: 'C', sets: 3, lo: 8, hi: 12 },
        { ex: 'machine-fly', pair: 'D', sets: 2, lo: 10, hi: 15, alt: ['cable-fly'] }
      ] },
      { id: 'legs2', name: 'Legs 2', focus: 'Leg press', items: [
        { ex: 'leg-press', pair: 'A1', sets: 3, lo: 10, hi: 15 },
        { ex: 'calf-seated', pair: 'A2', sets: 4, lo: 10, hi: 20, alt: ['calf-standing'], note: 'Standing if there is no machine.' },
        { ex: 'split-squat-smith', pair: 'B1', sets: 3, lo: 8, hi: 12, note: 'Each leg.' },
        { ex: 'reverse-crunch', pair: 'B2', sets: 4, lo: 10, hi: 15, alt: ['hanging-leg-raise', 'dragon-flag'] },
        { ex: 'leg-curl', pair: 'C1', sets: 3, lo: 10, hi: 15, alt: ['ghr'] },
        { ex: 'leg-extension', pair: 'C2', sets: 2, lo: 10, hi: 15 },
        { ex: 'shrug-db', pair: 'D', sets: 3, lo: 10, hi: 15, opt: 1, note: 'Optional.' }
      ] }
    ]
  }
};
