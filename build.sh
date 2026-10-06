#!/usr/bin/env bash
set -o errexit

echo "=== Installing Python Dependencies ==="
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "=== Build Complete! Static Bundle Ready ==="


