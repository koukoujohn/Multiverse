import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#10B981",
                tabBarInactiveTintColor: "#60646C",
                tabBarStyle: {
                    backgroundColor: "#F3F4F6",
                    borderTopColor: "#E5E7EB",
                    borderTopWidth: 1,
                },
                headerStyle: {
                    backgroundColor: "#F3F4F6",
                },
                headerTitleStyle: {
                    color: "#000000",
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("tabs.characters"),
                    tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: t("tabs.favorites"),
                    headerShown: true,
                    tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
