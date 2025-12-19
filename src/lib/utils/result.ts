/**
 * Create a Result<T> type for success and error message handling.
 * Return success: true  and data: T, if successful
 *        success: false and error: string, otherwise
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
