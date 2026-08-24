import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/app/theme";

export function HeaderAddButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
            <Text style={styles.headerButtonText}>+</Text>
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
        fontSize: 32,
        color: colors.accent,
    },
});
