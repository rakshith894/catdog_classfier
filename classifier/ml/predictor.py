import io
import os

import numpy as np
import torch
from PIL import Image


class CatDogCNN(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = torch.nn.Conv2d(3, 32, kernel_size=3)
        self.conv2 = torch.nn.Conv2d(32, 64, kernel_size=3)
        self.fc1 = torch.nn.Linear(64 * 30 * 30, 128)
        self.fc2 = torch.nn.Linear(128, 2)
        self.pool = torch.nn.MaxPool2d(2, 2)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = x.view(x.size(0), -1)
        x = torch.relu(self.fc1(x))
        return self.fc2(x)


_model = None
_model_path = None


def get_model():
    global _model, _model_path
    if _model is not None:
        return _model

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(project_root, 'model.pt'),
        os.path.join(project_root, 'model.pth'),
        os.path.join(project_root, 'catdog_model.pt'),
        os.path.join(project_root, 'catdog_model.pth'),
        os.path.join(project_root, 'model.h5'),
        os.path.join(project_root, 'model.keras'),
        os.path.join(project_root, 'catdog_model.h5'),
        os.path.join(project_root, 'catdog_model.keras'),
        os.path.join(ml_dir, 'model.pt'),
        os.path.join(ml_dir, 'model.pth'),
        os.path.join(ml_dir, 'catdog_model.pt'),
        os.path.join(ml_dir, 'catdog_model.pth'),
        os.path.join(ml_dir, 'model.h5'),
        os.path.join(ml_dir, 'model.keras'),
        os.path.join(ml_dir, 'catdog_model.h5'),
        os.path.join(ml_dir, 'catdog_model.keras'),
    ]

    for path in candidates:
        if os.path.exists(path):
            _model_path = path
            print(f"[CatDog] Loading model from: {path}")
            if path.endswith('.pth'):
                model = CatDogCNN()
                state = torch.load(path, map_location='cpu')
                model.load_state_dict(state)
                model.eval()
                _model = model
                print("[CatDog] PyTorch model loaded successfully!")
                return _model

            import tensorflow as tf
            _model = tf.keras.models.load_model(path)
            print("[CatDog] TensorFlow model loaded successfully!")
            return _model

    raise FileNotFoundError(
        "No model file found. Place model.pt, model.pth, catdog_model.pt, catdog_model.pth, model.h5, model.keras, catdog_model.h5, or catdog_model.keras in the project root or classifier/ml."
    )


def predict(image_file):
    """Accepts a Django uploaded file and returns cat/dog probabilities."""
    model = get_model()
    img_bytes = image_file.read()
    with Image.open(io.BytesIO(img_bytes)) as img:
        img = img.convert('RGB').resize((128, 128))
    img_array = np.array(img, dtype=np.float32) / 255.0

    if hasattr(model, 'predict'):
        prediction = model.predict(np.expand_dims(img_array, axis=0), verbose=0)
        score = float(prediction[0][0])
        dog_prob = round(score * 100, 2)
        cat_prob = round((1 - score) * 100, 2)
    else:
        tensor = torch.from_numpy(np.transpose(img_array, (2, 0, 1))).unsqueeze(0).float()
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)[0]
        cat_prob = round(float(probs[0]) * 100, 2)
        dog_prob = round(float(probs[1]) * 100, 2)
        score = float(probs[1])

    if score >= 0.5:
        label = 'Dog'
        confidence = dog_prob
    else:
        label = 'Cat'
        confidence = cat_prob

    return {
        'label': label,
        'confidence': confidence,
        'cat_prob': cat_prob,
        'dog_prob': dog_prob,
        'emoji': '🐶' if label == 'Dog' else '🐱',
    }
