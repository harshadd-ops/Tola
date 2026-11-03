"""CLI entrypoint for `python -m tola_api.seed`."""

from __future__ import annotations

from tola_api.seed.loader import main

if __name__ == "__main__":
    raise SystemExit(main())
