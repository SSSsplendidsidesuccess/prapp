# Playbook API Specification

## Base URL
`/api/v1`

## 1. Playbooks

### List Playbooks
GET `/playbooks`
- **Query Params**: `limit` (int, default 20), `offset` (int, default 0), `status` (string, optional)
- **Response**: `List[PlaybookResponse]`

### Create Playbook
POST `/playbooks`
- **Body**: `PlaybookCreate`
- **Response**: `PlaybookResponse` (201 Created)

### Get Playbook
GET `/playbooks/{playbook_id}`
- **Response**: `PlaybookResponse`

### Update Playbook
PUT `/playbooks/{playbook_id}`
- **Body**: `PlaybookUpdate`
- **Response**: `PlaybookResponse`

### Delete Playbook
DELETE `/playbooks/{playbook_id}`
- **Response**: `204 No Content`

## 2. Scenarios

### Add Scenario
POST `/playbooks/{playbook_id}/scenarios`
- **Body**: `ScenarioCreate` (subset of Scenario model)
- **Response**: `Scenario`

### Update Scenario
PUT `/playbooks/{playbook_id}/scenarios/{scenario_id}`
- **Body**: `ScenarioUpdate`
- **Response**: `Scenario`

### Delete Scenario
DELETE `/playbooks/{playbook_id}/scenarios/{scenario_id}`
- **Response**: `204 No Content`

## 3. AI Generation

### Generate Playbook Structure
POST `/playbooks/generate-structure`
- **Description**: Generates a skeleton playbook with suggested scenarios based on high-level input.
- **Body**:
  ```json
  {
    "target_persona": "CTO",
    "industry": "SaaS",
    "product_line": "Enterprise Security",
    "goals": ["Increase adoption", "Upsell premium features"]
  }
  ```
- **Response**: `PlaybookCreate` (populated with suggested scenarios but empty content)

### Generate Scenario Content
POST `/playbooks/{playbook_id}/scenarios/{scenario_id}/generate`
- **Description**: Generates detailed content for a specific scenario using RAG.
- **Body**:
  ```json
  {
    "focus_areas": ["Pricing objections", "Technical integration"],
    "additional_context": "Customer is worried about implementation time."
  }
  ```
- **Process**:
  1. Fetch Playbook and Scenario context.
  2. Query RAG with: `"{industry} {target_persona} {deal_stage} {focus_areas}"`.
  3. Construct prompt with retrieved context.
  4. Generate `ContentSection` JSON.
- **Response**: `ContentSection`

## 4. Templates

### Save as Template
POST `/playbooks/{playbook_id}/template`
- **Description**: Clones a playbook as a template.
- **Response**: `PlaybookResponse` (with `is_template=true`)

### List Templates
GET `/playbooks/templates`
- **Response**: `List[PlaybookResponse]`
