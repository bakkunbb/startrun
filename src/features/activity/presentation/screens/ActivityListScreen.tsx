import { useActivities } from "../hooks/useActivities";
import ActivityCard from "../components/ActivityCard";
import { Button, FlatList, Text, View } from "react-native";
import { useAddSampleActivity } from "../hooks/useAddSampleActivity";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/app/navigation/RootNavigator";

export function ActivityListScreen() {
    const { data, isPending, error, } = useActivities();
    const addSampleActivity = useAddSampleActivity();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    if (isPending) return <Text>Loading...</Text>
    if (error) return <Text>Error: {error.message}</Text>
    if (!data || data.length === 0)
        return (
            <View>
                <Button title="add"
                    onPress={() => addSampleActivity.mutate()} />
            </View>
        );

    return (
        <View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ActivityCard activity={item} />}
            />
            <Button
                title="기록 가져오기"
                onPress={() => navigation.navigate('Import')}
            />
        </View>
    );
}