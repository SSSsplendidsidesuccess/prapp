# Playbook RAG & AI Integration

## 1. Context Retrieval Strategy

We will leverage the existing `rag_service` to fetch relevant context from the user's uploaded documents (Knowledge Base).

### Retrieval Logic
When generating content for a Scenario, we construct a query based on:
1. **Playbook Context**: `Target Persona`, `Industry`, `Product Line`
2. **Scenario Context**: `Deal Stage`, `Meeting Context`, `Competitors`
3. **Implicit Needs**: Depending on the section being generated (e.g., for "Objection Handling", we query for "common objections" and "pricing concerns").

**Query Construction Example:**
```python
query_text = f"""
Information relevant for {playbook.target_persona} in {playbook.industry}.
Focus on {scenario.deal_stage} stage.
Context: {scenario.meeting_context}.
Competitors: {', '.join(scenario.competitors)}.
"""
```

### Context Window Management
- **Limit**: Retrieve top 10-15 chunks to ensure broad coverage without exceeding token limits.
- **Filtering**: (Future) Filter by document tags if available (e.g., "Battlecards", "Case Studies").

## 2. Prompt Engineering

### System Prompt
```text
You are an expert Sales Enablement Strategist. Your goal is to create a high-converting sales playbook scenario.
You must analyze the provided background information and generate structured, actionable content.

Output Format: JSON
Your response must strictly follow this JSON schema:
{
  "opening_strategy": "string",
  "key_messages": ["string"],
  "value_propositions": ["string"],
  "proof_points": ["string"],
  "discovery_questions": ["string"],
  "objection_handling": [{"objection": "string", "response": "string"}],
  "competitive_battle_cards": [{"competitor_name": "string", "our_advantage": "string", "their_weakness": "string", "key_differentiator": "string"}],
  "next_steps": ["string"]
}
```

### User Prompt Structure
```text
**TASK**: Generate content for the "{scenario.title}" scenario.

**PLAYBOOK CONTEXT**:
- Persona: {playbook.target_persona}
- Industry: {playbook.industry}
- Product: {playbook.product_line}

**SCENARIO CONTEXT**:
- Stage: {scenario.deal_stage}
- Meeting Context: {scenario.meeting_context}
- Pain Points: {scenario.customer_pain_points}
- Competitors: {scenario.competitors}

**KNOWLEDGE BASE (Reference Material)**:
{retrieved_chunks}

**INSTRUCTIONS**:
1. Tailor all content to the {scenario.deal_stage} stage.
2. Address the specific pain points mentioned.
3. Use the Knowledge Base to provide accurate product details and proof points.
4. If competitors are listed, create specific battle cards for them.
```

## 3. Service Layer Implementation

### `PlaybookService`
We will create a new service class `app/services/playbook_service.py` (or extend `OpenAIService`) to encapsulate this logic.

**Methods:**
- `generate_playbook_structure(context: PlaybookCreate) -> List[Scenario]`
  - Generates a list of recommended scenarios based on the persona/industry.
- `generate_scenario_content(playbook: Playbook, scenario: Scenario) -> ContentSection`
  - Orchestrates the RAG retrieval + OpenAI generation.

### Error Handling
- **Missing Context**: If RAG returns no results, the AI should fall back to general best practices for that persona/stage but flag the content as "Generic".
- **JSON Parsing**: Use retry logic if the LLM returns malformed JSON.
