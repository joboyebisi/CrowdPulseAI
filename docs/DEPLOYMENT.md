# Deployment record

## Web

- Provider: Vercel through the connected GitHub repository
- URL: `https://crowd-pulse-ai-delta.vercel.app`
- Source branch: `main`
- Durable integration revision: `c4d49c7`
- Production bootstrap revision: `5e5c369`
- Status: Ready

The production environment has the AWS backend URL and internal bootstrap secret. Its protected sync route transferred the existing server-side Twitch and Gemini configuration into AWS without exposing those values locally.

## AWS backend

- Account: `695912022574`
- Region: `eu-west-2`
- CloudFormation stack: `crowdpulse-backend`
- Stack status: `UPDATE_COMPLETE`
- API base URL: `https://e89itqb0ph.execute-api.eu-west-2.amazonaws.com`
- EventSub callback: `https://e89itqb0ph.execute-api.eu-west-2.amazonaws.com/eventsub`
- DynamoDB table: `crowdpulse-backend-CrowdPulseTable-3WLKMXIKWLO2`
- Creator index: `byCreator` (`ACTIVE`)
- KMS key ARN: `arn:aws:kms:eu-west-2:695912022574:key/08141e80-13f5-4e30-ad4c-4d2d239d85a8`
- EventSub secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:EventSubWebhookSecret-MfMuaznbcVnP-DZKfsf`
- Internal secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:InternalApiSecret-ZdpvXuXANpHW-aYcAoD`
- Integration secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:crowdpulse/integrations-fek9Lg`

These ARNs are identifiers, not secret values. Retrieve secret values only into process memory when required.

## Verified behavior

- CloudFormation completed its durable-backend update without rollback.
- The EventSub callback rejects unsigned requests and accepts correctly signed webhook verification.
- AWS contains the required Twitch client ID, Twitch client secret, Gemini API key, and Gemini model fields; verification did not display their values.
- The protected integration bootstrap rejects unauthenticated requests with HTTP 401.
- A production smoke test passed Match Room create, creator list, public read, supporter join, and opening brief operations.
- Smoke-test records were removed from DynamoDB.
- The Vercel session endpoint reports Twitch configured and Gemini active.

## Operational commands

```powershell
aws login --profile crowdpulse --region eu-west-2
aws sts get-caller-identity --profile crowdpulse --region eu-west-2
aws cloudformation describe-stacks --stack-name crowdpulse-backend --profile crowdpulse --region eu-west-2
```

AWS SAM CLI 1.171.0 is installed at `C:\Users\joboy\AppData\Local\Programs\Amazon\AWSSAMCLI\bin\sam.cmd`.

## Remaining live proof

The streamer must complete **Connect Twitch** in the production browser. Twitch user consent cannot be performed by an unattended deployment process. After consent, confirm the creator profile is connected, generate hype with distinct viewers, approve the captured Moment, and verify its public page before recording the demo.

Use a least-privilege deployment role for future maintenance instead of the root identity used for initial bootstrap.
