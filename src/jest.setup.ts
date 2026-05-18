import type { ReactotronReactNative } from "reactotron-react-native";

// api.ts and other modules call console.tron.log() (a Reactotron debug helper).
// In the test environment ReactotronConfig.ts is never imported, so console.tron
// would be undefined. Install a no-op proxy here — the same pattern that
// ReactotronConfig.ts uses in production builds.
console.tron = new Proxy({} as ReactotronReactNative, { get: () => () => {} });
