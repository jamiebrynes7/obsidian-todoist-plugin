import { type OnSubscriptionChange, type Refresh, type SubscriptionResult } from "@/data";
import type TodoistPlugin from "@/index";
import type { QueryWarning } from "@/query/parser";
import { GroupVariant, type Query } from "@/query/query";
import { type Settings, useSettingsStore } from "@/settings";
import { PluginContext, QueryContext } from "@/ui/context";
import { QueryHeader } from "@/ui/query/QueryHeader";
import { QueryWarnings } from "@/ui/query/QueryWarnings";
import { Displays } from "@/ui/query/displays";
import React, { useCallback, useEffect, useState } from "react";
import "./styles.scss";

const useSubscription = (
  plugin: TodoistPlugin,
  query: Query,
  callback: OnSubscriptionChange,
): [Refresh, boolean, boolean] => {
  const [refresher, setRefresher] = useState<Refresh | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    const [unsub, refresh] = plugin.services.todoist.subscribe(query.filter, callback);
    setRefresher(() => {
      return refresh;
    });
    return unsub;
  }, [query, plugin, callback]);

  const forceRefresh = useCallback(async () => {
    if (refresher === undefined) {
      return;
    }

    setIsFetching(true);
    await refresher();
    setHasFetchedOnce(true);
    setIsFetching(false);
  }, [refresher]);

  useEffect(() => {
    forceRefresh();
  }, [forceRefresh]);

  return [forceRefresh, isFetching, hasFetchedOnce];
};

type Props = {
  query: Query;
  warnings: QueryWarning[];
};

export const QueryRoot: React.FC<Props> = ({ query, warnings }) => {
  const plugin = PluginContext.use();
  const settings = useSettingsStore();
  const [result, setResult] = useState<SubscriptionResult>({ type: "success", tasks: [] });
  const [refresh, isFetching, hasFetchedOnce] = useSubscription(plugin, query, setResult);

  useEffect(() => {
    const interval = getAutorefreshInterval(query, settings);

    if (interval === undefined) {
      return;
    }

    const id = window.setInterval(async () => {
      await refresh();
    }, interval * 1000);

    return () => window.clearInterval(id);
  }, [query, settings, refresh]);

  return (
    <>
      <QueryHeader title={getTitle(query, result)} isFetching={isFetching} refresh={refresh} />
      <QueryWarnings warnings={warnings} />
      {hasFetchedOnce && <QueryResponseHandler result={result} query={query} />}
    </>
  );
};

const getAutorefreshInterval = (query: Query, settings: Settings): number | undefined => {
  if (query.autorefresh !== 0) {
    return query.autorefresh;
  }

  if (!settings.autoRefreshToggle) {
    return undefined;
  }

  if (settings.autoRefreshInterval !== 0) {
    return settings.autoRefreshInterval;
  }

  return undefined;
};

const getTitle = (query: Query, result: SubscriptionResult): string => {
  if (query.name.length === 0) {
    return "";
  }

  switch (result.type) {
    case "error":
      return `${query.name} (Error)`;
    case "success":
      return query.name.replace("{task_count}", result.tasks.length.toString());
  }
};

const QueryResponseHandler: React.FC<{
  result: SubscriptionResult;
  query: Query;
}> = ({ result, query }) => {
  if (result.type === "error") {
    return <Displays.Error kind={result.kind} />;
  }

  const tasks = result.tasks;
  if (tasks.length === 0) {
    return <Displays.Empty />;
  }

  if (query.groupBy !== GroupVariant.None) {
    return (
      <QueryContext.Provider value={query}>
        <Displays.Grouped tasks={tasks} />
      </QueryContext.Provider>
    );
  }

  return (
    <QueryContext.Provider value={query}>
      <Displays.List tasks={tasks} />
    </QueryContext.Provider>
  );
};
