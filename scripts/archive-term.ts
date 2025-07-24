#!/usr/bin/env tsx

/**
 * Simple Term Archiver
 *
 * Usage: npx tsx scripts/archive-term.ts "Summer 2025"
 */

import { prisma } from "../lib/prisma";

async function archiveTerm(termName: string) {
  console.log(`🔄 Archiving term: ${termName}`);

  try {
    // Find the term
    const term = await prisma.term.findUnique({
      where: { name: termName },
      include: { doorcards: true },
    });

    if (!term) {
      console.log(`❌ Term "${termName}" not found`);
      return;
    }

    console.log(`📦 Found term with ${term.doorcards.length} doorcards`);

    // Archive the term and its doorcards
    await prisma.$transaction(async (tx) => {
      // Archive the term
      await tx.term.update({
        where: { id: term.id },
        data: {
          isActive: false,
          isArchived: true,
          archiveDate: new Date(),
        },
      });

      // Archive all doorcards for this term
      await tx.doorcard.updateMany({
        where: { termId: term.id },
        data: {
          isActive: false,
          isPublic: false,
        },
      });
    });

    console.log(
      `✅ Successfully archived "${termName}" and ${term.doorcards.length} doorcards`
    );
  } catch (error) {
    console.error("❌ Error archiving term:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get term name from command line
const termName = process.argv[2];

if (!termName) {
  console.log('Usage: npx tsx scripts/archive-term.ts "Summer 2025"');
  process.exit(1);
}

archiveTerm(termName);
