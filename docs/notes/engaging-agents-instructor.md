# Engaging agent memo: instructor validation

The student memo creates `agent-shell`, a Bash script that opens an Apptainer
shell. It accepts an optional project folder and otherwise uses the current
folder. It resolves the path and derives a separate persistent agent home
from that path. New or moved projects require installation and login again.
The source in `scripts/agent-shell` must match the memo's embedded script.

The memo was edited and rendered on macOS. Before distributing it, pilot the
complete procedure on Engaging through both SSH and OnDemand:

1. Confirm the Apptainer module and image download work. Record the image
   digest and installed agent versions for reproducibility.
2. Check that `--home` with `--containall` preserves installations and logins
   in the specified agent-home directory. Test all three subscription flows.
3. Inspect `/proc/self/mountinfo` inside the container. Confirm no other
   personal/shared-data directories or host execution interfaces are mounted.
4. Create disposable files outside the shared directories. Confirm the
   container cannot read or write them, including through a symlink in the
   project, and can write project files. Use harmless test files, not secrets.
5. Confirm a failed container launch never starts an agent on the host.
6. Test a first agent task, leaving the container, host-side Git operations,
   and reopening the container from a new login session.

The boundary covers local file access, with system metadata exceptions.
Networking remains enabled. Agent credentials and the project, including
`.git`, are writable inside the container. Review generated code and Git
configuration/hooks before executing them outside it: host execution can
undo the protection of the container. This is not a boundary against remote
services, credential exfiltration, or container/kernel vulnerabilities.

Repeat validation after runtime or agent updates. Local shell syntax and
document rendering checks do not establish isolation on Engaging.
