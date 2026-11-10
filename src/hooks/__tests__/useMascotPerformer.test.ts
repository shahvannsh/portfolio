import { describe, expect, it } from "vitest";
import { directionToward } from "../useMascotPerformer";

describe("directionToward", () => {
  it("maps screen offsets to head directions", () => {
    expect(directionToward(10, 0)).toBe("right");
    expect(directionToward(0, 10)).toBe("down");
    expect(directionToward(-10, 0)).toBe("left");
    expect(directionToward(0, -10)).toBe("up");
    expect(directionToward(10, 10)).toBe("down-right");
    expect(directionToward(-10, -10)).toBe("up-left");
  });
});
