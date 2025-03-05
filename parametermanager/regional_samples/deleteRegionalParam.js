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
 * Deletes a parameter from the specified region of the specified
 * project using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} locationId - The ID of the region where parameter is located.
 * @param {string} parameterId - The ID of the parameter to delete.
 */
async function main(
  projectId = 'my-project',
  locationId = 'us-central1',
  parameterId = 'my-parameter'
) {
  // [START parametermanager_delete_regional_param]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const parameterId = 'my-parameter';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function deleteRegionalParam() {
    // Construct the fully qualified parameter name
    const name = client.parameterPath(projectId, locationId, parameterId);

    // Delete the parameter
    await client.deleteParameter({
      name: name,
    });

    console.log(`Deleted regional parameter: ${name}`);
  }

  await deleteRegionalParam();
  // [END parametermanager_delete_regional_param]
}

// The command-line arguments are passed as an array to main()
const args = process.argv.slice(2);
main(...args).catch(console.error);
