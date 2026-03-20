from flask import Flask, request, jsonify
from transformers import MarianMTModel, MarianTokenizer
import threading

app = Flask(__name__)

model_name = "Helsinki-NLP/opus-mt-en-hi"
tokenizer = None
model = None
model_loaded = False

def load_ai_model():
    global tokenizer, model, model_loaded
    print(f"Loading AI Model ({model_name}) in background...")
    try:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        model_loaded = True
        print("✅ Helsinki-NLP Model Loaded Successfully! Translation is now active.")
    except Exception as e:
        print(f"❌ Failed to load model: {str(e)}")

# Start loading model in background thread
threading.Thread(target=load_ai_model, daemon=True).start()

@app.route('/translate', methods=['POST'])
def translate_texts():
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return jsonify({'translated': []})

        if not model_loaded:
            # Return original texts if still loading the 300MB weights
            print("Translation requested but model is still downloading/loading...")
            return jsonify({'translated': texts, 'status': 'loading'})

        translated = model.generate(**tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=512))
        results = [tokenizer.decode(t, skip_special_tokens=True) for t in translated]
        
        return jsonify({'translated': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Flask Server starting immediately on port 5001...")
    app.run(port=5001, host='127.0.0.1', debug=False, use_reloader=False)
