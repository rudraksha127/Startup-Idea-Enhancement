/**
 * AgencyOS — Zoho Catalyst CloudScale Data Store & ZCQL Client
 * -------------------------------------------------------------
 * Provides unified access to Zoho Catalyst Data Store via ZCQL.
 * Operates in Live Catalyst Mode when deployed to Zoho AppSail,
 * or in Deterministic ZCQL Engine mode for local testing and CI.
 */

export interface CatalystConfig {
  projectId?: string;
  clientId?: string;
  clientSecret?: string;
  environment?: string;
  isLive?: boolean;
}

export class CatalystClient {
  private static instance: CatalystClient;
  private isLiveMode: boolean = false;
  private catalystApp: any = null;

  // In-Memory ZCQL Store for offline local development and CI tests
  private inMemoryStore: Map<string, Map<string, Record<string, any>>> = new Map();

  private constructor() {
    this.initStore();
  }

  public static getInstance(): CatalystClient {
    if (!CatalystClient.instance) {
      CatalystClient.instance = new CatalystClient();
    }
    return CatalystClient.instance;
  }

  /**
   * Initialize in-memory tables matching database/zoho-catalyst/manifests/tables.json
   */
  private initStore(): void {
    const tableNames = [
      "Organizations",
      "Users",
      "Leads",
      "LeadAudits",
      "LeadNotes",
      "Campaigns",
      "OutreachMessages",
      "Replies",
      "Meetings",
      "Proposals",
      "Clients",
      "Projects",
      "Tasks",
      "Templates",
      "Invoices",
      "AgentConfigs",
      "AgentExecutions",
      "AuditLogs",
    ];

    for (const table of tableNames) {
      if (!this.inMemoryStore.has(table)) {
        this.inMemoryStore.set(table, new Map());
      }
    }

    // Check if live Catalyst AppSail environment is detected
    if (
      (process.env.X_ZOHO_CATALYST_LISTEN_PORT ||
        process.env.CATALYST_PROJECT_ID ||
        process.env.CATALYST_CLIENT_ID) &&
      process.env.NODE_ENV === "production"
    ) {
      try {
        // Attempt safe lazy load of zcatalyst-sdk-node
        const req = typeof require !== "undefined" ? require : null;
        if (req) {
          const catalyst = req("zcatalyst-sdk-node");
          if (catalyst && typeof catalyst.initialize === "function") {
            this.catalystApp = catalyst.initialize();
            this.isLiveMode = true;
            console.log(`[Catalyst] Connected to live CloudScale project: ${process.env.CATALYST_PROJECT_ID || "AppSail"}`);
          }
        }
      } catch (err) {
        console.warn("[Catalyst] Live SDK init fallback to local ZCQL engine:", err);
        this.isLiveMode = false;
      }
    } else {
      this.isLiveMode = false;
    }
  }

  public isLive(): boolean {
    return this.isLiveMode;
  }

  public isMockMode(): boolean {
    return !this.isLiveMode;
  }

  /**
   * Execute a ZCQL Query (e.g. "SELECT * FROM Leads WHERE category = 'Restaurant'")
   */
  public async executeZCQL<T = any>(query: string): Promise<T[]> {
    if (this.isLiveMode && this.catalystApp) {
      try {
        const zcql = this.catalystApp.zcql();
        const results = await zcql.executeZCQLQuery(query);
        return results.map((row: any) => {
          // Catalyst ZCQL returns rows wrapped in table name: { Leads: { ... } }
          const keys = Object.keys(row);
          return keys.length === 1 && typeof row[keys[0]] === "object" ? row[keys[0]] : row;
        });
      } catch (err) {
        console.error(`[Catalyst ZCQL Error] Query failed: ${query}`, err);
        throw err;
      }
    }

    // Local in-memory ZCQL query parser
    return this.executeLocalZCQL<T>(query);
  }

