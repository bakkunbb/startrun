import { useActivities } from "../hooks/useActivities";
import ActivityCard from "../components/ActivityCard";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useAddSampleActivity } from "../hooks/useAddSampleActivity";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/app/navigation/RootNavigator";
import { useCallback, useLayoutEffect } from "react";
import { HeaderAddButton } from "../components/HeaderAddButton";
import { pickScreenShots } from "@/core/media/imagePicker";
import { useImportStore } from "@/features/ai-import/presentation/stores/importStore";

export function ActivityListScreen() {
    const { data, isPending, error, } = useActivities();
    const addSampleActivity = useAddSampleActivity();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const setImages = useImportStore((s) => s.setImages);

    const onAdd = useCallback(async () => {
        const images = await pickScreenShots();
        if (images.length === 0) return;
        setImages(images);
        navigation.navigate('Review');
    }, [navigation, setImages]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <HeaderAddButton onPress={onAdd} />
        });
    }, [navigation, onAdd]);

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
        <View style={styles.flex}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ActivityCard activity={item} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
});