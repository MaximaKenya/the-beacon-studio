export type StudioComparison = {
  id: string;
  title: string;
  line: string;
  fit: string;
  emphasis?: boolean;
};

export const studioComparison: StudioComparison[] = [
  {
    id: "hire",
    title: "In-house hire",
    line: "A full-time person, a salary, and time to learn your tools.",
    fit: "The work is every day and still growing.",
  },
  {
    id: "freelancer",
    title: "Freelancer",
    line: "One person for one build. You brief them and own the handoff.",
    fit: "A site or a one-off tool, then a pause.",
  },
  {
    id: "beacon",
    title: "The Beacon Studio",
    line: "One workflow on the tools you already use. A free 20-minute audit, then a monthly automation you can pause.",
    fit: "We watch it. You keep the conversations that need a person.",
    emphasis: true,
  },
];
