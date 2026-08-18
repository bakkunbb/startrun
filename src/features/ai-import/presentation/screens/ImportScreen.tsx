import { Button, Text, View } from "react-native";
import { pickScreenShots } from "@/core/media/imagePicker";
import { useExtractActivity } from "../hooks/useExtractActivity";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function ImportScreen() {
    // const { mutate, isPending, error } = useExtractActivity();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const extract = useExtractActivity();

    const handlePress = async () => {
        const images = await pickScreenShots();
        if (images.length === 0) return;
        const dto = await extract.mutateAsync(images);
        navigation.navigate('Review', { dto });

        // if (images.length > 0) {
        //     mutate(images);
        // }
    };

    return (
        <View>
            {extract.isPending && <Text>추출 중...</Text>}
            {extract.error && <Text>에러 발생: {extract.error.message}</Text>}
            {/* {data && (
                <ScrollView>
                    <Text>{JSON.stringify(data, null, 2)}</Text>
                </ScrollView>
            )} */}
            <Button title="스크린샷 선택" onPress={handlePress} />
        </View>
    );
}