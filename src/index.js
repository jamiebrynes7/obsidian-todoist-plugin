import TodoistPlugin from "./plugin";

module.exports = ({ SettingTab }) => {
  return new TodoistPlugin(SettingTab);
};
