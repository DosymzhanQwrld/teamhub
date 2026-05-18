import { buildProjectSearchQuery } from "../../src/utils/search.js";

test("buildProjectSearchQuery returns empty query when no arguments provided", () => {
  const query = buildProjectSearchQuery("user123");
  expect(query).toEqual({});
});

test("buildProjectSearchQuery adds search condition with regex", () => {
  const query = buildProjectSearchQuery("user123", "design");
  expect(query.$and).toBeDefined();
  expect(query.$and[0].$or).toContainEqual({ title: { $regex: "design", $options: "i" } });
});

test("buildProjectSearchQuery adds status filter", () => {
  const query = buildProjectSearchQuery("user123", "", "active");
  expect(query.status).toBe("active");
});