/**
 * Verification Script for Upgrade 3: Evidence-Based Domain Impact & Score Consistency Engine
 * 
 * Tests 4 critical cases:
 * Case A: Higher Secondary School in Perambalur (Social/Civic, high gain, low friction, zero industrial terms)
 * Case B: Chemical Plant near Chembarambakkam Lake (High friction, sensitive water body, reject/relocate)
 * Case C: Chemical Plant in SIPCOT Ranipet (Conforming industrial zone, low friction, high gain, approve with conditions)
 * Case D: Luxury Hill Resort in Nilgiris (HACA/eco-friction, zero SIPCOT/CETP/effluent leakage, valid disruption scores)
 */

import { generateGenericFallbackResult } from './demoFallback.js';
import { ScenarioInput } from './types.js';

interface TestAssertionResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestAssertionResult[] = [];

function assert(condition: boolean, name: string, details: string) {
  results.push({
    name,
    passed: condition,
    details: condition ? details : `FAILED: ${details}`,
  });
  const statusSymbol = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusSymbol}: ${name} — ${details}`);
}

console.log('================================================================');
console.log('UPGRADE 3 VERIFICATION: Evidence-Based Domain Impact & Score Consistency');
console.log('================================================================\n');

// -------------------------------------------------------------
// CASE A: Higher Secondary School in Perambalur
// -------------------------------------------------------------
console.log('--- TEST CASE A: Higher Secondary School in Perambalur ---');
const inputA: ScenarioInput = {
  description: 'Construction of a new Government Higher Secondary School with modern science laboratories, digital library, and sports facility in Perambalur town.',
  district: 'Perambalur',
  area: 'Perambalur Town',
  department: 'School Education Department',
};

const resultA = generateGenericFallbackResult(inputA);
const gainA = resultA.gainScore ?? 0;
const frictionA = resultA.frictionScore ?? 0;

// 1. Gain and Friction checks
assert(
  gainA >= 80,
  'Case A - High Gain Score',
  `Expected Gain >= 80, got ${gainA}`
);
assert(
  frictionA <= 25,
  'Case A - Low Friction Score',
  `Expected Friction <= 25, got ${frictionA}`
);
const recTextA = `${resultA.recommendation.title} ${resultA.recommendation.why} ${resultA.recommendation.summary}`.toLowerCase();
assert(
  recTextA.includes('proceed') || recTextA.includes('approve') || recTextA.includes('priority'),
  'Case A - Recommendation Verdict',
  `Expected Approve/Proceed, got: "${resultA.recommendation.title}"`
);

// 2. Industrial template leak check for School
const fullTextA = JSON.stringify({
  recommendation: resultA.recommendation,
  alternatives: resultA.alternatives,
  agentAnalyses: resultA.agentAnalyses,
  evidenceMatrix: resultA.evidenceMatrix,
}).toLowerCase();

const forbiddenIndustrialTerms = ['sipcot', 'sidco', 'cetp', 'zld', 'effluent'];
const foundLeaksA = forbiddenIndustrialTerms.filter(term => fullTextA.includes(term));
assert(
  foundLeaksA.length === 0,
  'Case A - Zero Industrial Template Leakage',
  foundLeaksA.length === 0
    ? 'No industrial terms found in school output'
    : `Found forbidden terms: ${foundLeaksA.join(', ')}`
);

// 3. What-if score monotonic disruption check
if (resultA.alternatives && resultA.alternatives.length > 0) {
  const origAltA = resultA.alternatives.find(a => a.id.includes('orig') || a.recommendationStatus === 'Baseline / Proposed');
  const recAltA = resultA.alternatives.find(a => a.recommendationStatus === 'Recommended');
  if (origAltA && recAltA) {
    assert(
      recAltA.scores.overall <= origAltA.scores.overall,
      'Case A - Disruption Score Monotonicity (Lower = Minimized Disruption)',
      `Recommended (${recAltA.scores.overall}) <= Original (${origAltA.scores.overall})`
    );
  } else {
    assert(true, 'Case A - Alternatives present', `Found ${resultA.alternatives.length} alternatives`);
  }
}

console.log('\n-------------------------------------------------------------');
// -------------------------------------------------------------
// CASE B: Chemical Plant near Chembarambakkam Lake
// -------------------------------------------------------------
console.log('--- TEST CASE B: Chemical Plant near Chembarambakkam Lake ---');
const inputB: ScenarioInput = {
  description: 'Setting up a synthetic organic chemical and azo dye manufacturing unit with daily water requirement of 250 KLD near Chembarambakkam Lake waterbody.',
  district: 'Thiruvallur',
  area: 'Chembarambakkam Lake Basin',
  department: 'Industries Department',
};

const resultB = generateGenericFallbackResult(inputB);
const gainB = resultB.gainScore ?? 0;
const frictionB = resultB.frictionScore ?? 0;

// 1. Friction check
assert(
  frictionB >= 75,
  'Case B - High Friction Score for Sensitive Water Zone',
  `Expected Friction >= 75, got ${frictionB}`
);
const compatB = resultB.locationImpactContext?.locationCompatibilityClassification;
assert(
  compatB === 'High Conflict / Incompatible' || compatB === 'Conditional / Safeguards Required',
  'Case B - Location Compatibility Friction Detected',
  `Expected High Conflict / Conditional, got: ${compatB}`
);
const recTextB = `${resultB.recommendation.title} ${resultB.recommendation.why} ${resultB.recommendation.summary}`.toLowerCase();
assert(
  recTextB.includes('reject') ||
  recTextB.includes('relocate') ||
  recTextB.includes('withhold') ||
  recTextB.includes('defer') ||
  recTextB.includes('incompatible') ||
  recTextB.includes('precaution'),
  'Case B - Recommendation Verdict Withholds/Rejects/Relocates',
  `Got: "${resultB.recommendation.title}"`
);

// 2. What-if score monotonic disruption check
if (resultB.alternatives && resultB.alternatives.length > 0) {
  const origAltB = resultB.alternatives.find(a => a.id.includes('orig') || a.recommendationStatus === 'Baseline / Proposed');
  const recAltB = resultB.alternatives.find(a => a.recommendationStatus === 'Recommended');
  if (origAltB && recAltB) {
    assert(
      recAltB.scores.overall <= origAltB.scores.overall,
      'Case B - Disruption Score Monotonicity',
      `Recommended Disruption (${recAltB.scores.overall}) <= Original Disruption (${origAltB.scores.overall})`
    );
  }
}

console.log('\n-------------------------------------------------------------');
// -------------------------------------------------------------
// CASE C: Chemical Plant in SIPCOT Ranipet
// -------------------------------------------------------------
console.log('--- TEST CASE C: Chemical Plant in SIPCOT Ranipet ---');
const inputC: ScenarioInput = {
  description: 'Setting up a specialty chemical manufacturing unit inside SIPCOT Industrial Complex Phase III in Ranipet with dedicated pre-treatment and CETP hookup.',
  district: 'Ranipet',
  area: 'SIPCOT Industrial Complex Phase III',
  department: 'Industries Department',
};

const resultC = generateGenericFallbackResult(inputC);
const gainC = resultC.gainScore ?? 0;
const frictionC = resultC.frictionScore ?? 0;

// 1. Conforming industrial zone friction modulation check
assert(
  frictionC <= 45,
  'Case C - Low/Moderate Friction in Designated Industrial Estate',
  `Expected Friction <= 45, got ${frictionC}`
);
assert(
  gainC >= 55,
  'Case C - Industrial Gain Score',
  `Expected Gain >= 55, got ${gainC}`
);
const compatC = resultC.locationImpactContext?.locationCompatibilityClassification;
assert(
  compatC === 'Highly Compatible' || compatC === 'Moderately Compatible' || compatC === 'Conditional / Safeguards Required',
  'Case C - Recognized as Compatible Industrial Zone',
  `Got: ${compatC}`
);
const recTextC = `${resultC.recommendation.title} ${resultC.recommendation.why} ${resultC.recommendation.summary}`.toLowerCase();
assert(
  recTextC.includes('proceed') ||
  recTextC.includes('approve') ||
  recTextC.includes('safeguard') ||
  recTextC.includes('favorable') ||
  recTextC.includes('permit'),
  'Case C - Recommendation Approves with Conditions in Designated Zone',
  `Got: "${resultC.recommendation.title}"`
);

console.log('\n-------------------------------------------------------------');
// -------------------------------------------------------------
// CASE D: Luxury Hill Resort in Nilgiris Rural Panchayat
// -------------------------------------------------------------
console.log('--- TEST CASE D: Luxury Hill Resort in Nilgiris (Coonoor) ---');
const inputD: ScenarioInput = {
  description: 'Development of a 50-room luxury eco-tourism hill resort with spa, private cottages, and terraced gardens in a Rural Panchayat in Coonoor, Nilgiris.',
  district: 'The Nilgiris',
  area: 'Coonoor Rural Panchayat',
  department: 'Tourism Department',
};

const resultD = generateGenericFallbackResult(inputD);
const frictionD = resultD.frictionScore ?? 0;

// 1. Eco-zone friction recognized
assert(
  frictionD >= 40,
  'Case D - Hill Ecology / HACA Friction Recognized',
  `Expected Friction >= 40, got ${frictionD}`
);

// 2. Zero industrial leakage for resort
const fullTextD = JSON.stringify({
  recommendation: resultD.recommendation,
  alternatives: resultD.alternatives,
  agentAnalyses: resultD.agentAnalyses,
  evidenceMatrix: resultD.evidenceMatrix,
}).toLowerCase();

const foundLeaksD = forbiddenIndustrialTerms.filter(term => fullTextD.includes(term));
assert(
  foundLeaksD.length === 0,
  'Case D - Zero Industrial Template Leakage in Hill Resort',
  foundLeaksD.length === 0
    ? 'No industrial terms found in hill resort output'
    : `Found forbidden terms: ${foundLeaksD.join(', ')}`
);

// 3. What-if score monotonic disruption check
if (resultD.alternatives && resultD.alternatives.length > 0) {
  const origAltD = resultD.alternatives.find(a => a.id.includes('orig') || a.recommendationStatus === 'Baseline / Proposed');
  const recAltD = resultD.alternatives.find(a => a.recommendationStatus === 'Recommended');
  if (origAltD && recAltD) {
    assert(
      recAltD.scores.overall <= origAltD.scores.overall,
      'Case D - Disruption Score Monotonicity',
      `Recommended Disruption (${recAltD.scores.overall}) <= Original Disruption (${origAltD.scores.overall})`
    );
  }
}

// 4. Evidence Matrix Presence and Score Explanation
const matrixDomainCount = Object.keys(resultD.evidenceMatrix || {}).length;
assert(
  matrixDomainCount >= 9,
  'Case D - Canonical Evidence Matrix Populated with All 9 Domains',
  `Evidence domain count: ${matrixDomainCount}`
);
assert(
  !!resultD.scoreExplanation && (resultD.scoreExplanation.frictionDrivers.length > 0 || resultD.scoreExplanation.gainDrivers.length > 0),
  'Case D - Score Explanation Generated with Drivers',
  `Drivers: Gain=${resultD.scoreExplanation?.gainDrivers.length}, Friction=${resultD.scoreExplanation?.frictionDrivers.length}`
);

console.log('\n=============================================================');
const totalTests = results.length;
const passedTests = results.filter(r => r.passed).length;
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('=============================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL UPGRADE 3 VERIFICATION TESTS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED. CHECK OUTPUT ABOVE.');
  process.exit(1);
}
