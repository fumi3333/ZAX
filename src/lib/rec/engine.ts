
// Mock Data: 5 Archetype Personas (ZAX "Phantom" Users)
// These represent diverse points in the 6-dim Latent Space.
export const ARCHETYPE_USERS = [
    {
        id: "ARCH-001",
        name: "Logic Sentinel",
        // Logic, Intuition, Empathy, Determination, Creativity, Flexibility
        vector: [95, 20, 30, 80, 40, 30],
        bio: "Structural integrity is the only truth.",
        tags: ["Logic", "Order"]
    },
    {
        id: "ARCH-002",
        name: "Chaos Weaver",
        vector: [20, 90, 80, 30, 95, 85],
        bio: "Patterns emerge from the noise.",
        tags: ["Creativity", "Chaos"]
    },
    {
        id: "ARCH-003",
        name: "Empathy Resonator",
        vector: [30, 80, 95, 40, 60, 90],
        bio: "I feel the pulse of the collective.",
        tags: ["Empathy", "Harmony"]
    },
    {
        id: "ARCH-004",
        name: "Willbreaker", // High Determination
        vector: [70, 40, 20, 95, 50, 40],
        bio: "The path is forged, not found.",
        tags: ["Drive", "Power"]
    },
    {
        id: "ARCH-005",
        name: "Fluid Balancer",
        vector: [60, 60, 60, 60, 60, 95],
        bio: "Adaptation is survival.",
        tags: ["Flexibility", "Balance"]
    }
];

// Math Utilities
function dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
    return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
    const magA = magnitude(a);
    const magB = magnitude(b);
    return magA === 0 || magB === 0 ? 0 : dotProduct(a, b) / (magA * magB);
}

// "Complementarity" Logic (Projected Distance)
// Instead of finding the *closest* (Same), we find the *complementary* (Different but resonant).
// Ideally, we want someone who fills the "gaps" in the user's vector without being totally alien.
function calculateComplementarityScore(userVec: number[], targetVec: number[]): number {
    const sim = cosineSimilarity(userVec, targetVec);

    // We target a "Sweet Spot" of similarity: around 0.3 - 0.6
    // Too similar (1.0) = Echo Chamber (No growth)
    // Too different (-1.0) = Conflict (No resonance)

    // Growth Potential Curve: Bell curve peaking at 0.5 similarity
    // Formula: e^(-(x - 0.5)^2 / 0.1)
    const optimalDistance = 0.5;
    const growthPotential = Math.exp(-Math.pow(sim - optimalDistance, 2) / 0.1);

    return growthPotential * 100; // 0-100 Score
}

export interface MatchResult {
    matchUser: typeof ARCHETYPE_USERS[0];
    similarity: number;
    growthScore: number;
    reasoning: string;
}

import { vectorStore } from "../db/client";

// ... (keep ARCHETYPE_USERS and math utils)

export async function findBestMatch(userVector: number[]): Promise<MatchResult> {
    
    // 1. Try DB Search (Real Users)
    try {
        const dbCandidates = await vectorStore.searchSimilar(userVector, 20);
        
        if (dbCandidates.length > 0) {
            let bestDbMatch: MatchResult | null = null;
            let maxScore = -1;

            for (const candidate of dbCandidates) {
                // Parse 6-dim vector (stored as string like "[1,2,3]")
                let candidateVector: number[] = [];
                try {
                    candidateVector = JSON.parse(candidate.vector);
                } catch (e) { continue; }

                // Calculate Resonance
                const score = calculateComplementarityScore(userVector, candidateVector);
                const sim = cosineSimilarity(userVector, candidateVector);

                if (score > maxScore) {
                     maxScore = score;
                     bestDbMatch = {
                        matchUser: {
                            id: candidate.userId,
                            name: "Resonant Soul", 
                            vector: candidateVector,
                            bio: candidate.reasoning || "A mysterious connection.",
                            tags: []
                        },
                        similarity: sim,
                        growthScore: Math.round(score),
                        reasoning: generateMathReasoning(userVector, candidateVector, sim)
                     };
                }
            }
            if (bestDbMatch) return bestDbMatch;
        }
    } catch (e) {
        console.warn("DB Match failed, falling back to Archetypes", e);
    }

    // 2. Fallback to Archetype (Original Logic)
    let bestMatch: MatchResult | null = null;
    let maxScore = -1;

    for (const archetype of ARCHETYPE_USERS) {
        const sim = cosineSimilarity(userVector, archetype.vector);
        const score = calculateComplementarityScore(userVector, archetype.vector);

        if (score > maxScore) {
            maxScore = score;
            const reasoning = generateMathReasoning(userVector, archetype.vector, sim);
            bestMatch = {
                matchUser: archetype,
                similarity: sim,
                growthScore: Math.round(score),
                reasoning
            };
        }
    }

    return bestMatch!; // Safe assertion for demo
}

function generateMathReasoning(userVec: number[], targetVec: number[], sim: number): string {
    // Generate a "Scientific" text based on vector comparison
    // Identify largest gap
    let maxGapIndex = 0;
    let maxGap = -100;

    const dimensions = ["Logic", "Intuition", "Empathy", "Determination", "Creativity", "Flexibility"];

    userVec.forEach((val, i) => {
        const gap = targetVec[i] - val; // Target has more of this
        if (gap > maxGap) {
            maxGap = gap;
            maxGapIndex = i;
        }
    });

    const targetStrongDim = dimensions[maxGapIndex];

    return `Delta Analysis: Detected structural void in [${targetStrongDim}] sector. \nTarget ENTITY #${targetVec[0] % 9}${targetVec[1] % 9} exhibits +${Math.round(maxGap)}% amplification in this domain. \nCalculated Resonance: ${sim.toFixed(4)}. Optimal for symbiotic reinforcement.`;
}
