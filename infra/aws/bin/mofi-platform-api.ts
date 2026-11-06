#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MofiPlatformApiStack } from '../lib/mofi-platform-api-stack';

const app = new cdk.App();

const stage = app.node.tryGetContext('stage') ?? process.env.MOFI_STAGE ?? 'dev';
const account = process.env.CDK_DEFAULT_ACCOUNT;
/** Default deploy region (override with CDK_DEFAULT_REGION or `cdk deploy --region`). */
const region = process.env.CDK_DEFAULT_REGION ?? 'us-east-1';

new MofiPlatformApiStack(app, `MofiPlatformApi-${stage}`, {
  env: {
    region,
    ...(account ? { account } : {}),
  },
  stage,
  description: 'MOFI pilot ECS monolith — Fargate + ALB + ECR',
});
