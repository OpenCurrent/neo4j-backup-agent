## Neo4j Backup Agent

### Drive gcloud node.js client-lib to initiate disk snapshot on a schedule


### How it works

Sends an http request to neo4j endpoints as configured in config/\*.json
and will determine which host is a slave.  Disk Snapshot is initaited on
configured device on an available slave.

### Runbook


#### Build Steps

docker build .

