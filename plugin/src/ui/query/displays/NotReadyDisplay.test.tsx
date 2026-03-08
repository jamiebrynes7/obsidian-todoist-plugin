import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotReadyDisplay } from "./NotReadyDisplay";

describe("NotReadyDisplay", () => {
  it("should return null", () => {
    const { container } = render(<NotReadyDisplay />);

    expect(container).toBeEmptyDOMElement();
  });
});
