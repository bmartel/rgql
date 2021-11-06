#!/bin/sh

if [ ! -f "$PWD/.env" ]; then
  cp "$PWD/.env.example" "$PWD/.env"
fi
