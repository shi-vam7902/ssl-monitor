import { GetListDto } from 'src/utils/common.dto';

export const paginationService = (query: GetListDto) => {
  const page: number = Number(query.page) * 1 || 1;
  const direction = query.sortDirection; // This must be ["DESC", "ASC"]
  const limit: number = Number(query.limit) * 1 || undefined;
  const skip: number = (page - 1) * limit || 0;

  let sort = {};
  if (query.sort) {
    sort[query.sort] = direction == '1' ? 'ASC' : 'DESC';
  } else {
    sort = { createdAt: 'DESC' };
  }
  return { limit, skip, sort };
};
