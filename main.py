"""
    To run app on a sever sue command:
        uvicorn main:app --reload
"""

import base64
from io import BytesIO
from PIL import Image, ImageOps
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

model = load_model("digit_recognizer.h5")

class ImagePayload(BaseModel):
    image_data: str

app = FastAPI()

# Add this middleware to your app
origins = ["*"] # This allows all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(base64_string : str):
    image_data_url = base64_string.split(",")[1]
    padding_needed = len(image_data_url) % 4
    if padding_needed != 0:
        image_data_url += '=' * (4 - padding_needed)
    image_data = base64.b64decode(image_data_url)

    img = Image.open(BytesIO(image_data)).convert("L")

    img = ImageOps.invert(img)

    img = img.resize((28, 28))

    img_array = np.asarray(img)
    img_array = img_array / 255.0

    img_array = img_array.reshape(1, 28, 28)

    return img_array

@app.get("/")
def root():
    return {"Hello": "World"}

@app.post("/predict")
def predict(payload: ImagePayload):
    processed_image = preprocess_image(payload.image_data)

    predictions = model.predict(processed_image)

    predicted_digit = int(np.argmax(predictions[0]))

    print(f"Predicted digit: {predicted_digit}")
    return {"predicted_digit" : predicted_digit}