import { StyleSheet, View } from "react-native";
import { Field } from "./SummaryField";
import { ExtractedActivity } from "../../domain/entities/ExtractedActivity";
import { useReviewDraft } from "../hooks/useReviewDraft";
import { useState } from "react";
import { DateTimeField } from "./DateTimeField";

export function SumamryCard({ activity, review }: { activity: ExtractedActivity; review: ReturnType<typeof useReviewDraft>; }) {

    const [date, setDate] = useState(review.draft.startedAt ?? new Date())

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
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
    },
});