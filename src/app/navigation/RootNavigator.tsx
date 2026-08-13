import { ActivityListScreen } from "@/features/activity/presentation/screens/ActivityListScreen";
import ImportScreen from "@/features/ai-import/presentation/screens/ImportScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type RootStackParamList = {
    ActivityList: undefined;
    Import: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="ActivityList"
                    component={ActivityListScreen}
                    options={{ title: '기록' }}
                />
                <Stack.Screen
                    name="Import"
                    component={ImportScreen}
                    options={{ title: '기록 가져오기' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}