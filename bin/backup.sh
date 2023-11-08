#!/bin/bash

. $HOME/.bashrc
. .env
. .env.local

path=$HOME
now=$(date +%Y-%m-%d_%H.%M.%S)

backup() {
	mkdir -p ${path}/backups/${now}/mongo
	dump-mongo
	tar czfh ${path}/backups/${now}/www.tgz ${path}/www
	scp -r ${path}/backups/${now}/ profullstack:~/backups/
}

dump-mysql() {
 	mysqldump --all-databases --add-drop-table --single-transaction --set-gtid-purged=OFF --user=root -h 127.0.0.1 -P 33061 -psomewordpress > ${path}/backups/${now}/mysql/leeniesbluebay.sql
}

dump-mongo(){
	mongodump --host="localhost" --port=27017 -d avenasea --forceTableScan -o ${path}/backups/${now}/mongo/avenasea
	mongodump --host="localhost" --port=27017 -d grazily --forceTableScan -o ${path}/backups/${now}/mongo/grazily
}

backup
