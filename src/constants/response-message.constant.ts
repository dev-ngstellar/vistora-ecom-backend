export const RESPONSE_MESSAGE = {
  HEALTH_CHECK_SUCCESS: 'Server health check passed successfully',
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Requested resource not found',
  BAD_REQUEST: 'Invalid request data provided',
  UNAUTHORIZED: 'Authentication required. Please log in',
  FORBIDDEN: 'You do not have permission to perform this action',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred on the server',
  VALIDATION_ERROR: 'Validation failed for the provided input',
} as const;

export type ResponseMessage = (typeof RESPONSE_MESSAGE)[keyof typeof RESPONSE_MESSAGE];
