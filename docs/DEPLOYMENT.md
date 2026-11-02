# Deployment record

## Web

- Provider: Vercel through the connected GitHub repository
- URL: `https://crowd-pulse-ai-delta.vercel.app`
- Source branch: `main`
- Verified revision: `58b6c86`

## AWS backend foundation

- Account: `695912022574`
- Region: `eu-west-2`
- CloudFormation stack: `crowdpulse-backend`
- Stack status: `CREATE_COMPLETE`
- EventSub callback: `https://e89itqb0ph.execute-api.eu-west-2.amazonaws.com/eventsub`
- DynamoDB table: `crowdpulse-backend-CrowdPulseTable-3WLKMXIKWLO2`
- Secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:EventSubWebhookSecret-MfMuaznbcVnP-DZKfsf`

The secret ARN is an identifier, not the secret value. Retrieve the value only into process memory when creating or verifying Twitch EventSub subscriptions.

## Verified behavior

- CloudFormation completed without rollback.
- An unsigned webhook request returns HTTP 403.
- A correctly signed webhook verification request returns HTTP 200 and its challenge body.
- The public Vercel landing page returns HTTP 200 and contains the current match-day experience.

## Operational commands

```powershell
aws login --profile crowdpulse --region eu-west-2
aws sts get-caller-identity --profile crowdpulse --region eu-west-2
aws cloudformation describe-stacks --stack-name crowdpulse-backend --profile crowdpulse --region eu-west-2
```

AWS SAM CLI 1.171.0 is installed for the current Windows user. Future deployment work should use a least-privilege role rather than the root identity used for initial bootstrap.
