// Each key maps to the current stage the user just responded to.
// Responses include reflection + validation + bridge into the next question.

export const mockResponses = {
  // Low branch ---------------------------------------------------------------

  explore_helping: [
    "That makes a lot of sense — sounds like you've found something that genuinely works for you. Are there any small habits, boundaries, or ways of working that are helping with that?",
    "It's really worth noticing those things — they clearly make a difference for you. And are there any small habits, boundaries, or ways of working that are also playing a part?",
    "Thank you for sharing that — those things sound like real anchors. Are there any small habits, boundaries, or ways of working you'd say are helping too?",
  ],

  strengths_amplify: [
    "Those sound like real strengths worth holding onto. How could you keep that going over the next few weeks?",
    "It's meaningful that you've noticed that about yourself — those habits clearly matter. How could you keep that going, even in small ways, over the next few weeks?",
    "Thank you for sharing — that kind of self-awareness is genuinely valuable. How could you keep that going over the next few weeks?",
  ],

  future_maintenance: [
    "That sounds like a grounded and meaningful intention — even a small step in that direction counts. Before we close, it's worth acknowledging: just noticing what's been working is a form of resilience. Thank you for taking the time to reflect on this today.",
    "That feels like a real commitment, and small ones like that can make a real difference over time. Before we close — what you've shared today reflects something genuinely positive, and that's worth holding onto. Thank you.",
    "That's a thoughtful way to carry this forward. Before we close — the awareness you've brought to this today is something to acknowledge. Thank you for sharing it with me.",
  ],

  // Mid branch ---------------------------------------------------------------

  explore_variability: [
  "It sounds like things haven\'t I\'m been easy sometimes. At the same time, experiences like this can sometimes shift from day to day — have there been moments where work has felt even slightly more manageable?",

  "Thank you for sharing that. Sometimes when people describe things as feeling up and down, there can still be certain moments or situations that feel a bit lighter. Have you noticed any of those recently?",

  "That sounds genuinely draining at times. I\'m also wondering whether there are situations, people, or parts of the day where things tend to feel slightly easier?",

  "It sounds like there\'s been a real level of pressure there. Even within difficult periods though, are there moments where things feel a little steadier or less intense?",

  "Thanks for reflecting on that. Since it sounds like things may fluctuate a bit, have you noticed any times where the emotional pressure feels less strong?"
],

  exceptions_mid: [
    "It sounds like there are moments you can draw on — those count for more than you might think. What do you think might move it just one point lower on that scale, not jumping to fine, just one small step?",
    "That's a useful thread to pull on. What might move things just one point lower on that scale?",
    "Thank you — those moments of relief are really important. What do you think might help move it just one point lower?",
  ],

  small_shifts: [
    "That feels like a meaningful and achievable step. Thank you for sharing this with me.",
    "That's a good thing to hold in mind. Before we close — even the awareness you've brought to this today is something to acknowledge. Thank you for talking this through.",
    "That sounds like a real step forward. Before we close — thank you for this; it takes honesty to reflect the way you have today.",
  ],

  

  // High branch --------------------------------------------------------------

  safety_check_support: [
    "Thank you for sharing that — it's really good to know there are people around you. If it's okay to continue, it makes sense you're feeling this way — a sustained stretch of this is exhausting. Has there been a point in the last few months, even just a week or a few days, when work felt slightly more manageable? What was different then?",
    "That's really good to hear — having support around you makes a real difference. If it's okay, I'd like to explore this a bit more with you. Has there been a point in the last few months, even just a few days, when things felt slightly more manageable? What do you think was different then?",
  ],

  safety_check_no_support: [
    "Thank you for being honest — it's important you know that occupational health and your employee assistance programme are there for exactly this kind of moment, and reaching out to them is a real option. If it's okay to continue, has there been a point in the last few months, even just a week or a few days, when work felt slightly more manageable? What was different then?",
    "I really appreciate you telling me that — please do know that your EAP or occupational health team are there for moments like this, and it's worth reaching out if you can. If it's okay, let's continue — has there been a point in the last few months, even just a few days, when things felt slightly more manageable? What do you think was different?",
  ],

  exceptions_high: [
    "That period is really worth paying attention to. Was it something about the workload, the people around you, how you were working — or something else? What do you think made the difference?",
    "It's meaningful that you can identify a time like that. What do you think made the difference — was it the workload, the people, how you were working, or something else?",
    "Thank you for going there — those moments matter more than they might seem. Was it something about the workload, the people around you, or how you were working? What do you think made the difference?",
  ],

  strengths_high: [
    "That's a really important insight — sounds like you have more understanding of what helps than you might think. What's one small thing you could try to do this week, even something minor, that might create a bit more of that for yourself at work?",
    "It's worth holding onto that understanding — it tells you something real about what works for you. What's one small thing you could try this week, even very small, that might bring a little more of that?",
    "Thank you — that kind of clarity is genuinely valuable. What's one small thing you could try to do this week that might create even a bit more of that?",
  ],

  next_steps_high: [
    "That sounds like a thoughtful and grounded step — even something small can shift how a week feels. Thank you for talking this through with me.",
    "That's a meaningful commitment, and small steps like that really do add up. Thank you so much for talking this through with me today.",
    "That feels like a real step forward. Thank you for taking the time to reflect on this — it takes real honesty to do what you've done today.",
  ],
};

export type MockResponseKey = keyof typeof mockResponses;
