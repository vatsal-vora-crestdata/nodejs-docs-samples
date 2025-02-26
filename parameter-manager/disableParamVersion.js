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
 * Disables a specific version of a global parameter in Google Cloud Parameter Manager.
 * This function demonstrates how to disable a global parameter version by setting
 * its 'disabled' field to true using the Parameter Manager client library.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} parameterId - The ID of the parameter for which version is to be disabled.
 * @param {string} versionId - The version ID of the parameter to be disabled.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  versionId = 'v1'
) {
  // [START parametermanager_disable_param_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const parameterId = 'my-parameter';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function disableParamVersion() {
    // Construct the full resource name
    const name = client.parameterVersionPath(
      projectId,
      'global',
      parameterId,
      versionId
    );

    // Construct the request
    const request = {
      parameterVersion: {
        name: name,
        disabled: true,
      },
      updateMask: {
        paths: ['disabled'],
      },
    };

    // Make the API call to update the parameter version
    const [response] = await client.updateParameterVersion(request);

    console.log(
      `Disabled parameter version ${response.name} for parameter ${parameterId}`
    );
    return response;
  }

  await disableParamVersion();
  // [END parametermanager_disable_param_version]
}

// The command-line arguments are passed as an array to main().
const args = process.argv.slice(2);
main(...args).catch(console.error);
