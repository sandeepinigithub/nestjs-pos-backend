/**
 * Prisma Schema Merger
 * 
 * This script merges schema.base.prisma with all .prisma files in the models/ directory
 * into a single schema.prisma file that Prisma can use.
 * 
 * Compatible with Prisma 5.x and 6.x
 * 
 * Usage: ts-node scripts/merge-prisma-schema.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const PRISMA_DIR = path.join(__dirname, '..', 'prisma');
const BASE_SCHEMA = path.join(PRISMA_DIR, 'schema.base.prisma');
const MODELS_DIR = path.join(PRISMA_DIR, 'models');
const OUTPUT_SCHEMA = path.join(PRISMA_DIR, 'schema.prisma');

function mergeSchemas(): void {
  try {
    console.log('🔄 Merging Prisma schema files...');

    // Read base schema
    if (!fs.existsSync(BASE_SCHEMA)) {
      console.error(`❌ Base schema not found: ${BASE_SCHEMA}`);
      console.error('   Make sure schema.base.prisma exists in the prisma/ directory');
      process.exit(1);
    }

    let mergedContent = fs.readFileSync(BASE_SCHEMA, 'utf8');
    
    // Ensure base schema ends with newline
    if (!mergedContent.endsWith('\n')) {
      mergedContent += '\n';
    }
    
    mergedContent += '\n// ============================================\n';
    mergedContent += '// Models (merged from models/ directory)\n';
    mergedContent += '// Auto-generated - DO NOT EDIT MANUALLY\n';
    mergedContent += '// ============================================\n\n';

    // Read all model files
    if (!fs.existsSync(MODELS_DIR)) {
      console.error(`❌ Models directory not found: ${MODELS_DIR}`);
      console.error('   Creating models directory...');
      fs.mkdirSync(MODELS_DIR, { recursive: true });
      console.log('✅ Created models directory');
      console.log('⚠️  Please add your model files to prisma/models/');
    }

    const modelFiles = fs
      .readdirSync(MODELS_DIR)
      .filter(file => file.endsWith('.prisma'))
      .sort(); // Sort for consistent ordering

    if (modelFiles.length === 0) {
      console.warn('⚠️  No model files found in models/ directory');
      console.warn('   Add your .prisma model files to prisma/models/');
    }

    let fileCount = 0;
    const processedFiles: string[] = [];

    modelFiles.forEach((file) => {
      const filePath = path.join(MODELS_DIR, file);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Clean up file content - remove leading/trailing whitespace
      fileContent = fileContent.trim();
      
      // Skip empty files
      if (!fileContent) {
        console.warn(`  ⚠️  Skipping empty file: ${file}`);
        return;
      }
      
      // Add file header comment
      mergedContent += `// --- ${file} ---\n`;
      mergedContent += fileContent;
      mergedContent += '\n\n';
      fileCount++;
      processedFiles.push(file);
      
      console.log(`  ✓ Merged ${file}`);
    });

    // Write merged schema
    fs.writeFileSync(OUTPUT_SCHEMA, mergedContent, 'utf8');

    console.log(`\n✅ Schema merged successfully!`);
    console.log(`   Processed ${fileCount} model file(s): ${processedFiles.join(', ')}`);
    console.log(`   Output: ${OUTPUT_SCHEMA}`);
    
  } catch (error: any) {
    console.error('❌ Error merging schemas:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  mergeSchemas();
}

export { mergeSchemas };

