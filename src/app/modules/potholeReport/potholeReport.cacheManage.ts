import cacheService from "../../../util/cacheService";
import { normalizeQuery } from "../../../util/normalizeQuery";
import { TPotholeReport } from "./potholeReport.interface";

const DEFAULT_TTL = 60 * 60 * 6; // 6 hours cache time

const PotholeReportCacheManage = {
  keys: {
    reportList: "potholeReportList",
    reportListWithQuery: "potholeReportListWithQuery",
    reportId: (id: string) => `potholeReport:${id}`,
    reportListWithQueryKey: (query: Record<string, unknown>) => {
      const normalized = normalizeQuery(query);
      return `${
        PotholeReportCacheManage.keys.reportListWithQuery
      }:${JSON.stringify(normalized)}`;
    },
  },

  updateReportCache: async (reportId: string) => {
    // Remove the specific report cache
    await cacheService.deleteCache(
      PotholeReportCacheManage.keys.reportId(reportId)
    );

    // Remove the general report list cache
    await cacheService.deleteCache(PotholeReportCacheManage.keys.reportList);

    // Invalidate all query-based caches
    await cacheService.deleteCacheByPattern(
      PotholeReportCacheManage.keys.reportListWithQuery + ":*"
    );
  },

  getCacheSingleReport: async (
    reportId: string
  ): Promise<TPotholeReport | null> => {
    const key = PotholeReportCacheManage.keys.reportId(reportId);
    const cached = await cacheService.getCache<TPotholeReport>(key);
    return cached ?? null;
  },

  setCacheSingleReport: async (
    reportId: string,
    data: Partial<TPotholeReport>
  ) => {
    const key = PotholeReportCacheManage.keys.reportId(reportId);
    await cacheService.setCache(key, data, DEFAULT_TTL);
  },

  setCacheListWithQuery: async (
    query: Record<string, unknown>,
    data: { result: any; meta?: any },
    ttl: number = DEFAULT_TTL
  ) => {
    const key = PotholeReportCacheManage.keys.reportListWithQueryKey(query);
    await cacheService.setCache(key, data, ttl);
  },

  getCacheListWithQuery: async (
    query: Record<string, unknown>
  ): Promise<{ result: any; meta?: any } | null> => {
    const key = PotholeReportCacheManage.keys.reportListWithQueryKey(query);
    const cached = await cacheService.getCache<{ result: any; meta?: any }>(
      key
    );
    return cached ?? null;
  },
};

export default PotholeReportCacheManage;
