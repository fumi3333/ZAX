// Real Data Source: World Happiness Report 2019
// Source: https://kaggle.com/unsdsn/world-happiness
// Selected 30 Representative Countries for Scatter Plot Verification

export interface HappinessData {
    rank: number;
    country: string;
    score: number;
    gdp: number;
    social: number;
    health: number;
    freedom: number;
    generosity: number;
    corruption: number;
}

export const realHappinessData: HappinessData[] = [
    { rank: 1, country: "Finland", score: 7.769, gdp: 1.340, social: 1.587, health: 0.986, freedom: 0.596, generosity: 0.153, corruption: 0.393 },
    { rank: 2, country: "Denmark", score: 7.600, gdp: 1.383, social: 1.573, health: 0.996, freedom: 0.592, generosity: 0.252, corruption: 0.410 },
    { rank: 3, country: "Norway", score: 7.554, gdp: 1.488, social: 1.582, health: 1.028, freedom: 0.603, generosity: 0.271, corruption: 0.341 },
    { rank: 4, country: "Iceland", score: 7.494, gdp: 1.380, social: 1.624, health: 1.026, freedom: 0.591, generosity: 0.354, corruption: 0.118 },
    { rank: 5, country: "Netherlands", score: 7.488, gdp: 1.396, social: 1.522, health: 0.999, freedom: 0.557, generosity: 0.322, corruption: 0.298 },
    { rank: 6, country: "Switzerland", score: 7.480, gdp: 1.452, social: 1.526, health: 1.052, freedom: 0.572, generosity: 0.263, corruption: 0.343 },
    { rank: 7, country: "Sweden", score: 7.343, gdp: 1.387, social: 1.487, health: 1.009, freedom: 0.574, generosity: 0.267, corruption: 0.373 },
    { rank: 8, country: "New Zealand", score: 7.307, gdp: 1.303, social: 1.557, health: 1.026, freedom: 0.585, generosity: 0.330, corruption: 0.380 },
    { rank: 9, country: "Canada", score: 7.278, gdp: 1.365, social: 1.505, health: 1.039, freedom: 0.584, generosity: 0.285, corruption: 0.308 },
    { rank: 10, country: "Austria", score: 7.246, gdp: 1.376, social: 1.475, health: 1.016, freedom: 0.532, generosity: 0.244, corruption: 0.226 },
    { rank: 15, country: "United Kingdom", score: 7.054, gdp: 1.333, social: 1.538, health: 0.996, freedom: 0.450, generosity: 0.348, corruption: 0.278 },
    { rank: 17, country: "Germany", score: 6.985, gdp: 1.373, social: 1.454, health: 0.987, freedom: 0.495, generosity: 0.261, corruption: 0.265 },
    { rank: 19, country: "United States", score: 6.892, gdp: 1.433, social: 1.457, health: 0.881, freedom: 0.454, generosity: 0.280, corruption: 0.128 },
    { rank: 24, country: "France", score: 6.592, gdp: 1.324, social: 1.472, health: 1.045, freedom: 0.436, generosity: 0.111, corruption: 0.183 },
    { rank: 28, country: "Saudi Arabia", score: 6.375, gdp: 1.403, social: 1.357, health: 0.795, freedom: 0.439, generosity: 0.080, corruption: 0.132 },
    { rank: 36, country: "Italy", score: 6.223, gdp: 1.294, social: 1.488, health: 1.039, freedom: 0.231, generosity: 0.158, corruption: 0.030 },
    { rank: 40, country: "Poland", score: 6.182, gdp: 1.206, social: 1.438, health: 0.884, freedom: 0.483, generosity: 0.117, corruption: 0.050 },
    { rank: 58, country: "Japan", score: 5.886, gdp: 1.327, social: 1.419, health: 1.088, freedom: 0.445, generosity: 0.069, corruption: 0.140 },
    { rank: 68, country: "Russia", score: 5.648, gdp: 1.183, social: 1.452, health: 0.726, freedom: 0.334, generosity: 0.082, corruption: 0.031 },
    { rank: 82, country: "Greece", score: 5.287, gdp: 1.181, social: 1.156, health: 0.999, freedom: 0.067, generosity: 0.000, corruption: 0.034 },
    { rank: 93, country: "China", score: 5.191, gdp: 1.029, social: 1.125, health: 0.893, freedom: 0.521, generosity: 0.058, corruption: 0.100 },
    { rank: 96, country: "Vietnam", score: 5.175, gdp: 0.741, social: 1.346, health: 0.851, freedom: 0.543, generosity: 0.147, corruption: 0.073 },
    { rank: 122, country: "Kenya", score: 4.509, gdp: 0.512, social: 0.983, health: 0.581, freedom: 0.431, generosity: 0.372, corruption: 0.053 },
    { rank: 140, country: "India", score: 4.015, gdp: 0.755, social: 0.765, health: 0.588, freedom: 0.498, generosity: 0.200, corruption: 0.085 },
    { rank: 149, country: "Syria", score: 3.462, gdp: 0.619, social: 0.378, health: 0.440, freedom: 0.013, generosity: 0.331, corruption: 0.141 },
    { rank: 154, country: "Afghanistan", score: 3.203, gdp: 0.350, social: 0.517, health: 0.361, freedom: 0.000, generosity: 0.158, corruption: 0.025 },
    { rank: 156, country: "South Sudan", score: 2.853, gdp: 0.306, social: 0.575, health: 0.295, freedom: 0.010, generosity: 0.202, corruption: 0.091 },
    { rank: 76, country: "Hong Kong", score: 5.430, gdp: 1.438, social: 1.277, health: 1.122, freedom: 0.440, generosity: 0.258, corruption: 0.287 },
    { rank: 34, country: "Singapore", score: 6.262, gdp: 1.572, social: 1.463, health: 1.141, freedom: 0.556, generosity: 0.271, corruption: 0.453 },
    { rank: 54, country: "South Korea", score: 5.895, gdp: 1.301, social: 1.197, health: 1.038, freedom: 0.159, generosity: 0.175, corruption: 0.056 },
];
