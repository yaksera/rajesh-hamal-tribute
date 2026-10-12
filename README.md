# Cursor-tracking portfolio: Rajesh Hamal fan tribute

An unofficial fan tribute to Nepali actor Rajesh Hamal, built on a cursor-tracking portfolio template. The hero character follows your mouse: head, eyes, brows and hair turn toward the cursor. Built with **Next.js 16**, **Tailwind CSS v4** and **GSAP**.

## Run it

```bash
npm install
npm run dev
```

## Make it yours

Everything personal is in **`src/content/profile.ts`**: name, role, tagline, email, socials, about text, stats, skills, experience, projects, and the character's colours (`skin`, `hair`, `eyes`, `shirt`, and `hairStyle: "long" | "short"`).

- **Section headings and buttons** are in `profile.copy`. **Films** are in `profile.projects`. Please verify biographical details before publishing.
- **Character looks:** `face: "soft" | "rugged"`, `hairStyle: "long" | "short" | "swept"`, `outfit: "tee" | "vest"`, `necklace`.
- **Tribute framing:** the hero badge, contact intro and footer `disclaimer` keep it clear that this isn't an official site. Keep them if you publish it.
- **Contact form:** copy `.env.example` to `.env.local` and add a [Resend](https://resend.com) API key and your inbox address. Until then, the form politely offers a mailto link instead.

## How the character works

`src/components/character.tsx` draws the character as layered SVG. On every pointer move, GSAP `quickTo` shifts each layer by a different amount toward the cursor:

| Layer       | Moves                       |
| ----------- | --------------------------- |
| Features    | most (eyes, nose, mouth)    |
| Irises      | extra, clipped inside the eyes |
| Head        | less, plus a small tilt     |
| Ears, back hair | the opposite way        |

That difference in movement makes a flat drawing read as a head turning in 3D. The character also blinks at random intervals, breathes, looks around on its own after a few idle seconds, raises its brows when you hover **Resume**, and smiles when you hover **Let's talk**. All motion switches off when the visitor has `prefers-reduced-motion` set.

The wavy hair outline in `character-paths.ts` was generated with a small Catmull-Rom + sine-offset script; edit `BACK_HAIR` and the locks if you want a different silhouette.
