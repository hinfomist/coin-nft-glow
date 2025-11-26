#!/bin/bash

# This script checks if the /admin route returns a 200 status code.
# It assumes the application is running on localhost:8080.

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/admin)

if [ "$STATUS_CODE" -eq 200 ]; then
  echo "✅ /admin route test passed!"
else
  echo "❌ /admin route test failed. Status code: $STATUS_CODE"
fi
