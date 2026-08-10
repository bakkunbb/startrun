import { useActivities } from "../hooks/useActivities";
import ActivityCard from "../components/ActivityCard";
import { Button, FlatList, Text, View } from "react-native";
import { useAddSampleActivity } from "../hooks/useAddSampleActivity";

export function ActivityListScreen() {
    const { data, isPending, error, } = useActivities();
    const addSampleActivity = useAddSampleActivity();

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
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ActivityCard activity={item} />}
        />
    );
}