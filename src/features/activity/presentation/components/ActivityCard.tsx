import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Activity, paceSecPerKm, primarySegments, SegmentBearing, } from '../../domain/entities/Activity';
import { formatDistanceKm, formatDuration, formatMonthDay, formatPace } from '@/core/utils/format';
import { colors, spacing, radius, typography } from '@/app/theme';
import { SourceBadge } from './SourceBadge';
import { RootStackParamList } from '@/app/navigation/RootNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function ActivityCard({ activity }: { activity: Activity }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const isHeartRateExist = activity.heartRate !== undefined;

    return (
        <View style={styles.card}>
            <Pressable
                onPress={() => {
                    navigation.navigate('Detail', { id: activity.id });
                }}>
                <View style={styles.rowContainer}>
                    <Text style={styles.distance}>{formatDistanceKm(activity.distanceMeters)} km</Text>
                    <SourceBadge source={activity.source} />
                </View>
                <Text style={styles.meta}>
                    {formatMonthDay(activity.startedAt)}
                    {' • '}
                    {formatDuration(activity.durationSeconds)}
                    {' • '}
                    {
                        isHeartRateExist ? `${activity.heartRate ?? 0}bpm  • ` : null
                    }
                    {`${formatPace(paceSecPerKm(activity))}/km`}
                    {' • '}
                    {`구간 ${primarySegments(activity as SegmentBearing)?.segments.length ?? '없음'}`}
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    rowContainer: {
        flexDirection: 'row',          // Aligns items horizontally
        justifyContent: 'space-between', // Pushes items to the edges
        alignItems: 'center',          // Vertically centers items in the row
        width: '100%',                 // Takes up full horizontal space
        // paddingHorizontal: 16,         // Adds internal padding from screen edges
    },
    distance: {
        fontSize: 22,
        fontWeight: '500',
        color: colors.text,
    },
    meta: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 4,
    },
});