import { ApiResponse } from "@/types";

export const apiResponse = <D = unknown>(
  success: boolean,
  message: string,
  data?: D
): ApiResponse<D> => {
  return {
    success,
    message,
    data,
  };
};
