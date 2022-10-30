import "mocha";
import { assert } from "chai";
import { parseQuery, ParsingError } from "../src/query/parser";

describe("Query parsing", () => {
  it("Name must exist", () => {
    const obj = {
      filter: "foo",
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);
  });

  it("Filter must exist", () => {
    const obj = {
      name: "Tasks",
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);
  });

  it("Only name & filter are required", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
    };

    assert.doesNotThrow(() => parseQuery(JSON.stringify(obj)), ParsingError);
  });

  it("Autorefresh must be a number", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      autorefresh: "NaN",
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);
  });

  it("Autorefresh cannot be negative", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      autorefresh: -1,
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);
  });

  it("Valid autorefresh values pass", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      autorefresh: 1,
    };

    assert.doesNotThrow(() => parseQuery(JSON.stringify(obj)), ParsingError);
  });

  it("Sorting must be an array", () => {
    const obj = {
      name: "Tasks",
      filter: "foo",
      sorting: "Not an array",
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);

    const other = {
      name: "Tasks",
      filter: "foo",
      sorting: [],
    };

    assert.doesNotThrow(() => { parseQuery(JSON.stringify(other)); }, ParsingError);
  });

  it("Sorting can only be a specified set of options", () => {
    const obj = {
      name: "Tasks",
      filter: "filter",
      sorting: ["not-valid"],
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);

    const validObj = {
      name: "Tasks",
      filter: "filter",
      sorting: ["date", "priority"],
    };

    assert.doesNotThrow(() => parseQuery(JSON.stringify(validObj)), ParsingError);
  });

  it("Group must be a boolean", () => {
    const obj = {
      name: "Tasks",
      filter: "Filter",
      group: "not-a-boolean",
    };

    assert.throws(() => { parseQuery(JSON.stringify(obj)); }, ParsingError);

    const validObj = {
      name: "Tasks",
      filter: "Filter",
      group: true,
    };

    assert.doesNotThrow(() => parseQuery(JSON.stringify(validObj)), ParsingError);
  });
});
