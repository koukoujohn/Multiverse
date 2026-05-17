import Reactotron from "reactotron-react-native";

if (__DEV__) {
    Reactotron.configure({ port: 9090 }).useReactNative().connect();
    console.tron = Reactotron;
} else {
    // No-op proxy: any console.tron.anyMethod() call is silently ignored in production builds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.tron = new Proxy({} as any, { get: () => () => {} });
}

export default Reactotron;
