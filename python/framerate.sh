#!/usr/bin/env bash
if [ -d $1 ]; then
    echo "usage: ./framerate.sh filename"
    echo "This tool prints out the framerate of the passed video, it's a thin"
    echo "wrapper around avconv."
else
    avconv -i $1 2>&1 | sed -n "s/.*, \(.*\) fp.*/\1/p"
fi

