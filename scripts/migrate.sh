#!/bin/sh

while

  res=$(curl -X POST localhost:8080/admin/schema --data-binary '@graphql/schema.graphql' 2>/dev/null | grep 'Success')

  [ -z "$res" ]
do :; done
