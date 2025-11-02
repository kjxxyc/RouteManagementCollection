export interface Password {
  id: number;
  routeId: number;
  capturedAt: Date | string;
}

export interface CapturePasswordRequest {
  routeId: number;
  passwordValue: string;
}
