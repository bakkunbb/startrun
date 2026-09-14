import { ThemeColors, useStyles } from "@/app/theme";
import { Pressable, StyleSheet, Text } from "react-native";

export function HeaderDeleteButton({ onPress }: { onPress: () => void }) {
    const styles = useStyles(createStyles);
    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
            <Text style={styles.headerButtonText}>삭제</Text>
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
        fontSize: 17,
        color: colors.danger,
    },
});