// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const cp = require('child_process');
const {v4: uuidv4} = require('uuid');

const {ParameterManagerClient} = require('@google-cloud/parametermanager');
const client = new ParameterManagerClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {};
options.apiEndpoint = `parametermanager.${locationId}.rep.googleapis.com`;

const regionalClient = new ParameterManagerClient(options);

const {KeyManagementServiceClient} = require('@google-cloud/kms');
const kmsClient = new KeyManagementServiceClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const parameterId = `test-parameter-${uuidv4()}`;
const regionalParameterId = `test-regional-${uuidv4()}`;

const keyRingId = 'node-test-kms-key';
const keyId = `test-parameter-${uuidv4()}`;
const keyId1 = `test-parameter-${uuidv4()}`;

let parameter;
let regionalParameter;

const keyRing = `projects/${projectId}/locations/global/keyRings/${keyRingId}`;
const kmsKey = `projects/${projectId}/locations/global/keyRings/${keyRingId}/cryptoKeys/${keyId}`;
const kmsKey1 = `projects/${projectId}/locations/global/keyRings/${keyRingId}/cryptoKeys/${keyId1}`;

const regionalKeyRing = `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}`;
const regionalKmsKey = `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${keyId}`;
const regionalKmsKey1 = `projects/${projectId}/locations/${locationId}/keyRings/${keyRingId}/cryptoKeys/${keyId1}`;

