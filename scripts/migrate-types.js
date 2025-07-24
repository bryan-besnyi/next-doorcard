#!/usr/bin/env node

/**
 * Type Migration Helper Script
 * 
 * This script helps identify types that still need to be moved to the centralized type system.
 * Run this to see what types are still scattered throughout the codebase.
 */

const fs = require('fs');
const path = require('path');

// Directories to scan for types
const SCAN_DIRECTORIES = [
  'app',
  'components', 
  'lib',
  'hooks',
  'store'
];

// Files to exclude
const EXCLUDE_FILES = [
  'node_modules',
  '.next',
  'cypress',
  'types', // Don't scan the new types directory
  'scripts',
  'prisma'
];

// Type patterns to look for
const TYPE_PATTERNS = [
  /interface\s+(\w+)/g,
  /type\s+(\w+)\s*=/g,
  /export\s+(?:type|interface)\s+(\w+)/g
];

function findTypeDefinitions(dir, results = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_FILES.includes(item)) {
        findTypeDefinitions(fullPath, results);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative('.', fullPath);
      
      // Find type definitions
      for (const pattern of TYPE_PATTERNS) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          results.push({
            type: match[1],
            file: relativePath,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    }
  }
  
  return results;
}

function main() {
  console.log('🔍 Scanning for type definitions...\n');
  
  const allTypes = [];
  
  for (const dir of SCAN_DIRECTORIES) {
    if (fs.existsSync(dir)) {
      const types = findTypeDefinitions(dir);
      allTypes.push(...types);
    }
  }
  
  // Group by file
  const typesByFile = {};
  allTypes.forEach(type => {
    if (!typesByFile[type.file]) {
      typesByFile[type.file] = [];
    }
    typesByFile[type.file].push(type);
  });
  
  console.log('📋 Found type definitions:\n');
  
  Object.entries(typesByFile).forEach(([file, types]) => {
    console.log(`📁 ${file}:`);
    types.forEach(type => {
      console.log(`   - ${type.type} (line ${type.line})`);
    });
    console.log('');
  });
  
  console.log('✅ Migration suggestions:');
  console.log('1. Move component types to types/components/');
  console.log('2. Move page types to types/pages/');
  console.log('3. Move API types to types/api/');
  console.log('4. Move hook types to types/hooks/');
  console.log('5. Update imports to use centralized types');
}

if (require.main === module) {
  main();
}

module.exports = { findTypeDefinitions }; 