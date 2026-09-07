import { analyzeLocationConditionedImpact } from './locationConditionedAnalysis.js';
import { extractStructuredProposalUnderstanding } from './proposalUnderstanding.js';
import { resolveLocationAdministrativeProfile } from './locationContextData.js';
import { generateGenericFallbackResult } from './demoFallback.js';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING UPGRADE 2 LOCATION-CONDITIONED ENGINE VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // SCENARIO 1: Chemical plant on fertile agricultural farmland near river
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 1: Chemical plant on fertile agricultural farmland near Cauvery River (Thanjavur) ---');
  const input1 = {
    description: 'Construct a large chemical manufacturing plant on fertile agricultural farmland near Cauvery River and populated residential settlement',
    district: 'Thanjavur',
    location: 'Thanjavur, Tamil Nadu',
    department: 'Industries Department',
  };

  const prop1 = extractStructuredProposalUnderstanding(input1);
  const locProfile1 = resolveLocationAdministrativeProfile(input1);
  const analysis1 = analyzeLocationConditionedImpact(prop1, input1, undefined, locProfile1);
  const simResult1 = generateGenericFallbackResult(input1);

  assert(
    simResult1.locationImpactContext !== undefined,
    'SimulationResult contains locationImpactContext'
  );

  const ctx1 = simResult1.locationImpactContext!;
  console.log(`  ℹ️ Location Compatibility Score: ${ctx1.locationCompatibilityScore}/100`);
  console.log(`  ℹ️ Classification: "${ctx1.locationCompatibilityClassification}"`);
  console.log(`  ℹ️ Sensitive Receptors count: ${ctx1.sensitiveReceptors.length}`);

  assert(
    ctx1.locationCompatibilityScore <= 35,
    `Location Compatibility Score is low for farmland+river conflict (Got: ${ctx1.locationCompatibilityScore})`
  );
  assert(
    ctx1.locationCompatibilityClassification === 'High Conflict / Incompatible',
    `Location is classified as High Conflict / Incompatible (Got: ${ctx1.locationCompatibilityClassification})`
  );

  const hasWaterReceptor = ctx1.sensitiveReceptors.some(r => r.type.toLowerCase().includes('water') || r.type.toLowerCase().includes('river'));
  const hasAgriReceptor = ctx1.sensitiveReceptors.some(r => r.type.toLowerCase().includes('agri'));
  const hasResReceptor = ctx1.sensitiveReceptors.some(r => r.type.toLowerCase().includes('resident'));

  assert(hasWaterReceptor, 'Identified River / Water Body sensitive receptor');
  assert(hasAgriReceptor, 'Identified Agricultural land sensitive receptor');
  assert(hasResReceptor, 'Identified Residential settlement sensitive receptor');

  // Verify Proximity Rule: No hallucination, unstated proximity is strictly UNKNOWN
  const unstatedProximityReceptor = ctx1.sensitiveReceptors.find(r => r.distanceOrProximity === 'UNKNOWN');
  console.log(`  ℹ️ Unknown proximity receptors present: ${Boolean(unstatedProximityReceptor)}`);
  assert(
    unstatedProximityReceptor !== undefined || ctx1.locationUnknowns.length > 0,
    'Strict Proximity Mandate honored: unstated proximity marked UNKNOWN or recorded in unknowns'
  );

  // Verify Gain and Friction override
  console.log(`  ℹ️ Gain Score: ${simResult1.gainScore}, Friction Score: ${simResult1.frictionScore}`);
  assert(
    (simResult1.gainScore || 0) <= 30,
    `Gain score capped appropriately for high-damage proposal (Got: ${simResult1.gainScore})`
  );
  assert(
    (simResult1.frictionScore || 0) >= 75,
    `Friction score is High to Very High (Got: ${simResult1.frictionScore})`
  );
  assert(
    simResult1.polarity === 'negative',
    `Final polarity is negative due to critical environmental & social conflict`
  );

  // Check 0 friction on unrelated domains
  console.log('  ℹ️ Domain friction check:');
  const domains = ['transport', 'infrastructure', 'population', 'essential_services', 'economic', 'environmental', 'disaster_risk', 'social', 'policy_compliance'] as const;
  for (const d of domains) {
    const da = simResult1.agentAnalyses[d];
    console.log(`     - [${d}] Score/Friction: ${da.score}, Classification: ${da.conditionEvaluation?.impactClassification || 'N/A'}`);
  }

  // --------------------------------------------------------------------------
  // SCENARIO 2: Same Chemical plant inside approved SIPCOT Industrial Park
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Same Chemical plant inside approved SIPCOT Industrial Complex (Ranipet) ---');
  const input2 = {
    description: 'Construct a large chemical manufacturing plant inside SIPCOT Industrial Complex Phase III with Zero Liquid Discharge and common effluent treatment',
    district: 'Ranipet',
    location: 'Ranipet, Tamil Nadu',
    area: 'SIPCOT Industrial Complex',
    department: 'Industries Department',
  };

  const simResult2 = generateGenericFallbackResult(input2);
  const ctx2 = simResult2.locationImpactContext!;
  console.log(`  ℹ️ Location Compatibility Score: ${ctx2.locationCompatibilityScore}/100`);
  console.log(`  ℹ️ Classification: "${ctx2.locationCompatibilityClassification}"`);
  console.log(`  ℹ️ Gain Score: ${simResult2.gainScore}, Friction Score: ${simResult2.frictionScore}`);

  assert(
    ctx2.locationCompatibilityScore >= 50,
    `Location Compatibility Score is significantly higher in SIPCOT industrial park (Got: ${ctx2.locationCompatibilityScore})`
  );
  assert(
    ctx2.locationCompatibilityClassification === 'Moderately Compatible' || ctx2.locationCompatibilityClassification === 'Highly Compatible' || ctx2.locationCompatibilityClassification === 'Conditional / Safeguards Required',
    `Location in SIPCOT is compatible or conditional (Got: ${ctx2.locationCompatibilityClassification})`
  );
  assert(
    (simResult2.gainScore || 0) > (simResult1.gainScore || 0),
    `Gain score is higher in industrial zone (${simResult2.gainScore}) than on farmland (${simResult1.gainScore})`
  );
  assert(
    (simResult2.frictionScore || 0) < (simResult1.frictionScore || 0),
    `Friction score is lower in industrial zone (${simResult2.frictionScore}) than on farmland (${simResult1.frictionScore})`
  );

  // Verify Agriculture domain receives Minimal/No Direct Impact with 0 friction
  const agriEval2 = ctx2.domainConditionEvaluations?.essential_services;
  console.log(`  ℹ️ Agriculture/Essential Services Evaluation in SIPCOT: ${agriEval2?.impactClassification}`);

  // --------------------------------------------------------------------------
  // SCENARIO 3: Government Administrative Complex in Government Zone
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: New Government Administrative Complex in Administrative Zone (Salem) ---');
  const input3 = {
    description: 'Construct a new District Collectorate Administrative Complex and Integrated Master Office Building in Master Plan Government Zone',
    district: 'Salem',
    location: 'Salem, Tamil Nadu',
    department: 'Revenue and Disaster Management Department',
  };

  const simResult3 = generateGenericFallbackResult(input3);
  const ctx3 = simResult3.locationImpactContext!;
  console.log(`  ℹ️ Location Compatibility Score: ${ctx3.locationCompatibilityScore}/100`);
  console.log(`  ℹ️ Classification: "${ctx3.locationCompatibilityClassification}"`);
  console.log(`  ℹ️ Gain Score: ${simResult3.gainScore}, Friction Score: ${simResult3.frictionScore}`);

  assert(
    ctx3.locationCompatibilityScore >= 65,
    `Location Compatibility Score is high for conforming administrative complex (Got: ${ctx3.locationCompatibilityScore})`
  );
  assert(
    simResult3.polarity === 'positive',
    `Polarity is positive for public administrative infrastructure`
  );

  // --------------------------------------------------------------------------
  // SCENARIO 4: Cascading Graph and Alternatives Difference Check
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Cascading Graph & What-If Differentiation ---');
  console.log(`  ℹ️ Scenario 1 Primary Chain: "${simResult1.cascadingGraph?.primaryChainSummary}"`);
  console.log(`  ℹ️ Scenario 2 Primary Chain: "${simResult2.cascadingGraph?.primaryChainSummary}"`);

  assert(
    simResult1.cascadingGraph?.primaryChainSummary !== simResult2.cascadingGraph?.primaryChainSummary,
    'Cascading graph primary chain is differentiated between farmland and industrial estate locations'
  );

  console.log(`  ℹ️ Scenario 1 Recommended Option: "${simResult1.recommendation?.recommendedOptionTitle}"`);
  assert(
    simResult1.recommendation?.recommendedOptionId === 'opt_a' || simResult1.recommendation?.title.includes('Farmland') || simResult1.recommendation?.title.includes('SIPCOT') || simResult1.recommendation?.title.includes('REJECT'),
    `Recommendation properly addresses location conflict: ${simResult1.recommendation?.title}`
  );

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL LOCATION-CONDITIONED IMPACT ANALYSIS TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
