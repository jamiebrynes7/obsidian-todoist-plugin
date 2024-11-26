import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TokenInputForm } from "./TokenInputForm";

describe("TokenInputForm", () => {
  it("should initially have the button be disabled", () => {
    render(
      <TokenInputForm
        onTokenSubmit={() => {}}
        tester={async () => {
          return true;
        }}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should show an error if input is empty after focus and unfocus", async () => {
    render(
      <TokenInputForm
        onTokenSubmit={() => {}}
        tester={async () => {
          return true;
        }}
      />,
    );

    const textBox = screen.getByRole("textbox");
    fireEvent.focus(textBox);
    fireEvent.blur(textBox);

    await waitFor(() => {
      expect(textBox).toHaveAttribute("data-invalid", "true");
    });
  });

  it("should shown an error if API test rejects token", async () => {
    const [getArgs, testToken] = makeFakeTokenTest(false);
    render(<TokenInputForm onTokenSubmit={() => {}} tester={testToken} />);

    const textBox = screen.getByRole("textbox");
    fireEvent.focus(textBox);
    fireEvent.change(textBox, { target: { value: "abcdef" } });
    fireEvent.blur(textBox);

    await waitFor(() => {
      expect(textBox).toHaveAttribute("data-invalid", "true");
    });
    expect(getArgs()).toBe("abcdef");
  });

  it("should enable button if API test accepts token", async () => {
    const [getArgs, testToken] = makeFakeTokenTest(true);
    render(<TokenInputForm onTokenSubmit={() => {}} tester={testToken} />);

    const textBox = screen.getByRole("textbox");
    fireEvent.focus(textBox);
    fireEvent.change(textBox, { target: { value: "abcdef" } });
    fireEvent.blur(textBox);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("disabled");
    });
    expect(getArgs()).toBe("abcdef");
  });

  it("should call callback when submit button is pressed", async () => {
    const [_, testToken] = makeFakeTokenTest(true);
    let submittedToken = "";
    render(
      <TokenInputForm
        onTokenSubmit={(token: string) => {
          submittedToken = token;
        }}
        tester={testToken}
      />,
    );

    const textBox = screen.getByRole("textbox");
    const button = screen.getByRole("button");

    fireEvent.focus(textBox);
    fireEvent.change(textBox, { target: { value: "abcdef" } });
    fireEvent.blur(textBox);

    await waitFor(() => {
      expect(button).not.toHaveAttribute("disabled");
    });

    fireEvent.click(button);
    expect(submittedToken).toBe("abcdef");
  });
});

const makeFakeTokenTest: (
  result: boolean,
) => [() => string | undefined, (token: string) => Promise<boolean>] = (result) => {
  let called: string | undefined = undefined;

  return [
    () => called,
    async (token: string) => {
      called = token;
      return result;
    },
  ];
};
