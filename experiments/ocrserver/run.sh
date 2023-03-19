#!/bin/bash
ulimit -m 100000

exec sudo python3 $@