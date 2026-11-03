# Tola eval harness (`tola_evals`)
> Owner: AI/voice lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Spec: [docs/04-ai/AI_EVALS.md](../../../../docs/04-ai/AI_EVALS.md) · Prompts: [../prompts/](../prompts/) · Data: [docs/04-ai/DATA_PIPELINE.md](../../../../docs/04-ai/DATA_PIPELINE.md)

This harness measures the AI parts of Tola: M-01 STT, M-03 agents, read-back intelligibility and red-team resistance. It runs in two modes:
- **replay** (default, ₹0, deterministic): recorded STT and Lyzr outputs from `fixtures/replay/`, keyed by input SHA-256;
- **live** (nightly or manual): calls Sarvam and Lyzr under a ₹ budget cap and re-records fixtures.

Gram arithmetic is **not** tested here. It is exact and lives in the `ledger-core` unit/property tests.

## Layout
```
implementation/scalable/ai/evals/
├─ README.md                  this file
├─ requirements.txt           numpy 2.5, jiwer 4.0, jsonschema 4.26, pydantic 2.14, pyyaml, sarvamai 0.1.37, lyzr-adk 0.1.12, pytest 9
├─ thresholds.yaml            MVP and v1 gates (copy of AI_EVALS §5)
├─ tola_evals/
│  ├─ __main__.py             CLI: generate | run | gate | fetch-audio | record
│  ├─ generate/
│  │  ├─ generator.yaml       field-norm parameters [S17] (DATA_PIPELINE §3.1)
│  │  ├─ synthetic_month.py   DS-01: 500 events + injections.jsonl, integer mg, seeded
│  │  └─ phrase_grammar/      bn/hi/kn/mr numeral phrase grammars for voice scripts
│  ├─ suites/
│  │  ├─ stt_numeral.py       Q1: nWER, NVA, per-language gap        (DS-02)
│  │  ├─ intake.py            Q2: field EM, false-haan rate           (DS-03)
│  │  ├─ flags.py             Q3: flag recall/precision, mismatch     (DS-01 → ledger-core)
│  │  ├─ explain.py           Q4: auto faithfulness + rubric export   (DS-04)
│  │  ├─ readback.py          Q5: listener sheet scoring              (DS-06)
│  │  ├─ redteam.py           Q5: attack success, injection recall    (DS-05)
│  │  ├─ routing.py           Manager route acc, dispute recall
│  │  └─ perf.py              p50/p95 latency, ₹ per call
│  ├─ metrics/
│  │  ├─ numerals.py          language number tables → canonical tokens; nWER via jiwer
│  │  ├─ exact_match.py
│  │  ├─ flags.py
│  │  └─ faithfulness.py      digit/number-word scan outside {{slots}}, slot keys, blame lexicon
│  └─ clients/
│     ├─ sarvam.py            saaras/bulbul calls with timeout + cost meter
│     ├─ lyzr.py              agent chat calls by LYZR_AGENT_ID_*
│     └─ replay.py            fixture lookup by input hash
├─ datasets/
│  ├─ ds01_synthetic/         config only (output is generated into .cache/)
│  ├─ ds02_numerals/          manifest.csv + transcripts.jsonl (NO audio in git; audio in GCS asia-south1)
│  ├─ ds03_intake/            *.jsonl  {envelope, transcript, gold IntakeDraft}
│  ├─ ds04_explain/           flag bundles + rubric sheets per language
│  ├─ ds05_redteam/           *.jsonl  {input, expected_behaviour}
│  └─ ds06_readback/          rendered read-backs + listener responses
├─ fixtures/replay/           recorded provider outputs, keyed by sha256(input)
├─ scripts/
│  └─ check_prompt_sync.py    prompts/*.md must equal the PROMPTS.md blocks; version bump on change
└─ reports/                   (gitignored) offline.json, live.json, summary.md
```

## Run
```bash
cd implementation/scalable/ai/evals
python -m pip install -r requirements.txt

# DS-01: one synthetic month, then all offline suites in replay mode
python -m tola_evals generate --seeds 20261020 --events 500 --out .cache/ds01
python -m tola_evals run --suites stt_numeral,intake,flags,explain,redteam,routing \
       --mode replay --data datasets --cache .cache --out reports/offline.json
python -m tola_evals gate --report reports/offline.json --thresholds thresholds.yaml --stage mvp

# Live (needs SARVAM_API_KEY, LYZR_API_KEY, LYZR_AGENT_ID_*; spends real credits)
AI_FALLBACK_MODE=live python -m tola_evals run --suites stt_numeral,intake --mode live \
       --budget-inr 20 --data datasets --cache .cache --out reports/live.json --record-fixtures fixtures/replay
```
`gate` exits non-zero if any threshold fails. CI uses it in `.github/workflows/evals.yml` (full YAML in AI_EVALS §7).

## Rules
- **Never commit audio, real names or phone numbers.** DS-02 audio stays in `gs://$GCS_BUCKET/evals/ds02/` under speaker consent ([DATA_PIPELINE §4](../../../../docs/04-ai/DATA_PIPELINE.md)).
- **Headline nWER uses human speech only.** Clips tagged `synthetic=true` are reported separately.
- **Test splits are by speaker** and frozen per quarter.
- **Live runs respect `--budget-inr`.** The run aborts cleanly when the Sarvam/Lyzr meter reaches the cap.
- **Prompt changes bump the version** in the prompt file header (`manager@1.0.0` → `1.1.0`) and in [PROMPTS.md](../../../../docs/04-ai/PROMPTS.md).

## Status (2026-10-20)
Only the layout and the prompt files exist. Harness code, `requirements.txt` and `thresholds.yaml` are built in prototype week 1. Owner: AI/voice lead; due **30 Nov 2026**. First baseline is due **6 Dec 2026**.
