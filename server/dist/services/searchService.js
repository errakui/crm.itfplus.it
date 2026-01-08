"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDocumentsOptimized = searchDocumentsOptimized;
exports.warmUpCache = warmUpCache;
const client_1 = require("@prisma/client");
// Cache semplice in-memory senza dipendenze esterne
class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 1000;
        this.ttl = 5 * 60 * 1000; // 5 minuti
    }
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey)
                this.cache.delete(firstKey);
        }
        this.cache.set(key, { value, expires: Date.now() + this.ttl });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item || Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
}
// Cache in-memory: 5 minuti, 1000 chiavi
const cache = new SimpleCache();
const prisma = new client_1.PrismaClient();
function searchDocumentsOptimized(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { q, cities, from, to, pageSize = 20, cursor } = params;
        // Cache key
        const key = JSON.stringify({ q, cities, from, to, pageSize, cursor });
        const hit = cache.get(key);
        if (hit) {
            console.log(`[CACHE HIT] Query: ${q}`);
            return hit;
        }
        // Guard: minimo 3 caratteri
        if (!q || q.length < 3) {
            return { items: [], nextCursor: null, queryTime: 0 };
        }
        // Fuzzy search per query molto brevi o con possibili errori di battitura
        const isFuzzySearch = q.length < 5 || q.includes('*') || q.includes('?');
        const startTime = Date.now();
        try {
            let sql;
            if (isFuzzySearch) {
                // Fuzzy search usando pg_trgm per titoli
                sql = `
        WITH q AS (
          SELECT
            $1 AS search_term,
            COALESCE($2::text[], ARRAY[]::text[]) AS cities_filter,
            $3::timestamp AS from_date,
            $4::timestamp AS to_date
        )
        SELECT 
          d.id,
          d.title,
          d."uploadDate",
          d."viewCount",
          d."downloadCount",
          d."favoriteCount",
          d.cities,
          d.keywords,
          ts_headline(
            'italian', 
            COALESCE(d.content, ''), 
            websearch_to_tsquery('italian', unaccent(q.search_term)),
            'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,ShortWord=2,MaxWords=25,MinWords=10'
          ) AS snippet,
          similarity(d.title, q.search_term) AS rank_score
        FROM documents d, q
        WHERE similarity(d.title, q.search_term) > 0.3
          AND (CARDINALITY(q.cities_filter) = 0 OR d.cities && q.cities_filter)
          AND (q.from_date IS NULL OR d."uploadDate" >= q.from_date)
          AND (q.to_date IS NULL OR d."uploadDate" <= q.to_date)
        ORDER BY similarity(d.title, q.search_term) DESC, d."uploadDate" DESC
        LIMIT $5;
      `;
            }
            else {
                // Query ottimizzata con PostgreSQL FTS usando colonna tsv
                sql = `
        WITH q AS (
          SELECT
            websearch_to_tsquery('italian', unaccent($1)) AS tsq,
            COALESCE($2::text[], ARRAY[]::text[]) AS cities_filter,
            $3::timestamp AS from_date,
            $4::timestamp AS to_date
        )
        SELECT 
          d.id,
          d.title,
          d."uploadDate",
          d."viewCount",
          d."downloadCount",
          d."favoriteCount",
          d.cities,
          d.keywords,
          ts_headline(
            'italian', 
            COALESCE(d.content, ''), 
            q.tsq,
            'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,ShortWord=2,MaxWords=25,MinWords=10'
          ) AS snippet,
          ts_rank_cd(d.tsv, q.tsq) AS rank_score
        FROM documents d, q
        WHERE d.tsv @@ q.tsq
          AND (CARDINALITY(q.cities_filter) = 0 OR d.cities && q.cities_filter)
          AND (q.from_date IS NULL OR d."uploadDate" >= q.from_date)
          AND (q.to_date IS NULL OR d."uploadDate" <= q.to_date)
          ${cursor ? `AND (ts_rank_cd(d.tsv, q.tsq), d.id) < ($6::float, $7::text)` : ''}
        ORDER BY 
          (ts_rank_cd(d.tsv, q.tsq) * 0.7) + 
          (EXTRACT(EPOCH FROM d."uploadDate") / 1e10 * 0.3) DESC,
          d.id DESC
        LIMIT $5;
      `;
            }
            const params_array = [
                q,
                cities || null,
                from || null,
                to || null,
                pageSize,
                (cursor === null || cursor === void 0 ? void 0 : cursor.rank) || null,
                (cursor === null || cursor === void 0 ? void 0 : cursor.id) || null
            ].filter((_, i) => cursor || i < 5);
            console.log(`[SEARCH] Query: "${q}", Cities: ${(cities === null || cities === void 0 ? void 0 : cities.length) || 0}, Params: ${params_array.length}`);
            const rows = yield prisma.$queryRawUnsafe(sql, ...params_array);
            const nextCursor = rows.length === pageSize && rows[rows.length - 1]
                ? {
                    rank: rows[rows.length - 1].rank_score,
                    id: rows[rows.length - 1].id
                }
                : null;
            const queryTime = Date.now() - startTime;
            const result = {
                items: rows.map(row => ({
                    id: row.id,
                    title: row.title,
                    uploadDate: row.uploadDate,
                    viewCount: row.viewCount,
                    downloadCount: row.downloadCount,
                    favoriteCount: row.favoriteCount,
                    cities: row.cities,
                    keywords: row.keywords,
                    content: row.snippet
                })),
                nextCursor,
                queryTime,
                total: rows.length // Approssimazione per performance
            };
            // Cache risultato
            cache.set(key, result);
            console.log(`[SEARCH COMPLETE] Query: "${q}" - ${rows.length} results in ${queryTime}ms`);
            return result;
        }
        catch (error) {
            console.error(`[SEARCH ERROR] Query: "${q}"`, error);
            // Fallback: ricerca semplice
            const fallbackRows = yield prisma.document.findMany({
                where: Object.assign({ OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { content: { contains: q, mode: 'insensitive' } }
                    ] }, (cities && cities.length > 0 ? {
                    cities: { hasSome: cities }
                } : {})),
                select: {
                    id: true,
                    title: true,
                    uploadDate: true,
                    viewCount: true,
                    downloadCount: true,
                    favoriteCount: true,
                    cities: true,
                    keywords: true
                },
                orderBy: { uploadDate: 'desc' },
                take: pageSize
            });
            const queryTime = Date.now() - startTime;
            return {
                items: fallbackRows.map(row => (Object.assign(Object.assign({}, row), { content: `${row.title}...` }))),
                nextCursor: null,
                queryTime,
                total: fallbackRows.length
            };
        }
    });
}
// Funzione per pre-scaldare cache con query popolari
function warmUpCache() {
    return __awaiter(this, void 0, void 0, function* () {
        const popularQueries = [
            'sentenza tribunale',
            'decreto ingiuntivo',
            'ricorso cassazione',
            'ordinanza',
            'appello'
        ];
        console.log('[CACHE WARMUP] Starting...');
        for (const query of popularQueries) {
            try {
                yield searchDocumentsOptimized({ q: query });
                console.log(`[CACHE WARMUP] Cached: ${query}`);
            }
            catch (error) {
                console.error(`[CACHE WARMUP ERROR] ${query}:`, error);
            }
        }
        console.log('[CACHE WARMUP] Complete');
    });
}
//# sourceMappingURL=searchService.js.map