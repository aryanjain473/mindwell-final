from deepface import DeepFace
import sys
import json
import os
import numpy as np

def detect_emotion(image_path):
    try:
        # Check if image file exists
        if not os.path.exists(image_path):
            print(json.dumps({"error": f"Image file not found: {image_path}"}))
            return
        
        # Use retinaface backend for best accuracy (most accurate face detection)
        # Fallback to other backends if retinaface fails
        backends = ['retinaface', 'opencv', 'ssd', 'mtcnn', 'dlib']
        
        result = None
        backend_used = None
        
        for backend in backends:
            try:
                # Analyze with emotion detection
                # Use enforce_detection=True for better accuracy - ensures face is properly detected
                result = DeepFace.analyze(
                    img_path=image_path, 
                    actions=['emotion'],
                    enforce_detection=True,  # Require face detection for accuracy
                    detector_backend=backend,
                    silent=True
                )
                backend_used = backend
                break  # Success, exit loop
            except Exception as e:
                error_msg = str(e)
                # Check if it's a parameter error (like prog_bar)
                if "unexpected keyword argument" in error_msg.lower():
                    # Skip this backend and try next one
                    continue
                # Only try next backend if it's a detection error, not a model error
                if "No face" not in error_msg and "could not detect" not in error_msg.lower():
                    # This might be a backend-specific error, try next one
                    continue
                # If it's a detection error, try with enforce_detection=False for this backend
                try:
                    result = DeepFace.analyze(
                        img_path=image_path, 
                        actions=['emotion'],
                        enforce_detection=False,  # More lenient
                        detector_backend=backend,
                        silent=True
                    )
                    backend_used = backend
                    break
                except Exception as inner_e:
                    # Skip this backend and try next
                    continue
        
        if result is None:
            # Last attempt with opencv and no enforcement
            try:
                result = DeepFace.analyze(
                    img_path=image_path, 
                    actions=['emotion'],
                    enforce_detection=False,
                    detector_backend='opencv',
                    silent=True
                )
                backend_used = 'opencv'
            except Exception as e:
                error_msg = f"Could not detect face or analyze emotion. Please ensure your face is clearly visible, well-lit, and facing the camera. Error: {str(e)}"
                print(json.dumps({"error": error_msg}))
                sys.stderr.write(f"Error: {error_msg}\n")
                return
        
        # Handle both single result and list results
        if isinstance(result, list):
            result = result[0]
        
        if 'dominant_emotion' in result and 'emotion' in result:
            emotion = result['dominant_emotion']
            emotion_scores = result['emotion']
            
            # Debug: Print raw scores to understand the format
            # DeepFace returns emotion scores - need to check if they're percentages or decimals
            # Typical format: {'angry': 0.5, 'disgust': 2.1, 'fear': 1.2, 'happy': 95.8, 'sad': 0.1, 'surprise': 0.2, 'neutral': 0.1}
            # Values are typically percentages (0-100), but we need to normalize them
            
            # Normalize all scores to decimals (0-1)
            normalized_scores = {}
            total_score = sum(emotion_scores.values())
            
            for emo, score in emotion_scores.items():
                # DeepFace returns percentages (0-100), so divide by 100
                # But check if values are already normalized (< 1.0) or are percentages (> 1.0)
                if total_score > 7:  # If sum is > 7, likely percentages (since 7 emotions, max would be ~700 if percentages)
                    # Normalize by dividing by 100
                    normalized_scores[emo] = float(score) / 100.0
                elif total_score <= 1.0:
                    # Already normalized, use as-is
                    normalized_scores[emo] = float(score)
                else:
                    # Values are percentages but not summing to expected, normalize by 100
                    normalized_scores[emo] = float(score) / 100.0
                
                # Ensure value is between 0 and 1
                normalized_scores[emo] = max(0.0, min(1.0, normalized_scores[emo]))
            
            # Re-normalize to ensure they sum to 1.0 (probability distribution)
            score_sum = sum(normalized_scores.values())
            if score_sum > 0:
                normalized_scores = {k: v / score_sum for k, v in normalized_scores.items()}
            
            # Get the dominant emotion's confidence as decimal (0-1)
            confidence_decimal = normalized_scores.get(emotion, 0.0)
            
            # Ensure confidence is between 0 and 1
            confidence_decimal = max(0.0, min(1.0, confidence_decimal))
            
            output = {
                "emotion": emotion,
                "confidence": round(float(confidence_decimal), 4),  # Return as decimal 0-1
                "emotion_scores": {k: round(float(v), 4) for k, v in normalized_scores.items()}  # All normalized scores
            }
            
            print(json.dumps(output))
        else:
            print(json.dumps({"error": "No emotion detected. Please ensure a face is clearly visible in the image."}))
            
    except Exception as e:
        error_msg = str(e)
        # Provide user-friendly error messages
        if "No face detected" in error_msg or "could not detect a face" in error_msg.lower():
            error_msg = "No face detected in the image. Please ensure your face is clearly visible and well-lit."
        elif "tf-keras" in error_msg.lower() or "tf_keras" in error_msg.lower():
            error_msg = "DeepFace dependency error. Please install required packages: pip install tf-keras"
        elif "tensorflow" in error_msg.lower():
            error_msg = "TensorFlow error. Please check your TensorFlow installation."
        
        print(json.dumps({"error": error_msg}))
        sys.stderr.write(f"Error: {error_msg}\n")

if __name__ == "__main__":
    detect_emotion(sys.argv[1])

