// Test file for algorithm implementations
const { kruskal, approximateTSP, haversineDistance, calculateDistances } = require('./algo');

console.log('=== Testing ExploreEase Algorithms ===\n');

// Test 1: Haversine Distance
console.log('Test 1: Haversine Distance Calculation');
console.log('---------------------------------------');
const mumbaiLat = 19.0760, mumbaiLon = 72.8777;
const delhiLat = 28.6139, delhiLon = 77.2090;
const distance = haversineDistance(mumbaiLat, mumbaiLon, delhiLat, delhiLon);
console.log(`Distance from Mumbai to Delhi: ${distance.toFixed(2)} km`);
console.log(`Expected: ~1150-1200 km\n`);

// Test 2: Small route optimization
console.log('Test 2: Small Route Optimization (3 cities)');
console.log('--------------------------------------------');
const smallCities = [
  { city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Goa', latitude: 15.2993, longitude: 74.1240 }
];

const smallRoute = kruskal(smallCities);
console.log('Cities:', smallRoute.cities.map(c => c.city).join(' -> '));
console.log('Route order:', smallRoute.route.map(c => c.city).join(' -> '));
console.log(`Total distance: ${smallRoute.totalDistance.toFixed(2)} km`);
console.log(`Number of MST edges: ${smallRoute.mst.length}\n`);

// Test 3: Larger route optimization
console.log('Test 3: Larger Route Optimization (5 cities)');
console.log('---------------------------------------------');
const largeCities = [
  { city: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { city: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { city: 'Agra', latitude: 27.1767, longitude: 78.0081 },
  { city: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { city: 'Kanpur', latitude: 26.4499, longitude: 80.3319 }
];

const largeRoute = kruskal(largeCities);
console.log('Cities:', largeRoute.cities.map(c => c.city).join(', '));
console.log('Optimized route order:');
largeRoute.route.forEach((city, index) => {
  console.log(`  ${index + 1}. ${city.city}`);
});
console.log(`Total distance: ${largeRoute.totalDistance.toFixed(2)} km`);
console.log(`Number of MST edges: ${largeRoute.mst.length}`);
console.log('\nMST Edges:');
largeRoute.mst.forEach((edge, index) => {
  console.log(`  ${index + 1}. ${edge.fromCity} <-> ${edge.toCity}: ${edge.distance.toFixed(2)} km`);
});

// Test 4: Calculate all distances
console.log('\n\nTest 4: Distance Matrix Calculation');
console.log('------------------------------------');
const testCities = [
  { city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { city: 'Bangalore', latitude: 12.9716, longitude: 77.5946 }
];

const edges = calculateDistances(testCities);
console.log('All pairwise distances:');
edges.forEach(edge => {
  console.log(`  ${edge.fromCity} <-> ${edge.toCity}: ${edge.distance.toFixed(2)} km`);
});

console.log('\n=== All Tests Completed ===');
