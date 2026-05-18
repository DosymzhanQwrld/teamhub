export function buildProjectSearchQuery(userId, search = "", status = "") {
  const query = {};

  if (search) {
    query.$and = [
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }

  if (status) {
    query.status = status;
  }

  return query;
}