import json
import base64
import traceback
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
def index(request):
    history = request.session.get('prediction_history', [])
    return render(request, 'index.html', {'history': history})
@csrf_exempt
@require_http_methods(["POST"])
def predict_view(request):
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image uploaded.'}, status=400)
        image_file = request.FILES['image']
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if image_file.content_type not in allowed_types:
            return JsonResponse({'error': 'Invalid file type. Use JPG, PNG, or WEBP.'}, status=400)
        # Run prediction
        from .ml.predictor import predict
        result = predict(image_file)
        # Save image as base64 for history preview
        image_file.seek(0)
        img_data = base64.b64encode(image_file.read()).decode('utf-8')
        img_src = f"data:{image_file.content_type};base64,{img_data}"
        # Build history entry
        entry = {
            'label': result['label'],
            'confidence': result['confidence'],
            'cat_prob': result['cat_prob'],
            'dog_prob': result['dog_prob'],
            'emoji': result['emoji'],
            'img_src': img_src,
            'filename': image_file.name,
        }
        # Store last 6 predictions in session
        history = request.session.get('prediction_history', [])
        history.insert(0, entry)
        history = history[:6]
        request.session['prediction_history'] = history
        request.session.modified = True
        return JsonResponse({
            'success': True,
            'label': result['label'],
            'confidence': result['confidence'],
            'cat_prob': result['cat_prob'],
            'dog_prob': result['dog_prob'],
            'emoji': result['emoji'],
            'img_src': img_src,
            'history': history,
        })
    except FileNotFoundError as e:
        return JsonResponse({'error': str(e)}, status=500)
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'error': f'Prediction failed: {str(e)}'}, status=500)
@require_http_methods(["POST"])
def clear_history(request):
    request.session['prediction_history'] = []
    request.session.modified = True
    return JsonResponse({'success': True})
