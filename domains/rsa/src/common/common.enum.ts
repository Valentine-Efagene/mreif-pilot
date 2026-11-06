export enum DocumentStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

export enum S3Folder {
  LOGO = 'rsa/logo',
  DOCUMENT = 'rsa/document',
}

export enum ResponseMessage {
  CREATED = "Created Successfully",
  UPDATED = "Updated Successfully",
  DELETED = "Deleted Successfully",
  FETCHED = "Fetched Successfully",
  AUTHENTICATED = "Authenticated Successfully",
}

export enum MySqlErrorCodes {
  ER_DUP_ENTRY = 'ER_DUP_ENTRY', // Duplicate entry error
  ER_NO_REFERENCED_ROW_2 = 'ER_NO_REFERENCED_ROW_2', // Bad foreign key
  ER_BAD_DB_ERROR = 'ER_BAD_DB_ERROR', // Unknown database
  ER_BAD_FIELD_ERROR = 'ER_BAD_FIELD_ERROR', // Unknown column in field list
  ER_PARSE_ERROR = 'ER_PARSE_ERROR', // Syntax error or access violation
  ER_NO_DB_ERROR = 'ER_NO_DB_ERROR', // No database selected
  ER_TABLE_EXISTS_ERROR = 'ER_TABLE_EXISTS_ERROR', // Table already exists
  ER_NO_SUCH_TABLE = 'ER_NO_SUCH_TABLE', // Table doesn't exist
  ER_LOCK_WAIT_TIMEOUT = 'ER_LOCK_WAIT_TIMEOUT', // Lock wait timeout exceeded
  ER_DATA_TOO_LONG = 'ER_DATA_TOO_LONG', // Data too long for column
  ER_WRONG_VALUE_COUNT_ON_ROW = 'ER_WRONG_VALUE_COUNT_ON_ROW', // Column count doesn't match value count
  ER_ACCESS_DENIED_ERROR = 'ER_ACCESS_DENIED_ERROR', // Access denied for user
  ER_ROW_IS_REFERENCED = 'ER_ROW_IS_REFERENCED', // Cannot delete or update parent row: foreign key constraint fails
  ER_NO_REFERENCED_ROW = 'ER_NO_REFERENCED_ROW', // Cannot add or update a child row: foreign key constraint fails
  ER_DUP_KEY = 'ER_DUP_KEY', // Duplicate key on write or update
  ER_SP_DOES_NOT_EXIST = 'ER_SP_DOES_NOT_EXIST', // Stored procedure does not exist
  ER_CANNOT_ADD_FOREIGN = 'ER_CANNOT_ADD_FOREIGN', // Cannot add foreign key constraint
  ER_TOO_MANY_FIELDS = 'ER_TOO_MANY_FIELDS', // Too many columns
  ER_TRUNCATED_WRONG_VALUE = 'ER_TRUNCATED_WRONG_VALUE', // Truncated incorrect value
  ER_QUERY_INTERRUPTED = 'ER_QUERY_INTERRUPTED', // Query execution was interrupted
  ER_LOCK_DEADLOCK = 'ER_LOCK_DEADLOCK', // Deadlock found when trying to get lock
}

export enum ErrorMessage {
  NO_COMMENT_DECLINE = 'A comment is required to decline',
  DUPLICATE_RSA = 'You have an ongoing RSA Withdrawal Application',
  DOCUMENTS_NOT_APPROVED = 'Please ensure all documents have been approved',
  MISSING_PARENT_MORTGAGE = 'This mortgage does not exist',
}

export enum AxiosErrorCode {
  ECONNREFUSED = "ECONNREFUSED",
}