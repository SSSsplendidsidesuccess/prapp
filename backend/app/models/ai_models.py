"""
AI-related models for PRD generation and enhancement.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class PRDGenerateRequest(BaseModel):
    """Request model for generating a PRD from an idea."""
    idea_description: str = Field(
        ..., 
        min_length=10,
        max_length=5000,
        description="Description of the product idea to generate a PRD for"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "idea_description": "A mobile app that helps users track their daily water intake with reminders and gamification features. Users can set goals, earn badges, and compete with friends."
            }
        }


class PRDEnhanceRequest(BaseModel):
    """Request model for enhancing an existing PRD."""
    enhancement_instructions: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Instructions for how to enhance the PRD"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "enhancement_instructions": "Add more specific success metrics with numerical targets and expand the timeline to include development phases."
            }
        }


class AIGeneratedPRD(BaseModel):
    """Response model for AI-generated PRD content."""
    title: str = Field(..., description="Generated PRD title")
    description: str = Field(..., description="Generated PRD description")
    target_audience: str = Field(..., description="Generated target audience")
    success_metrics: List[str] = Field(..., description="Generated success metrics")
    timeline: str = Field(..., description="Generated timeline")
    tokens_used: Optional[int] = Field(None, description="Number of tokens used in generation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Water Intake Tracking Mobile App",
                "description": "A comprehensive mobile application designed to help users maintain optimal hydration levels through intelligent tracking, personalized reminders, and engaging gamification features. The app addresses the common problem of inadequate water consumption by making hydration tracking fun and social.",
                "target_audience": "Health-conscious individuals aged 18-45 who use smartphones and are interested in wellness tracking and personal health improvement",
                "success_metrics": [
                    "80% of users log water intake at least once daily within first week",
                    "60% user retention rate after 30 days",
                    "Average of 5 daily water logs per active user",
                    "4.5+ star rating on app stores"
                ],
                "timeline": "12 weeks total - 2 weeks design, 6 weeks development, 2 weeks testing, 2 weeks beta launch",
                "tokens_used": 1250
            }
        }


class PRDGenerateResponse(BaseModel):
    """Response model for PRD generation endpoint."""
    message: str = Field(..., description="Success message")
    generated_prd: AIGeneratedPRD = Field(..., description="The generated PRD content")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "PRD generated successfully",
                "generated_prd": {
                    "title": "Water Intake Tracking Mobile App",
                    "description": "A comprehensive mobile application...",
                    "target_audience": "Health-conscious individuals...",
                    "success_metrics": ["80% of users log water intake..."],
                    "timeline": "12 weeks total...",
                    "tokens_used": 1250
                }
            }
        }


class PRDEnhanceResponse(BaseModel):
    """Response model for PRD enhancement endpoint."""
    message: str = Field(..., description="Success message")
    enhanced_prd: AIGeneratedPRD = Field(..., description="The enhanced PRD content")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "PRD enhanced successfully",
                "enhanced_prd": {
                    "title": "Water Intake Tracking Mobile App - Enhanced",
                    "description": "An enhanced comprehensive mobile application...",
                    "target_audience": "Health-conscious individuals...",
                    "success_metrics": ["85% of users log water intake..."],
                    "timeline": "14 weeks total with detailed phases...",
                    "tokens_used": 1450
                }
            }
        }