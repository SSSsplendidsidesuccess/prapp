"""
OpenAI service for AI-powered PRD generation, enhancement, and playbook generation.
Handles GPT-4 integration with comprehensive prompt engineering.
"""
from openai import AsyncOpenAI
from typing import Dict, Optional, List, Any
import logging
import json
from app.core.config import settings
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for interacting with OpenAI API for PRD operations."""
    
    def __init__(self):
        """Initialize OpenAI client with API key from settings."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured")
        
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        logger.info(f"OpenAI service initialized with model: {self.model}")
    
    def _construct_generation_prompt(self, idea_description: str) -> List[Dict[str, str]]:
        """
        Construct prompt for PRD generation from idea description.
        
        Args:
            idea_description: User's product idea description
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        system_prompt = """You are an expert Product Manager with extensive experience writing Product Requirements Documents (PRDs). Your task is to transform product ideas into comprehensive, well-structured PRDs that development teams can use to build products.

When generating a PRD, you should:
1. Create a clear, concise title that captures the essence of the product
2. Write a detailed description that explains what the product does, why it's needed, and how it solves user problems
3. Identify the target audience with specific user personas or segments
4. Define measurable success metrics that align with business goals
5. Provide a realistic timeline with key milestones

Your PRDs should be:
- Clear and unambiguous
- Actionable for development teams
- Focused on user value and business outcomes
- Realistic and achievable
- Well-structured and professional

Output your response as a JSON object with these exact fields:
{
  "title": "string (max 200 characters)",
  "description": "string (detailed, 2-4 paragraphs)",
  "target_audience": "string (specific user segments)",
  "success_metrics": ["string", "string", ...] (3-5 measurable metrics),
  "timeline": "string (realistic estimate with milestones)"
}"""

        user_prompt = f"""Generate a comprehensive Product Requirements Document (PRD) for the following product idea:

{idea_description}

Please analyze this idea and create a professional PRD that includes:
- A compelling title
- A detailed description explaining the product, its purpose, and value proposition
- Clear target audience definition
- Measurable success metrics
- A realistic timeline with key milestones

