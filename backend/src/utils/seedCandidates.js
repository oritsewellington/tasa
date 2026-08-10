import dotenv from "dotenv";
import { connectDB } from "../utils/db.js";
import Category from "../models/Category.model.js";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

dotenv.config();

const CANDIDATES_BY_CATEGORY = {
  "Best Actor (Male)": [
    { name: "Benedict Jacob", level: "100 Level" },
    { name: "Promise Okafor", level: "200 Level" },
    { name: "Edokpo Daniel", level: "300 Level" },
  ],

  "Best Actor (Female)": [
    { name: "Temitope Davies Idunnuoluwa", level: "100 Level" },
    { name: "Wazzy Queensley Ifeanyi", level: "200 Level" },
    { name: "Tsuru Ruth", level: "300 Level" },
  ],

  "Best Dancer (Male)": [
    { name: "Benedict Jacob", level: "100 Level" },
    { name: "Osayande Solomon", level: "200 Level" },
    { name: "Ikegbue Emmanuel", level: "300 Level" },
  ],

  "Best Dancer (Female)": [
    { name: "Praise Prosper Osagiede", level: "100 Level" },
    { name: "Treasurer Joseph", level: "200 Level" },
    { name: "Efosa Martina", level: "300 Level" },
  ],

  "Best Director (Male)": [{ name: "Emmanuel Nwaebichi", level: "300 Level" }],

  "Best Director (Female)": [{ name: "Ugiagbe Promise", level: "300 Level" }],

  "Best Costumier (Male)": [
    { name: "Benedict Jacob", level: "100 Level" },
    { name: "Godwin Oviawe", level: "200 Level" },
    { name: "Ikegbue Emmanuel", level: "300 Level" },
  ],

  "Best Costumier (Female)": [
    { name: "Idahor John Osarumwense", level: "100 Level" },
    { name: "Angela Christianah Nicolas", level: "200 Level" },
    { name: "Ogbeta Blessing", level: "300 Level" },
  ],

  "Political Guru (Male)": [
    { name: "Omoruyi Sylvester", level: "100 Level" },
    { name: "Dauda Favour", level: "200 Level" },
    { name: "Emmanuel Nwaebichi", level: "300 Level" },
  ],

  "Political Guru (Female)": [
    { name: "Mercy Ejebe", level: "200 Level" },
    { name: "Happy Osuware", level: "300 Level" },
  ],

  "Sportsman of the Year (Male)": [
    { name: "Oviawe Godwin", level: "200 Level" },
    { name: "Osazuwa Godstime", level: "300 Level" },
  ],

  "Sportsman of the Year (Female)": [
    { name: "Gowon Esther", level: "200 Level" },
    { name: "Abu Blessing", level: "300 Level" },
  ],

  "Most Influential (Male)": [
    { name: "Dauda Favour", level: "100 Level" },
    { name: "Destiny Osakhunmen Osagie", level: "200 Level" },
    { name: "Abu Joseph", level: "300 Level" },
  ],

  "Most Influential (Female)": [
    { name: "Owoicho Ochanya Blessing", level: "100 Level" },
    { name: "Igumao Edith", level: "200 Level" },
    { name: "Agape Anthony", level: "300 Level" },
  ],

  "Best Set Designer": [
    { name: "Prince Efosa Enadeghe", level: "200 Level" },
    { name: "Benjamin Chinonso", level: "300 Level" },
  ],

  "Best Supporting Actor (Male)": [
    { name: "Joseph Bernard", level: "100 Level" },
    { name: "Oyewale Oluwatobiloba", level: "200 Level" },
    { name: "Osaro Evidence", level: "300 Level" },
  ],

  "Best Supporting Actor (Female)": [
    { name: "Tongo Beatrice", level: "100 Level" },
    { name: "Osifo Faith Omosefe", level: "200 Level" },
    { name: "Azeez Rachel", level: "300 Level" },
  ],

  "Thespian of the Year": [
    { name: "Oyamenda Ephraim", level: "200 Level" },
    { name: "Osaro Evidence", level: "300 Level" },
  ],

  "Best Stage Manager": [
    { name: "Amayo Unity", level: "200 Level" },
    { name: "Ugiagbe Promise", level: "300 Level" },
  ],

  "Entrepreneur of the Year": [
    { name: "Oyewale Oluwatobiloba", level: "200 Level" },
    { name: "Jenny's Hair Makeover", level: "300 Level" },
  ],

  "Best Content Creator": [
    { name: "Chaos Creators", level: "100 Level" },
    { name: "Diamond Secret", level: "200 Level" },
    { name: "VB Glam", level: "300 Level" },
  ],

  "Best Drummer": [
    { name: "Ezenagu Praise Somtochukwu", level: "100 Level" },
    { name: "Isaac Newton", level: "200 Level" },
    { name: "Desmond Nwachukwu", level: "300 Level" },
  ],

  "Music Artist of the Year": [
    { name: "Energy", level: "100 Level" },
    { name: "Derek More", level: "200 Level" },
    { name: "Billy", level: "300 Level" },
  ],
};

