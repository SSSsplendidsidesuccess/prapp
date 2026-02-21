# Voice Input Feature Design Document

## Overview
Enable voice input for the practice session page to simulate realistic sales calls. This feature allows users to speak their responses instead of typing, using the browser's Web Speech API.

## 1. UX Flow
1.  **Initial State**: Microphone icon appears next to the text input field.
2.  **Activation**:
    -   User clicks the microphone icon.
    -   First time: Browser requests microphone permission.
    -   If denied: Show error message.
    -   If granted: Start listening.
3.  **Recording State**:
    -   Microphone icon changes to a pulsing/active state (e.g., red or amber).
    -   "Listening..." indicator or visual waveform appears.
    -   User speaks.
4.  **Transcription**:
    -   Speech is converted to text in real-time (interim results) or final results.
    -   Text is appended to the input field.
5.  **Deactivation**:
    -   User clicks the microphone icon again to stop.
    -   OR Silence detection (optional/browser dependent) stops recording.
    -   Icon reverts to initial state.
6.  **Review & Send**:
    -   User reviews the transcribed text.
    -   User can manually edit if needed.
    -   User clicks "Send" (or presses Enter).

## 2. Technical Architecture

### 2.1. `useVoiceInput` Hook
A custom React hook to encapsulate the Web Speech API logic.

**Location**: `frontend/hooks/useVoiceInput.ts`

**Interface**:
```typescript
interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}
```

**Internal Logic**:
-   Check for `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
-   Initialize `SpeechRecognition` instance.
-   Configure: `continuous = true`, `interimResults = true`, `lang = 'en-US'`.
-   Event Handlers:
    -   `onstart`: Set `isListening = true`, clear error.
    -   `onresult`: Update `transcript` state with latest text.
    -   `onerror`: Set `error` state, `isListening = false`.
    -   `onend`: Set `isListening = false`.

### 2.2. Component Modifications
**File**: `frontend/app/session/[id]/page.tsx`

**Changes**:
-   Import `useVoiceInput`.
-   Integrate hook:
    ```typescript
    const { 
      isListening, 
      transcript, 
      startListening, 
      stopListening, 
      resetTranscript,
      isSupported
    } = useVoiceInput();
    ```
-   Effect to sync transcript to input:
    ```typescript
    useEffect(() => {
      if (transcript) {
        setInputMessage(prev => {
           // simple append or replace strategy
           return transcript; 
        });
      }
    }, [transcript]);
    ```
    *Refinement*: Direct binding might be better: `setInputMessage(transcript)` but need to handle manual edits. A better approach: `onresult` in hook callbacks could directly call `setInputMessage`. OR, simply let the hook manage its own transcript and user manually appends.
    *Decision*: The hook provides the *current session's* transcript. When listening starts, we might want to clear previous or append. Let's make the hook update the external state or return a transcript that we sync.
    *Revised Approach*: Pass `onTranscriptChange` callback to `useVoiceInput`? No, keeping it simple. `transcript` from hook is "what has been said in this recording session". We can append it to `inputMessage`.
    
    *Better approach for `SessionPage`*:
    - When `transcript` updates, update `inputMessage`.
    - Careful not to overwrite manual edits if user types *while* speaking (rare but possible).
    - *Simplest*: When `isListening` is active, `inputMessage` = `transcript`. When stops, `inputMessage` is preserved.
    - *Wait*, if user types "Hello", then clicks record and says "World", result should be "Hello World".
    - *Solution*: The hook accumulates text. 

**UI Components**:
-   Add `MicrophoneButton` component (or inline).
-   Button states:
    -   **Idle**: `<Mic />` (Gray/White)
    -   **Listening**: `<Mic />` (Red/Amber + Pulse animation)
    -   **Disabled**: Hidden or Grayed out if !isSupported.

## 3. Error Handling

| Scenario | Action | User Feedback |
| :--- | :--- | :--- |
| **Browser Unsupported** | `isSupported` is false | Hide mic button or show tooltip "Voice input not supported in this browser" |
| **Permission Denied** | `onerror` with `not-allowed` | Show toast/alert: "Microphone access denied. Please enable permissions." |
| **No Speech Detected** | `onerror` with `no-speech` | Auto-stop, show "No speech detected" (optional) |
| **Network Error** | `onerror` with `network` | Show "Network error, please check connection" |

## 4. Browser Compatibility
-   **Chrome/Edge**: Uses `webkitSpeechRecognition`. Excellent support.
-   **Safari**: Uses `webkitSpeechRecognition` (prefixed). Good support.
-   **Firefox**: Support is experimental/behind flags. Might need to fallback to typing.
-   **Strategy**: Check for existence of API. If missing, feature is disabled gracefully.

## 5. Implementation Plan (Code Mode)

1.  **Create Hook**: `frontend/hooks/useVoiceInput.ts`
    -   Implement types for `SpeechRecognition`.
    -   Implement logic.
2.  **Update Page**: `frontend/app/session/[id]/page.tsx`
    -   Add UI elements.
    -   Connect hook.
    -   Add visual feedback (styles/animations).
3.  **Testing**:
    -   Test in Chrome (primary).
    -   Verify permission flow.
    -   Verify text appending.
    -   Verify error states.

