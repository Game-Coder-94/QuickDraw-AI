"""
    To run app on a sever sue command:
        uvicorn main:app --reload
"""

import base64
from io import BytesIO
from PIL import Image
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def root():
    return {"Hello": "World"}

@app.post("/predict")
def predict(payload: ImagePayload):

    model = load_model("digit_recognizer.h5")

    base64_string = payload.image_data
    base64_string = base64_string.split(",")[1]
    padding_needed = len(base64_string) % 4
    if padding_needed != 0:
        base64_string += '=' * (4 - padding_needed)

    print(base64_string)

    image_data = base64.b64decode(base64_string)
    img = Image.open(BytesIO(image_data))

    img = img.convert("L")
    img = img.resize((28, 28))

    img_array = np.asarray(img)
    img_array = img_array / 255.0
    img_array = img_array.reshape(1, 28, 28, 1)

    predictions = model.predict(img_array)

    probabilities = predictions[0]
    predicted_digit = np.argmax(probabilities)
    print(predicted_digit)
    return {"message": f"Prediction made {predicted_digit}"}