#!/usr/bin/env tsx

import { TermManager } from "../lib/term-management";
import { prisma } from "../lib/prisma";

async function testTerms() {
  console.log("🧪 Testing TermManager...");
  
  try {
    // Test 1: Get all terms
    console.log("📅 Testing getAllTerms()...");
    const terms = await TermManager.getAllTerms();
    console.log(`✅ Found ${terms.length} terms:`, terms.map(t => t.name));
    
    // Test 2: Get active term
    console.log("🎯 Testing getActiveTerm()...");
    const activeTerm = await TermManager.getActiveTerm();
    console.log(`✅ Active term:`, activeTerm?.name || "None");
    
    // Test 3: Get statistics
    console.log("📊 Testing getTermStatistics()...");
    const stats = await TermManager.getTermStatistics();
    console.log("✅ Statistics:", stats);
    
  } catch (error) {
    console.error("❌ Error testing TermManager:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testTerms(); 