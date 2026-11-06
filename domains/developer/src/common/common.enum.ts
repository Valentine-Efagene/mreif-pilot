export enum DocumentStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

export enum ApprovalStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

export enum S3Folder {
  LOGO = 'developer/logo',
  DOCUMENT = 'developer/document',
}

export enum DocumentModule {
  DEVELOPER = 'DEVELOPER',
  DEVELOPER_DIRECTOR = 'DEVELOPER_DIRECTOR',
  PROPOSED_DEVELOPMENT = 'PROPOSED_DEVELOPMENT',
}

export enum ResponseMessage {
  CREATED = "Created Successfully",
  UPDATED = "Updated Successfully",
  DELETED = "Deleted Successfully",
  FETCHED = "Fetched Successfully",
}

export enum AxiosErrorCode {
  ECONNREFUSED = "ECONNREFUSED",
}

export enum ErrorMessage {
  NO_REASON_DECLINE = 'A reason is required to decline',
  NO_COMMENT_DECLINE = 'A comment is required to decline',
  DOCUMENTS_NOT_APPROVED = 'Please ensure all documents have been approved',
}