async function seedCandidatesForCategory(categoryName, nominees) {
  const category = await Category.findOne({ name: categoryName }).collation({
    locale: "en",
    strength: 2,
  });

  if (!category) {
    console.log(`  ⚠ Skipped "${categoryName}" — no matching category found.`);
    return { created: 0, skipped: 0, missing: true };
  }

  const event = await Event.findOne({ categoryId: category._id });
  if (!event) {
    console.log(
      `  ⚠ Skipped "${categoryName}" — category exists but has no event.`,
    );
    return { created: 0, skipped: 0, missing: true };
  }

  // Existing names under this event — case-insensitive, trimmed — so
  // rerunning with more pasted batches never creates duplicates.
  const existing = await Candidate.find({ event: event._id }, "name");
  const existingNames = new Set(
    existing.map((c) => c.name.trim().toLowerCase()),
  );

  // Highest candidateNumber already used under this event, so new
  // candidates continue the sequence instead of colliding with the
  // schema's unique { event, candidateNumber } index on a rerun.
  const lastCandidate = await Candidate.findOne({ event: event._id })
    .sort({ candidateNumber: -1 })
    .select("candidateNumber");
  let nextNumber = (lastCandidate?.candidateNumber || 0) + 1;

  let created = 0,
    skipped = 0;

  for (const nominee of nominees) {
    const key = nominee.name.trim().toLowerCase();
    if (existingNames.has(key)) {
      skipped++;
      continue;
    }

    await Candidate.create({
      name: nominee.name.trim(),
      department: "",
      level: nominee.level?.trim() || "",
      photo: "",
      candidateNumber: nextNumber,
      event: event._id,
      totalVotes: 0,
    });

    existingNames.add(key);
    nextNumber++;
    created++;
  }

  console.log(
    `  ✓ ${categoryName}: ${created} created, ${skipped} already existed.`,
  );
  return { created, skipped, missing: false };
}

async function seedCandidates() {
  await connectDB();

  console.log("Seeding candidates...\n");

  let totalCreated = 0,
    totalSkipped = 0;
  const missingCategories = [];

  for (const [categoryName, nominees] of Object.entries(
    CANDIDATES_BY_CATEGORY,
  )) {
    const result = await seedCandidatesForCategory(categoryName, nominees);
    totalCreated += result.created;
    totalSkipped += result.skipped;
    if (result.missing) missingCategories.push(categoryName);
  }

  console.log(
    `\nDone — ${totalCreated} candidates created, ${totalSkipped} already existed.`,
  );

  if (missingCategories.length) {
    console.log(
      `\n⚠ These category names didn't match any seeded category/event — check spelling:\n  ${missingCategories.join("\n  ")}`,
    );
  }

  process.exit(0);
}

seedCandidates().catch((err) => {
  console.error("Candidate seed failed:", err);
  process.exit(1);
});
