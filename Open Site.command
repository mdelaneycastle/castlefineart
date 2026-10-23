#!/bin/bash
# Double-click to view the test site at http://localhost:8765 (Ctrl+C or close the window to stop)
cd "$(dirname "$0")"
lsof -ti tcp:8765 >/dev/null || (python3 -m http.server 8765 >/dev/null 2>&1 &)
sleep 1
open "http://localhost:8765/index.html"
echo "Castle Fine Art test site running at http://localhost:8765 — close this window to stop."
wait
