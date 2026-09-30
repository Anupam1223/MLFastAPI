import React from 'react';
import ChapterDeck from '../components/ChapterDeck';
import {
  EndpointBridgeVisualizer,
  RouteSetupVisualizer,
  RequestJourneyVisualizer,
  ShapeVisualizer,
} from '../components/PredictionEndpointVisualizers';
import {
  FormatsConvergeVisualizer,
  SingleIrisVisualizer,
  BatchIrisVisualizer,
  TextPredictVisualizer,
  ImagePipelineVisualizer,
  Base64CompareVisualizer,
  DataFlowVisualizer,
} from '../components/InputFormatVisualizers';

export const meta = {
  title: 'Serializing and Deserializing ML Models (Part 2)',
  subtitle: 'Prediction endpoints, and turning client data into model input',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;

const Pre = ({ children }) => (
  <pre className="font-mono text-[11px] leading-relaxed bg-gray-950/80 border border-gray-700 rounded-lg p-3 text-teal-100 overflow-x-auto">
    {children}
  </pre>
);

const Box = ({ title, tone = 'teal', children }) => {
  const border = {
    teal: 'border-l-teal-400',
    amber: 'border-l-amber-400',
    rose: 'border-l-rose-400',
    sky: 'border-l-sky-400',
    emerald: 'border-l-emerald-400',
  }[tone];
  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800/30 p-3 border-l-4 ${border} space-y-1.5`}>
      {title && <p className="text-white font-semibold">{title}</p>}
      {children}
    </div>
  );
};

const Hint = ({ children }) => <p className="text-xs text-gray-400">{children}</p>;

const slidesData = [
  {
    id: 'endpoints',
    title: 'Creating Prediction Endpoints',
    subtitle: 'The URL clients call to get a prediction',
    Visual: EndpointBridgeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          With a machine learning model loaded and prepared, the next logical step is to create the web interface for it. This
          interface is the <strong className="text-white">API endpoint</strong>, a specific URL within your FastAPI application that
          external clients or services can interact with to get predictions.
        </p>
        <p>
          We’ll focus on creating endpoints that receive input data, pass it to the model, and return the model’s output.
        </p>
        <Box title="POST, with Pydantic" tone="teal">
          <p>
            Typically, predictions involve sending data to the server to be processed, making the HTTP <C>POST</C> method the
            appropriate choice for prediction endpoints. We’ll also leverage the Pydantic models defined in Chapter 2 to ensure the
            incoming data has the correct structure and types, and to define the format of the response.
          </p>
        </Box>
        <Hint>Send POST and GET on the right. Only POST has a body for the features.</Hint>
      </div>
    ),
  },
  {
    id: 'route',
    title: 'Defining the Prediction Route',
    subtitle: 'InputFeatures in, PredictionOutput out',
    Visual: RouteSetupVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Let’s start by outlining a basic prediction endpoint. Assume we have a Pydantic model <C>InputFeatures</C> representing the
          expected input data and a <C>PredictionOutput</C> model for the response. We also assume our trained ML model object is
          available, perhaps loaded into a global variable <C>model</C> for simplicity at this stage (more advanced loading techniques
          like dependency injection will be covered later in this chapter).
        </p>
        <Pre>{`from fastapi import FastAPI
from pydantic import BaseModel
import joblib # Or your preferred library (pickle, etc.)
import numpy as np

# --- Pydantic Models (from Chapter 2) ---
class InputFeatures(BaseModel):
    # Example features - adjust to your model's needs
    feature1: float
    feature2: int
    feature3: float
    category_feature: str # Example categorical feature

class PredictionOutput(BaseModel):
    prediction: float # Or int, str, list, depending on your model

# --- Application Setup ---
app = FastAPI()

# --- Load the Model (Simplified Example) ---
# In a real application, manage loading more carefully (e.g., on startup)
try:
    # Replace 'your_model.joblib' with your model file
    model = joblib.load('your_model.joblib')
    # If your model requires a preprocessor (e.g., for scaling, encoding)
    # preprocessor = joblib.load('your_preprocessor.joblib')
except FileNotFoundError:
    print("Error: Model file not found. Ensure 'your_model.joblib' exists.")
    model = None # Handle the case where the model isn't loaded
    # preprocessor = None

# --- Prediction Endpoint ---
@app.post("/predict", response_model=PredictionOutput)
async def make_prediction(input_data: InputFeatures):
    """
    Receives input features, uses the loaded model to make a prediction,
    and returns the prediction.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # 1. Prepare input data for the model
    # Convert Pydantic model to format expected by the model (e.g., DataFrame, NumPy array)
    # This often involves selecting features and potentially preprocessing
    # Example: Create a NumPy array in the correct order/shape
    # Note: Preprocessing (like one-hot encoding 'category_feature') should match training
    # For simplicity here, we assume the model directly accepts this structure
    # or that preprocessing steps are integrated within the loaded 'model' object (e.g., a Pipeline)

    # Simple example assuming model expects a list or NumPy array of numerical values
    # You MUST adapt this part based on your specific model's input requirements!
    # Example: features = [[input_data.feature1, input_data.feature2, input_data.feature3]]
    # If preprocessing is separate:
    #     processed_features = preprocessor.transform(features)
    #     prediction_result = model.predict(processed_features)

    # Placeholder: Direct feature access (adapt as needed)
    # This is highly dependent on your model's expected input format
    try:
        # Example: Assuming model expects a 2D array-like structure
        model_input = np.array([[
            input_data.feature1,
            input_data.feature2,
            input_data.feature3
            # Add preprocessed categorical features if needed
        ]])

        # 2. Perform Inference
        prediction_value = model.predict(model_input)

        # 3. Format the response
        # Model might return a NumPy array or list; extract the relevant value
        # Ensure the type matches PredictionOutput.prediction type
        result = float(prediction_value[0]) # Example: Get first element and cast

        return PredictionOutput(prediction=result)

    except Exception as e:
        # Handle potential errors during preprocessing or prediction
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")`}</Pre>
        <p className="text-xs text-gray-400">
          <C>HTTPException</C> is used but not imported — add it to the FastAPI import. The preprocessor assignment is commented out, so a successful load never creates <C>preprocessor</C>; only the error branch sets it to None.
        </p>
        <Hint>Step through setup on the right, then remove the model file.</Hint>
      </div>
    ),
  },
  {
    id: 'breakdown',
    title: 'Inside make_prediction',
    subtitle: 'Signature, array, predict, response',
    Visual: RequestJourneyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Let’s break down the <C>make_prediction</C> function:</p>
        <p><strong className="text-white">1. Function Signature:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <C>@app.post("/predict", response_model=PredictionOutput)</C>: This decorator registers the function to handle POST
            requests at the <C>/predict</C> path. <C>response_model=PredictionOutput</C> tells FastAPI to validate the return value
            against the <C>PredictionOutput</C> model and automatically document it.
          </li>
          <li>
            <C>async def make_prediction(input_data: InputFeatures)</C>: Defines an asynchronous function. The{' '}
            <C>input_data: InputFeatures</C> parameter declaration is significant. FastAPI uses this type hint to expect the request
            body to be JSON, validate the JSON data against the <C>InputFeatures</C> Pydantic model, and, if validation passes,
            convert the JSON into an <C>InputFeatures</C> object and pass it as the <C>input_data</C> argument. If validation fails,
            FastAPI automatically returns a detailed HTTP 422 Unprocessable Entity error response.
          </li>
        </ul>
        <p><strong className="text-white">2. Preparing Input Data:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <C>model_input = np.array(...)</C>: This is a critical step where you transform the validated <C>input_data</C> (an{' '}
            <C>InputFeatures</C> object) into the precise format your machine learning model expects for its <C>predict()</C> method.
            This might involve selecting specific fields, converting data types, reshaping data (e.g., into a 2D NumPy array, even for
            a single prediction), and applying the exact same preprocessing steps used during model training (scaling, encoding
            categorical features, etc.). Often, this preprocessing logic is saved alongside the model, perhaps within a scikit-learn{' '}
            <C>Pipeline</C> object, simplifying this step considerably.{' '}
            <strong className="text-white">Failure to match the training preprocessing is a common source of errors.</strong>
          </li>
        </ul>
        <p><strong className="text-white">3. Performing Inference:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <C>prediction_value = model.predict(model_input)</C>: Here, the prepared input is passed to the loaded model’s{' '}
            <C>predict()</C> method (or <C>predict_proba()</C> if probabilities are needed). This is where the actual machine learning
            computation happens. Note that if your model’s prediction step is computationally intensive and blocks the CPU, it can
            hinder the performance of your asynchronous application. Techniques to handle this are discussed in Chapter 5. For now, we
            assume inference is reasonably fast.
          </li>
        </ul>
        <p><strong className="text-white">4. Formatting the Response:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <C>result = float(prediction_value[0])</C>: Model prediction methods often return NumPy arrays or lists, even for single
            predictions. You need to extract the relevant value and potentially convert its type to match your <C>PredictionOutput</C>{' '}
            model.
          </li>
          <li>
            <C>return PredictionOutput(prediction=result)</C>: You create an instance of your <C>PredictionOutput</C> model using the
            prediction result. FastAPI automatically serializes this Pydantic object into a JSON response for the client.
          </li>
        </ul>
        <p>
          This structure provides a way to serve predictions: FastAPI handles the web server mechanics and data validation, while your
          code focuses on the ML-specific tasks of data preparation, inference, and response formatting. Remember to adapt the data
          preparation and response formatting steps precisely to the requirements of your specific model and the desired output.
        </p>
        <Hint>Change the body, unload the model, or make predict raise, and step through the four phases.</Hint>
      </div>
    ),
  },
  {
    id: 'formats',
    title: 'Handling Different Input Formats',
    subtitle: 'Clients send JSON and files; models want arrays and tensors',
    Visual: FormatsConvergeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Machine learning models are often trained on data represented in specific formats, such as NumPy arrays, Pandas DataFrames,
          or tensors with precise shapes and data types. However, clients interacting with your API typically send data in more
          web-friendly formats, most commonly <strong className="text-white">JSON payloads</strong> or occasionally as{' '}
          <strong className="text-white">uploaded files</strong>. Your FastAPI application acts as the bridge, receiving data in one
          format and transforming it into the structure your loaded model expects.
        </p>
        <p>
          Building upon the data validation structures defined using Pydantic (covered in Chapter 2), this section focuses on the
          practical steps within your endpoint functions to handle these incoming formats and perform the necessary preprocessing
          before invoking your model’s prediction method.
        </p>
        <Box title="JSON payloads" tone="sky">
          <p>
            The most frequent scenario involves receiving input features as a JSON object or an array of objects. Pydantic models excel
            at validating the structure and types of this incoming JSON.
          </p>
        </Box>
        <Hint>Pick each client format on the right and see what predict() actually receives.</Hint>
      </div>
    ),
  },
  {
    id: 'single',
    title: 'Single Prediction Requests',
    subtitle: 'One JSON object, one row',
    Visual: SingleIrisVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For predicting on a single instance, the client usually sends a JSON object where keys represent feature names and values
          represent the corresponding feature values.
        </p>
        <Pre>{`# schemas.py
from pydantic import BaseModel

class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float
    # Example of a categorical feature if needed:
    # species_guess: str | None = None`}</Pre>
        <p>
          In your endpoint, you’ll receive an instance of this Pydantic model. Your task is then to convert this object into the
          numerical format your model requires, often a <strong className="text-white">2D NumPy array</strong> where each row is a
          sample (even if it’s just one sample).
        </p>
        <Pre>{`# main.py
from fastapi import FastAPI, Depends
import numpy as np
from .schemas import IrisFeatures
from .model_loader import get_model

app = FastAPI()
# model = load_my_sklearn_model('path/to/model.joblib')

@app.post("/predict/single")
async def predict_single(
    features: IrisFeatures,
    model = Depends(get_model) # Use dependency injection
):
    """Receives single feature set via JSON, returns prediction."""
    feature_values = [
        features.sepal_length,
        features.sepal_width,
        features.petal_length,
        features.petal_width,
    ]
    # Convert to NumPy array, ensuring the shape is (1, num_features)
    # Models often expect a 2D array, even for a single sample.
    input_array = np.array(feature_values).reshape(1, -1)
    prediction = model.predict(input_array)
    probability = model.predict_proba(input_array) # If applicable
    return {
        "prediction": prediction[0].item(),
        "probability": probability[0].tolist() # Convert array to list
    }`}</Pre>
        <p>
          Notice the conversion to a NumPy array and the <C>reshape(1, -1)</C> call. This explicitly creates a 2D array with one row,
          which is the standard input format for many libraries like scikit-learn, even when predicting for a single instance. Also,
          note the conversion of NumPy results (<C>prediction[0]</C>, <C>probability[0]</C>) back to standard Python types (<C>item()</C>,{' '}
          <C>tolist()</C>) before returning the JSON response.
        </p>
        <Hint>Move the four measurements, then turn the reshape off.</Hint>
      </div>
    ),
  },
  {
    id: 'shape',
    title: 'Why the Array Is Two-Dimensional',
    subtitle: 'reshape(1, -1) and reshape(n, -1)',
    Visual: ShapeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          <C>model.predict</C> in libraries like scikit-learn expects a 2D array: one row per sample, one column per feature. A single
          JSON object is still one sample, so it is a table with <strong className="text-white">one row</strong>.
        </p>
        <Box title="reshape(1, -1)" tone="teal">
          <p>
            <C>np.array(feature_values)</C> builds a flat list of length 4, shape <C>(4,)</C>. <C>reshape(1, -1)</C> turns that into
            shape <C>(1, 4)</C>. The <C>-1</C> means “however many columns are left.”
          </p>
        </Box>
        <p>
          A flat array raises <C>ValueError: Expected 2D array, got 1D array instead</C>. The same rule scales up: a batch of n
          samples has shape <C>(n, n_features)</C>.
        </p>
        <Hint>Add rows, then switch to a flat list.</Hint>
      </div>
    ),
  },
  {
    id: 'batch',
    title: 'Batch Prediction Requests',
    subtitle: 'List[IrisFeatures] becomes one array',
    Visual: BatchIrisVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For efficiency, you might want to allow clients to send multiple instances for prediction in a single API call. This is
          typically done by sending a JSON array of objects. Pydantic handles this using <C>List[YourModel]</C>.
        </p>
        <Pre>{`# schemas.py
from pydantic import BaseModel
from typing import List

class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

class BatchPredictionRequest(BaseModel):
    instances: List[IrisFeatures]

class PredictionResult(BaseModel):
    prediction: int # Or float, depending on the model output
    probability: list[float] | None = None

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResult]`}</Pre>
        <p>
          The endpoint then iterates through the list, prepares each instance, collects them into a 2D NumPy array, and feeds the
          entire batch to the model if it supports batch inference (most do).
        </p>
        <Pre>{`# main.py
from typing import List
from .schemas import BatchPredictionRequest, BatchPredictionResponse, PredictionResult

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    request: BatchPredictionRequest,
    model = Depends(get_model)
):
    """Receives batch of features via JSON array, returns batch predictions."""
    batch_features = []
    for features in request.instances:
        feature_values = [
            features.sepal_length,
            features.sepal_width,
            features.petal_length,
            features.petal_width,
        ]
        batch_features.append(feature_values)
    input_array = np.array(batch_features)
    predictions = model.predict(input_array)
    probabilities = model.predict_proba(input_array) # If applicable
    results = []
    for i in range(len(predictions)):
        results.append(
            PredictionResult(
                prediction=predictions[i].item(),
                probability=probabilities[i].tolist()
            )
        )
    return BatchPredictionResponse(predictions=results)`}</Pre>
        <p>
          This batch processing approach is generally more efficient than making multiple individual API calls, as it reduces network
          overhead and can leverage optimized batch inference capabilities of the underlying ML library.
        </p>
        <Hint>Add instances, then compare one batch call with one call per flower.</Hint>
      </div>
    ),
  },
  {
    id: 'text',
    title: 'Handling Text Data',
    subtitle: 'A string in JSON, a vectorizer somewhere',
    Visual: TextPredictVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>For Natural Language Processing (NLP) models, the input is typically text, sent as strings within a JSON payload.</p>
        <Pre>{`# schemas.py
from pydantic import BaseModel
from typing import List

class TextItem(BaseModel):
    text: str

class TextBatchRequest(BaseModel):
    texts: List[str]

# main.py (endpoint snippet)
from .model_loader import get_nlp_model

@app.post("/predict/text")
async def predict_text(
    request: TextItem, # Or TextBatchRequest for batching
    model = Depends(get_nlp_model)
):
    """Receives text input, returns NLP model prediction (e.g., sentiment)."""
    input_text = request.text # Or request.texts for batch

    # Preprocessing might involve tokenization, vectorization, etc.
    # *IF* this is not part of the loaded model pipeline:
    # processed_input = preprocess_text(input_text)
    # prediction = model.predict(processed_input)

    # *IF* the model (e.g., scikit-learn Pipeline) handles preprocessing:
    prediction = model.predict([input_text]) # Pass raw text(s)

    sentiment_score = prediction[0].item()
    sentiment_label = "positive" if sentiment_score > 0.5 else "negative"
    return {
        "input_text": input_text,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label
    }`}</Pre>
        <p>
          A significant factor for text (and sometimes other data types) is where preprocessing like tokenization or vectorization
          occurs. If you saved a scikit-learn <C>Pipeline</C> that includes components like <C>TfidfVectorizer</C>, your loaded model
          artifact already contains the necessary preprocessing steps. In this case, you can often pass the raw text directly to the
          pipeline’s <C>predict</C> method. If preprocessing is not part of the saved model, you must implement those exact steps
          within your FastAPI endpoint (or helper functions) before calling <C>predict</C>.{' '}
          <strong className="text-white">Consistency between training preprocessing and inference preprocessing is absolutely mandatory for correct results.</strong>
        </p>
        <Hint>Type a sentence, switch who owns the vectorizer, and drag the 0.5 cutoff.</Hint>
      </div>
    ),
  },
  {
    id: 'files',
    title: 'Handling File Uploads',
    subtitle: 'Images, audio, documents',
    Visual: ImagePipelineVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          For models that operate on non-tabular data like images, audio, or documents, clients might need to upload files directly
          instead of embedding data within JSON. FastAPI handles this using <C>File</C> and <C>UploadFile</C>.
        </p>
        <Pre>{`# main.py
from fastapi import FastAPI, File, UploadFile, Depends
from PIL import Image
import io
import numpy as np
from .model_loader import get_image_model

app = FastAPI()

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Loads image bytes, preprocesses for the model."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.resize((224, 224))
        img_array = np.array(img)
        if img_array.ndim == 2: # Handle grayscale
            img_array = np.stack((img_array,)*3, axis=-1) # Convert to 3 channels
        img_array = img_array / 255.0 # Normalize to [0, 1]
        img_array = np.expand_dims(img_array, axis=0)
        return img_array.astype(np.float32)
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise ValueError("Invalid image file or format") from e

@app.post("/predict/image")
async def predict_image(
    image_file: UploadFile = File(...),
    model = Depends(get_image_model)
):
    """Receives an image file, returns prediction."""
    try:
        contents = await image_file.read()
        try:
            input_tensor = preprocess_image(contents)
        except ValueError as e:
            return {"error": str(e)}
    finally:
        await image_file.close() # Important to close the file
    prediction = model.predict(input_tensor)
    predicted_class_index = np.argmax(prediction[0])
    predicted_label = class_names[predicted_class_index]
    return {
        "filename": image_file.filename,
        "content_type": image_file.content_type,
        "prediction_index": predicted_class_index.item(),
        "predicted_label": predicted_label
    }`}</Pre>
        <p>In this example:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>We define the endpoint parameter <C>image_file</C> using <C>UploadFile = File(...)</C>.</li>
          <li>We use <C>await image_file.read()</C> to get the file contents as bytes (as file I/O is inherently asynchronous).</li>
          <li>
            A helper function <C>preprocess_image</C> encapsulates the steps needed to convert the raw bytes into the specific tensor
            format the model requires (resizing, normalization, adding batch dimension, ensuring correct data type). This function uses
            the Pillow library (<C>PIL</C>) for image manipulation.
          </li>
          <li>Error handling is included for cases where the file might not be a valid image.</li>
          <li>The file is explicitly closed using <C>await image_file.close()</C> in a <C>finally</C> block to ensure resources are released.</li>
          <li>The preprocessed data is fed to the model, and the results are formatted for the response.</li>
        </ol>
        <Hint>Step through the shapes. Switch to a grayscale photo, then send a corrupt file.</Hint>
      </div>
    ),
  },
  {
    id: 'base64',
    title: 'Base64 Inside JSON',
    subtitle: 'An alternative for smaller images',
    Visual: Base64CompareVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          An alternative, sometimes seen for smaller images, is to encode the image data as a Base64 string within a JSON payload. This
          avoids multipart form data but <strong className="text-white">increases the payload size</strong>. The API endpoint would
          then decode the Base64 string back into bytes before proceeding with preprocessing.
        </p>
        <Pre>{`# schemas.py
from pydantic import BaseModel

class ImageBase64(BaseModel):
    image_b64: str
    filename: str | None = None

# main.py (endpoint snippet)
import base64

@app.post("/predict/image_base64")
async def predict_image_base64(
    request: ImageBase64,
    model = Depends(get_image_model)
):
    """Receives Base64 encoded image via JSON, returns prediction."""
    try:
        image_bytes = base64.b64decode(request.image_b64)
        input_tensor = preprocess_image(image_bytes) # Use the same preprocessor
    except (ValueError, base64.binascii.Error) as e:
        return {"error": f"Invalid Base64 data or image format: {e}"}
    prediction = model.predict(input_tensor)
    predicted_class_index = np.argmax(prediction[0])
    return {
        "filename": request.filename or "unknown",
        "prediction_index": predicted_class_index.item(),
    }`}</Pre>
        <p>
          Choose the input method (direct file upload vs. Base64 in JSON) based on client requirements, expected file sizes, and API
          design preferences. <strong className="text-white">File uploads are generally better for larger binary data.</strong>
        </p>
        <Hint>Grow the image and compare the bytes on the wire.</Hint>
      </div>
    ),
  },
  {
    id: 'flow',
    title: 'Data Flow Diagram',
    subtitle: 'JSON and files meet at the model',
    Visual: DataFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The following diagram illustrates the typical data flow when handling different input formats.</p>
        <p className="italic text-gray-400">
          Data flow from client request through FastAPI processing to model inference and response.
        </p>
        <p>
          Regardless of the input format (JSON, file upload), the pattern remains similar: receive the request, validate or read the
          data, preprocess it into the exact format the underlying ML model library expects, perform the prediction, and format the
          results into a JSON response. Carefully managing this transformation is essential for building functional and reliable ML
          prediction APIs.
        </p>
        <Hint>Send a JSON payload and a file upload, and follow each path until they meet at predict().</Hint>
      </div>
    ),
  },
];

export default function SerializingAndDeserializingMLModelsPartTwo() {
  return <ChapterDeck slides={slidesData} />;
}