describe('Parameter Manager samples', () => {
  const parametersToDelete = [];
  const regionalParametersToDelete = [];

  before(async () => {
    projectId = await client.getProjectId();

    // Create a test global parameter
    [parameter] = await client.createParameter({
      parent: `projects/${projectId}/locations/global`,
      parameterId: parameterId,
      parameter: {
        format: 'JSON',
      },
    });
    parametersToDelete.push(parameter);

    // Create a test regional parameter
    [regionalParameter] = await regionalClient.createParameter({
      parent: `projects/${projectId}/locations/${locationId}`,
      parameterId: regionalParameterId,
      parameter: {
        format: 'JSON',
      },
    });
    regionalParametersToDelete.push(regionalParameter);

    try {
      await client.getKeyRing({name: keyRing});
    } catch (error) {
      if (error.code === 5) {
        await kmsClient.createKeyRing({
          parent: kmsClient.locationPath(projectId, 'global'),
          keyRingId: keyRingId,
        });
      }
    }

    try {
      await client.getKeyRing({name: regionalKeyRing});
    } catch (error) {
      if (error.code === 5) {
        await kmsClient.createKeyRing({
          parent: kmsClient.locationPath(projectId, locationId),
          keyRingId: keyRingId,
        });
      }
    }

    try {
      await client.getCryptoKey({name: kmsKey});
    } catch (error) {
      if (error.code === 5) {
        await kmsClient.createCryptoKey({
          parent: kmsClient.keyRingPath(projectId, 'global', keyRingId),
          cryptoKeyId: keyId,
          cryptoKey: {
            purpose: 'ASYMMETRIC_DECRYPT',
            versionTemplate: {
              algorithm: 'RSA_DECRYPT_OAEP_2048_SHA256',
            },
          },
        });
      }
    }

    try {
      await client.getCryptoKey({name: regionalKmsKey});
    } catch (error) {
      if (error.code === 5) {
        await kmsClient.createCryptoKey({
          parent: kmsClient.keyRingPath(projectId, locationId, keyRingId),
          cryptoKeyId: keyId,
          cryptoKey: {
            purpose: 'ASYMMETRIC_DECRYPT',
            versionTemplate: {
              algorithm: 'RSA_DECRYPT_OAEP_2048_SHA256',
            },
          },
        });
      }
    }

    try {
      await client.getCryptoKey({name: kmsKey1});
    } catch (error) {
      if (error.code === 5) {
        await kmsClient.createCryptoKey({
          parent: kmsClient.keyRingPath(projectId, 'global', keyRingId),
          cryptoKeyId: keyId1,
          cryptoKey: {
            purpose: 'ASYMMETRIC_DECRYPT',
            versionTemplate: {
              algorithm: 'RSA_DECRYPT_OAEP_2048_SHA256',
            },
          },
        });
      }
    }

    try {
      await client.getCryptoKey({name: regionalKmsKey1});
    } catch (error) {
      if (error.code === 5) {
        await kmsClient.createCryptoKey({
          parent: kmsClient.keyRingPath(projectId, kmsKey1, keyRingId),
          cryptoKeyId: keyId1,
          cryptoKey: {
            purpose: 'ASYMMETRIC_DECRYPT',
            versionTemplate: {
              algorithm: 'RSA_DECRYPT_OAEP_2048_SHA256',
            },
          },
        });
      }
    }
  });

  after(async () => {
    // Clean up
    parametersToDelete.forEach(async parameterName => {
      await client.deleteParameter({name: parameterName});
    });

    regionalParametersToDelete.forEach(async regionalParameterName => {
      await regionalClient.deleteParameter({name: regionalParameterName});
    });

    try {
      await kmsClient.destroyCryptoKeyVersion({
        name: `${kmsKey}/cryptoKeyVersions/1`,
      });
    } catch (error) {
      if (error.code === 5) {
        console.info(`Already destroyed: ${error.message}`);
      }
    }

    try {
      await kmsClient.destroyCryptoKeyVersion({
        name: `${kmsKey1}/cryptoKeyVersions/1`,
      });
    } catch (error) {
      if (error.code === 5) {
        console.error(`Already destroyed: ${error.message}`);
      }
    }

    try {
      await kmsClient.destroyCryptoKeyVersion({
        name: `${regionalKmsKey}/cryptoKeyVersions/1`,
      });
    } catch (error) {
      if (error.code === 5) {
        console.error(`Already destroyed: ${error.message}`);
      }
    }

    try {
      await kmsClient.destroyCryptoKeyVersion({
        name: `${regionalKmsKey1}/cryptoKeyVersions/1`,
      });
    } catch (error) {
      if (error.code === 5) {
        console.error(`Already destroyed: ${error.message}`);
      }
    }
  });

  it('should create a parameter with kms_key', async () => {
    const output = execSync(
      `node createParamWithKmsKey.js ${projectId} ${parameterId}-1 ${kmsKey}`
    );
    parametersToDelete.push(`${parameterId}-1`);
    assert.include(
      output,
      `Created parameter projects/${projectId}/locations/global/parameters/${parameterId}-1 with kms_key ${kmsKey}`
    );
  });

  it('should create a regional parameter with kms_key', async () => {
    const output = execSync(
      `node regional_samples/createRegionalParamWithKmsKey.js ${projectId} ${locationId} ${regionalParameterId}-1 ${regionalKmsKey}`
    );
    regionalParametersToDelete.push(`${regionalParameterId}-1`);
    assert.include(
      output,
      `Created regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-1 with kms_key ${regionalKmsKey}`
    );
  });

  it('should update a parameter with kms_key', async () => {
    const output = execSync(
      `node updateParamKmsKey.js ${projectId} ${parameterId} ${kmsKey}`
    );
    parametersToDelete.push(`${parameterId}`);
    assert.include(
      output,
      `Updated parameter projects/${projectId}/locations/global/parameters/${parameterId} with kms_key ${kmsKey}`
    );
  });

  it('should update a regional parameter with kms_key', async () => {
    const output = execSync(
      `node regional_samples/updateRegionalParamKmsKey.js ${projectId} ${locationId} ${regionalParameterId} ${regionalKmsKey}`
    );
    regionalParametersToDelete.push(`${regionalParameterId}`);
    assert.include(
      output,
      `Updated regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId} with kms_key ${regionalKmsKey}`
    );
  });

  it('should remove a kms_key for parameter', async () => {
    const output = execSync(
      `node removeParamKmsKey.js ${projectId} ${parameterId} ${kmsKey}`
    );
    parametersToDelete.push(`${parameterId}`);
    assert.include(
      output,
      `Removed kms_key for parameter projects/${projectId}/locations/global/parameters/${parameterId}`
    );
  });

  it('should remove a kms_key for regional parameter', async () => {
    const output = execSync(
      `node regional_samples/removeRegionalParamKmsKey.js ${projectId} ${locationId} ${regionalParameterId} ${regionalKmsKey}`
    );
    regionalParametersToDelete.push(`${regionalParameterId}`);
    assert.include(
      output,
      `Removed kms_key for regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}`
    );
  });
});
