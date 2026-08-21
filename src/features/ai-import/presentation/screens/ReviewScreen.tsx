import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { useImportStore } from "../stores/importStore";
import { useExtractActivity } from "../hooks/useExtractActivity";
import { ReviewForm } from "../components/ReviewForm";

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

    if (extract.isError) {
        return (
            <View style={styles.center}>
                <Text>결과를 불러오지 못했습니다.</Text>
                <Pressable onPress={() => extract.mutate(images)}>
                    <Text>다시 시도</Text>
                </Pressable>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text>다른 사진 고르기</Text>
                </Pressable>
            </View>
        );
    }

    if (!extract.data) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <ReviewForm dto={extract.data} onLeave={onLeave} />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
    },
});
