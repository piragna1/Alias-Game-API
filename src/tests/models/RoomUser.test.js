// tests/models/RoomUser.test.js
import { describe, it, expect } from "vitest";
import RoomUser from "../../models/RoomUser.js";

describe("RoomUser", () => {
  it("should create a RoomUser with id and name", () => {
    const user = new RoomUser({ id: "u1", name: "Gonzalo" });
    expect(user.id).toBe("u1");
    expect(user.name).toBe("Gonzalo");
    expect(user.team).toBe(null);
  });

  it("should assign a team if provided", () => {
    const user = new RoomUser({ id: "u2", name: "Clara", team: "red" });
    expect(user.team).toBe("red");
  });
});
