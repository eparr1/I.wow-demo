// Each key maps to the current stage the user just responded to.
// Responses include reflection + validation + bridge into the next question.

export const mockResponses = {
  // Low branch ---------------------------------------------------------------

  explore_helping: [
    "So you've got something that's actually working for you. What else has been helping you stay steady day to day?",
    "That makes sense — you can see what's keeping things manageable. Are there other routines or structures that are part of that?",
    "That tells you something real about what works. What else has been helping you hold things together?",
  ],

  strengths_amplify: [
    "Those sound like real strengths — you can see what's working. How do you want to do more of that this week?",
    "You've got a clear read on what helps you. How do you want to build on that this week?",
    "That kind of clarity matters. How do you want to do more of that going forward?",
  ],

  future_maintenance: [
    "You've got real clarity on what's steadying you. That matters.",
    "You know what works for you — just keep doing that.",
    "The structure you've built is worth protecting.",
  ],

  // Mid branch ---------------------------------------------------------------

  explore_variability: [
    "It sounds like things haven't been easy. When was work feeling less heavy recently?",
    "That sounds genuinely draining at times. Have there been days when even one part of it felt slightly lighter?",
    "There's real pressure there. When was it feeling even a bit more manageable?",
    "Things do fluctuate. When was work feeling less heavy for you?",
    "That makes sense given what you're carrying. When was the last time it felt even slightly easier?",
  ],

  exceptions_mid: [
    "It sounds like there are moments you can draw on. What would make one day feel slightly easier this week?",
    "That's a useful thread. What would help make one day feel slightly easier?",
    "Those moments are worth paying attention to. What would help you have one easier day this week?",
  ],

  small_shifts: [
    "You can see it shifts for you. That's understanding worth holding.",
    "One small thing you figure out this week could change the whole week's feel.",
    "That feels concrete and doable. Small steps like that add up.",
  ],

  // High branch --------------------------------------------------------------

  explore_high: [
    "That kind of relentless pressure takes something out of you. Has there been any point in the last few months, even just a week or a few days, when things felt even slightly more manageable?",
    "Carrying that for a sustained stretch is exhausting. Has there been a point, even briefly, when work felt a bit less heavy?",
    "That makes complete sense given what you're describing. Has there been any time recently when things felt even slightly different — even just a few days?",
  ],

  support_check: [
    "That tells you something real about what helps. When things feel stretched like this, is there anyone at work you feel you can lean on?",
    "Worth holding onto that — it gives you something to work with. Is there anyone at work you tend to turn to when things get heavy?",
    "You can see the difference when that changes. When it gets hard like this, who at work, if anyone, do you lean on?",
    "If sharing at work doesn't feel safe, that's completely valid. One option is anonymous feedback to HR or management, but you don't have to take that on. What would help you protect your energy here?",    "Some people find it helpful to keep a separate support space while they figure out what feels safe at work. In the meantime, what small thing could help you protect your energy?",
    "If it feels too much to try to change the environment, that's okay. What could help you have a little more energy or calm this week?",  ],

  exceptions_high: [
    "That period is worth paying attention to. What was different on that easier day — the workload, the people around you, how you were working?",
    "You can identify a time when it felt different. What do you think made the difference — the workload, the people, how you were working?",
    "Those moments matter more than they might seem. What was different on that easier day?",
  ],

  strengths_high: [
    "That's a real insight — you have more understanding of what helps than you might think. What's one thing you could do this week that builds a bit more of that?",
    "It's worth holding onto that — it tells you something real about what works for you. What's one thing you could do this week, even something small?",
    "That kind of clarity is genuinely valuable. What's one thing you could do this week that builds even a bit more of that?",
  ],

  next_steps_high: [
    "That's a concrete step. Small boundaries really do shape how a day feels.",
    "You've got a real plan. Let's see how that week goes.",
    "That's specific and sustainable. That matters.",
  ],
};

export type MockResponseKey = keyof typeof mockResponses;
