'use strict';

const request = require('superagent');
// eslint-disable-next-line
const debug = require('debug')('neo4j-backup-agent/get-neo4j-slaves');

module.exports = getSlaves;

/**
 * Find the neo4j slaves
 * @param {Object} hostObjects
 * @param hostObjects[idx].url - url to neo4j host
 */
async function getSlaves (hostObjects) {
  const promises = hostObjects.map((hostObj) => {
    let url = hostObj.url + '/db/manage/server/ha/available';
    return request.get(url);
  });
  let responses;
  try {
    responses = await Promise.all(promises);
  } catch (e) {
    throw new Error(
      'Error at Promise.all: ' +
      e.toString() +
      ' statusCode: ' +
      e.status
    );
  }

  let slaves = responses.filter((res) => {
    return res.text === 'slave';
  });

  if (!slaves || slaves.length < 1) {
    throw new Error('No slaves found');
  }

  let hosts = slaves.map((res) => {
    return res.request.host;
  });
  debug('slaves', hosts);
  return hosts;
}

if (require.main === module) {
  (async () => {
    const config = require('config');
    try {
      let responses = await getSlaves(config.neo4j);
      console.log(responses[0]);
    } catch (e) {
      console.error(e.toString());
    }
  })();
}
