import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  CrowdedMainVisualizer,
  ProjectTreeVisualizer,
  SchemaFileVisualizer,
  RouterBuildVisualizer,
  IncludeRouterVisualizer,
  StructureMapVisualizer,
  RootTestVisualizer,
  PredictOkVisualizer,
  WrongTypeVisualizer,
  MissingFeatureVisualizer,
  PytestRunVisualizer,
} from '../components/RefactorPredictVisualizers';

export const meta = {
  title: 'Structuring and Testing FastAPI Applications (Part 4)',
  subtitle: 'Refactor the prediction service, then test it',
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
    id: 'before',
    title: 'One File for the Whole Service',
    subtitle: 'Schemas, the model, and every route start in main.py',
    Visual: CrowdedMainVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          A machine learning prediction service will be refactored for better organization using <C>APIRouter</C>. Subsequently,
          tests will be written using <C>TestClient</C> to ensure its functionality and reliability.
        </p>
        <p>Assume our initial prediction service looks something like this (likely in a single <C>main.py</C> file):</p>
        <Pre>{`# main_before_refactor.py (Illustrative example)
from fastapi import FastAPI
from pydantic import BaseModel
import joblib # Or your preferred model loading library

# Assume model is pre-trained and saved as 'model.joblib'
# Assume necessary preprocessing steps are defined elsewhere or simple

# --- Data Models (from Chapter 2) ---
class InputFeatures(BaseModel):
    feature1: float
    feature2: float
    # ... other features

class PredictionOutput(BaseModel):
    prediction: float # Or appropriate type

# --- Application Setup ---
app = FastAPI(title="Simple ML Prediction Service")

# --- Model Loading (from Chapter 3) ---
# In a real app, handle potential loading errors
model = joblib.load("model.joblib")

# --- Prediction Endpoint (from Chapter 3) ---
@app.post("/predict", response_model=PredictionOutput)
async def make_prediction(input_data: InputFeatures):
    """
    Accepts input features and returns a prediction.
    """
    # Convert Pydantic model to format expected by the model
    # This is simplified; real preprocessing might be more complex
    features = [[input_data.feature1, input_data.feature2]]

    prediction_result = model.predict(features)

    return PredictionOutput(prediction=prediction_result[0])

# --- Root Endpoint (Optional) ---
@app.get("/")
async def read_root():
    return {"message": "Prediction service is running"}

# To run (using uvicorn): uvicorn main_before_refactor:app --reload`}</Pre>
        <p>
          This works for simple cases, but as we add more endpoints (e.g., for model info, batch predictions, different model
          versions), this single file becomes unwieldy.
        </p>
        <Hint>Add an endpoint on the right. It has nowhere to go except this file.</Hint>
      </div>
    ),
  },
  {
    id: 'tree',
    title: 'The Project Split',
    subtitle: 'Each job gets its own file',
    Visual: ProjectTreeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Let’s structure the project using <C>APIRouter</C>.</p>
        <p>1. Create a project structure. Organize your files like this:</p>
        <Pre>{`your_project/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Main application setup
│   ├── routers/
│   │   ├── __init__.py
│   │   └── predictions.py      # Prediction-related routes
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   └── core/
│       ├── __init__.py
│       └── config.py           # Configuration (optional for now)
├── tests/
│   ├── __init__.py
│   └── test_predictions.py     # Tests for prediction routes
├── model.joblib                # Your serialized model
└── requirements.txt            # Project dependencies`}</Pre>
        <Hint>Split the project, then click each file to see what moved into it.</Hint>
      </div>
    ),
  },
  {
    id: 'schemas',
    title: 'Pydantic Models in schemas.py',
    subtitle: 'InputFeatures in, PredictionOutput out',
    Visual: SchemaFileVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          2. Define Pydantic models. Move the Pydantic models to <C>app/models/schemas.py</C>:
        </p>
        <Pre>{`# app/models/schemas.py
from pydantic import BaseModel

class InputFeatures(BaseModel):
    feature1: float
    feature2: float
    # ... other features

class PredictionOutput(BaseModel):
    prediction: float # Or appropriate type`}</Pre>
        <Hint>Click InputFeatures, then PredictionOutput. The body and the response have to match those fields.</Hint>
      </div>
    ),
  },
  {
    id: 'router',
    title: 'The Prediction Router',
    subtitle: 'prefix="/predict" turns "/" into /predict/',
    Visual: RouterBuildVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          3. Create the prediction router. Move the prediction logic into <C>app/routers/predictions.py</C>. Notice we import{' '}
          <C>APIRouter</C> and use <C>router</C> instead of <C>app</C> as the decorator. We also adjust import paths.
        </p>
        <Pre>{`# app/routers/predictions.py
from fastapi import APIRouter
import joblib
from app.models.schemas import InputFeatures, PredictionOutput

# Assume model path is configured or known
MODEL_PATH = "model.joblib"
model = joblib.load(MODEL_PATH)

router = APIRouter(
    prefix="/predict", # All routes in this router will start with /predict
    tags=["predictions"] # Group endpoints in API docs
)

@router.post("/", response_model=PredictionOutput) # Path is now relative to prefix
async def make_prediction(input_data: InputFeatures):
    """
    Accepts input features and returns a prediction.
    (Logic remains the same as before)
    """
    features = [[input_data.feature1, input_data.feature2]]
    prediction_result = model.predict(features)
    return PredictionOutput(prediction=prediction_result[0])

# You could add other prediction-related endpoints here later,
# e.g., @router.post("/batch", ...)`}</Pre>
        <Hint>Turn the prefix off. The decorator stays @router.post("/"), and the public path changes.</Hint>
      </div>
    ),
  },
  {
    id: 'include',
    title: 'main.py Includes the Router',
    subtitle: 'GET / stays. POST /predict goes through predictions.router',
    Visual: IncludeRouterVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          4. Update the main application. Modify <C>app/main.py</C> to create the main <C>FastAPI</C> instance and include the router.
        </p>
        <Pre>{`# app/main.py
from fastapi import FastAPI
from app.routers import predictions # Import the router module

app = FastAPI(title="Refactored ML Prediction Service")

# Include the router from predictions.py
app.include_router(predictions.router)

@app.get("/")
async def read_root():
    return {"message": "Prediction service is running"}

# To run: uvicorn app.main:app --reload`}</Pre>
        <Hint>Call GET /, then POST /predict/. Only the second one enters the router.</Hint>
      </div>
    ),
  },
  {
    id: 'map',
    title: 'How the Files Connect',
    subtitle: 'main.py includes the router. The router imports the schemas. Tests hit the app.',
    Visual: StructureMapVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Now our prediction logic is neatly contained within <C>app/routers/predictions.py</C>, and <C>main.py</C> is cleaner,
          focusing on application setup and routing.
        </p>
        <p>
          <C>main.py</C> includes <C>predictions.py</C>. <C>predictions.py</C> imports <C>schemas.py</C>. The test file talks to the
          FastAPI app. The app includes the <C>APIRouter</C>, and the router uses the Pydantic models.
        </p>
        <Hint>Click each box. The line under the diagram is that file’s job.</Hint>
      </div>
    ),
  },
  {
    id: 'root-test',
    title: 'TestClient Hits GET /',
    subtitle: '200, and the exact message',
    Visual: RootTestVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          With the structure in place, let’s write tests. We’ll use <C>pytest</C> and FastAPI’s <C>TestClient</C>.
        </p>
        <p>1. Install pytest, if you haven’t already:</p>
        <Pre>{`pip install pytest`}</Pre>
        <p>
          2. Create the test file <C>tests/test_predictions.py</C>.
        </p>
        <p>3. Write the tests. Start with the client and the root route:</p>
        <Pre>{`# tests/test_predictions.py
from fastapi.testclient import TestClient
from app.main import app # Import the FastAPI app instance
from app.models.schemas import InputFeatures # Import for type hints if needed

# Create a TestClient instance using our FastAPI app
client = TestClient(app)

def test_read_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Prediction service is running"}`}</Pre>
        <Box title="Importing the app loads the model" tone="amber">
          <p>
            <C>from app.main import app</C> also imports the router, and that file calls <C>joblib.load("model.joblib")</C> at import
            time. Without that file on disk, collection fails before the first assert. Part 2 showed how a test swaps the model.
          </p>
        </Box>
        <Hint>Flip the handler message. Status stays 200. The json assert fails.</Hint>
      </div>
    ),
  },
  {
    id: 'predict-ok',
    title: 'A Valid Prediction',
    subtitle: '200, a prediction key, and a float',
    Visual: PredictOkVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`def test_make_prediction_success():
    """Test the prediction endpoint with valid input."""
    # Define valid input data matching InputFeatures schema
    valid_input = {"feature1": 5.1, "feature2": 3.5}

    # Make a POST request to the /predict/ endpoint
    response = client.post("/predict/", json=valid_input)

    # Assert the request was successful (HTTP 200 OK)
    assert response.status_code == 200

    # Assert the response body structure matches PredictionOutput
    response_data = response.json()
    assert "prediction" in response_data

    # Optionally, assert the type of the prediction
    assert isinstance(response_data["prediction"], float)

    # Note: Asserting the exact prediction value depends on your model
    # and might require a fixed test dataset or mocking the model.
    # For simplicity here, we focus on structure and status.`}</Pre>
        <Hint>The body is two floats. The checks are status, the key, and the type. The number itself is not locked.</Hint>
      </div>
    ),
  },
  {
    id: 'wrong-type',
    title: 'A String Instead of a Float',
    subtitle: 'Pydantic returns 422 before the model runs',
    Visual: WrongTypeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`def test_make_prediction_invalid_input_type():
    """Test the prediction endpoint with incorrect input data type."""
    # Send data where a feature is a string instead of a float
    invalid_input = {"feature1": "wrong_type", "feature2": 3.5}

    response = client.post("/predict/", json=invalid_input)

    # FastAPI/Pydantic automatically handles validation errors
    # Expect HTTP 422 Unprocessable Entity
    assert response.status_code == 422

    # Check if the response body contains validation error details
    response_data = response.json()
    assert "detail" in response_data
    # You can add more specific checks on the error message if needed
    # e.g., assert "feature1" in str(response_data["detail"])`}</Pre>
        <Hint>Send "wrong_type", then send 5.1. Only the string stops at 422.</Hint>
      </div>
    ),
  },
  {
    id: 'missing',
    title: 'A Missing Feature',
    subtitle: '422 names feature2 as required',
    Visual: MissingFeatureVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`def test_make_prediction_missing_input_feature():
    """Test the prediction endpoint with missing input data."""
    # Send data missing 'feature2'
    missing_input = {"feature1": 5.1}

    response = client.post("/predict/", json=missing_input)

    # Expect HTTP 422 Unprocessable Entity
    assert response.status_code == 422

    response_data = response.json()
    assert "detail" in response_data
    # e.g., assert "feature2" in str(response_data["detail"])
    # e.g., assert "field required" in str(response_data["detail"])`}</Pre>
        <Hint>Drop feature2, then put it back. The 422 names that field.</Hint>
      </div>
    ),
  },
  {
    id: 'pytest',
    title: 'pytest Runs tests/',
    subtitle: 'Four tests, collected from the tests directory',
    Visual: PytestRunVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          4. Run the tests. Navigate to your project’s root directory (<C>your_project/</C>) in the terminal and run <C>pytest</C>:
        </p>
        <Pre>{`pytest`}</Pre>
        <p>
          Pytest will discover and run the tests in the <C>tests</C> directory. You should see output indicating whether the tests
          passed or failed.
        </p>
        <p>
          This hands-on exercise demonstrates how to apply the structuring principles using <C>APIRouter</C> to organize your
          prediction service and how to use <C>TestClient</C> to write effective tests. This approach significantly improves
          maintainability and ensures your API behaves as expected, even after refactoring or adding new features. As your
          application grows, this separation and testing become increasingly valuable.
        </p>
        <Hint>Run pytest. Then click a test to see the request it sends.</Hint>
      </div>
    ),
  },
];

export default function StructuringAndTestingFastAPIApplicationsPartFour() {
  return <ChapterDeck slides={slidesData} />;
}
