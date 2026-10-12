/**
 * Everything on the site that's specific to its subject lives here.
 *
 * This build is an UNOFFICIAL FAN TRIBUTE to actor Rajesh Hamal. It is deliberately written in the
 * third person and labelled as a tribute so nobody mistakes it for his official site.
 * Please double-check biographical details before publishing.
 */

export type HairStyle = "long" | "short" | "swept";
export type Face = "soft" | "rugged";
export type Outfit = "tee" | "vest";

export const profile = {
  name: "Rajesh Hamal",
  fullName: "Rajesh Hamal",
  role: "Actor · Nepali Film Industry",
  tagline:
    "The Mahanayak of Nepali cinema: a leading man for more than three decades, from his 1991 debut to today.",
  location: "Kathmandu, Nepal",
  /** Contact address of the site's creator (not of Rajesh Hamal). */
  email: "hello@example.com",
  available: false,

  /** Shown on every page so the site can't be mistaken for an official one. */
  disclaimer: "Unofficial fan tribute. Not affiliated with or endorsed by Rajesh Hamal.",

  socials: [] as { label: string; href: string }[],

  copy: {
    heroGreeting: "A fan tribute to",
    primaryCta: { label: "Filmography", href: "#work" },
    secondaryCta: { label: "Fan mail", href: "#contact" },
    workEyebrow: "Filmography",
    workTitle: "Films that made a",
    workTitleScript: "legend",
    workIntro: "A few landmark films from a career of more than 200.",
    aboutEyebrow: "About",
    aboutTitle: "Nepal’s leading man, known as the",
    aboutTitleScript: "Mahanayak",
    experienceLabel: "Career highlights",
    skillsLabel: "Known for",
    contactEyebrow: "Fan mail",
    contactTitle: "Share your favourite",
    contactTitleScript: "scene",
    contactIntro:
      "Which Rajesh Hamal film do you love most? Messages go to the creator of this fan site, not to Rajesh Hamal himself.",
  },

  /** The code-drawn character in the hero. */
  character: {
    label: "Cartoon illustration of Rajesh Hamal in a grey vest with a woven trim",
    face: "rugged" as Face,
    hairStyle: "swept" as HairStyle,
    outfit: "vest" as Outfit,
    necklace: true,
    skin: "#c98d66",
    skinShadow: "#a8704d",
    hair: "#151011",
    hairShine: "#3d3230",
    eyes: "#2b1a12",
    lips: "#8a4a3e",
    shirt: "#a9aaa6",
    shirtShadow: "#8e8f8b",
  },

  about: [
    "Rajesh Hamal is one of the most celebrated actors in the history of Nepali cinema. Since his debut in Yug Dekhi Yug Samma (1991) he has headlined more than 200 films and earned the title Mahanayak, the great hero.",
    "Known for his commanding screen presence and unmistakable dialogue delivery, he remains a household name across Nepal and the Nepali diaspora.",
  ],

  stats: [
    { value: 1991, suffix: "", label: "Film debut" },
    { value: 200, suffix: "+", label: "Films" },
    { value: 30, suffix: "+", label: "Years on screen" },
  ],

  skills: [
    "Action", "Drama", "Romance", "Iconic dialogues", "Screen presence", "Mahanayak",
    "Nepali cinema", "Kathmandu", "Leading man", "Living legend",
  ],

  experience: [
    {
      period: "1991",
      title: "Film debut",
      company: "Yug Dekhi Yug Samma",
      summary: "His first leading role, and the start of a career that would define Nepali cinema for a generation.",
    },
    {
      period: "1990s",
      title: "Rise to stardom",
      company: "Golden era of Nepali film",
      summary: "Became the industry's most bankable leading man, headlining hit after hit through the decade.",
    },
    {
      period: "Today",
      title: "Mahanayak",
      company: "A living legend",
      summary: "Still one of the most recognised faces in Nepal, with a filmography of more than 200 titles.",
    },
  ],

  /** Films shown in the Filmography section. Add, remove or correct entries here. */
  projects: [
    {
      title: "Yug Dekhi Yug Samma",
      kind: "1991 · Debut",
      description: "The film that introduced Rajesh Hamal to Nepali audiences as a leading man.",
      tags: ["Debut", "Drama"],
      href: "#",
      accent: "#8b1e2d",
    },
    {
      title: "Deuta",
      kind: "1992",
      description: "One of the early hits that cemented his place at the top of the industry.",
      tags: ["Classic", "Drama"],
      href: "#",
      accent: "#7a5236",
    },
    {
      title: "Balidan",
      kind: "1997",
      description: "A landmark film set against Nepal's struggle for democracy.",
      tags: ["Historical", "Drama"],
      href: "#",
      accent: "#2f5d62",
    },
    {
      title: "Your favourite",
      kind: "Add a film",
      description: "Replace this card with another film: its year, a one-line description and a link to watch or read more.",
      tags: ["Edit in profile.ts"],
      href: "#",
      accent: "#5b4bb7",
    },
  ],
};

export type Profile = typeof profile;
export type Project = Profile["projects"][number];
