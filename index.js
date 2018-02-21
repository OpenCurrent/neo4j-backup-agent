'use strict';

const config = require('config');
const getSlaves = require('./lib/get-neo4j-slaves.js');
const createSnapshot = require('./lib/create-snapshot.js');
// eslint-disable-next-line
const debug = require('debug')('neo4j-backup-agent');

// Ensure backupFreq isn't too frequent.
if (!config.timers || config.timers.backupFreq <= 60000) {
  var msg = (
    'Configured backupFreq is too small!',
    'backFreq must be 60000 ms or greater.'
  );
  throw new Error(msg);
}

// kick-off the first invocation!
main(config.neo4j);

// successive invocations of main happen on configured interval
setInterval(main, config.timers.backupFreq, config.neo4j);

async function main (hostObjects) {
  try {
    // get the list of available slaves
    let slaves = await getSlaves(hostObjects);

    // pick the first slave
    let instanceName = slaves[0].split('.')[0];

    let params = {
      instanceName: instanceName,
      deviceName: config.deviceName,
      snapshotName: 'neo4j-snapshot-' + new Date().getTime()
    };

    // signs of life!
    console.log(
      new Date().toISOString(),
      'creating snapshot with params:',
      JSON.stringify(params, null, 2)
    );

    // create the snapshot
    let a = await createSnapshot(params);
    console.log('snapshot id', a[2].id);
  } catch (e) {
    console.error(e.toString());
  }
}
