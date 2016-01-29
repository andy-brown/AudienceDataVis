#!/usr/bin/env python
import subprocess
import argparse
import os

def main():
    parser  = argparse.ArgumentParser()
    parser.add_argument("--verbosity", "-v", help="Increase output verbosity", action="store_true")
    parser.add_argument("--input", "-i", help="The video file to process", required=True)
    parser.add_argument("--scaled", "-s", help="Scale the video to make a tiny version", required=False, action="store_true")
    parser.add_argument("--outputlocation", "-ol", help="The output location for the video file that has been processed", required=True)
    parser.add_argument("--compression", "-c", help="Set the compression of the output video. Note: quality is uniform. This only changes the speed at which the video can be processed and the output filesize (0=Lowest, 8=Highest)", default=0, type=int)
    #parser.add_argument("output", help="The output file")
    args = parser.parse_args()

    output_filename, extension = os.path.splitext(args.input)
    output_filename += '.mp4'
    output_filename = os.path.basename(output_filename)
    output_filename = os.path.join(args.outputlocation, output_filename)

    speeds = ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow']

    if args.scaled:
        convert_command = ["avconv", "-i", args.input,"-b:v", "300k", "-maxrate", "300k", "-minrate", "300k", "-bufsize", "1M" ,"-preset",speeds[args.compression] ,"-y", "-strict", "-2","-s","256x144", output_filename]
    else:
        convert_command = ["avconv", "-i", args.input,"-vf", "scale=iw*0.5:-1","-tune","fastdecode","-strict","experimental", output_filename]

    subprocess.call(convert_command)





if __name__ == "__main__":
    main()
