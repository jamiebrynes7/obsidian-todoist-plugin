import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TodoistApiClient } from "@/api";
import type { SyncResponse } from "@/api/domain/sync";
import { type OnSubscriptionChange, type SubscriptionResult, TodoistAdapter } from "@/data/index";
import { makeApiTask } from "@/factories/data";

const makeSyncResponse = (overrides?: Partial<SyncResponse>): SyncResponse => ({
  syncToken: "token-1",
  projects: [],
  sections: [],
  labels: [],
  ...overrides,
});

const makeMockApi = (): TodoistApiClient => {
  return {
    getTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn(),
    closeTask: vi.fn(),
    getUser: vi.fn().mockResolvedValue({ isPremium: false }),
    sync: vi.fn().mockResolvedValue(makeSyncResponse()),
  } as unknown as TodoistApiClient;
};

const subscribeAndRefresh = async (
  adapter: TodoistAdapter,
  query = "#test",
): Promise<{ result: SubscriptionResult; callback: OnSubscriptionChange }> => {
  let captured: SubscriptionResult = { type: "not-ready" };
  const callback: OnSubscriptionChange = (r) => {
    captured = r;
  };

  const [, refresh] = adapter.subscribe(query, callback);
  await refresh();

  return { result: captured, callback };
};

describe("TodoistAdapter", () => {
  let adapter: TodoistAdapter;
  let mockApi: TodoistApiClient;

  beforeEach(() => {
    adapter = new TodoistAdapter();
    mockApi = makeMockApi();
  });

  describe("Subscription", () => {
    it("should deliver success result with tasks", async () => {
      const apiTask = makeApiTask();
      vi.mocked(mockApi.getTasks).mockResolvedValue([apiTask]);

      await adapter.initialize(mockApi);
      const { result } = await subscribeAndRefresh(adapter);

      expect(result.type).toBe("success");
      if (result.type !== "success") {
        return;
      }

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe("task-1");
    });

    it("should deliver not-ready result when API is not initialized", async () => {
      let captured: SubscriptionResult = { type: "success", tasks: [] };
      const callback: OnSubscriptionChange = (r) => {
        captured = r;
      };

      const [, refresh] = adapter.subscribe("#test", callback);
      await refresh();

      expect(captured.type).toBe("not-ready");
    });

    it("should remove a task by ID and notify callback", async () => {
      const tasks = [makeApiTask({ id: "task-1" }), makeApiTask({ id: "task-2" })];
      vi.mocked(mockApi.getTasks).mockResolvedValue(tasks);

      await adapter.initialize(mockApi);

      let captured: SubscriptionResult = { type: "not-ready" };
      const callback: OnSubscriptionChange = (r) => {
        captured = r;
      };

      const [, refresh] = adapter.subscribe("#test", callback);
      await refresh();

      const result1 = captured as SubscriptionResult;
      expect(result1.type).toBe("success");
      if (result1.type !== "success") {
        return;
      }
      expect(result1.tasks).toHaveLength(2);

      // Close task-1 to trigger remove
      vi.mocked(mockApi.closeTask).mockResolvedValue(undefined);
      await adapter.actions.closeTask("task-1");

      const result2 = captured as SubscriptionResult;
      expect(result2.type).toBe("success");
      if (result2.type !== "success") {
        return;
      }
      expect(result2.tasks).toHaveLength(1);
      expect(result2.tasks[0].id).toBe("task-2");
    });
  });
});
