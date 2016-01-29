#!/usr/bin/env python
import subprocess
import argparse
import os

def main():
    parser  = argparse.ArgumentParser()
    parser.add_argument("--output", "-o", help="The output location for the frames", required=True, default='.')
    parser.add_argument("--input", "-i", help="The video file to process", required=True)
    args = parser.parse_args()

    command = ["avconv", "-i", args.input, "-y","-f", "image2", os.path.join(args.output,"frame_%05d.jpg")]
    subprocess.call(command)



if __name__ == "__main__":
    main()

