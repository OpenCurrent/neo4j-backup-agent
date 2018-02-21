'use strict';
const Compute = require('@google-cloud/compute');
const compute = new Compute();

module.exports = createSnapshot;

/**
 * Create Snapshot of Google Compute Disk
 * @param {string} param.instanceName - Name of Compute Engine VM where disk is attached
 * @param {string} param.deviceName - Device Name of disk to snapshot
 */
async function createSnapshot ({instanceName, deviceName, snapshotName}) {
  let instances;

  try {
    instances = (await compute.getVMs()).pop();
  } catch (e) {
    console.error('Error while retrieving VM list:', e.toString());
  }

  if (!instances || instances.length < 1) {
    console.error('No VMs exist on the configured GCP project');
  }

  let targetHost = instances.filter((o) => {
    return o.name === instanceName;
  });

  if (!targetHost || targetHost.length < 1) {
    console.error('No neo4j hosts exist on the configured GCP project');
  }

  let diskSpec;
  try {
    diskSpec = targetHost[0]
      .metadata
      .disks
      .filter((o) => {
        return o.deviceName === deviceName;
      })[0].source;
  } catch (e) {
    console.error('Error while retrieving neo4j volume details:', e.toString());
  }
  diskSpec = diskSpec.split('/');
  let zoneName = diskSpec[8];
  let diskName = diskSpec[10];
  let zone = compute.zone(zoneName);
  let disk = zone.disk(diskName);
  let snapResponse = await disk.createSnapshot(snapshotName);

  return snapResponse;
}

if (require.main === module) {
  (async () => {
    let params = {
      instanceName: 'neo4j-node2',
      deviceName: 'neo4j0',
      snapshotName: 'neo4j-snapshot-' + new Date().getTime()
    };
    let a = await createSnapshot(params);
    console.log('snapshot id', a[2].id);
  })();
}
