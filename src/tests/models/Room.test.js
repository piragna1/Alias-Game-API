// tests/models/Room.test.js
import { describe, it, expect, vi } from "vitest";
import Room from "../../models/Room.js";

describe("Room", () => {
  it("should create a room with code and hostId", () => {
    const room = new Room({ code: "ABCD", hostId: "host1" });
    expect(room.code).toBe("ABCD");
    expect(room.hostId).toBe("host1");
    expect(room.users).toEqual([]);
  });

  it("should add a user", () => {
    const room = new Room({ code: "ABCD", hostId: "host1" });
    room.addUser({ id: "u1", name: "Gonzalo" });
    expect(room.users.length).toBe(1);
    expect(room.users[0].id).toBe("u1");
  });

  it("should not add duplicate users", () => {
    const room = new Room({ code: "ABCD", hostId: "host1" });
    room.addUser({ id: "u1", name: "Gonzalo" });
    room.addUser({ id: "u1", name: "Gonzalo" });
    expect(room.users.length).toBe(1);
  });

  it("should assign and remove teams", () => {
    const room = new Room({ code: "ABCD", hostId: "host1" });
    room.addUser({ id: "u1", name: "Gonzalo" });
    room.assignTeam("u1", "red");
    expect(room.getTeamOf("u1")).toBe("red");

    room.removeFromTeams("u1");
    expect(room.getTeamOf("u1")).toBe(null);
  });

  it("should remove a user", () => {
    const room = new Room({ code: "ABCD", hostId: "host1" });
    room.addUser({ id: "u1", name: "Gonzalo" });
    room.removeUser("u1");
    expect(room.users.length).toBe(0);
  });

  it("should broadcast messages to all sockets", () => {
    const room = new Room({ code: "ABCD", hostId: "host1" });
    const mockSocket = { send: vi.fn() };
    room.sockets.set("u1", mockSocket);
    room.broadcast({ type: "ping" });

    expect(mockSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: "ping" }));
  });
});
