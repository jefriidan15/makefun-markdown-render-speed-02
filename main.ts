// Driver for the markdown-render-speed-02 entry: reads the cases from
// the input directory, renders each one with parse() from parse.js,
// and writes the HTML strings in order to the output directory.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const raw = readFileSync(join(inputDir, 'cases.json'), 'utf8');
const parsed = JSON.parse(raw);
// The harness hands over a bare array of cases; accept an object
// carrying them under `cases` too, so the driver is not picky.
const cases = Array.isArray(parsed) ? parsed : parsed.cases;
if (!Array.isArray(cases)) throw new Error('cases.json: expected an array of cases');

const html = new Array(cases.length);
for (let n = 0; n < cases.length; n++) {
  html[n] = parse(cases[n].markdown);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'html.json'), JSON.stringify(html));
