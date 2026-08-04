import confetti from "canvas-confetti";
import { CONFETTI_COLORS } from "./constants";

export function fireShipConfetti() {
  const count = 140;
  const defaults = {
    origin: { y: 0.7 },
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.35),
    spread: 55,
    startVelocity: 45,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.35),
    spread: 80,
    decay: 0.91,
    scalar: 0.9,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.3),
    spread: 110,
    startVelocity: 30,
    scalar: 1.1,
  });
}

export function fireMilestoneConfetti() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.55 },
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
  });
}
