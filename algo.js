// Union-Find (Disjoint Set Union) Data Structure
// Used for detecting cycles in Kruskal's algorithm
class UnionFind {
  constructor(size) {
    this.parent = Array(size).fill(null).map((_, i) => i);
    this.rank = Array(size).fill(0);
  }

  // Find the root parent of a node with path compression
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  // Union two sets by rank
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Already in the same set
    }

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    return true;
  }
}

/**
 * Haversine formula - Calculate great-circle distance between two points on Earth
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate all pairwise distances between cities
 * @param {Array} cities - Array of city objects with latitude and longitude
 * @returns {Array} Array of edges with format {from, to, distance}
 */
function calculateDistances(cities) {
  const edges = [];

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const distance = haversineDistance(
        cities[i].latitude,
        cities[i].longitude,
        cities[j].latitude,
        cities[j].longitude
      );

      edges.push({
        from: i,
        to: j,
        distance: distance,
        fromCity: cities[i].city || `Point ${i}`,
        toCity: cities[j].city || `Point ${j}`,
      });
    }
  }

  return edges;
}

/**
 * Kruskal's Algorithm - Find Minimum Spanning Tree
 * @param {Array} cities - Array of city objects with latitude and longitude
 * @returns {Object} Object containing MST edges, total distance, and ordered route
 */
function kruskal(cities) {
  if (!cities || cities.length < 2) {
    return {
      mst: [],
      totalDistance: 0,
      route: cities || [],
      message: "Need at least 2 cities to create a route",
    };
  }

  // Step 1: Calculate all pairwise distances
  const edges = calculateDistances(cities);

  // Step 2: Sort edges by distance (greedy approach)
  edges.sort((a, b) => a.distance - b.distance);

  // Step 3: Initialize Union-Find data structure
  const uf = new UnionFind(cities.length);
  const mst = [];
  let totalDistance = 0;

  // Step 4: Process edges in order of increasing distance
  for (const edge of edges) {
    // If adding this edge doesn't create a cycle, add it to MST
    if (uf.union(edge.from, edge.to)) {
      mst.push(edge);
      totalDistance += edge.distance;

      // MST complete when we have n-1 edges
      if (mst.length === cities.length - 1) {
        break;
      }
    }
  }

  // Step 5: Create an ordered route from MST using DFS
  const route = createRouteFromMST(mst, cities);

  return {
    mst: mst,
    totalDistance: totalDistance,
    route: route,
    cities: cities,
  };
}

/**
 * Create an ordered route from MST edges using depth-first traversal
 * @param {Array} mst - Minimum spanning tree edges
 * @param {Array} cities - Array of city objects
 * @returns {Array} Ordered array of cities forming a route
 */
function createRouteFromMST(mst, cities) {
  if (mst.length === 0) {
    return cities;
  }

  // Build adjacency list from MST
  const adjacencyList = Array(cities.length)
    .fill(null)
    .map(() => []);

  for (const edge of mst) {
    adjacencyList[edge.from].push(edge.to);
    adjacencyList[edge.to].push(edge.from);
  }

  // DFS to create ordered route
  const visited = Array(cities.length).fill(false);
  const route = [];

  function dfs(node) {
    visited[node] = true;
    route.push(cities[node]);

    for (const neighbor of adjacencyList[node]) {
      if (!visited[neighbor]) {
        dfs(neighbor);
      }
    }
  }

  // Start DFS from node 0 (typically current location)
  dfs(0);

  return route;
}

/**
 * Find shortest path visiting all cities (TSP approximation using MST)
 * This creates a tour from the MST by doing a DFS traversal
 * @param {Array} cities - Array of city objects
 * @returns {Object} Object with route and total distance
 */
function approximateTSP(cities) {
  const result = kruskal(cities);

  // For TSP, we need to return to start, so calculate that distance too
  if (result.route.length > 1) {
    const lastCity = result.route[result.route.length - 1];
    const firstCity = result.route[0];
    const returnDistance = haversineDistance(
      lastCity.latitude,
      lastCity.longitude,
      firstCity.latitude,
      firstCity.longitude
    );

    result.totalDistance += returnDistance;
    result.isTour = true;
  }

  return result;
}

module.exports = {
  kruskal,
  approximateTSP,
  haversineDistance,
  calculateDistances,
  UnionFind,
};
