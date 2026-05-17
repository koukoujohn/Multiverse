import { ReactotronReactNative } from "reactotron-react-native";

declare global {
    interface Console {
        tron: ReactotronReactNative;
    }
}
