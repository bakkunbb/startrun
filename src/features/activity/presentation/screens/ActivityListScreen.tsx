import { useActivities } from "../hooks/useActivities";
import ActivityCard from "../components/ActivityCard";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/app/navigation/RootNavigator";
import { useCallback, useLayoutEffect } from "react";
import { HeaderAddButton } from "../components/HeaderAddButton";
import { pickScreenShots } from "@/core/media/imagePicker";
import { useImportStore } from "@/features/ai-import/presentation/stores/importStore";
import { EmptyState } from "@/core/ui/EmptyState";
import { colors, radius, spacing } from "@/app/theme";
import { summarize, thisWeek } from "../../domain/periodSummary";
import { WeeklySummaryStrip } from "../components/WeeklySummaryStrip";

export function ActivityListScreen() {
    const { data, isPending, error, refetch } = useActivities();
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

    if (isPending) {
        return (
            <View>
                {[0, 1, 2].map((i) => (
                    <View key={i} style={styles.cardSkeleton}>
                        <View style={styles.skeletonBarWide} />
                        <View style={styles.skeletonBarNarrow} />
                    </View>
                ))}
            </View>
        );
    }

    if (error) {
        return (
            <EmptyState
                title="불러오지 못했습니다"
                actionLabel="다시 시도"
                onAction={() => refetch()}
            />
        );
    }

    if (!data || data.length === 0) {
        return (
            <EmptyState
                title="첫 기록을 추가해보세요"
                description="러닝 앱 스크린샷을 불러오면 자동으로 채워집니다"
                actionLabel="스크린샷 불러오기"
                onAction={onAdd}
            />
        );
    }

    const weekly = summarize(thisWeek(data));

    return (
        <View style={styles.flex}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ActivityCard activity={item} />}
                ListHeaderComponent={weekly.count > 0 ? <WeeklySummaryStrip summary={weekly} /> : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    cardSkeleton: {
        backgroundColor: colors.card,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        gap: spacing.sm,
    },
    skeletonBarWide: {
        height: 20,
        width: '40%',
        borderRadius: radius.sm,
        backgroundColor: colors.bgSubtle,
    },
    skeletonBarNarrow: {
        height: 14,
        width: '70%',
        borderRadius: radius.sm,
        backgroundColor: colors.bgSubtle,
    },
});