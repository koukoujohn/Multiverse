import Reactotron from "reactotron-react-native";

Reactotron.configure({
    port: 9090,
}) // controls connection & communication settings
    .useReactNative() // add all built-in react native plugins
    .connect(); // let's connect!

console.tron = Reactotron;

export default Reactotron;
