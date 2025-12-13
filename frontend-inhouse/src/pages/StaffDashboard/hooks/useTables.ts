import { useCallback, useEffect, useState } from "react";
import type { ApiTable } from "../../../api/staff/staff.operations.api";
import {
  assignSessionToTable,
  getTableByNumber,
  getTables,
} from "../../../api/staff/staff.operations.api";

/**
 * Hook: useTables
 * -------------------------
 * Manages all table-related operations for Staff Dashboard:
 * - Fetch all tables
 * - Fetch specific table by number
 * - Assign or refresh table sessions
 * - Handles errors + logs for debugging
 */
export function useTables(rid: string) {
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  /**
   * 📦 Fetch all tables for restaurant
   * Always returns a valid array (never undefined)
   */
  const fetchTables = useCallback(async (): Promise<ApiTable[]> => {
    console.log(
      `%c[useTables] → Fetching tables for restaurant: ${rid}`,
      "color:#3fa9f5"
    );

    setIsLoading(true);
    setTableError(null);

    try {
      const res = await getTables();

      let data: ApiTable[] = [];
      if (Array.isArray(res)) {
        data = res;
      } else if (Array.isArray(res?.data)) {
        data = res.data;
      } else if (Array.isArray(res?.tables)) {
        data = res.tables;
      } else if (Array.isArray(res?.result)) {
        data = res.result;
      } else if (res && res._id) {
        data = [res];
      } else {
        data = [];
      }

      setTables(data);
      console.log(
        `%c[useTables] ✅ Tables fetched successfully (${data.length} tables)`,
        "color:#4CAF50"
      );

      return data; // ✅ ensures other hooks get the tables
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(
        "%c[useTables] ❌ Failed to fetch tables:",
        "color:red",
        message
      );
      setTableError(message);
      setTables([]);
      return [];
    } finally {
      setIsLoading(false);
      console.log("%c[useTables] fetchTables() complete", "color:#888");
    }
  }, [rid]);

  /**
   * 🔍 Fetch single table by its number
   */
  const fetchTableByNumber = useCallback(async (tableNumber: string) => {
    if (!tableNumber) return null;

    console.log(
      `%c[useTables] → Fetching table #${tableNumber}`,
      "color:#ffb300"
    );

    try {
      const res = await getTableByNumber(tableNumber);
      console.log(
        `%c[useTables] ✅ Table #${tableNumber} fetched successfully`,
        "color:#4CAF50"
      );
      return res;
    } catch (err: any) {
      console.error(
        `%c[useTables] ❌ Failed to get table #${tableNumber}:`,
        "color:red",
        err
      );
      return null;
    }
  }, []);

  /**
   * 🪑 Assign a session to a specific table (and refresh)
   */
  const assignSession = useCallback(
    async (tableId: string, sessionId: string, staffAlias: string) => {
      if (!tableId || !sessionId) {
        console.warn(
          "%c[useTables] ⚠️ Missing tableId or sessionId during assignSession",
          "color:orange"
        );
        return { success: false };
      }

      console.log(
        `%c[useTables] → Assigning session '${sessionId}' to table ${tableId} (${staffAlias})`,
        "color:#9c27b0"
      );

      try {
        const res = await assignSessionToTable(tableId, sessionId, staffAlias);
        if (res?.success) {
          console.log(
            `%c[useTables] ✅ Session assigned successfully, refreshing tables...`,
            "color:#4CAF50"
          );
          await fetchTables();
        } else {
          console.warn(
            "%c[useTables] ⚠️ Session assignment returned false response",
            "color:orange"
          );
        }
        return res;
      } catch (err: any) {
        console.error(
          "%c[useTables] ❌ Failed to assign session:",
          "color:red",
          err
        );
        return { success: false };
      }
    },
    [fetchTables]
  );

  /**
   * 🚀 Auto-fetch tables when restaurant changes or component mounts
   */
  useEffect(() => {
    if (!rid) {
      console.warn(
        "%c[useTables] ⚠️ Missing restaurant ID (rid)",
        "color:orange"
      );
      return;
    }

    console.log(
      "%c[useTables] 🔄 Initial table fetch on mount",
      "color:#2196F3"
    );
    fetchTables();
  }, [rid]);

  return {
    tables,
    setTables,
    fetchTables,
    fetchTableByNumber,
    assignSession,
    isLoading,
    tableError,
  };
}
