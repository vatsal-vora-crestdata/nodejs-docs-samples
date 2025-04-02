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

/**
 * Updates a regional parameter with kms_key using the Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is to be updated.
 * @param {string} locationId - The ID of the region where parameter is to be updated.
 * @param {string} parameterId - The ID of the parameter to update. This ID must be unique within the project.
 * @param {string} kmsKey - The ID of the KMS key to be used for encryption.
 */
async function main(
  projectId = 'my-project',
  locationId = 'us-central1',
  parameterId = 'my-parameter',
  kmsKey = 'projects/my-project/locations/us-central1/keyRings/my-key-ring/cryptoKeys/my-encryption-key'
) {
  // [START parametermanager_update_regional_param_kms_key]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const locationId = 'YOUR_LOCATION_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const kmsKey = 'YOUR_KMS_KEY'

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function updateRegionalParamKmsKey() {
    const name = client.parameterPath(projectId, locationId, parameterId);
    const request = {
      parameter: {
        name: name,
        kmsKey: kmsKey,
      },
      updateMask: {
        paths: ['kms_key'],
      },
    };

    const [parameter] = await client.updateParameter(request);
    console.log(
      `Updated regional parameter ${parameter.name} with kms_key ${parameter.kmsKey}`
    );
  }

  await updateRegionalParamKmsKey();
  // [END parametermanager_update_regional_param_kms_key]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
