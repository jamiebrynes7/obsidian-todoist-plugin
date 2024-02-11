import type { ISettings } from "./settings";
import { settings } from "./settings";

let _settings: ISettings | undefined = undefined;
settings.subscribe((update) => _settings = update);

export default function debug(log: string | LogMessage) {
  if (!_settings?.debugLogging ?? false) {
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
