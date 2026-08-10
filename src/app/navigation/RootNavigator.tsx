import { ActivityListScreen } from "@/features/activity/presentation/screens/ActivityListScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type RootStackParamList = {
    ActivityList: undefined;
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
            </Stack.Navigator>
        </NavigationContainer>
    )
}