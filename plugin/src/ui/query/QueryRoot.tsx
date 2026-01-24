import { domAnimation, LazyMotion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

import type { OnSubscriptionChange, Refresh, SubscriptionResult } from "@/data";
import { t } from "@/i18n";
import type TodoistPlugin from "@/index";
import type { QueryWarning } from "@/query/parser";
import type { TaskQuery } from "@/query/schema/tasks";
import { type Settings, useSettingsStore } from "@/settings";
import { PluginContext } from "@/ui/context";
import { QueryHeader } from "@/ui/query/QueryHeader";
import { QueryResponseHandler } from "@/ui/query/QueryResponseHandler";
import { QueryWarnings } from "@/ui/query/QueryWarnings";
import "./styles.scss";

import { secondsToMillis } from "@/infra/time";

const useSubscription = (
  plugin: TodoistPlugin,
  query: TaskQuery,
  callback: OnSubscriptionChange,
): [Refresh, boolean, boolean, Date | undefined] => {
  const [refresher, setRefresher] = useState<Refresh | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [refreshedTimestamp, setRefreshedTimestamp] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const [unsub, refresh] = plugin.services.todoist.subscribe(query.filter, (results) => {
      callback(results);
      setRefreshedTimestamp(new Date());
    });
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

  return [forceRefresh, isFetching, hasFetchedOnce, refreshedTimestamp];
};

type Props = {
  query: TaskQuery;
  warnings: QueryWarning[];
};

export const QueryRoot: React.FC<Props> = ({ query, warnings }) => {
  const plugin = PluginContext.use();
  const settings = useSettingsStore();
  const [result, setResult] = useState<SubscriptionResult>({
    type: "success",
    tasks: [],
  });
  const [refresh, isFetching, hasFetchedOnce, refreshedTimestamp] = useSubscription(
    plugin,
    query,
    setResult,
  );

  useEffect(() => {
    const interval = getAutorefreshInterval(query, settings);

    if (interval === undefined) {
      return;
    }

    const id = window.setInterval(async () => {
      await refresh();
    }, secondsToMillis(interval));

    return () => window.clearInterval(id);
  }, [query, settings, refresh]);

  return (
    <LazyMotion features={domAnimation}>
      <QueryHeader
        title={getTitle(query, result)}
        isFetching={isFetching}
        refresh={refresh}
        refreshedTimestamp={refreshedTimestamp}
      />
      <QueryWarnings warnings={warnings} />
      {hasFetchedOnce && <QueryResponseHandler result={result} query={query} />}
    </LazyMotion>
  );
};

const getAutorefreshInterval = (query: TaskQuery, settings: Settings): number | undefined => {
  if (query.autorefresh !== undefined && query.autorefresh !== 0) {
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

const getTitle = (query: TaskQuery, result: SubscriptionResult): string => {
  const name = query.name ?? "";
  if (name.length === 0) {
    return "";
  }

  switch (result.type) {
    case "error": {
      const postfix = t().query.header.errorPostfix;
      return `${query.name} ${postfix}`;
    }
    case "success":
      return name.replace("{task_count}", result.tasks.length.toString());
    case "not-ready":
      return "";
    default: {
      const _: never = result;
      throw new Error("Unknown result type");
    }
  }
};
