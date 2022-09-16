import "mocha";
import { assert } from "chai";
import { Task } from "../src/api/models";
import type { ITaskRaw } from "../src/api/raw_models";

describe("Task tree parsing", () => {
  it("Tree matches parents and subtasks", () => {
    const apiTasks: ITaskRaw[] = [
      {
        id: 1,
        priority: 1,
        order: 0,
        content: "Parent task",
        description: "",
        project_id: 0,
        section_id: 0,
        label_ids: [],
      },
      {
        id: 2,
        priority: 2,
        order: 1,
        content: "Subtask",
        description: "",
        parent: 1,
        project_id: 0,
        section_id: 0,
        label_ids: [],
      },
    ];

    const tasks = Task.buildTree(apiTasks);
    assert.lengthOf(tasks, 1, "Resulting tree has one parent node.");

    const parent = tasks[0];
    assert.lengthOf(parent.children, 1, "Parent task has one subtask");

    const child = parent.children[0];
    assert.equal(child.id, 2, "Parent has expected subtask");
    assert.equal(child.parent, parent, "Subtask has expected parent.");
  });

  it("Subtask without parent in scope is a top-level node", () => {
    const apiTasks: ITaskRaw[] = [
      {
        id: 2,
        priority: 2,
        order: 1,
        content: "Subtask",
        description: "",
        parent: 1,
        project_id: 0,
        section_id: 0,
        label_ids: [],
      },
    ];

    const tasks = Task.buildTree(apiTasks);
    assert.lengthOf(tasks, 1, "Resulting tree has one parent node.");
  });
});

describe("Task date parsing", () => {
  it("Tasks with dates only have no time", () => {
    const apiTask: ITaskRaw = {
      id: 1,
      priority: 1,
      order: 1,
      content: "Task",
      description: "",
      due: {
        date: "2019-09-12",
        datetime: null,
        recurring: false,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    };

    const task = new Task(apiTask);

    assert.isFalse(task.hasTime);
  });

  it("Tasks with time have time", () => {
    const apiTask: ITaskRaw = {
      id: 1,
      priority: 1,
      order: 1,
      content: "Task",
      description: "",
      due: {
        date: null,
        datetime: "2019-09-12T02:30:00Z",
        recurring: false,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    };

    const task = new Task(apiTask);

    assert.isTrue(task.hasTime);
  });
});

describe("Task comparisons", () => {
  it("Tasks use Todoist order if no ordering provided", () => {
    const first = new Task({
      id: 1,
      priority: 1,
      order: 0,
      content: "Parent task",
      description: "",
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const second = new Task({
      id: 2,
      priority: 2,
      order: 1,
      content: "Subtask",
      description: "",
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(first.compareTo(second, []), 0);
    assert.isAbove(second.compareTo(first, []), 0);
  });

  it("Tasks are sorted by priority (high to low)", () => {
    const lowPriority = new Task({
      id: 1,
      priority: 1,
      order: 0,
      content: "Parent task",
      description: "",
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const highPriority = new Task({
      id: 2,
      priority: 2,
      order: 1,
      content: "Subtask",
      description: "",
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(highPriority.compareTo(lowPriority, ["priority"]), 0);
    assert.isAbove(lowPriority.compareTo(highPriority, ["priority"]), 0);
  });

  it("Tasks fallback to Todoist ordering if priority is the same", () => {
    const first = new Task({
      id: 1,
      priority: 2,
      order: 0,
      content: "Parent task",
      description: "",
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const second = new Task({
      id: 2,
      priority: 2,
      order: 1,
      content: "Subtask",
      description: "",
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(first.compareTo(second, []), 0);
    assert.isAbove(second.compareTo(first, []), 0);
  });

  it("Tasks are sorted by date (earliest -> latest).", () => {
    const first = new Task({
      id: 1,
      priority: 2,
      order: 0,
      content: "Parent task",
      description: "",
      due: {
        recurring: false,
        date: "2019-09-01",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const second = new Task({
      id: 2,
      priority: 2,
      order: 1,
      content: "Subtask",
      description: "",
      due: {
        recurring: false,
        date: "2019-09-07",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(first.compareTo(second, ["date"]), 0);
    assert.isAbove(second.compareTo(first, ["date"]), 0);
  });

  it("Tasks on the same day are sorted in time order (earliest -> latest -> no time)", () => {
    const first = new Task({
      id: 1,
      priority: 2,
      order: 0,
      content: "Parent task",
      description: "",
      due: {
        recurring: false,
        date: null,
        datetime: "2019-08-01T02:30:00Z",
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const second = new Task({
      id: 2,
      priority: 2,
      order: 1,
      content: "Subtask",
      description: "",
      due: {
        recurring: false,
        date: null,
        datetime: "2019-08-01T03:30:00Z",
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const third = new Task({
      id: 2,
      priority: 2,
      order: 1,
      content: "Subtask",
      description: "",
      due: {
        recurring: false,
        date: "2019-08-01",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(first.compareTo(second, ["date"]), 0);
    assert.isBelow(first.compareTo(third, ["date"]), 0);
    assert.isBelow(second.compareTo(third, ["date"]), 0);

    assert.isAbove(second.compareTo(first, ["date"]), 0);
    assert.isAbove(third.compareTo(first, ["date"]), 0);
    assert.isAbove(third.compareTo(second, ["date"]), 0);
  });

  it("Task ordered by priority falls to the next if equal", () => {
    const first = new Task({
      id: 1,
      priority: 1,
      order: 1,
      content: "Task",
      description: "",
      due: {
        recurring: false,
        date: "2019-08-02",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const second = new Task({
      id: 1,
      priority: 1,
      order: 1,
      content: "Task",
      description: "",
      due: {
        recurring: false,
        date: "2019-08-03",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(first.compareTo(second, ["priority", "date"]), 0);
    assert.isAbove(second.compareTo(first, ["priority", "date"]), 0);
  });

  it("Task ordered by date falls to the next if equal", () => {
    const first = new Task({
      id: 1,
      priority: 2,
      order: 1,
      content: "Task",
      description: "",
      due: {
        recurring: false,
        date: "2019-08-03",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    const second = new Task({
      id: 1,
      priority: 1,
      order: 1,
      content: "Task",
      description: "",
      due: {
        recurring: false,
        date: "2019-08-03",
        datetime: null,
      },
      project_id: 0,
      section_id: 0,
      label_ids: [],
    });

    assert.isBelow(first.compareTo(second, ["date", "priority"]), 0);
    assert.isAbove(second.compareTo(first, ["date", "priority"]), 0);
  });
});
