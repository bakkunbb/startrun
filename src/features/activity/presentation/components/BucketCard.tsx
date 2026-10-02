import { radius, spacing, ThemeColors, useColors, useStyles } from "@/app/theme";
import { Activity, paceSecPerKm } from "../../domain/entities/Activity";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "@/app/navigation/RootNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDistanceKm, formatMonthDay, formatPace } from "@/core/utils/format";
import { ChevronRight } from "lucide-react-native";

export function BucketCard({ activity }: { activity: Activity }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const styles = useStyles(createStyles);
    const colors = useColors();

    return (
        <View style={styles.card}>
            <Pressable key={activity.id} onPress={() => navigation.navigate('Detail', { id: activity.id })}>
                <View style={styles.rowContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.dateLabel}>{formatMonthDay(activity.startedAt)}</Text>
                        <Text style={styles.contentLabel}>
                            {formatDistanceKm(activity.distanceMeters)}km
                            {' • '}
                            {formatPace(paceSecPerKm(activity))}
                        </Text>
                    </View>
                    <ChevronRight color={colors.text} />
                </View>
            </Pressable>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    rowContainer: {
        flexDirection: 'row',          // Aligns items horizontally
        justifyContent: 'space-between', // Pushes items to the edges
        alignItems: 'center',          // Vertically centers items in the row
        width: '100%',                 // Takes up full horizontal space
    },
    textContainer: {
        gap: 3
    },
    dateLabel: {
        fontSize: 15,
        color: colors.text
    },
    contentLabel: {
        fontSize: 13,
        color: colors.textMuted
    }
})