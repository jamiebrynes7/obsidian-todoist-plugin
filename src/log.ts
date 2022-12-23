import type { ISettings } from "./settings";
import { SettingsInstance } from "./settings";

let settings: ISettings = null;
SettingsInstance.subscribe((value) => (settings = value));

export default function debug(log: string | LogMessage) {
  if (!settings.debugLogging) {
    return;
  }

  if (isComplexLog(log)) {
    console.log(log.msg);
    console.log(log.context);
  } else {
    console.log(log);
  }
}

interface LogMessage {
  msg: string;
  context: object;
}

function isComplexLog(log: string | LogMessage): log is LogMessage {
  return (log as LogMessage).msg !== undefined;
}
