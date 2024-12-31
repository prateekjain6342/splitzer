import boto3
from botocore.client import Config
import os
import hashlib

# ACCOUNT_ID = os.environ.get('R2_ACCOUNT_ID')
# ACCESS_KEY_ID = os.environ.get('R2_ACCESS_KEY_ID')
# SECRET_ACCESS_KEY = os.environ.get('R2_SECRET_ACCESS_KEY')
# BUCKET_NAME = os.environ.get('R2_BUCKET_NAME')



ACCOUNT_ID = ""
ACCESS_KEY_ID = ""
SECRET_ACCESS_KEY = ""
BUCKET_NAME = ""
hashed_secret_key = hashlib.sha256(SECRET_ACCESS_KEY.encode()).hexdigest()

s3_client = boto3.client('s3',
    endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=ACCESS_KEY_ID,
    aws_secret_access_key=hashed_secret_key,
    config=Config(signature_version='s3v4')
)

def get_r2_object(object_key):
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=object_key)
    print(response)
    print('Successfully fetched the object')

    # Process the response content as needed
    # For example, to read the content:
    # object_content = response['Body'].read()

    # Or to save the file:
    # with open('ingested_0001.parquet', 'wb') as f:
    #     f.write(response['Body'].read())

def create_r2_object(object_key):
    response = s3_client
