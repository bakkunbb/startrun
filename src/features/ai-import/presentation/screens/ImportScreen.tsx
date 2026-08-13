import { Button, ScrollView, Text, View } from "react-native";
import { pickScreenShots } from "@/core/media/imagePicker";
import { useExtractActivity } from "../hooks/useExtractActivity";

export default function ImportScreen() {
    const { mutate, data, isPending, error } = useExtractActivity();

    const handlePress = async () => {
        const images = await pickScreenShots();
        if (images.length > 0) {
            mutate(images);
        }
    };

    return (
        <View>
            {isPending && <Text>추출 중...</Text>}
            {error && <Text>에러 발생: {error.message}</Text>}
            {data && (
                <ScrollView>
                    <Text>{JSON.stringify(data, null, 2)}</Text>
                </ScrollView>
            )}
            <Button title="스크린샷 선택" onPress={handlePress} />
        </View>
    );
}