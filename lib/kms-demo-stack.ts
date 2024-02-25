import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { CfnOutput } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';


export class KmsDemoStack  extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an AWS Lambda function
    const handler = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log("Received event:", JSON.stringify(event, null, 2));
          return {
            statusCode: 200,
            body: JSON.stringify('Hello from Joel!'),
          };
        };
      `),
      handler: 'index.handler',
    });

    // Create a KMS key
    const kmsKey = new kms.Key(this, 'MyKmsKey', {
      alias: 'my-kms-key',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Be cautious with this in a production environment.
    });

     // Create an S3 bucket with server-side encryption using the KMS key
     new s3.Bucket(this, 'MyBucket', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: kmsKey,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // This will delete the bucket when stack is deleted. Be careful with this in a production environment.
    });

    // Create the API Gateway with Lambda integration
    const api = new apigateway.RestApi(this, 'MyApi');

    const integration = new apigateway.LambdaIntegration(handler, {
      proxy: true,
      
      // encryptionKey: kmsKey, // Use the KMS key for server-side encryption
    });

    api.root.addMethod('GET', integration);

    new CfnOutput(this, 'KMS Key ID ', {
      value: kmsKey.keyId,
    });

    new CfnOutput(this, 'KMS Key Value', {
      value: kmsKey.keyArn,
    });
  }
  }

  
