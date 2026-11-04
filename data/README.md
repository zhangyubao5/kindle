# Predefined N5 vocabulary

This repository includes **674 N5 study entries** in `n5-words.json`, each with a Japanese headword, kana reading, romaji, and English meaning. The dashboard loads the bundled `n5-words.js` locally; it makes no dictionary or AI requests at runtime.

Source: [OpenJLPT](https://github.com/evanclan/OpenJLPT), `data/json/vocab/n5.json`, revision `0d1d3410bec90bd4098a7c72de820543cb4f707c`.

Contains data from OpenJLPT (CC BY-SA 4.0), which uses JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's JLPT lists, and Tatoeba. This subset retains vocabulary spellings, readings, romaji and English glosses; one example sentence per entry is now included, while part-of-speech fields and dictionary IDs were omitted, and gloss arrays were joined for display. No kanji-dictionary records are included in this subset.

The subset and its generated bundle are licensed under **CC BY-SA 4.0**: https://creativecommons.org/licenses/by-sa/4.0/. See `LICENSE-CC-BY-SA-4.0.txt` for the full license and disclaimer, and `NOTICE-OpenJLPT.md` for the original source notice and prior modifications. JLPT levels are community study classifications, not an official exhaustive test list.

Edit `n5-words.json`, then run `python3 scripts/build-vocabulary.py` and commit both files to update the predefined vocabulary. Track upstream OpenJLPT updates when maintaining this dataset.

## Examples

Every entry has an `example` object with Japanese and English text. 659 sentence pairs are from Tatoeba via the same OpenJLPT source revision, selected for compactness; the Tatoeba sentence IDs are retained and linked in the dashboard. See NOTICE-OpenJLPT.md for Tatoeba attribution and its CC BY 2.0 FR license. These are usage examples; their grammar is not guaranteed to be N5.

15 short sentence pairs were written for this dashboard to fill missing examples or replace overly long ones. These additions are marked `source: "Original"` and released under the same CC BY-SA 4.0 license as the adapted dataset.
