import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyCjs7bNVLQdaffWTSXTCP0M4w2rrcN9qjE"  # or import from config if you already have it

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(model_name="models/gemini-2.5-pro")

response = model.generate_content("Say hello from Gemini!")
print(response.text)
