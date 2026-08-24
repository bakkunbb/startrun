import { ActivityListScreen } from "@/features/activity/presentation/screens/ActivityListScreen";
import { DetailScreen } from "@/features/activity/presentation/screens/DetailScreen";
// import { ExtractionDto } from "@/features/ai-import/data/models/ExtractionDto";
// import ImportScreen from "@/features/ai-import/presentation/screens/ImportScreen";
import ReviewScreen from "@/features/ai-import/presentation/screens/ReviewScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "@/app/theme";

export type RootStackParamList = {
    ActivityList: undefined;
    // Import: undefined;
    Review: undefined;
    Detail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
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
                {/* <Stack.Screen
                    name="Import"
                    component={ImportScreen}
                    options={{ title: '기록 가져오기' }}
                /> */}
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