Return your response as a valid JSON object with the specified fields."""

        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    
    def _construct_enhancement_prompt(
        self, 
        current_prd: Dict, 
        enhancement_instructions: str
    ) -> List[Dict[str, str]]:
        """
        Construct prompt for PRD enhancement based on user instructions.
        
        Args:
            current_prd: Current PRD data
            enhancement_instructions: User's instructions for enhancement
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        system_prompt = """You are an expert Product Manager specializing in refining and enhancing Product Requirements Documents (PRDs). Your task is to improve existing PRDs based on specific feedback and enhancement requests.

When enhancing a PRD, you should:
1. Carefully analyze the current PRD content
2. Understand the enhancement instructions
3. Make targeted improvements while maintaining the PRD's core intent
4. Ensure all changes are coherent and professional
5. Preserve good existing content while improving weak areas

Your enhancements should:
- Address the specific feedback provided
- Maintain consistency across all sections
- Improve clarity and actionability
- Add relevant details where needed
- Keep the PRD focused and concise

Output your response as a JSON object with these exact fields:
{
  "title": "string (max 200 characters)",
  "description": "string (detailed, 2-4 paragraphs)",
  "target_audience": "string (specific user segments)",
  "success_metrics": ["string", "string", ...] (3-5 measurable metrics),
  "timeline": "string (realistic estimate with milestones)"
}"""

        # Format current PRD for context
        current_prd_text = f"""Current PRD:
Title: {current_prd.get('title', 'N/A')}

Description: {current_prd.get('description', 'N/A')}

Target Audience: {current_prd.get('target_audience', 'N/A')}

Success Metrics:
{chr(10).join(f'- {metric}' for metric in current_prd.get('success_metrics', [])) if current_prd.get('success_metrics') else 'N/A'}

Timeline: {current_prd.get('timeline', 'N/A')}"""

        user_prompt = f"""{current_prd_text}

Enhancement Instructions:
{enhancement_instructions}

Please enhance this PRD according to the instructions above. Improve the specified areas while maintaining the overall quality and coherence of the document.

Return your response as a valid JSON object with the specified fields."""

        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    
    async def generate_prd(self, idea_description: str) -> Dict:
        """
        Generate a PRD from an idea description using GPT-4.
        
        Args:
            idea_description: User's product idea description
            
        Returns:
            Dictionary containing PRD fields (title, description, target_audience, 
            success_metrics, timeline)
            
        Raises:
            ValueError: If idea_description is empty or invalid
            Exception: If OpenAI API call fails
        """
        if not idea_description or not idea_description.strip():
            raise ValueError("Idea description cannot be empty")
        
        logger.info(f"Generating PRD from idea (length: {len(idea_description)} chars)")
        
        try:
            # Construct messages
            messages = self._construct_generation_prompt(idea_description)
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            prd_data = json.loads(content)
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"PRD generated successfully. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            # Validate required fields
            required_fields = ["title", "description", "target_audience", 
                             "success_metrics", "timeline"]
            missing_fields = [f for f in required_fields if f not in prd_data]
            
            if missing_fields:
                logger.error(f"Generated PRD missing fields: {missing_fields}")
                raise ValueError(f"Generated PRD missing required fields: {missing_fields}")
            
            # Ensure success_metrics is a list
            if not isinstance(prd_data.get("success_metrics"), list):
                prd_data["success_metrics"] = [prd_data["success_metrics"]]
            
            return prd_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            raise Exception("Failed to parse AI response. Please try again.")
        
        except Exception as e:
            logger.error(f"Error generating PRD: {str(e)}")
            raise Exception(f"Failed to generate PRD: {str(e)}")
    
    async def enhance_prd(
        self, 
        current_prd: Dict, 
        enhancement_instructions: str
    ) -> Dict:
        """
        Enhance an existing PRD based on user instructions.
        
        Args:
            current_prd: Current PRD data dictionary
            enhancement_instructions: User's instructions for enhancement
            
        Returns:
            Dictionary containing enhanced PRD fields
            
        Raises:
            ValueError: If inputs are invalid
            Exception: If OpenAI API call fails
        """
        if not enhancement_instructions or not enhancement_instructions.strip():
            raise ValueError("Enhancement instructions cannot be empty")
        
        if not current_prd:
            raise ValueError("Current PRD data is required")
        
        logger.info(
            f"Enhancing PRD '{current_prd.get('title', 'Unknown')}' "
            f"(instructions length: {len(enhancement_instructions)} chars)"
        )
        
        try:
            # Construct messages
            messages = self._construct_enhancement_prompt(
                current_prd, 
                enhancement_instructions
            )
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            enhanced_prd = json.loads(content)
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"PRD enhanced successfully. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            # Validate required fields
            required_fields = ["title", "description", "target_audience", 
                             "success_metrics", "timeline"]
            missing_fields = [f for f in required_fields if f not in enhanced_prd]
            
            if missing_fields:
                logger.error(f"Enhanced PRD missing fields: {missing_fields}")
                raise ValueError(f"Enhanced PRD missing required fields: {missing_fields}")
            
            # Ensure success_metrics is a list
            if not isinstance(enhanced_prd.get("success_metrics"), list):
                enhanced_prd["success_metrics"] = [enhanced_prd["success_metrics"]]
            
            return enhanced_prd
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            raise Exception("Failed to parse AI response. Please try again.")
        
        except Exception as e:
            logger.error(f"Error enhancing PRD: {str(e)}")
            raise Exception(f"Failed to enhance PRD: {str(e)}")
    
    async def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count for a given text.
        Rough estimation: ~4 characters per token for English text.
        
        Args:
            text: Text to estimate tokens for
            
        Returns:
            Estimated token count
        """
        return len(text) // 4
    
    def _construct_evaluation_prompt(self, prd_data: Dict) -> List[Dict[str, str]]:
        """
        Construct prompt for PRD evaluation with multi-dimensional scoring.
        
        Args:
            prd_data: PRD data to evaluate
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        system_prompt = """You are an expert Product Manager and PRD evaluator with extensive experience assessing Product Requirements Documents. Your task is to provide comprehensive, constructive evaluation of PRDs across multiple dimensions.

When evaluating a PRD, assess these six dimensions (score 0-100 for each):

1. **Clarity (0-100)**: How clear, well-structured, and easy to understand is the PRD?
   - Is the language precise and unambiguous?
   - Is the structure logical and easy to follow?
   - Are concepts explained clearly?

2. **Relevance (0-100)**: How relevant and focused is the content?
   - Does it address the right problems?
   - Is the scope appropriate?
   - Does it stay focused on key objectives?

3. **Confidence (0-100)**: How confident can stakeholders be in this PRD?
   - Is the vision compelling and well-articulated?
   - Are assumptions clearly stated?
   - Does it inspire confidence in the approach?

4. **Completeness (0-100)**: How complete are the requirements?
   - Are all necessary sections covered?
   - Are success metrics well-defined?
   - Is the target audience clearly identified?
   - Are timelines realistic and detailed?

5. **Feasibility (0-100)**: How technically and practically feasible is this?
   - Are the requirements realistic?
   - Is the timeline achievable?
   - Are resources and constraints considered?

6. **Innovation (0-100)**: How innovative and differentiated is the solution?
   - Does it offer unique value?
   - Is there creative problem-solving?
   - Does it push boundaries appropriately?

Your evaluation should be:
- Constructive and encouraging
- Specific with actionable feedback
- Balanced (acknowledge strengths and areas for improvement)
- Professional and supportive

Output your response as a JSON object with these exact fields:
{
  "scores": {
    "clarity": 0-100,
    "relevance": 0-100,
    "confidence": 0-100,
    "completeness": 0-100,
    "feasibility": 0-100,
    "innovation": 0-100
  },
  "overall_score": 0-100 (weighted average),
  "strengths": ["strength 1", "strength 2", "strength 3"] (2-3 key strengths),
  "improvements": [
    {
      "area": "area name",
      "suggestion": "specific actionable suggestion",
      "priority": "high|medium|low"
    }
  ] (3-5 improvement recommendations),
  "summary": "2-3 sentence overall evaluation summary"
}"""

        # Format PRD for evaluation
        prd_text = f"""PRD to Evaluate:

Title: {prd_data.get('title', 'N/A')}

Description:
{prd_data.get('description', 'N/A')}

Target Audience: {prd_data.get('target_audience', 'Not specified')}

Success Metrics:
{chr(10).join(f'- {metric}' for metric in prd_data.get('success_metrics', [])) if prd_data.get('success_metrics') else 'Not specified'}

Timeline: {prd_data.get('timeline', 'Not specified')}

Priority: {prd_data.get('priority', 'Not specified')}

Status: {prd_data.get('status', 'Not specified')}"""

        user_prompt = f"""{prd_text}

Please provide a comprehensive evaluation of this PRD across all six dimensions. Be constructive, specific, and actionable in your feedback. Identify both strengths and areas for improvement.

Return your response as a valid JSON object with the specified fields."""

        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    
    async def evaluate_prd(self, prd_data: Dict) -> Dict:
        """
        Evaluate a PRD using AI to generate multi-dimensional scores and recommendations.
        
        Args:
            prd_data: PRD data dictionary to evaluate
            
        Returns:
            Dictionary containing evaluation scores, strengths, improvements, and summary
            
        Raises:
            ValueError: If PRD data is invalid or insufficient
            Exception: If OpenAI API call fails
        """
        # Validate PRD has minimum required content
        if not prd_data.get('title') or not prd_data.get('description'):
            raise ValueError("PRD must have at least a title and description for evaluation")
        
        # Check if description is too short
        description = prd_data.get('description', '')
        if len(description.strip()) < 50:
            raise ValueError("PRD description is too short for meaningful evaluation (minimum 50 characters)")
        
        logger.info(f"Evaluating PRD '{prd_data.get('title', 'Unknown')}'")
        
        try:
            # Construct messages
            messages = self._construct_evaluation_prompt(prd_data)
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,  # Lower temperature for more consistent evaluations
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            evaluation_data = json.loads(content)
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"PRD evaluation completed. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            # Validate required fields
            required_fields = ["scores", "overall_score", "strengths", "improvements", "summary"]
            missing_fields = [f for f in required_fields if f not in evaluation_data]
            
            if missing_fields:
                logger.error(f"Evaluation missing fields: {missing_fields}")
                raise ValueError(f"Evaluation missing required fields: {missing_fields}")
            
            # Validate scores structure
            required_score_fields = ["clarity", "relevance", "confidence", "completeness", "feasibility", "innovation"]
            scores = evaluation_data.get("scores", {})
            missing_scores = [f for f in required_score_fields if f not in scores]
            
            if missing_scores:
                logger.error(f"Evaluation missing score dimensions: {missing_scores}")
                raise ValueError(f"Evaluation missing score dimensions: {missing_scores}")
            
            # Ensure all scores are integers between 0-100
            for dimension, score in scores.items():
                if not isinstance(score, (int, float)) or score < 0 or score > 100:
                    logger.warning(f"Invalid score for {dimension}: {score}, clamping to 0-100")
                    scores[dimension] = max(0, min(100, int(score)))
            
            # Validate overall_score
            overall_score = evaluation_data.get("overall_score", 0)
            if not isinstance(overall_score, (int, float)) or overall_score < 0 or overall_score > 100:
                # Calculate as average if invalid
                overall_score = sum(scores.values()) // len(scores)
                logger.warning(f"Invalid overall_score, calculated as average: {overall_score}")
                evaluation_data["overall_score"] = overall_score
            
            # Ensure strengths is a list
            if not isinstance(evaluation_data.get("strengths"), list):
                evaluation_data["strengths"] = [str(evaluation_data.get("strengths", ""))]
            
            # Ensure improvements is a list of dicts
            if not isinstance(evaluation_data.get("improvements"), list):
                evaluation_data["improvements"] = []
            
            # Validate improvement structure
            for improvement in evaluation_data["improvements"]:
                if not isinstance(improvement, dict):
                    continue
                if "area" not in improvement:
                    improvement["area"] = "General"
                if "suggestion" not in improvement:
                    improvement["suggestion"] = "Review and enhance this section"
                if "priority" not in improvement or improvement["priority"] not in ["high", "medium", "low"]:
                    improvement["priority"] = "medium"
            
            return evaluation_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse evaluation response as JSON: {e}")
            raise Exception("Failed to parse AI evaluation response. Please try again.")
        
        except Exception as e:
            logger.error(f"Error evaluating PRD: {str(e)}")
            raise Exception(f"Failed to evaluate PRD: {str(e)}")


    async def generate_session_response(
        self,
        preparation_type: str,
        meeting_subtype: Optional[str],
        context_payload: dict,
        transcript: List[dict],
        retrieved_context: Optional[List[Dict[str, any]]] = None
    ) -> str:
        """
        Generate AI response for preparation session with optional RAG context.
        
        Args:
            preparation_type: Type of preparation (Interview, Sales, etc.)
            meeting_subtype: Specific subtype (e.g., Behavioral, Technical)
            context_payload: Session context (agenda, tone, role_context)
            transcript: Conversation history
            retrieved_context: Optional list of retrieved document chunks from RAG
            
        Returns:
            AI response message
            
        Raises:
            Exception: If OpenAI API call fails
        """
        logger.info(f"Generating session response for {preparation_type} session (RAG: {bool(retrieved_context)})")
        
        try:
            # Construct conversation prompt
            messages = self._construct_session_prompt(
                preparation_type,
                meeting_subtype,
                context_payload,
                transcript,
                retrieved_context
            )
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            # Extract response
            ai_message = response.choices[0].message.content
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"Session response generated. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            return ai_message
            
        except Exception as e:
            logger.error(f"Error generating session response: {str(e)}")
            raise Exception(f"Failed to generate AI response: {str(e)}")
    
    def _construct_session_prompt(
        self,
        preparation_type: str,
        meeting_subtype: Optional[str],
        context_payload: dict,
        transcript: List[dict],
        retrieved_context: Optional[List[Dict[str, any]]] = None
    ) -> List[Dict[str, str]]:
        """
        Construct prompt for preparation session with optional RAG context.
        
        Args:
            preparation_type: Type of preparation
            meeting_subtype: Specific subtype
            context_payload: Session context
            transcript: Conversation history
            retrieved_context: Optional retrieved document chunks
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        # Build system prompt based on preparation type
        system_prompts = {
            "Interview": """You are an expert interview coach helping someone prepare for job interviews. Your role is to:
