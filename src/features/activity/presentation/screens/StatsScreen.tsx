import { useColors } from "@/app/theme";
import { Text, View } from "react-native";

export function StatsScreen() {
    const colors = useColors();
    return (
        <View>
            <Text style={{ color: colors.accent }}>testing</Text>
        </View>
    );
}