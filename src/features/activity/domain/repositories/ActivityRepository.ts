import { Activity } from "../entities/Activity";

export interface ActivityRepository {
    getAll(): Promise<Activity[]>;
    getById(id: string): Promise<Activity | null>;
    save(activity: Activity): Promise<void>;
    remove(id: string): Promise<void>;
    findNear(startedAt: Date, toleranceMinutes: number): Promise<Activity[]>;
}