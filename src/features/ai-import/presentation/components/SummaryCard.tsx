import { StyleSheet, Text, View } from "react-native";
import { Field } from "./SummaryField";
import { ExtractedActivity } from "../../domain/entities/ExtractedActivity";
import { useReviewDraft } from "../hooks/useReviewDraft";
import { useState } from "react";
import { DateTimeField } from "./DateTimeField";
import { colors, layout } from "@/app/theme";
import { formatPace } from "@/core/utils/format";

export function SumamryCard({ activity, review }: { activity: ExtractedActivity; review: ReturnType<typeof useReviewDraft>; }) {

    const [date, setDate] = useState(review.draft.startedAt ?? new Date())

    const { distanceMeters, durationSeconds } = review.draft;
    const pace = distanceMeters && durationSeconds
        ? (durationSeconds / distanceMeters) * 1000
        : null;

    return (
        <View style={cardStyles.card}>
            <Field
                label="거리" unit="km"
                value={review.inputs.distance} onChangeText={review.setDistanceInput}
                keyboardType="decimal-pad"
                invalid={activity.lowConfidenceFields.includes('distanceMeters')}
                hint="10.24 형식으로 입력해주세요"
                uncertain={activity.lowConfidenceFields.includes('distanceMeters')}
            />
            <Field
                label="시간"
                value={review.inputs.duration} onChangeText={review.setDurationInput}
                invalid={activity.lowConfidenceFields.includes('durationSeconds')}
                hint="52:31 또는 1:02:03 형식"
            />
            <View style={cardStyles.row}>
                <Text style={cardStyles.label}>평균 페이스</Text>
                <Text style={cardStyles.paceValue}>{formatPace(pace)}/km</Text>
            </View>
            <Field
                label="심박수"
                value={review.inputs.heartRate} onChangeText={review.setHeartRateInput}
                keyboardType="number-pad" placeholder="선택"
            />
            <DateTimeField
                label="날짜"
                value={date}
                onChange={(selected) => {
                    setDate(selected);
                    review.setStartedAt(selected)
                }}
            />
            <Field
                label="칼로리" unit="kcal"
                value={review.inputs.calories} onChangeText={review.setCaloriesInput}
                keyboardType="number-pad" placeholder="선택"
            />
            <Field label="메모" value={review.inputs.note} onChangeText={review.setNote} multiline placeholder="선택" />
        </View>
    );
}

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: layout.minTouchSize,
        gap: 8,
    },
    label: {
        width: layout.formLabelWidth,
        fontSize: 15,
        color: colors.textMuted,
    },
    paceValue: {
        flex: 1,
        fontSize: 18,
        color: colors.textMuted,
        textAlign: 'right',
        paddingHorizontal: 10,
    },
});