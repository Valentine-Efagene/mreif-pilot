import { InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda';

export default class LambdaInvoker {
  public static invoke = async (
    funcName: string,
    region: string,
    payload: any,
  ) => {
    const client = new LambdaClient({ region });
    const command = new InvokeCommand({
      FunctionName: funcName,
      Payload: JSON.stringify(payload),
      LogType: LogType.Tail,
    });

    const { Payload, LogResult } = await client.send(command);
    const result = Buffer.from(Payload).toString();
    const logs = Buffer.from(LogResult, 'base64').toString();
    return { logs, result };
  };
}
