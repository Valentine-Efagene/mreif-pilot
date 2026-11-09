export function createLambdaInvokeStub() {
  return {
    async invokeFunction(
      functionArn: string,
      payload: unknown,
    ): Promise<{ functionArn: string; payload: unknown }> {
      return { functionArn, payload };
    },
  };
}
