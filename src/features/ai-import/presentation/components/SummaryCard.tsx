import { StyleSheet, Text, View } from "react-native";
import { Field } from "./SummaryField";
import { ExtractedActivity } from "../../domain/entities/ExtractedActivity";
import { useReviewDraft } from "../hooks/useReviewDraft";

export function SumamryCard({ activity }: { activity: ExtractedActivity }) {

    const review = useReviewDraft(activity);

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
            <Text>{review.draft.startedAt?.toDateString()}</Text>
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