export interface ISmilerResponse {
  signature: string;
  timestamp: string;
  JSONVersion: string;
  SmileJobID: string;
  PartnerParams: {
    user_id: string;
    job_id: string;
    job_type: number;
  };
  ResultType: string;
  ResultText: string;
  ResultCode: string;
  IsFinalResult: string;
  Actions: {
    Verify_Business: string;
    Return_Business_Info: string;
  };
  company_information: {
    company_type: string;
    country: string;
    address: string;
    registration_number: string;
    search_number: string;
    authorized_shared_capital: string;
    industry: string;
    tax_id: string;
    registration_date: string;
    phone: string;
    legal_name: string;
    state: string;
    email: string;
    status: string;
  };
  fiduciaries: [
    {
      name: string;
      fiduciary_type: string;
      address: string;
      registration_number: string;
      status: string;
    },
  ];
  beneficial_owners: [
    {
      shareholdings: string;
      address: string;
      gender: string;
      nationality: string;
      registration_number: string;
      name: string;
      shareholder_type: string;
      phone_number: string;
    },
    {
      shareholdings: string;
      address: string;
      gender: string;
      nationality: string;
      registration_number: string;
      name: string;
      shareholder_type: string;
      phone_number: string;
    },
  ];
  proprietors: Array<string>;
  documents: {
    search_certificate: string;
  };
  directors: [
    {
      shareholdings: string;
      id_number: string;
      address: string;
      occupation: string;
      gender: string;
      nationality: string;
      date_of_birth: string;
      name: string;
      id_type: string;
      phone_number: string;
    },
    {
      shareholdings: string;
      id_number: string;
      address: string;
      occupation: string;
      gender: string;
      nationality: string;
      date_of_birth: string;
      name: string;
      id_type: string;
      phone_number: string;
    },
  ];
  success: boolean;
}
