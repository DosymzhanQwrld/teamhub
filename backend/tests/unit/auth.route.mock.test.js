import { jest } from "@jest/globals";

test("mocked route handler returns created user response", async () => {
  const req = {
    body: {
      name: "Alex",
      email: "alex@example.com",
      password: "password123"
    }
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const handler = async (req, res) => {
    res.status(201).json({
      token: "token",
      user: {
        name: req.body.name,
        email: req.body.email
      }
    });
  };

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    token: "token",
    user: {
      name: "Alex",
      email: "alex@example.com"
    }
  });
});
