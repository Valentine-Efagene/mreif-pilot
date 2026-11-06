import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { BusinessType } from './verfier.dto';
import SmilerUtil from './util/SmilerUtil';

@Injectable()
export class VerifierService {
  async verifyRcn(rcNumber: string, businessType: BusinessType) {
    const apiUrl = process.env.smiler_url;
    const partnerId = process.env.smiler_partner_id;
    const smilerSignatureApiKey = process.env.smiler_signature_api_key;
    const smilerJobType = process.env.smiler_job_type;
    const smilerJobId = process.env.smiler_job_id;
    const smilerUserId = process.env.smiler_user_id;
    const timestamp = new Date().toISOString();

    const smilerSignature = SmilerUtil.generateSignature(
      smilerSignatureApiKey,
      partnerId,
      timestamp,
    );

    const payload = {
      source_sdk: 'rest_api',
      source_sdk_version: '1.0.0',
      country: 'NG',
      id_type: 'BUSINESS_REGISTRATION',
      id_number: rcNumber,
      business_type: businessType,
      signature: smilerSignature,
      timestamp,
      partner_id: partnerId,
      partner_params: {
        user_id: smilerUserId,
        job_id: smilerJobId,
        job_type: smilerJobType,
      },
    };

    try {
      const response = await axios.post(apiUrl, payload);
      return response?.data?.company_information?.legal_name;
    } catch (error) {
      throw new BadRequestException(`Smile Error: ${error.response.data.error}`);
    }
  }

  /*async verifyAccountNumberWithArn(accountNumber: string): Promise<any> {
    const accountNumberVerifierUrl = process.env.account_number_verifier_url;
    const apiArn = `${accountNumberVerifierUrl}`;
    const accountNumberVerifierRegion =
      process.env.account_number_verifier_region;

    const formData = new FormData();
    formData.append('account_number', accountNumber);

    const response = await LambdaInvoker.invoke(
      apiArn,
      accountNumberVerifierRegion,
      formData,
    );
    return response;
  }
  */
}
