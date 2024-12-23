#!/bin/bash

code="$1"
language="$2"
timestamp=$(date +%s)

script_path=scripts/languages/$language.sh
timeout_time="3s"

setup_variables() {
  if [ -f "$script_path" ]; then
    source "$script_path"
  else
    echo "error unknown language $language" >&2
    exit 1
  fi
}

run() {
  docker exec $service bash -c "echo \"$code\" > temp/$filename"
  docker exec $service bash -c "timeout $timeout_time $command temp/$filename"

  if [ $? -eq 124 ]; then
    echo "TERMINATED, max execution time is $timeout_time"
  fi

  docker exec $service bash -c "rm temp/$filename"
}

setup_variables
run
