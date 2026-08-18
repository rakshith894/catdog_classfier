🐾 PawsAI — Cat vs Dog Classifier
An extraordinary Django web app that classifies cat and dog images using your trained CNN model, wrapped in a stunning dark glassmorphism UI.

📁 Project Structure

catdog_django/
├── manage.py
├── requirements.txt
├── catdog/                        ← Django project config
│   ├── settings.py
│   └── urls.py
└── classifier/                    ← Main app
    ├── views.py
    ├── urls.py
    ├── ml/
    │   └── predictor.py           ← Model loading + inference
    ├── templates/classifier/
    │   └── index.html             ← UI
    └── static/classifier/
        ├── css/style.css
        └── js/app.js
⚡ Quick Start
1. Place your model
Copy your trained model file into:

catdog_django/classifier/ml/
Supported names (auto-detected):

model.pt
model.pth
catdog_model.pt
catdog_model.pth
2. Create virtual environment & install dependencies
bash

cd catdog_django
python -m venv venv
venv\Scripts\activate        # Windows
# OR
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
3. Run migrations
bash

python manage.py migrate
4. Start the server
bash

python manage.py runserver
5. Open your browser
http://127.0.0.1:8000

🚀 Deploy to Render
This project includes Render deployment files:
- render.yaml
- build.sh

Render setup:
1. Push this repo to GitHub.
2. In Render, choose New > Web Service.
3. Connect the repository and select the app.
4. Use the included render.yaml or set the start command to:
   gunicorn catdog.wsgi:application --bind 0.0.0.0:$PORT
5. Add environment variables if needed:
   - SECRET_KEY
   - DEBUG=False

The app is configured to serve static files with WhiteNoise and run with Gunicorn.

✨ Features
🌑 Dark glassmorphism UI
📸 Drag & Drop image upload with live preview
📊 Animated confidence bars (Cat 🐱 vs Dog 🐶)
🎉 Confetti burst on every prediction
🕒 Prediction history gallery (last 6)
🐾 Floating paw print animations
📱 Fully responsive
🧠 Model Details
Input size: 128 × 128 RGB
Output: sigmoid (0 = Cat, 1 = Dog)
Framework: PyTorch