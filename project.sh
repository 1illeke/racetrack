#!/bin/bash

pushd $(dirname $0)
urxvt -e vim $(find src/ -type f) -c "b main.js" &
sleep 0.2
export receptionist_key=r; export observer_key=o; export safety_key=s
urxvt -e bash -c 'echo src/main.js | entr -r npm run dev' &
popd
