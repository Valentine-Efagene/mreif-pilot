import { InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda';

export default class LambdaHelper {
  private static readonly getConfig = () => {
    return {
      credentials: {
        accessKeyId: process.env.aws_s3_access_key_id,
        secretAccessKey: process.env.aws_s3_secret_access_key,
      },
      region: process.env.aws_s3_region ?? "us-east-1",
    };
  }

  /**
   * https://docs.aws.amazon.com/lambda/latest/dg/example_lambda_Invoke_section.html
   * 
   * @param funcName 
   * @param payload 
   * @returns 
   */
  public static invokeFunc = async (funcName: string, payload: any) => {
    const client = new LambdaClient(this.getConfig());
    const command = new InvokeCommand({
      FunctionName: funcName,
      Payload: JSON.stringify(payload),
      LogType: LogType.Tail,
    });

    const { Payload, LogResult } = await client.send(command);
    const result = Buffer.from(Payload).toString();
    const logs = Buffer.from(LogResult, "base64").toString();
    return { result, logs };
  };
}
