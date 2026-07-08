/**
 * parsePagination
 * Reads page/limit query params with sane defaults and caps, so no endpoint
 * can be made to return an unbounded result set.
 */
export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

export function paginatedResponse({ data, page, limit, totalCount }) {
    return {
        success: true,
        data,
        page,
        limit,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    };
}
