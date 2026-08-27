import { ActivityListScreen } from "@/features/activity/presentation/screens/ActivityListScreen";
import { DetailScreen } from "@/features/activity/presentation/screens/DetailScreen";
import ReviewScreen from "@/features/ai-import/presentation/screens/ReviewScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "@/app/theme";

export type RootStackParamList = {
    ActivityList: undefined;
    Review: undefined;
    Detail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: colors.bg },
                    headerShadowVisible: true,
                    headerTitleStyle: { fontSize: 17, fontWeight: '500', color: colors.text },
                    headerTintColor: colors.accent,
                    contentStyle: { backgroundColor: colors.bg },
                    headerBackButtonDisplayMode: 'minimal',
                }}
            >
                <Stack.Screen
                    name="ActivityList"
                    component={ActivityListScreen}
                    options={{ title: '기록' }}
                />
                <Stack.Screen
                    name="Review"
                    component={ReviewScreen}
                    options={{ title: '기록 검토' }}
                />
                <Stack.Screen
                    name="Detail"
                    component={DetailScreen}
                    options={{ title: '상세 기록' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}