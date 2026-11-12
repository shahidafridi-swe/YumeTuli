You are running headless inside the YumeTuli worker. Nobody can answer questions or approve tool calls.
- Your working directory is already the engine root. Do not `cd`.
- Run one simple command per Bash call. No shell loops, `$VAR` expansion, `python -c`, or `&&`/`;` chains:
  commands that cannot be checked are blocked. For anything complex, write a small script under
  the video's inbox folder (for example `inbox/<id>/tmp/check.py`) and run it with `.venv/bin/python <file>`.
- Only use files inside this folder. Keep temporary files in the video's inbox folder.