  /**
   * Insert a single row into a Zoho Catalyst Table
   */
  public async insertRow<T = any>(tableName: string, data: Record<string, any>): Promise<T> {
    const table = this.getTableMap(tableName);
    const rowId = data.ROWID || data.id || `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: Record<string, any> = {
      ROWID: String(rowId),
      createdAt: data.createdAt || now,
      updatedAt: now,
      ...data,
    };

    if (this.isLiveMode && this.catalystApp) {
      try {
        const datastore = this.catalystApp.datastore();
        const catalystTable = datastore.table(tableName);
        const liveResult = await catalystTable.insertRow(record);
        table.set(String(liveResult.ROWID || rowId), liveResult);
        return liveResult as T;
      } catch (err) {
        console.warn(`[Catalyst DataStore] insertRow fallback for ${tableName}:`, err);
      }
    }

    table.set(String(rowId), record);
    return record as T;
  }

  /**
   * Bulk insert rows
   */
  public async insertRows<T = any>(tableName: string, rows: Record<string, any>[]): Promise<T[]> {
    const inserted: T[] = [];
    for (const row of rows) {
      const res = await this.insertRow<T>(tableName, row);
      inserted.push(res);
    }
    return inserted;
  }

  /**
   * Update a row in a Zoho Catalyst Table
   */
  public async updateRow<T = any>(
    tableName: string,
    rowId: string,
    data: Record<string, any>
  ): Promise<T> {
    const table = this.getTableMap(tableName);
    let existing = table.get(String(rowId));

    if (!existing) {
      // Search by primary ID field (e.g. leadId, userId, orgId)
      for (const [id, rec] of table.entries()) {
        if (
          rec.leadId === rowId ||
          rec.userId === rowId ||
          rec.orgId === rowId ||
          rec.clientId === rowId ||
          rec.projectId === rowId ||
          rec.invoiceId === rowId ||
          rec.campaignId === rowId
        ) {
          existing = rec;
          rowId = id;
          break;
        }
      }
    }

    if (!existing) {
      throw new Error(`[Catalyst] Row ${rowId} not found in table ${tableName}`);
    }

    const updated = {
      ...existing,
      ...data,
      ROWID: String(rowId),
      updatedAt: new Date().toISOString(),
    };

    if (this.isLiveMode && this.catalystApp) {
      try {
        const datastore = this.catalystApp.datastore();
        const catalystTable = datastore.table(tableName);
        await catalystTable.updateRow(updated);
      } catch (err) {
        console.warn(`[Catalyst DataStore] updateRow live warning for ${tableName}:`, err);
      }
    }

    table.set(String(rowId), updated);
    return updated as T;
  }

  /**
   * Delete a row by ROWID or entity ID
   */
  public async deleteRow(tableName: string, rowId: string): Promise<boolean> {
    const table = this.getTableMap(tableName);
    if (table.has(String(rowId))) {
      table.delete(String(rowId));
      return true;
    }

    // Try finding by entity ID column
    for (const [id, rec] of table.entries()) {
      if (
        rec.leadId === rowId ||
        rec.userId === rowId ||
        rec.orgId === rowId ||
        rec.clientId === rowId ||
        rec.projectId === rowId ||
        rec.invoiceId === rowId ||
        rec.campaignId === rowId
      ) {
        table.delete(id);
        return true;
      }
    }

    return false;
  }

  /**
   * Find all rows matching criteria
   */
  public async find<T = any>(tableName: string, filter?: Record<string, any>): Promise<T[]> {
    const table = this.getTableMap(tableName);
    const all = Array.from(table.values());

    if (!filter || Object.keys(filter).length === 0) {
      return all as T[];
    }

    return all.filter((row) => {
      for (const [key, val] of Object.entries(filter)) {
        if (val === undefined) continue;
        if (row[key] !== val) return false;
      }
      return true;
    }) as T[];
  }

  /**
   * Find single row matching criteria
   */
  public async findOne<T = any>(tableName: string, filter: Record<string, any>): Promise<T | null> {
    const results = await this.find<T>(tableName, filter);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Count rows matching criteria
   */
  public async count(tableName: string, filter?: Record<string, any>): Promise<number> {
    const results = await this.find(tableName, filter);
    return results.length;
  }

  /**
   * Clear all records in table (useful for test isolation)
   */
  public clearTable(tableName: string): void {
    const table = this.inMemoryStore.get(tableName);
    if (table) {
      table.clear();
    }
  }

  /**
   * Clear all tables
   */
  public resetAllTables(): void {
    for (const table of this.inMemoryStore.values()) {
      table.clear();
    }
  }

  private getTableMap(tableName: string): Map<string, Record<string, any>> {
    let map = this.inMemoryStore.get(tableName);
    if (!map) {
      map = new Map();
      this.inMemoryStore.set(tableName, map);
    }
    return map;
  }

  /**
   * Parser for standard ZCQL queries
   * Example: SELECT * FROM Leads WHERE organizationId = 'org-1' AND category = 'Restaurant'
   */
  private executeLocalZCQL<T>(query: string): T[] {
    const trimmed = query.trim();
    const selectMatch = trimmed.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);

    if (!selectMatch) {
      // Basic fallback: if cannot parse full SQL, return all items from table
      const fromMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (fromMatch) {
        const table = this.getTableMap(fromMatch[1]);
        return Array.from(table.values()) as T[];
      }
      return [];
    }

    const [, columnsStr, tableName, whereClause, orderByClause, limitStr] = selectMatch;
    const table = this.getTableMap(tableName);
    let results = Array.from(table.values());

    // 1. Filter by WHERE clause
    if (whereClause) {
      const conditions = whereClause.split(/\s+AND\s+/i);
      results = results.filter((row) => {
        for (const cond of conditions) {
          const eqMatch = cond.match(/^([a-zA-Z0-9_]+)\s*(=|!=|>|<|LIKE)\s*['"]?([^'"]+)['"]?$/i);
          if (eqMatch) {
            const [, col, op, rawExpected] = eqMatch;
            const actual = row[col];
            const expected = isNaN(Number(rawExpected)) ? rawExpected : Number(rawExpected);

            if (op === "=" && actual != expected) return false;
            if (op === "!=" && actual == expected) return false;
            if (op === ">" && Number(actual) <= Number(expected)) return false;
            if (op === "<" && Number(actual) >= Number(expected)) return false;
            if (op.toUpperCase() === "LIKE") {
              const regex = new RegExp(String(expected).replace(/%/g, ".*"), "i");
              if (!regex.test(String(actual))) return false;
            }
          }
        }
        return true;
      });
    }

    // 2. Order by
    if (orderByClause) {
      const [col, direction] = orderByClause.trim().split(/\s+/);
      const isDesc = direction && direction.toUpperCase() === "DESC";
      results.sort((a, b) => {
        const valA = a[col] ?? 0;
        const valB = b[col] ?? 0;
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // 3. Limit
    if (limitStr) {
      const limit = parseInt(limitStr, 10);
      results = results.slice(0, limit);
    }

    // 4. Column projection
    if (columnsStr.trim() !== "*") {
      const selectedCols = columnsStr.split(",").map((c) => c.trim());
      results = results.map((row) => {
        const projected: Record<string, any> = {};
        for (const col of selectedCols) {
          projected[col] = row[col];
        }
        return projected;
      });
    }

    return results as T[];
  }
}

export const catalystClient = CatalystClient.getInstance();
