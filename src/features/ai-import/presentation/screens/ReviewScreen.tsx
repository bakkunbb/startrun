import { Alert, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/app/theme";
import { useEffect, useState } from "react";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { useImportStore } from "../stores/importStore";
import { useExtractActivity } from "../hooks/useExtractActivity";
import { ReviewForm } from "../components/ReviewForm";
import { EmptyState } from "@/core/ui/EmptyState";
import { ExtractionErrorCode } from "../../data/datasources/aiExtractionApi";

const EXTRACTION_MESSAGES: Record<ExtractionErrorCode, { title: string; description: string }> = {
    network: { title: '연결을 확인해주세요', description: '네트워크 상태를 확인한 뒤 다시 시도해주세요' },
    timeout: { title: '응답이 오래 걸려요', description: '이미지 수를 줄이면 빨라집니다' },
    server: { title: '기록을 읽지 못했어요', description: '잠시 후 다시 시도해주세요' },
    parse: { title: '결과를 이해하지 못했어요', description: '다른 스크린샷으로 시도해보세요' },
};

export default function ReviewScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const images = useImportStore((s) => s.images);
    const clear = useImportStore((s) => s.clear);

    const extract = useExtractActivity();
    const { mutate } = extract;

    useEffect(() => {
        if (images.length > 0) mutate(images);
    }, [images, mutate]);

    const [canLeave, setCanLeave] = useState(false);
    const onLeave = () => {
        clear();
        setCanLeave(true);
    }

    usePreventRemove(!canLeave, ({ data }) => {
        Alert.alert('작성 중인 내용이 사라집니다', '검토를 그만둘까요?', [
            { text: '계속 작성', style: 'cancel' },
            {
                text: '나가기', style: 'destructive', onPress: () => {
                    clear();
                    navigation.dispatch(data.action);
                }
            },
        ]);
    })

    useEffect(() => {
        if (canLeave) navigation.popToTop();
    }, [canLeave, navigation]);

    if (extract.isError) {
        const code = extract.error.code;
        const { title, description } = EXTRACTION_MESSAGES[code];
        const isParseError = code === 'parse';

        return (
            <EmptyState
                title={title}
                description={description}
                actionLabel={isParseError ? '다른 사진 고르기' : '다시 시도'}
                onAction={isParseError ? () => navigation.goBack() : () => mutate(images)}
            />
        );
    }

    if (!extract.data) {
        return (
            <View style={styles.skeletonContainer}>
                <View style={styles.summarySkeleton} />
                <View style={styles.segmentsSkeleton} />
            </View>
        );
    }

    return <ReviewForm dto={extract.data} onLeave={onLeave} />;
}

const styles = StyleSheet.create({
    skeletonContainer: { flex: 1, padding: spacing.lg, gap: spacing.md },
    summarySkeleton: {
        height: 280,
        borderRadius: radius.lg,
        backgroundColor: colors.bgSubtle,
    },
    segmentsSkeleton: {
        height: 200,
        borderRadius: radius.lg,
        backgroundColor: colors.bgSubtle,
    },
});
