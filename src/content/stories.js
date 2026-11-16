// STORIES FROM PEOPLE WHO HAVE BEEN ON EXCHANGE
//
// SAMPLE CONTENT. Every entry marked `sample: true` is a placeholder written so the page can be
// designed: the people, their words and their routes are NOT real. Before this goes live, replace
// them with real participants who have agreed to be featured (their first name, their own words,
// their own photographs), then delete the `sample` flag. A note on the page reminds you while
// developing, and each sample story is tagged.
//
// For each story:
//   direction   "out" (from Lebanon, abroad) or "in" (from abroad, to Lebanon)
//   programme   volunteer | talent | teacher (its AIESEC colour comes from content/site.js)
//   from, to    { city, country, at: [longitude, latitude] }: the route is drawn between them
//   photos      the portrait, then two more: src/assets/gen/story-<id>-portrait.jpg, -1.jpg, -2.jpg
//               (see src/assets/gen/README.md). Until they exist, `stand` names stand-ins.

import { hasGen } from "../lib/media";

// a story's own photograph (0 the portrait, 1 and 2 the others) once it has arrived, its stand-in until then
export const storyPhoto = (s, i) => {
  const own = i === 0 ? `story-${s.id}-portrait` : `story-${s.id}-${i}`;
  return hasGen(own) ? own : s.stand[i];
};

const BEIRUT = { city: "Beirut", country: "Lebanon", at: [35.5, 33.89] };

export const STORIES = [
  {
    id: "maya",
    sample: true,
    name: "Maya",
    direction: "out",
    programme: "volunteer",
    when: "Summer",
    from: BEIRUT,
    to: { city: "São Paulo", country: "Brazil", at: [-46.63, -23.55] },
    quote: "I went to teach English to children. I came back having learned how to listen.",
    story: [
      "Six weeks in a community centre on the edge of the city, with a team of volunteers from four countries and a timetable that changed every morning.",
      "The children taught her more Portuguese than any class. The other volunteers taught her how to run a room. She came home and joined the team that sends the next ones out.",
    ],
    stand: ["program-volunteer", "door-local", "day-batroun"],
  },
  {
    id: "ana",
    sample: true,
    name: "Ana",
    direction: "in",
    programme: "volunteer",
    when: "Winter",
    from: { city: "Lisbon", country: "Portugal", at: [-9.14, 38.72] },
    to: BEIRUT,
    quote: "Everyone warned me about Beirut. Nobody warned me I would want to stay.",
    story: [
      "She came for an education project with a local organisation and stayed with a host family in Achrafieh, who fed her as if she had been away for years.",
      "On weekends the team took her north to the cedars and south to Tyre. She still sends the family a message every Sunday.",
    ],
    stand: ["door-incoming", "day-beirut-night", "place-tyre"],
  },
  {
    id: "karim",
    sample: true,
    name: "Karim",
    direction: "out",
    programme: "talent",
    when: "Six months",
    from: { city: "Tripoli", country: "Lebanon", at: [35.85, 34.44] },
    to: { city: "Istanbul", country: "Türkiye", at: [28.98, 41.01] },
    quote: "My first real job was in another language, in another country, and I was ready for it.",
    story: [
      "An internship in the product team of a logistics startup, found through AIESEC in his last year of engineering.",
      "He left with a reference, two languages he could work in, and the confidence to apply for things he would not have dared to before.",
    ],
    stand: ["program-talent", "platforms-cover", "exchange-hero"],
  },
  {
    id: "kwame",
    sample: true,
    name: "Kwame",
    direction: "in",
    programme: "talent",
    when: "Four months",
    from: { city: "Accra", country: "Ghana", at: [-0.19, 5.6] },
    to: BEIRUT,
    quote: "I learned more about building a business in Beirut than in any course.",
    story: [
      "A marketing internship with a young company in Mar Mikhael, where everyone did three jobs and the office closed for lunch.",
      "He arrived knowing nobody. By the end there was a farewell dinner in Byblos with half the team and most of the AIESEC office.",
    ],
    stand: ["place-byblos", "day-mezze", "lebanon-byblos"],
  },
  {
    id: "lea",
    sample: true,
    name: "Léa",
    direction: "out",
    programme: "teacher",
    when: "A school year",
    from: { city: "Zahlé", country: "Lebanon", at: [35.9, 33.85] },
    to: { city: "Hanoi", country: "Vietnam", at: [105.85, 21.03] },
    quote: "Standing in front of forty students taught me what I actually believe.",
    story: [
      "A year teaching English in a public secondary school, with a mentor teacher who became a friend.",
      "She found out she is good at it. She is now training to teach at home.",
    ],
    stand: ["program-teacher", "door-local", "day-cedars"],
  },
  {
    id: "priya",
    sample: true,
    name: "Priya",
    direction: "in",
    programme: "teacher",
    when: "Three months",
    from: { city: "Pune", country: "India", at: [73.86, 18.52] },
    to: { city: "Byblos", country: "Lebanon", at: [35.65, 34.12] },
    quote: "My students taught me Arabic faster than I taught them English.",
    story: [
      "She taught English at a language centre in Byblos, in a classroom ten minutes' walk from a harbour seven thousand years old.",
      "On her last day the class brought manakish and a card in three languages.",
    ],
    stand: ["place-byblos", "place-jeita", "day-raouche"],
  },
];
