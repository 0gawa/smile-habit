#!/bin/bash
set -e

if [ -f /app/tmp/pids/server.pid ]; then
  rm /app/tmp/pids/server.pid
fi

# DockerfileのCMDで渡されたコマンドを実行
exec "$@"
