// 后端 API
//    ↕
// src/api/bookmarkApi.ts       ← 第1层：负责"和后端说话"
//    ↕
// src/components/bookmark/     ← 第2层：负责"显示和交互"
//    ↕
// src/layouts/SideBar.tsx      ← 第3层：负责"把组件放到页面上"
// 每个业务模块的 API 调用单独一个文件，涉及到 Bookmark 模块的 API 调用，统一通过 src/api/bookmarkApi.ts 进行调用

import axiosClient from './axiosClient';

// 后端发给前端的完整数据
// 后端同学请注意：如果 poi 相关的字段有不需要的，可以在群文档中留言。
export interface Bookmark {
  bookmarkId: string;
  poiId: string;
  googlePlacesId: string;
  poiName: string;
  poiAddress: string;
  poiLatitude: number;
  poiLongitude: number;
  categoryId?: number;
}

// 前端 Post 请求时发给后端的完整数据
// 这里没有 poiId 是因为 poiId 是后端自动生成的，前端不知道。
export interface CreateBookmarkRequest {
  googlePlacesId: string;
  categoryId?: number;
}

export const getBookmarks = (): Promise<Bookmark[]> => {
  return axiosClient.get('/bookmarks');
};

export const createBookmark = (request: CreateBookmarkRequest): Promise<Bookmark> => {
  return axiosClient.post('/bookmarks', request);
};

export const deleteBookmark = (bookmarkId: string): Promise<void> => {
  return axiosClient.delete(`/bookmarks/${bookmarkId}`);
};
