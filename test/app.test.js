const assert = require("assert");

const journeyPlanner = require("../src/journeyPlanner");

function assertExists(array, string, msg) {
  assert.ok(array.indexOf(string) > -1, msg);
}

// describe("Given an ‘origin’ and ‘destination’, order the possible journeys by the lowest number of exchanges.", function() {
//   it("should be able to parse an object", function() {
//
//       assert.equal();
//   });
// });