- Ask relevant interview questions based on the context
- Provide constructive feedback on responses
- Help improve communication skills
- Maintain a supportive and encouraging tone
- Focus on STAR method (Situation, Task, Action, Result) for behavioral questions
- Ask follow-up questions to dig deeper into examples""",
            
            "Corporate": """You are an expert corporate communication coach. Your role is to:
- Help prepare for corporate meetings and presentations
- Provide feedback on professional communication
- Focus on clarity, conciseness, and impact
- Help structure key messages effectively""",
            
            "Pitch": """You are an expert pitch coach helping someone prepare investor or sales pitches. Your role is to:
- Ask probing questions about the pitch
- Help refine the value proposition
- Focus on storytelling and persuasion
- Provide feedback on clarity and impact""",
            
            "Sales": """You are a prospective customer in a sales call simulation. Your role is to:
- Act as the customer persona specified in the context
- Ask realistic questions about the product/service based on your needs and concerns
- Challenge the salesperson with objections appropriate to your deal stage
- Show skepticism when appropriate, but be open to good answers
- Ask follow-up questions to dig deeper into areas of interest or concern
- Reference information from your company background when relevant
- Behave realistically based on the deal stage (e.g., more exploratory in Discovery, more detail-focused in Proposal)

IMPORTANT: You have access to background information about the product/service being sold. Use this information to:
- Ask informed questions that a real customer would ask
- Challenge claims with specific concerns
- Reference features or capabilities mentioned in the documentation
- Only use information that would be realistic for a customer to know or ask about""",
            
            "Presentation": """You are an expert presentation coach. Your role is to:
