import "mocha";
import { assert } from "chai";
import { parseQuery } from "../src/query";

describe("Query parsing", () => {
  it("Name must exist", () => {
    const obj = {
      filter: "foo",
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());
  });

  it("Filter must exist", () => {
    const obj = {
      name: "Tasks",
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());
  });

  it("Only name & filter are required", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isOk());
  });

  it("Autorefresh must be a number", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      autorefresh: "NaN",
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());
  });

  it("Autorefresh cannot be negative", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      autorefresh: -1,
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());
  });

  it("Valid autorefresh values pass", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      autorefresh: 1,
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isOk());
  });

  it("Sorting must be an array", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      sorting: "Not an array",
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());

    const other = {
      name: "Tasks",
      filter: "foo",
      sorting: [],
    };

    const otherResult = parseQuery(other);
    assert.isTrue(otherResult.isOk());
  });

  it("Sorting can only be a specified set of options", () => {
    const obj = {
      name: "Tasks",
      filter: "filter",
      sorting: ["not-valid"],
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());

    const validObj = {
      name: "Tasks",
      filter: "filter",
      sorting: ["date", "priority"],
    };

    const otherResult = parseQuery(validObj);
    assert.isTrue(otherResult.isOk());
  });

  it("Group must be a boolean", () => {
    const obj = {
      name: "Tasks",
      filter: "Filter",
      group: "not-a-boolean",
    };

    const result = parseQuery(obj);
    assert.isTrue(result.isErr());

    const validObj = {
      name: "Tasks",
      filter: "Filter",
      group: true,
    };

    const otherResult = parseQuery(validObj);
    assert.isTrue(otherResult.isOk());
  });
});
