/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('node:assert/strict');
const uuid = require('uuid');
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const computeLib = require('@google-cloud/compute');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

async function deleteDisk(projectId, region, diskName) {
  const disksClient = new computeLib.RegionDisksClient();
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  const [response] = await disksClient.delete({
    project: projectId,
    disk: diskName,
    region,
  });
  let operation = response.latestResponse;

  console.log(`Deleting ${diskName}`);

  // Wait for the delete operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await regionOperationsClient.wait({
      operation: operation.name,
      project: projectId,
      region,
    });
  }
}

describe('Create compute regional replicated disk', async () => {
  const diskName = `replicated-disk-${uuid.v4()}`;
  const vmName1 = `vm1-with-replicated-disk-${uuid.v4()}`;
  const vmName2 = `vm2-with-replicated-disk-${uuid.v4()}`;
  const region = 'europe-central2';
  const zone1 = 'europe-central2-a';
  const zone2 = 'europe-central2-b';
  let projectId;

  before(async () => {
    const instancesClient = new computeLib.InstancesClient();
    projectId = await instancesClient.getProjectId();
  });

  after(async () => {
    // Cleanup resources
    [vmName1, vmName2].forEach(vm => {
      execSync(`node ./deleteInstance.js ${projectId} ${zone1} ${vm}`, {
        cwd,
      });
    });
    await deleteDisk(projectId, region, diskName);
  });

  it('should create a regional replicated disk', () => {
    const response = execSync(
      `node ./disks/createRegionalReplicatedDisk.js ${diskName} ${region} ${zone1} ${zone2}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Regional replicated disk: ${diskName} created.`));
  });

  it('should attach replicated disk to vm', () => {
    // Create VM, where replicated disk will be attached.
    execSync(
      `node ./createInstance.js ${projectId} ${zone1} ${vmName1} e2-small`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./disks/attachRegionalDisk.js ${diskName} ${region} ${vmName1} ${zone1}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Replicated disk: ${diskName} attached to VM: ${vmName1}.`
      )
    );
  });

  it('should force replicated disk to be attached to vm', () => {
    // Create VM, where replicated disk will be attached.
    execSync(
      `node ./createInstance.js ${projectId} ${zone1} ${vmName2} e2-small`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./disks/attachRegionalDiskForce.js ${diskName} ${region} ${vmName2} ${zone1}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Replicated disk: ${diskName} was forced to be attached to VM: ${vmName2}.`
      )
    );
  });
});
