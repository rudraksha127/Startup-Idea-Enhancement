import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { UserRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class UsersRepository {
  static async findById(userId: string): Promise<UserRecord | null> {
    const users = await catalystClient.find<UserRecord>("Users", { userId });
    if (users.length > 0) return users[0];
    const byRow = await catalystClient.find<UserRecord>("Users", { ROWID: userId });
    return byRow.length > 0 ? byRow[0] : null;
  }

  static async findByEmail(email: string): Promise<UserRecord | null> {
    const users = await catalystClient.find<UserRecord>("Users", { email: email.toLowerCase() });
    return users.length > 0 ? users[0] : null;
  }

  static async findByOrg(organizationId: string): Promise<UserRecord[]> {
    return catalystClient.find<UserRecord>("Users", { organizationId });
  }

  static async create(data: Omit<UserRecord, "ROWID" | "createdAt" | "updatedAt">): Promise<UserRecord> {
    const userId = data.userId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<UserRecord>("Users", {
      ...data,
      userId,
      email: data.email.toLowerCase(),
    });
  }

  static async update(userId: string, data: Partial<UserRecord>): Promise<UserRecord> {
    return catalystClient.updateRow<UserRecord>("Users", userId, data);
  }

  static async delete(userId: string): Promise<boolean> {
    return catalystClient.deleteRow("Users", userId);
  }
}
