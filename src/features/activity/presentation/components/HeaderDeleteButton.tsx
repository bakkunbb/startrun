import { colors } from "@/app/theme";
import { Pressable, StyleSheet, Text } from "react-native";

export function HeaderDeleteButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
            <Text style={styles.headerButtonText}>삭제</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    headerButtonPressed: {
        opacity: 0.5,
    },
    headerButtonText: {
        fontSize: 16,
        color: colors.danger,
    },
});