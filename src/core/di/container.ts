import { ActivityRepositoryImpl } from "@/features/activity/data/repositories/ActivityRepositoryImpl";
import { ActivityRepository } from "@/features/activity/domain/repositories/ActivityRepository";
import { getDatabase } from "../database/client";
import { ActivityLocalDataSource } from "@/features/activity/data/datasources/ActivityLocalDataSources";
import { SaveActivity, makeSaveActivity } from "@/features/activity/domain/usecases/saveActivity";

type Container = {
    activityRepository: ActivityRepository;
    saveActivity: SaveActivity;
};

let instance: Promise<Container> | null = null;

export function getContainer(): Promise<Container> {
    if (!instance) {
        instance = (async () => {
            const db = await getDatabase();
            const activityRepository = new ActivityRepositoryImpl(new ActivityLocalDataSource(db));
            return {
                activityRepository,
                saveActivity: makeSaveActivity(activityRepository),
            };
        })();
    }
    return instance;
}