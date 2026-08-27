const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getPaginationParams = (input = {}) => {
  const page = Math.max(toInt(input.page, DEFAULT_PAGE), 1);
  const pageSize = Math.min(Math.max(toInt(input.pageSize, DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
};

export const createPaginationMeta = ({ page, pageSize, total }) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(Math.ceil(total / pageSize), 1),
});
