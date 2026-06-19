import { describe, it, expect } from "vitest";
import userReducer, { setUserData } from "../redux/userSlice";

describe("userSlice Redux", () => {
  it("should return null as the initial state", () => {
    const state = userReducer(undefined, { type: "@@INIT" });
    expect(state.userData).toBeNull();
  });

  it("should set userData correctly when setUserData is dispatched", () => {
    const mockUser = { name: "Laeeq", email: "laeeq@test.com", credits: 1000 };
    const state = userReducer(undefined, setUserData(mockUser));
    expect(state.userData).toEqual(mockUser);
  });
});
