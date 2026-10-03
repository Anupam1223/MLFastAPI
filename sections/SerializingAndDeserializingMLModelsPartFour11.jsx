import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  ServiceOverviewVisualizer,
  TrainIrisVisualizer,
  ServiceLayoutVisualizer,
  IrisFeaturesVisualizer,
  PredictionOutVisualizer,
  StartupLoadVisualizer,
  PredictJourneyVisualizer,
  PredictFailureVisualizer,
  UvicornVisualizer,
  DocsCurlVisualizer,
  ValidationFailVisualizer,
} from '../components/IrisServiceVisualizers';

export const meta = {
  title: 'Serializing and Deserializing ML Models (Part 4)',
  subtitle: 'Practice: an Iris model behind a FastAPI endpoint',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;

const Pre = CodeBlock;

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
    id: 'overview',
    title: 'Practice: Building a Model Prediction Service',
    subtitle: 'A saved Iris classifier behind POST /predict',
    Visual: ServiceOverviewVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          A simple FastAPI service is built to load a pre-trained machine learning model and expose an endpoint for predictions. It
          integrates data validation with Pydantic and applies model integration techniques.
        </p>
        <Hint>Step from training, to the joblib file, to the API, to the JSON a client receives.</Hint>
      </div>
    ),
  },
  {
    id: 'train',
    title: 'Prerequisites: A Trained Model',
    subtitle: 'Fit LogisticRegression, then joblib.dump',
    Visual: TrainIrisVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          First, you need a trained machine learning model saved to a file. For this example, we’ll assume you have a simple
          classifier trained on the Iris dataset using scikit-learn and saved using <C>joblib</C>.
        </p>
        <p>If you don’t have one readily available, you can create a basic model like this:</p>
        <Pre>{`# train_save_model.py
import joblib
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression

# Load the Iris dataset
iris = load_iris()
X, y = iris.data, iris.target

# Train a simple Logistic Regression model
model = LogisticRegression(max_iter=200)
model.fit(X, y)

# Save the trained model
model_filename = 'iris_classifier.joblib'
joblib.dump(model, model_filename)

print(f"Model trained and saved to {model_filename}")
# Expected output mapping: {0: 'setosa', 1: 'versicolor', 2: 'virginica'}
print(f"Target names: {list(iris.target_names)}")`}</Pre>
        <p>
          Run this script (<C>python train_save_model.py</C>) to generate the <C>iris_classifier.joblib</C> file in your project
          directory. This model expects four input features: sepal length, sepal width, petal length, and petal width (all in cm). It
          predicts one of three Iris species: setosa, versicolor, or virginica.
        </p>
        <Box title="What this script is doing" tone="amber">
          <p>
            It fits on all 150 rows. There is no train/test split, because the point is the file, not a score. The class order in{' '}
            <C>iris.target_names</C> is the order <C>class_names</C> must copy later.
          </p>
        </Box>
        <Hint>Watch the three clusters appear, then the joblib file.</Hint>
      </div>
    ),
  },
  {
    id: 'layout',
    title: 'Project Structure',
    subtitle: 'fastapi_ml_service/ holds the file, the schemas, and the app',
    Visual: ServiceLayoutVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Let’s organize our service. Create a small project directory with the following structure:</p>
        <Pre>{`fastapi_ml_service/
├── iris_classifier.joblib   # Your saved model file
├── models.py                # Pydantic models for request/response
└── main.py                  # Your FastAPI application code`}</Pre>
        <Hint>Step through the folder. main.py is the file that loads the joblib artifact and imports models.py.</Hint>
      </div>
    ),
  },
  {
    id: 'features',
    title: 'Defining Data Models: IrisFeatures',
    subtitle: 'Four centimeter measurements, each greater than 0',
    Visual: IrisFeaturesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          We need Pydantic models to define the structure of our input data and the prediction response. Create the <C>models.py</C>{' '}
          file:
        </p>
        <Pre>{`# models.py
from pydantic import BaseModel, Field
from typing import List

class IrisFeatures(BaseModel):
    """Input features for Iris prediction."""
    sepal_length: float = Field(..., gt=0, description="Sepal length in cm")
    sepal_width: float = Field(..., gt=0, description="Sepal width in cm")
    petal_length: float = Field(..., gt=0, description="Petal length in cm")
    petal_width: float = Field(..., gt=0, description="Petal width in cm")

    class Config:
        # Example for FastAPI documentation
        schema_extra = {
            "example": {
                "sepal_length": 5.1,
                "sepal_width": 3.5,
                "petal_length": 1.4,
                "petal_width": 0.2
            }
        }`}</Pre>
        <p>
          <C>IrisFeatures</C> defines the four input features required by our model. We use <C>Field</C> to add validation (must be
          greater than 0) and descriptions, which FastAPI uses for automatic documentation. We also include an example payload.
        </p>
        <Box title="Current versions" tone="amber">
          <p>
            <C>class Config</C> with <C>schema_extra</C> is Pydantic v1. In v2 the example lives on{' '}
            <C>model_config = ConfigDict(json_schema_extra={'{'}…{'}'})</C>. <C>Field(gt=0)</C> still works. <C>List</C> is imported
            here for <C>PredictionOut</C> on the next slide.
          </p>
        </Box>
        <Hint>Drag the measurements, or set petal width to 0 and watch the request stop.</Hint>
      </div>
    ),
  },
  {
    id: 'output',
    title: 'Defining Data Models: PredictionOut',
    subtitle: 'Class id, class name, and three probabilities',
    Visual: PredictionOutVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`class PredictionOut(BaseModel):
    """Prediction output schema."""
    predicted_class_id: int = Field(..., description="Predicted class index (0, 1, or 2)")
    predicted_class_name: str = Field(..., description="Predicted class name ('setosa', 'versicolor', 'virginica')")
    probabilities: List[float] = Field(..., description="List of probabilities for each class [setosa, versicolor, virginica]")`}</Pre>
        <p>
          <C>PredictionOut</C> defines the structure of our response, including the predicted class index, the corresponding name, and
          the probabilities for each class.
        </p>
        <Hint>Grow the petal. The winning species and the three-number list both move. The list order is setosa, versicolor, virginica.</Hint>
      </div>
    ),
  },
  {
    id: 'startup',
    title: 'Load the Model When the App Starts',
    subtitle: 'joblib.load, or model = None',
    Visual: StartupLoadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Now, let’s write the core application logic in <C>main.py</C>. We will load the model at startup and create a <C>/predict</C>{' '}
          endpoint.
        </p>
        <Pre>{`# main.py
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from models import IrisFeatures, PredictionOut # Import Pydantic models

# --- Application Setup ---
app = FastAPI(
    title="Iris Prediction Service",
    description="A simple API to predict Iris species using a pre-trained model.",
    version="0.1.0",
)

# --- Model Loading ---
# Load the model at application startup.
# For larger applications, consider dependency injection.
model_path = "iris_classifier.joblib"
try:
    model = joblib.load(model_path)
    print(f"Model loaded successfully from {model_path}")
    # Define class names based on the Iris dataset standard order
    class_names = ['setosa', 'versicolor', 'virginica']
except FileNotFoundError:
    print(f"Error: Model file not found at {model_path}")
    model = None # Set model to None if loading fails
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
def read_root():
    """Root endpoint providing basic API information."""
    return {"message": "Welcome to the Iris Prediction API!"}`}</Pre>
        <p className="text-white font-semibold">Steps in main.py</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Import necessary libraries: <C>FastAPI</C>, <C>joblib</C>, <C>numpy</C>, <C>HTTPException</C>, and our Pydantic models.</li>
          <li>Create FastAPI instance: Initialize the app with a title and description.</li>
          <li>
            Load the model: Use <C>joblib.load()</C> to load the <C>iris_classifier.joblib</C> file when the application starts. Basic
            error handling is included. We also define <C>class_names</C> corresponding to the model’s output.
          </li>
        </ol>
        <Box title="class_names only exists after a successful load" tone="amber">
          <p>
            It is assigned inside the <C>try</C>, not in the <C>except</C> branches. That is safe because <C>/predict</C> returns 503
            while <C>model is None</C>, before it indexes <C>class_names</C>.
          </p>
        </Box>
        <Hint>Leave the file in place, then remove it. Startup still finishes, and the next request is a 503.</Hint>
      </div>
    ),
  },
  {
    id: 'journey',
    title: 'The /predict Endpoint',
    subtitle: 'One row in, an id and three probabilities out',
    Visual: PredictJourneyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`@app.post("/predict", response_model=PredictionOut)
async def predict_iris(features: IrisFeatures):
    """
    Predict the Iris species based on input features.

    Takes sepal length, sepal width, petal length, and petal width,
    returns the predicted class ID, class name, and probabilities.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded or unavailable.")

    # 1. Convert input data to the format expected by the model
    #    (scikit-learn models usually expect a 2D NumPy array)
    input_data = np.array([[
        features.sepal_length,
        features.sepal_width,
        features.petal_length,
        features.petal_width
    ]])

    # 2. Make prediction
    try:
        prediction_id = model.predict(input_data)
        probabilities = model.predict_proba(input_data)
    except Exception as e:
        # Handle potential errors during prediction
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    # 3. Format the response
    predicted_class_index = int(prediction_id[0]) # Get the first element

    if predicted_class_index < 0 or predicted_class_index >= len(class_names):
        raise HTTPException(status_code=500, detail="Prediction index out of bounds.")

    predicted_class_name = class_names[predicted_class_index]
    prediction_probabilities = probabilities[0].tolist() # Get probabilities for the first (and only) input

    return PredictionOut(
        predicted_class_id=predicted_class_index,
        predicted_class_name=predicted_class_name,
        probabilities=prediction_probabilities
    )`}</Pre>
        <p>Define the <C>/predict</C> endpoint:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>It’s a POST endpoint because we are sending data to create a prediction.</li>
          <li>
            It expects a request body matching the <C>IrisFeatures</C> Pydantic model. FastAPI automatically handles parsing the
            incoming JSON and validating it against this model. If validation fails, FastAPI returns a 422 Unprocessable Entity error
            automatically.
          </li>
          <li>
            It specifies <C>response_model=PredictionOut</C>. FastAPI uses this to validate the outgoing response, filter data (only
            fields defined in <C>PredictionOut</C> are returned), and generate documentation.
          </li>
          <li>Inside the function: check the model loaded, build a 2D array, call <C>predict</C> and <C>predict_proba</C>, then return <C>PredictionOut</C>.</li>
        </ul>
        <Hint>The bars are a stand-in so the species can move as you drag. A saved LogisticRegression would use its own coefficients. Petal size does most of the separating.</Hint>
      </div>
    ),
  },
  {
    id: 'failures',
    title: 'When /predict Does Not Return a Species',
    subtitle: '503 if the model is missing, 500 if prediction itself fails',
    Visual: PredictFailureVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Inside the endpoint, three checks leave through <C>HTTPException</C> instead of <C>PredictionOut</C>:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Check if the model was loaded successfully. If <C>model is None</C>, raise status <C>503</C> with detail “Model is not
            loaded or unavailable.”
          </li>
          <li>
            Call <C>model.predict()</C> for the class id and <C>model.predict_proba()</C> for the class probabilities. Any exception
            there becomes status <C>500</C> and <C>Prediction error: …</C>.
          </li>
          <li>
            If <C>predicted_class_index</C> is below 0 or past the end of <C>class_names</C>, raise status <C>500</C> with detail
            “Prediction index out of bounds.”
          </li>
        </ul>
        <Hint>Switch the three failures. The request has already passed IrisFeatures. It still does not get a species name.</Hint>
      </div>
    ),
  },
  {
    id: 'uvicorn',
    title: 'Running the Service',
    subtitle: 'uvicorn main:app, from this directory',
    Visual: UvicornVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Running and Testing the Service</p>
        <p>
          Start the server: open your terminal in the <C>fastapi_ml_service</C> directory and run:
        </p>
        <Pre>{`uvicorn main:app --reload --host 0.0.0.0 --port 8000`}</Pre>
        <ul className="list-disc pl-5 space-y-1">
          <li><C>main:app</C>: Tells Uvicorn to find the <C>app</C> object inside the <C>main.py</C> file.</li>
          <li><C>--reload</C>: Automatically restarts the server when code changes (useful during development).</li>
          <li><C>--host 0.0.0.0</C>: Makes the server accessible from other machines on your network (or Docker containers later).</li>
          <li><C>--port 8000</C>: Specifies the port to run on.</li>
        </ul>
        <Pre>{`# --- Run the Application (Optional, for direct execution) ---
# Typically, you'd run this using Uvicorn from the command line.
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)`}</Pre>
        <Box title="python main.py does not start the server" tone="amber">
          <p>That block is commented out. The process only listens if you run the uvicorn command above, from the directory that contains <C>main.py</C> and the joblib file.</p>
        </Box>
        <Hint>Step across the four pieces of the command until the port is listening.</Hint>
      </div>
    ),
  },
  {
    id: 'curl',
    title: 'Docs and a Successful Prediction',
    subtitle: 'The example flower comes back as setosa',
    Visual: DocsCurlVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Access the documentation: open your web browser and go to <C>http://localhost:8000/docs</C>. You should see the interactive
          Swagger UI documentation generated by FastAPI, showing your <C>/</C> and <C>/predict</C> endpoints, including the schemas
          defined by Pydantic.
        </p>
        <p>Test with <C>curl</C>: open another terminal and send a POST request to the <C>/predict</C> endpoint:</p>
        <Pre>{`curl -X 'POST' \\
  'http://localhost:8000/predict' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "sepal_length": 5.1,
    "sepal_width": 3.5,
    "petal_length": 1.4,
    "petal_width": 0.2
  }'`}</Pre>
        <p>You should receive a JSON response similar to this (probabilities might vary slightly):</p>
        <Pre>{`{
  "predicted_class_id": 0,
  "predicted_class_name": "setosa",
  "probabilities": [0.97, 0.02, 0.00]
}`}</Pre>
        <Hint>Follow the example from Swagger into the response. Those four numbers are the schema_extra example.</Hint>
      </div>
    ),
  },
  {
    id: 'validation',
    title: 'Test Validation',
    subtitle: 'A bad measurement is a 422, and the model is not called',
    Visual: ValidationFailVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Try sending invalid data (e.g., missing a field or providing non-numeric data):</p>
        <Pre>{`curl -X 'POST' \\
  'http://localhost:8000/predict' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "sepal_length": 5.1,
    "sepal_width": "not-a-number",
    "petal_length": 1.4,
    "petal_width": 0.2
  }'`}</Pre>
        <p>
          FastAPI (thanks to Pydantic) will automatically return a <strong className="text-white">422 Unprocessable Entity</strong>{' '}
          error with details about the validation failure:
        </p>
        <Pre>{`{
  "detail": [
    {
      "loc": [
        "body",
        "sepal_width"
      ],
      "msg": "value is not a valid float",
      "type": "type_error.float"
    }
  ]
}`}</Pre>
        <p>
          You have now successfully built a functioning ML prediction service using FastAPI! It loads a model, defines clear data
          contracts with Pydantic for input and output, and serves predictions through a well-defined API endpoint. This forms a
          solid foundation for deploying more complex models. In later chapters, we will explore structuring larger applications,
          testing, handling asynchronous operations, and containerization.
        </p>
        <Box title="Current versions" tone="amber">
          <p>
            That error body is Pydantic v1. On current FastAPI the same request still returns 422, with <C>type</C> like{' '}
            <C>float_parsing</C> and a message such as “Input should be a valid number”. The request still stops before{' '}
            <C>model.predict</C>.
          </p>
        </Box>
        <Hint>Send the string, then omit petal width. Both die at IrisFeatures.</Hint>
      </div>
    ),
  },
];

export default function SerializingAndDeserializingMLModelsPartFour() {
  return <ChapterDeck slides={slidesData} />;
}
