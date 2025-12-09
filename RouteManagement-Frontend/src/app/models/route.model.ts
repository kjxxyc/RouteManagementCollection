export interface Route {
  id: number;
  name: string;
  description: string;
  date: Date | string;
  status: string;
  isPublished: boolean;
  publishedAt?: Date | string;
  createdAt: Date | string;
}

export interface CreateRouteRequest {
  name: string;
  description: string;
  date: Date | string;
}

export interface UpdateRouteRequest {
  name?: string;
  description?: string;
  date?: Date | string;
}

export interface ChangeRouteStatusRequest {
  status: string;
}
