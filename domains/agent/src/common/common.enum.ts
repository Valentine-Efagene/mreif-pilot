export enum DocumentStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

export enum S3Folder {
  AVATAR = 'developer/avatar',
  LOGO = 'developer/logo',
  DOCUMENT = 'developer/document',
}

export enum DocumentModule {
  DEVELOPER = 'DEVELOPER',
  DEVELOPER_DIRECTOR = 'DEVELOPER_DIRECTOR',
  PROPOSED_DEVELOPMENT = 'PROPOSED_DEVELOPMENT',
}

export enum AxiosErrorCode {
  ECONNREFUSED = "ECONNREFUSED",
}

export enum ResponseMessage {
  CREATED = 'Created Successfully',
  UPDATED = 'Updated Successfully',
  DELETED = 'Deleted Successfully',
  FETCHED = 'Fetched Successfully',
  AUTHENTICATED = 'Authenticated Successfully',
}

export enum ErrorMessage {
  NO_COMMENT_DECLINE = 'A comment is required to decline',
  NO_REASON_DECLINE = 'Please provide a reason for declining',
}
