# Approach — Voice Command Shopping Assistant

## Overview

Saathi is a voice-first grocery assistant built for speed and natural interaction. The core challenge was making voice commands feel conversational, not like rigid command parsing.

## Key Decisions

**1. Single Action Schema (`{intent, entities}`)**
Voice, typed search, and button clicks all funnel through the same dispatcher. This keeps voice from being a bolted-on feature and makes the app resilient if speech recognition fails.

**2. LLM + Regex Hybrid**
Groq LLM handles varied phrasing and multilingual commands, while a regex fallback ensures the app never fails completely. This balance provides both flexibility and reliability.

**3. Lift State Up**
Shopping list state lives in `App.jsx` (not `ListScreen.jsx`) because the mic button is also in `App.jsx`. This single source of truth ensures real-time UI updates after every voice command.

**4. Product Catalog Enriches, Not Gatekeeps**
The catalog provides prices, categories, and filters, but unknown products are added as custom items. Voice commands never fail because of catalog limitations.

**5. Web Speech API for Voice**
Browser-based STT avoids backend audio streaming, making the demo simple, fast, and free.

## Results

Users can speak naturally ("I need apples", "add 2 liters of milk", "find organic apples under ₹300") and see real-time feedback. The assistant understands intent, extracts entities, and updates the list instantly.

## What I'd Improve

- Hindi language support (already structured for it)
- Smart recommendations based on purchase history
- Persistent storage (Supabase/PostgreSQL)

---

*Total: ~200 words*