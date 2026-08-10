import { ActivityRepositoryImpl } from "../../data/repositories/ActivityRepositoryImpl";
import { Activity } from "../entities/Activity";

export type SaveActivity = (activity: Activity) => Promise<void>;

export function makeSaveActivity(repo: ActivityRepositoryImpl): SaveActivity {
    return async (activity) => {
        if (activity.distanceMeters <= 0) {
            throw new Error('거리는 0보다 커야 합니다');
        }

        if (activity.externalId) {
            const near = await repo.findNear(activity.startedAt, 30);
            if (near.some((d) => d.externalId === activity.externalId)) return;
        }

        await repo.save(activity);
    }
}