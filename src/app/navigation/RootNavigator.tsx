import { ActivityListScreen } from "@/features/activity/presentation/screens/ActivityListScreen";
import { DetailScreen } from "@/features/activity/presentation/screens/DetailScreen";
import ReviewScreen from "@/features/ai-import/presentation/screens/ReviewScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "@/app/theme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatsScreen } from "@/features/activity/presentation/screens/StatsScreen";
import { ChartLine, List, } from "lucide-react-native";
import { StyleSheet } from "react-native";

export type TabsParamList = {
    RecordTab: undefined;
    StatsTab: undefined;
}

export type RootStackParamList = {
    Tabs: undefined,
    Review: undefined;
    Detail: { id: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

const headerOptions = {
    headerStyle: { backgroundColor: colors.bg },
    headerShadowVisible: true,
    headerTitleStyle: { fontSize: 17, fontWeight: '500' as const, color: colors.text },
    headerTintColor: colors.accent,
    headerBackButtonDisplayMode: 'minimal' as const,
};

const stackScreenOptions = {
    ...headerOptions,
    contentStyle: { backgroundColor: colors.bg },
}

const tabBarStyle = {
    backgroundColor: colors.bg,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 2,
    elevation: 4,
}

function tabIconColor(focused: boolean) {
    return focused ? colors.accent : colors.textMuted;
}

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                ...headerOptions,
                sceneStyle: { backgroundColor: colors.bg },
                tabBarStyle,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
            }}
        >
            <Tab.Screen
                name="RecordTab"
                component={ActivityListScreen}
                options={{
                    title: '기록',
                    tabBarIcon: ({ focused, size }) => <List color={tabIconColor(focused)} size={size} />
                }}
            />
            <Tab.Screen
                name="StatsTab"
                component={StatsScreen}
                options={{
                    title: '통계',
                    tabBarIcon: ({ focused, size }) => <ChartLine color={tabIconColor(focused)} size={size} />
                }}
            />
        </Tab.Navigator>
    );
}

export function RootNavigator() {
    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={stackScreenOptions}>
                <RootStack.Screen
                    name="Tabs"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <RootStack.Screen
                    name="Review"
                    component={ReviewScreen}
                    options={{ title: '기록 검토' }}
                />
                <RootStack.Screen
                    name="Detail"
                    component={DetailScreen}
                    options={{ title: '상세 기록' }}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    )
}