const nativewindInterop = require("react-native-css-interop/babel");

module.exports = function (api) {
  api.cache(true);

  // `nativewind/babel` resolves to react-native-css-interop and returns `{ plugins }` — it must be
  // used as a preset, not listed under `plugins` (that triggers ".plugins is not a valid Plugin property").
  const { plugins: interopPlugins = [] } = nativewindInterop();
  const pluginsWithoutWorklets = interopPlugins.filter(
    (entry) =>
      entry !== "react-native-worklets/plugin" &&
      !(Array.isArray(entry) && entry[0] === "react-native-worklets/plugin")
  );

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [...pluginsWithoutWorklets, "react-native-reanimated/plugin"]
  };
};
