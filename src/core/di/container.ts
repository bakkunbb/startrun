import { ActivityRepositoryImpl } from "@/features/activity/data/repositories/ActivityRepositoryImpl";
import { ActivityRepository } from "@/features/activity/domain/repositories/ActivityRepository";
import { getDatabase } from "../database/client";
import { ActivityLocalDataSource } from "@/features/activity/data/datasources/ActivityLocalDataSources";

type Container = {
    activityRepository: ActivityRepository;
    // saveActivity: SaveActviity;
};

let instance: Promise<Container> | null = null;

export function getContainer(): Promise<Container> {
    if (!instance) {
        instance = (async () => {
            const db = await getDatabase();
            const activityLocal = new ActivityLocalDataSource(db);
            return {
                activityRepository: new ActivityRepositoryImpl(activityLocal),
            };
        })();
    }
    return instance;
}