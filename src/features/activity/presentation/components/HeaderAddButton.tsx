import { Pressable, StyleSheet, Text } from "react-native";
import { ThemeColors, useStyles } from "@/app/theme";

export function HeaderAddButton({ onPress }: { onPress: () => void }) {
    const styles = useStyles(createStyles);

    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
            <Text style={styles.headerButtonText}>+</Text>
        </Pressable>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