- Help prepare for presentations
- Focus on structure, clarity, and engagement
- Provide feedback on delivery and content
- Help manage Q&A scenarios""",
            
            "Other": """You are an expert communication coach. Your role is to:
- Help prepare for various communication scenarios
- Provide constructive feedback
- Focus on clarity and effectiveness
- Maintain a supportive tone"""
        }
        
        system_prompt = system_prompts.get(preparation_type, system_prompts["Other"])
        
        # Add context to system prompt
        agenda = context_payload.get("agenda", "")
        tone = context_payload.get("tone", "Professional & Confident")
        role_context = context_payload.get("role_context", "")
        customer_name = context_payload.get("customer_name", "")
        customer_persona = context_payload.get("customer_persona", "")
        deal_stage = context_payload.get("deal_stage", "")
        
        # Add sales-specific context
        if preparation_type == "Sales":
            if customer_name:
                system_prompt += f"\n\nYou are representing: {customer_name}"
            if customer_persona:
                system_prompt += f"\n\nYour persona: {customer_persona}"
            if deal_stage:
                system_prompt += f"\n\nCurrent deal stage: {deal_stage}"
                system_prompt += f"\n\nAdjust your questions and concerns to be appropriate for the {deal_stage} stage."
        
        if agenda:
            system_prompt += f"\n\nSession agenda: {agenda}"
        if role_context:
            system_prompt += f"\n\nSalesperson background: {role_context}"
        if meeting_subtype:
            system_prompt += f"\n\nFocus area: {meeting_subtype}"
        
        # Add RAG context if available
        if retrieved_context and len(retrieved_context) > 0:
            context_text = "\n\n=== BACKGROUND INFORMATION ===\n"
            context_text += "The following information is available about the product/service being discussed:\n\n"
            
            for i, chunk in enumerate(retrieved_context[:5], 1):  # Limit to top 5 chunks
                context_text += f"[Source {i}]\n{chunk['text']}\n\n"
            
            context_text += "=== END BACKGROUND INFORMATION ===\n"
            context_text += "\nUse this information naturally in your questions and responses. "
            context_text += "Ask questions that show you've done research or have specific concerns based on this information."
            
            system_prompt += context_text
        
        system_prompt += f"\n\nMaintain a {tone} tone throughout the conversation."
        
        # Build messages list
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (limit to last 10 messages for context window)
        recent_transcript = transcript[-10:] if len(transcript) > 10 else transcript
        
        for msg in recent_transcript:
            messages.append({
                "role": "assistant" if msg["role"] == "ai" else "user",
                "content": msg["message"]
            })
        
        return messages
    
    async def evaluate_session(
        self,
        preparation_type: str,
        meeting_subtype: Optional[str],
        context_payload: dict,
        transcript: List[dict]
    ) -> dict:
        """
        Evaluate a completed session using AI.
        
        Args:
            preparation_type: Type of preparation
            meeting_subtype: Specific subtype
            context_payload: Session context
            transcript: Full conversation history
            
        Returns:
            Dictionary containing evaluation data with scores and recommendations
            
        Raises:
            Exception: If OpenAI API call fails
        """
        logger.info(f"Evaluating {preparation_type} session")
        
        try:
            # Construct evaluation prompt
            messages = self._construct_evaluation_prompt_for_session(
                preparation_type,
                meeting_subtype,
                context_payload,
                transcript
            )
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            evaluation_data = json.loads(content)
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"Session evaluation completed. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            # Validate and add evaluation_id
            from uuid import uuid4
            evaluation_data["evaluation_id"] = str(uuid4())
            
            return evaluation_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse evaluation response as JSON: {e}")
            raise Exception("Failed to parse AI evaluation response. Please try again.")
        except Exception as e:
            logger.error(f"Error evaluating session: {str(e)}")
            raise Exception(f"Failed to evaluate session: {str(e)}")
    
    def _construct_evaluation_prompt_for_session(
        self,
        preparation_type: str,
        meeting_subtype: Optional[str],
        context_payload: dict,
        transcript: List[dict]
    ) -> List[Dict[str, str]]:
        """
        Construct prompt for session evaluation.
        
        Args:
            preparation_type: Type of preparation
            meeting_subtype: Specific subtype
            context_payload: Session context
            transcript: Full conversation history
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        # Determine if this is a sales session
        is_sales = preparation_type == "Sales"
        
        if is_sales:
            system_prompt = """You are an expert sales performance evaluator. Evaluate the salesperson's performance in this practice session across multiple dimensions and provide constructive feedback.

Evaluate these dimensions (score 0-100 for each):
1. **Product Knowledge**: How well did they demonstrate understanding of their product/service?
2. **Customer Understanding**: How well did they understand and address customer needs?
3. **Objection Handling**: How effectively did they handle objections and concerns?
4. **Value Communication**: How clearly did they articulate value propositions?
5. **Question Quality**: How effective were their discovery questions?
6. **Confidence & Delivery**: How confident and professional was their delivery?

For Sales sessions, also assess:
- **Knowledge Base Usage**: Did they reference specific features/capabilities from documentation?
- **Stage Appropriateness**: Were their responses appropriate for the deal stage?
- **Personalization**: Did they tailor responses to the customer persona?

Your evaluation should be:
- Constructive and encouraging
- Specific with actionable feedback
- Balanced (acknowledge strengths and areas for improvement)
- Professional and supportive
- Sales-focused with practical recommendations

Output your response as a JSON object with these exact fields:
{
  "universal_scores": {
    "product_knowledge": 0-100,
    "customer_understanding": 0-100,
    "objection_handling": 0-100,
    "value_communication": 0-100,
    "question_quality": 0-100,
    "confidence_delivery": 0-100
  },
  "sales_specific": {
    "knowledge_base_usage": "excellent|good|fair|poor",
    "stage_appropriateness": "excellent|good|fair|poor",
    "personalization": "excellent|good|fair|poor",
    "notes": "Brief notes on sales-specific performance"
  },
  "overall_score": 0-100 (weighted average),
  "strengths": ["strength 1", "strength 2", "strength 3"] (2-3 key strengths),
  "improvement_areas": [
    {
      "dimension": "dimension name",
      "current_level": "weak|solid|strong",
      "suggestion": "specific actionable suggestion",
      "priority": "high|medium|low"
    }
  ] (2-3 improvement areas),
  "practice_suggestions": ["suggestion 1", "suggestion 2"] (2-3 specific practice suggestions),
  "summary": "2-3 sentence overall evaluation summary"
}"""
        else:
            system_prompt = """You are an expert performance evaluator for interview and communication preparation. Evaluate the user's performance across multiple dimensions and provide constructive feedback.

Evaluate these universal dimensions (score 0-100 for each):
1. **Clarity & Structure**: How clear and well-organized were the responses?
2. **Relevance & Focus**: How well did responses address the questions?
3. **Confidence & Delivery**: How confident and professional was the delivery?
4. **Language Quality**: How professional and articulate was the language?
5. **Tone Alignment**: How well did the tone match the desired style?
6. **Engagement**: How engaging and enthusiastic was the communication?

Your evaluation should be:
- Constructive and encouraging
- Specific with actionable feedback
- Balanced (acknowledge strengths and areas for improvement)
- Professional and supportive

Output your response as a JSON object with these exact fields:
{
  "universal_scores": {
    "clarity_structure": 0-100,
    "relevance_focus": 0-100,
    "confidence_delivery": 0-100,
    "language_quality": 0-100,
    "tone_alignment": 0-100,
    "engagement": 0-100
  },
  "overall_score": 0-100 (weighted average),
  "strengths": ["strength 1", "strength 2", "strength 3"] (2-3 key strengths),
  "improvement_areas": [
    {
      "dimension": "dimension name",
      "current_level": "weak|solid|strong",
      "suggestion": "specific actionable suggestion",
      "priority": "high|medium|low"
    }
  ] (2-3 improvement areas),
  "practice_suggestions": ["suggestion 1", "suggestion 2"] (2-3 specific practice suggestions),
  "summary": "2-3 sentence overall evaluation summary"
}"""
        
        # Format transcript for evaluation
        transcript_text = "Conversation Transcript:\n\n"
        for i, msg in enumerate(transcript, 1):
            role = "Interviewer" if msg["role"] == "ai" else "Candidate"
            transcript_text += f"{role}: {msg['message']}\n\n"
        
        # Add context
        context_text = f"\nPreparation Type: {preparation_type}"
        if meeting_subtype:
            context_text += f"\nFocus Area: {meeting_subtype}"
        if context_payload.get("agenda"):
            context_text += f"\nAgenda: {context_payload['agenda']}"
        if context_payload.get("tone"):
            context_text += f"\nDesired Tone: {context_payload['tone']}"
        
        # Add sales-specific context
        if preparation_type == "Sales":
            if context_payload.get("customer_name"):
                context_text += f"\nCustomer: {context_payload['customer_name']}"
            if context_payload.get("customer_persona"):
                context_text += f"\nCustomer Persona: {context_payload['customer_persona']}"
            if context_payload.get("deal_stage"):
                context_text += f"\nDeal Stage: {context_payload['deal_stage']}"
                context_text += f"\n\nNote: Evaluate if the salesperson's approach was appropriate for the {context_payload['deal_stage']} stage."
        
        user_prompt = f"""{context_text}

{transcript_text}

Please provide a comprehensive evaluation of this preparation session. Be constructive, specific, and actionable in your feedback. Identify both strengths and areas for improvement.

Return your response as a valid JSON object with the specified fields."""
        
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]


    async def generate_playbook_structure(
        self,
        target_persona: Optional[str],
        industry: Optional[str],
        product_line: Optional[str],
        goals: List[str]
    ) -> Dict:
        """
        Generate a playbook structure with suggested scenarios based on high-level input.
        
        Args:
            target_persona: Target customer persona (e.g., "CTO", "CFO")
            industry: Target industry (e.g., "SaaS", "Healthcare")
            product_line: Product line (e.g., "Enterprise Security")
            goals: Business goals (e.g., ["Increase adoption", "Upsell premium features"])
            
        Returns:
            Dictionary containing playbook title, description, and suggested scenarios
            
        Raises:
            Exception: If OpenAI API call fails
        """
        logger.info(f"Generating playbook structure for {target_persona} in {industry}")
        
        try:
            # Construct prompt for playbook structure generation
            system_prompt = """You are an expert Sales Enablement Strategist specializing in creating comprehensive sales playbooks. Your task is to generate a structured playbook outline with relevant scenarios based on the provided context.

When generating a playbook structure, you should:
1. Create a clear, compelling title that reflects the target audience and purpose
2. Write a concise description explaining the playbook's value and use cases
3. Suggest 3-5 relevant scenarios based on the persona, industry, and goals
4. For each scenario, provide a title, appropriate deal stage, and brief meeting context
5. Identify potential customer pain points and competitors to address

Your scenarios should cover the full sales lifecycle where appropriate, from discovery to closing.

Output your response as a JSON object with these exact fields:
{
  "title": "string (compelling playbook title)",
  "description": "string (2-3 sentences describing the playbook)",
  "scenarios": [
    {
      "title": "string (scenario name, e.g., 'Discovery Call')",
      "deal_stage": "Prospecting|Discovery|Qualification|Proposal|Negotiation|Closing|Follow-up",
      "meeting_context": "string (brief context for this scenario)",
      "customer_pain_points": ["string", "string"] (2-3 common pain points),
      "competitors": ["string", "string"] (1-2 common competitors if applicable)
    }
  ]
}"""

            # Build user prompt
            user_prompt = f"""Generate a comprehensive sales playbook structure for the following context:

**Target Persona**: {target_persona or 'Not specified'}
**Industry**: {industry or 'Not specified'}
**Product Line**: {product_line or 'Not specified'}
**Business Goals**: {', '.join(goals) if goals else 'Not specified'}

Please create a playbook with:
1. A compelling title that speaks to the target persona
2. A clear description of the playbook's purpose and value
3. 3-5 relevant scenarios covering key stages of the sales process
4. For each scenario, include appropriate deal stage, context, pain points, and competitors

Make the scenarios specific to the persona and industry provided.

Return your response as a valid JSON object with the specified fields."""

            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            playbook_data = json.loads(content)
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"Playbook structure generated. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            # Validate required fields
            if "title" not in playbook_data or "scenarios" not in playbook_data:
                raise ValueError("Generated playbook missing required fields")
            
            # Convert scenarios to proper format with IDs
            from uuid import uuid4
            formatted_scenarios = []
            for scenario in playbook_data.get("scenarios", []):
                formatted_scenarios.append({
                    "id": str(uuid4()),
                    "title": scenario.get("title", "Untitled Scenario"),
                    "deal_stage": scenario.get("deal_stage", "Discovery"),
                    "meeting_context": scenario.get("meeting_context"),
                    "customer_pain_points": scenario.get("customer_pain_points", []),
                    "competitors": scenario.get("competitors", []),
                    "content": {
                        "opening_strategy": None,
                        "key_messages": [],
                        "value_propositions": [],
                        "proof_points": [],
                        "discovery_questions": [],
                        "objection_handling": [],
                        "competitive_battle_cards": [],
                        "next_steps": []
                    }
                })
            
            playbook_data["scenarios"] = formatted_scenarios
            
            return playbook_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            raise Exception("Failed to parse AI response. Please try again.")
        except Exception as e:
            logger.error(f"Error generating playbook structure: {str(e)}")
            raise Exception(f"Failed to generate playbook structure: {str(e)}")
    
    async def generate_scenario_content(
        self,
        user_id: str,
        playbook: Dict,
        scenario: Dict,
        focus_areas: List[str],
        additional_context: Optional[str],
        db: Any
    ) -> BaseModel:
        """
        Generate detailed content for a specific scenario using RAG.
        
        Args:
            user_id: User ID for RAG query
            playbook: Playbook data dictionary
            scenario: Scenario data dictionary
            focus_areas: Areas to focus on (e.g., ["Pricing objections", "Technical integration"])
            additional_context: Additional context for generation
            db: Database connection for user profile lookup
            
        Returns:
            ContentSection model with generated content
            
        Raises:
            Exception: If OpenAI API call fails
        """
        logger.info(f"Generating content for scenario '{scenario.get('title')}' in playbook '{playbook.get('title')}'")
        
        try:
            # Get user's company profile for context
            user = await db.users.find_one({"user_id": user_id})
            company_profile = user.get("company_profile", {}) if user else {}
            
            # Build query for RAG
            query_parts = []
            if playbook.get("target_persona"):
                query_parts.append(f"information relevant for {playbook['target_persona']}")
            if playbook.get("industry"):
                query_parts.append(f"in {playbook['industry']} industry")
            if scenario.get("deal_stage"):
                query_parts.append(f"at {scenario['deal_stage']} stage")
            if scenario.get("meeting_context"):
                query_parts.append(scenario["meeting_context"])
            if focus_areas:
                query_parts.append(" ".join(focus_areas))
            
            query_text = " ".join(query_parts) if query_parts else "product information and sales strategies"
            
            # Query RAG for relevant context
            from app.services.rag_service import get_rag_service
            rag_service = get_rag_service(settings.OPENAI_API_KEY)
            rag_results = await rag_service.query(
                user_id=user_id,
                query_text=query_text,
                top_k=10
            )
            
            # Build context from RAG results
            retrieved_context = ""
            if rag_results:
                retrieved_context = "\n\n=== KNOWLEDGE BASE (Reference Material) ===\n"
                for i, chunk in enumerate(rag_results, 1):
                    retrieved_context += f"\n[Source {i}]\n{chunk['text']}\n"
                retrieved_context += "\n=== END KNOWLEDGE BASE ===\n"
                logger.info(f"Retrieved {len(rag_results)} chunks for scenario content generation")
            
            # Construct prompt for scenario content generation
            system_prompt = """You are an expert Sales Enablement Strategist. Your goal is to create a high-converting sales playbook scenario with structured, actionable content.

You must analyze the provided background information and generate comprehensive content for this specific sales scenario.

Output Format: JSON
Your response must strictly follow this JSON schema:
{
  "opening_strategy": "string (how to start the conversation)",
  "key_messages": ["string", "string", ...] (3-5 main points to communicate),
  "value_propositions": ["string", "string", ...] (3-5 reasons why they should choose your solution),
  "proof_points": ["string", "string", ...] (3-5 specific features, capabilities, or benefits),
  "discovery_questions": ["string", "string", ...] (5-7 questions to ask),
  "objection_handling": [
    {
      "objection": "string (common objection)",
      "response": "string (how to address it)"
    }
  ] (3-5 common objections),
  "competitive_battle_cards": [
    {
      "competitor_name": "string",
      "our_advantage": "string",
      "their_weakness": "string",
      "key_differentiator": "string"
    }
  ] (1-3 battle cards if competitors are specified),
  "next_steps": ["string", "string", ...] (2-4 actions to advance the deal)
}

Make all content specific, actionable, and tailored to the scenario context."""

            # Build user prompt
            user_prompt = f"""**TASK**: Generate content for the "{scenario.get('title')}" scenario.

**PLAYBOOK CONTEXT**:
- Persona: {playbook.get('target_persona', 'Not specified')}
- Industry: {playbook.get('industry', 'Not specified')}
- Product: {playbook.get('product_line', 'Not specified')}

**SCENARIO CONTEXT**:
- Stage: {scenario.get('deal_stage', 'Not specified')}
- Meeting Context: {scenario.get('meeting_context', 'Not specified')}
- Pain Points: {', '.join(scenario.get('customer_pain_points', [])) if scenario.get('customer_pain_points') else 'Not specified'}
- Competitors: {', '.join(scenario.get('competitors', [])) if scenario.get('competitors') else 'Not specified'}
"""

            if company_profile:
                user_prompt += "\n**YOUR COMPANY/PRODUCT**:\n"
                if company_profile.get('name'):
                    user_prompt += f"- Name: {company_profile['name']}\n"
                if company_profile.get('description'):
                    user_prompt += f"- Description: {company_profile['description']}\n"
                if company_profile.get('value_proposition'):
                    user_prompt += f"- Value Proposition: {company_profile['value_proposition']}\n"
            
            if retrieved_context:
                user_prompt += f"\n{retrieved_context}\n"
            
            if focus_areas:
                user_prompt += f"\n**FOCUS AREAS**: {', '.join(focus_areas)}\n"
            
            if additional_context:
                user_prompt += f"\n**ADDITIONAL CONTEXT**: {additional_context}\n"
            
            user_prompt += """
**INSTRUCTIONS**:
1. Tailor all content to the {deal_stage} stage
2. Address the specific pain points mentioned
3. Use the Knowledge Base to provide accurate product details and proof points
4. If competitors are listed, create specific battle cards for them
5. Make discovery questions appropriate for this stage
6. Provide realistic objection handling strategies
7. Suggest concrete next steps to advance the deal

Return your response as a valid JSON object with the specified fields."""

            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2500,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            content_data = json.loads(content)
            
            # Log token usage
            usage = response.usage
            logger.info(
                f"Scenario content generated. Tokens used: "
                f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
                f"completion: {usage.completion_tokens})"
            )
            
            # Import ContentSection model
            from app.models.playbook import ContentSection
            
            # Validate and create ContentSection
            content_section = ContentSection(**content_data)
            
            return content_section
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            raise Exception("Failed to parse AI response. Please try again.")
        except Exception as e:
            logger.error(f"Error generating scenario content: {str(e)}")
            raise Exception(f"Failed to generate scenario content: {str(e)}")


# Create a singleton instance
openai_service = OpenAIService()