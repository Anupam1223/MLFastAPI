import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  NoServerVisualizer,
  HelloClientVisualizer,
  SharedFixtureVisualizer,
  PostGateVisualizer,
  PathQueryVisualizer,
  PredictAimsVisualizer,
  PredictGateVisualizer,
  TimesTwoVisualizer,
  MockSwapVisualizer,
  OverrideCleanupVisualizer,
  DummyPathVisualizer,
  ScenarioVisualizer,
} from '../components/TestClientVisualizers';

export const meta = {
  title: 'Structuring and Testing FastAPI Applications (Part 2)',
  subtitle: 'TestClient, pytest, and swapping the model in a test',
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
    id: 'no-server',
    title: 'Using TestClient',
    subtitle: 'HTTP against the app, with the port still dark',
    Visual: NoServerVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Testing your FastAPI application is a fundamental part of building reliable services. Manually testing endpoints through
          tools like <C>curl</C> or browser interfaces can be time-consuming and error-prone, especially as the application grows.
          FastAPI provides a convenient way to write automated tests for your API using the <C>TestClient</C>.
        </p>
        <p>
          The <C>TestClient</C> is built upon the excellent <C>httpx</C> library, which provides a modern, async-capable HTTP client.
          However, when used for testing FastAPI applications, <C>TestClient</C> interacts directly with your application code{' '}
          <em>without</em> needing to run a live web server like Uvicorn. This makes tests faster, more reliable, and easier to run
          in automated environments like Continuous Integration (CI) pipelines. It effectively simulates sending HTTP requests to
          your application and allows you to inspect the responses.
        </p>
        <Box title="What kind of test this is" tone="amber">
          <p>
            The lesson title says unit test. <C>TestClient</C> still runs the route, the validation, and the function. Part 1 called
            that an integration test of the endpoint. A unit test of a service function would call it directly and skip{' '}
            <C>TestClient</C>.
          </p>
        </Box>
        <Hint>Watch curl miss the port. Then watch the same GET hit the app with nothing listening.</Hint>
      </div>
    ),
  },
  {
    id: 'hello',
    title: 'Setting Up the TestClient',
    subtitle: 'client.get("/") then two asserts',
    Visual: HelloClientVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          To use <C>TestClient</C>, you first need to import it and instantiate it by passing your FastAPI application instance.
          Typically, you’ll do this within your test files.
        </p>
        <p>Let’s assume you have a simple FastAPI application defined in a file named <C>main.py</C>:</p>
        <Pre>{`# main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.post("/items/")
async def create_item(item: Item):
    return {"item_name": item.name, "item_price": item.price}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}`}</Pre>
        <p>Now, you can create a test file (e.g., <C>test_main.py</C>) and set up the <C>TestClient</C>:</p>
        <Pre>{`# test_main.py
from fastapi.testclient import TestClient
from main import app # Import your FastAPI app instance

# Instantiate the TestClient
client = TestClient(app)

def test_read_main():
    # Send a GET request to the root path "/"
    response = client.get("/")
    # Assert that the HTTP status code is 200 (OK)
    assert response.status_code == 200
    # Assert that the response JSON matches the expected dictionary
    assert response.json() == {"message": "Hello World"}`}</Pre>
        <p>In this example:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>We import <C>TestClient</C> from <C>fastapi.testclient</C>.</li>
          <li>We import the <C>app</C> instance from our <C>main.py</C> file.</li>
          <li>We create an instance of <C>TestClient</C>, passing our <C>app</C> to it.</li>
          <li>
            Inside the <C>test_read_main</C> function (test functions often start with <C>test_</C>), we use <C>client.get("/")</C> to
            simulate a GET request to the root endpoint.
          </li>
          <li>
            We then use standard <C>assert</C> statements to check if the <C>response.status_code</C> is <C>200</C> (HTTP OK) and if
            the <C>response.json()</C> content matches what the endpoint should return.
          </li>
        </ol>
        <Box title="The call is synchronous" tone="amber">
          <p>
            The endpoint is <C>async def</C>, but the test calls <C>client.get</C> with no <C>await</C>. <C>bool | None</C> and{' '}
            <C>str | None</C> need Python 3.10+, or <C>Optional</C> on older versions.
          </p>
        </Box>
        <Hint>Step from the bare app, to the wrapper, to the GET, to the two things the assert checks.</Hint>
      </div>
    ),
  },
  {
    id: 'fixture',
    title: 'Integration with Pytest',
    subtitle: 'One client, yielded to every test',
    Visual: SharedFixtureVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While you can run simple scripts using <C>TestClient</C>, it integrates very well with testing frameworks like{' '}
          <C>pytest</C>. Pytest provides features like test discovery, fixtures (for setup/teardown), assertions, and reporting,
          making your testing workflow effective.
        </p>
        <p>A typical <C>pytest</C> structure might look like this:</p>
        <Pre>{`# test_main.py (using pytest structure)
import pytest
from fastapi.testclient import TestClient
from main import app # Assuming main.py contains your FastAPI app

# Using a pytest fixture to create the client once for multiple tests
@pytest.fixture(scope="module")
def test_client():
    client = TestClient(app)
    yield client # Provide the client to the tests

# Tests now accept the fixture name as an argument
def test_read_main(test_client):
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item(test_client):
    response = test_client.post("/items/", json={"name": "Test Item", "price": 10.99})
    assert response.status_code == 200
    assert response.json() == {"item_name": "Test Item", "item_price": 10.99}

# ... other tests using test_client ...`}</Pre>
        <p>
          Using fixtures like <C>test_client</C> helps manage setup code cleanly. You would typically run these tests using the{' '}
          <C>pytest</C> command in your terminal.
        </p>
        <p>
          By leveraging <C>TestClient</C>, you can write comprehensive unit tests for your FastAPI endpoints, ensuring that your API
          logic, data validation, and response structures behave exactly as expected. This forms a significant part of building
          reliable and maintainable ML deployment services. In the next sections, we will explore how to test more complex
          scenarios, including those involving database interactions or external dependencies, often requiring techniques like
          mocking.
        </p>
        <Hint>Watch one client get handed to both tests. Then the runner is just pytest.</Hint>
      </div>
    ),
  },
  {
    id: 'post',
    title: 'Testing POST Requests',
    subtitle: 'json= is the body. A missing field is 422.',
    Visual: PostGateVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The <C>TestClient</C> supports all standard HTTP methods like <C>POST</C>, <C>PUT</C>, <C>DELETE</C>, etc., mirroring the{' '}
          <C>httpx</C> API.
        </p>
        <p>
          To test endpoints that expect data in the request body (like our <C>/items/</C> POST endpoint), you can pass a dictionary
          to the <C>json</C> parameter of the request method:
        </p>
        <Pre>{`# test_main.py (continued)
def test_create_item():
    item_data = {"name": "Test Item", "price": 10.99}
    # Send a POST request to "/items/" with JSON data
    response = client.post("/items/", json=item_data)
    # Assert status code 200 (OK)
    assert response.status_code == 200
    # Assert the response JSON matches the expected output
    # Note: The endpoint returns 'item_name' and 'item_price'
    assert response.json() == {"item_name": "Test Item", "item_price": 10.99}

def test_create_item_invalid_data():
    # Send data missing the required 'price' field
    invalid_item_data = {"name": "Incomplete Item"}
    response = client.post("/items/", json=invalid_item_data)
    # FastAPI automatically returns 422 for validation errors
    assert response.status_code == 422
    # You can optionally check the detail of the validation error
    # assert "detail" in response.json() # More specific checks can be added`}</Pre>
        <p>
          The second test, <C>test_create_item_invalid_data</C>, demonstrates testing the validation logic handled by Pydantic.
          Sending incomplete data results in a <strong className="text-white">422 Unprocessable Entity</strong> status code, which we
          assert.
        </p>
        <Hint>Step once. The second body never gets a renamed item back.</Hint>
      </div>
    ),
  },
  {
    id: 'path-query',
    title: 'Testing Path and Query Parameters',
    subtitle: 'The number is in the path. q rides along in params.',
    Visual: PathQueryVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Testing endpoints with path and query parameters is straightforward. Path parameters are included directly in the URL
          string, and query parameters can be passed as a dictionary to the <C>params</C> argument.
        </p>
        <Pre>{`# test_main.py (continued)
def test_read_item():
    item_id = 5
    # Send a GET request to "/items/5"
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200
    assert response.json() == {"item_id": item_id, "q": None}

def test_read_item_with_query_param():
    item_id = 10
    query_string = "some query"
    # Send a GET request to "/items/10?q=some%20query"
    response = client.get(f"/items/{item_id}", params={"q": query_string})
    assert response.status_code == 200
    assert response.json() == {"item_id": item_id, "q": query_string}`}</Pre>
        <Box title="None in the assert, null on the wire" tone="amber">
          <p>
            <C>response.json()</C> turns JSON <C>null</C> into Python <C>None</C>, so the assert compares against <C>None</C>. The
            bytes on the wire are <C>{'"q": null'}</C>.
          </p>
        </Box>
        <Hint>First request has no query. The second one attaches q.</Hint>
      </div>
    ),
  },
  {
    id: 'aims',
    title: 'Testing Prediction Endpoints',
    subtitle: 'Four checks around the model, not a new accuracy score',
    Visual: PredictAimsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Testing endpoints that perform machine learning predictions requires specific strategies past standard API logic
          validation. <C>TestClient</C> is often used for general endpoint testing, but prediction endpoints involve external
          dependencies like loaded models and potentially complex inference logic, making direct testing sometimes impractical or
          slow. Techniques are presented to effectively unit and integration test ML prediction endpoints.
        </p>
        <p>
          The primary goal when testing prediction endpoints is not typically to re-validate the model’s accuracy (which is usually
          handled during the ML training and evaluation phases) but rather to ensure the API surrounding the model works correctly.
          We want to verify:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong className="text-white">Input Handling:</strong> Does the endpoint correctly receive, parse, and validate input data using the defined Pydantic models?</li>
          <li><strong className="text-white">Integration with Prediction Logic:</strong> Does the endpoint correctly call the underlying function or method responsible for making predictions?</li>
          <li><strong className="text-white">Output Formatting:</strong> Does the endpoint return the prediction results in the expected format, adhering to the response model?</li>
          <li><strong className="text-white">Error Handling:</strong> Does the endpoint gracefully handle errors during prediction (e.g., invalid input shapes, unexpected model behavior)?</li>
        </ol>
        <Hint>Four beats. Each one is a single question the test is allowed to ask.</Hint>
      </div>
    ),
  },
  {
    id: 'predict-gate',
    title: 'A Prediction Request, Valid and Not',
    subtitle: '200 when both fields arrive. 422 when feature2 does not.',
    Visual: PredictGateVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          As with other endpoints, FastAPI’s <C>TestClient</C> is the primary tool for testing prediction endpoints. You simulate
          HTTP requests (e.g., POST requests with prediction input) and assert the expected HTTP status codes and response bodies.
        </p>
        <Pre>{`# Example structure (assuming pytest and TestClient fixture 'client')
from fastapi import status
from pydantic import BaseModel
# Assume these are defined elsewhere
# from my_app.schemas import PredictionInput, PredictionOutput
# from my_app.main import app

class PredictionInput(BaseModel):
    feature1: float
    feature2: str

class PredictionOutput(BaseModel):
    prediction: float
    probability: float | None = None

# In your test file (e.g., test_predictions.py)
def test_predict_endpoint_success(client):
    # Define valid input data based on PredictionInput schema
    input_data = {"feature1": 10.5, "feature2": "categoryA"}

    response = client.post("/predict", json=input_data)

    assert response.status_code == status.HTTP_200_OK

    # Assuming the endpoint returns data matching PredictionOutput
    response_data = response.json()
    assert "prediction" in response_data
    # Further assertions based on expected output structure...
    # For example, check type:
    assert isinstance(response_data["prediction"], float)

def test_predict_endpoint_invalid_input(client):
    # Input data missing a required field
    invalid_input_data = {"feature1": 10.5}

    response = client.post("/predict", json=invalid_input_data)

    # FastAPI/Pydantic automatically handle validation errors
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY`}</Pre>
        <Hint>The names HTTP_200_OK and HTTP_422_UNPROCESSABLE_ENTITY are just 200 and 422.</Hint>
      </div>
    ),
  },
  {
    id: 'times-two',
    title: 'The Dependency the Test Will Replace',
    subtitle: 'Depends runs perform_prediction, which returns feature1 × 2',
    Visual: TimesTwoVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Handling Model Dependencies in Tests</p>
        <p>
          The main challenge arises from the ML model itself. Loading and running a real model during unit tests can be slow,
          resource-intensive, and introduce external factors (like file paths) that complicate testing. We need ways to isolate the
          API logic from the actual model inference for faster, more reliable unit tests.
        </p>
        <p>Let’s assume your prediction endpoint uses a dependency to get the prediction result:</p>
        <Pre>{`# In your application (e.g., my_app/predictor.py)
def get_model():
    # Logic to load your actual ML model
    # ...
    return loaded_model
    pass # Placeholder

def perform_prediction(data: PredictionInput, model = Depends(get_model)):
    # Actual prediction logic using the loaded model
    # prediction_result = model.predict(processed_data)
    # return {"prediction": prediction_result, "probability": 0.95} # Example
    # For demonstration, return a fixed structure
    return {"prediction": data.feature1 * 2, "probability": 0.9}`}</Pre>
        <Pre>{`# In your main FastAPI file (e.g., my_app/main.py)
from fastapi import FastAPI, Depends
from .schemas import PredictionInput, PredictionOutput
from .predictor import perform_prediction

app = FastAPI()

@app.post("/predict", response_model=PredictionOutput)
async def predict(data: PredictionInput, result: dict = Depends(perform_prediction)):
    # The dependency injection handles calling perform_prediction
    # Note: Changed perform_prediction to return a dict directly for simplicity here
    # A more approach might involve a class-based dependency
    return result`}</Pre>
        <Box title="The model argument is unused" tone="amber">
          <p>
            The comments show <C>model.predict</C>. The return that actually runs is <C>data.feature1 * 2</C>. Overriding{' '}
            <C>get_model</C> does not change that number, because this function never calls the model.
          </p>
        </Box>
        <Hint>Drag feature1. The route does not multiply. perform_prediction does, before the route body runs.</Hint>
      </div>
    ),
  },
  {
    id: 'mock',
    title: 'Mocking the Prediction',
    subtitle: 'Same POST. The function in front of it changed.',
    Visual: MockSwapVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Mocking the Prediction Logic</p>
        <p>
          Mocking involves replacing the actual prediction function or model object with a substitute (a “mock”) during the test run.
          This mock can be programmed to return predefined outputs, allowing you to test the API’s behavior without executing the
          real model inference.
        </p>
        <p>
          FastAPI’s dependency injection system provides an elegant way to achieve this using <C>app.dependency_overrides</C>. You
          can override the dependency that provides the model or the prediction function itself.
        </p>
        <p>Now, in your test file, you can override the <C>perform_prediction</C> dependency:</p>
        <Pre>{`# In your test file (e.g., test_predictions.py)
from fastapi.testclient import TestClient
from my_app.main import app # Import your FastAPI app instance
from my_app.predictor import perform_prediction # Import the original dependency
from my_app.schemas import PredictionInput, PredictionOutput

# Create a mock prediction function for testing
async def mock_perform_prediction(data: PredictionInput):
    # Simulate prediction logic - return a fixed, known result
    # You can add assertions here about 'data' if needed
    print(f"Mock prediction called with: {data}")
    return {"prediction": 123.45, "probability": 0.88}

# Use FastAPI's dependency override feature
app.dependency_overrides[perform_prediction] = mock_perform_prediction

client = TestClient(app) # Create TestClient *after* overriding

def test_predict_with_mock(client):
    input_data = {"feature1": 10.5, "feature2": "categoryA"}
    response = client.post("/predict", json=input_data)

    assert response.status_code == 200
    response_data = response.json()
    # Assert against the output defined in the mock function
    assert response_data["prediction"] == 123.45
    assert response_data["probability"] == 0.88

# Remember to clear the override if other tests need the original dependency
# This is often handled better with pytest fixtures (see below)
def teardown_function():
    # Example using pytest teardown
    app.dependency_overrides.clear()`}</Pre>
        <Hint>21 slides out of the way. 123.45 slides in. clear() puts 21 back.</Hint>
      </div>
    ),
  },
  {
    id: 'cleanup',
    title: 'Clear the Override',
    subtitle: 'A fixture yields the client, then clears',
    Visual: OverrideCleanupVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Using pytest Fixtures for Cleaner Overrides:</p>
        <p>pytest fixtures provide a cleaner way to manage setup and teardown, including dependency overrides:</p>
        <Pre>{`# In conftest.py or your test file
import pytest
from fastapi.testclient import TestClient
from my_app.main import app
from my_app.predictor import perform_prediction
from my_app.schemas import PredictionInput

@pytest.fixture(scope="function") # Scope can be adjusted
def client_with_mock_predictor():
    # Define the mock function inside the fixture
    async def mock_perform_prediction_fixture(data: PredictionInput):
        return {"prediction": 123.45, "probability": 0.88}

    # Apply the override
    app.dependency_overrides[perform_prediction] = mock_perform_prediction_fixture
    # Yield the TestClient
    yield TestClient(app)
    # Teardown: Clear the override after the test using this fixture finishes
    app.dependency_overrides.clear()

# In your test file (e.g., test_predictions.py)
def test_predict_with_fixture(client_with_mock_predictor): # Use the fixture
    input_data = {"feature1": 10.5, "feature2": "categoryA"}
    # Use the client provided by the fixture
    response = client_with_mock_predictor.post("/predict", json=input_data)

    assert response.status_code == 200
    response_data = response.json()
    assert response_data["prediction"] == 123.45
    assert response_data["probability"] == 0.88`}</Pre>
        <p className="text-white font-semibold">Pros of Mocking:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">Speed:</strong> Tests run very quickly as no real model inference occurs.</li>
          <li><strong className="text-white">Isolation:</strong> Tests focus solely on the API layer, independent of model behavior or loading issues.</li>
          <li><strong className="text-white">Control:</strong> You precisely control the output of the mocked function for predictable assertions.</li>
        </ul>
        <p className="text-white font-semibold">Cons of Mocking:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">Doesn’t test integration:</strong> It doesn’t verify that the <em>actual</em> model loading and prediction function work correctly when called by the API.</li>
          <li><strong className="text-white">Maintenance:</strong> If the signature or behavior of the real function changes, the mock might need updating.</li>
        </ul>
        <Hint>The first test always sees 123.45. Toggle whether the second test still does.</Hint>
      </div>
    ),
  },
  {
    id: 'dummy',
    title: 'Using a Dummy Model',
    subtitle: 'The route still calls predict. The object behind it is trivial.',
    Visual: DummyPathVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          An alternative to mocking is to use a very simple, fast “dummy” model during tests. This dummy model should mimic the
          interface (e.g., <C>predict</C> method) of your real model but perform a trivial operation.
        </p>
        <p>
          You can achieve this using dependency injection, similar to mocking, but instead of mocking the prediction function, you
          might override the dependency that loads the model (<C>get_model</C> in our earlier example).
        </p>
        <Pre>{`# In your test setup (e.g., conftest.py or test file)
class DummyModel:
    """A simple model stand-in for testing."""
    def predict(self, input_data):
        # Simple logic, e.g., return a fixed value or based on input length
        print("DummyModel predict called")
        return [sum(input_data.values())] # Example dummy prediction

    def predict_proba(self, input_data):
        # Dummy probabilities
        return [[0.1, 0.9]] # Example

def get_dummy_model():
    print("Providing DummyModel")
    return DummyModel()

# In your pytest fixture or test setup
@pytest.fixture(scope="function")
def client_with_dummy_model():
    # Assume get_model is the dependency used to load the model
    # from my_app.predictor import get_model # Import the original dependency
    # app.dependency_overrides[get_model] = get_dummy_model # Override it

    # If perform_prediction directly uses the model:
    # You might need to structure your dependency differently,
    # e.g., have perform_prediction accept the model via Depends
    # async def perform_prediction(data: Input, model = Depends(get_model)): ...

    # For demonstration, let's assume we adjust perform_prediction to use the model from get_model
    # This part requires adapting your actual app structure
    # app.dependency_overrides[get_model] = get_dummy_model # Example override

    yield TestClient(app) # Assuming override is applied correctly
    app.dependency_overrides.clear() # Cleanup`}</Pre>
        <p>
          <em>
            Note: The exact implementation depends heavily on how your model is loaded and accessed within your endpoint logic.
            Ensure your dependencies are structured to allow overriding the model provider.
          </em>
        </p>
        <p className="text-white font-semibold">Pros of Dummy Model:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">Tests Integration Path:</strong> Verifies more of the path, including the code that calls the model’s methods.</li>
          <li><strong className="text-white">Simpler Mock Logic:</strong> The dummy model itself contains the simple logic, potentially simplifying the test setup compared to complex mocks.</li>
        </ul>
        <p className="text-white font-semibold">Cons of Dummy Model:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-white">Still Not the Real Model:</strong> Doesn’t test interactions with the actual ML model.</li>
          <li><strong className="text-white">Requires Dummy Implementation:</strong> You need to create and maintain this simple model mimic.</li>
        </ul>
        <Box title="sum() and a string feature" tone="amber">
          <p>
            The course body has <C>feature2: str</C>. <C>sum(input_data.values())</C> cannot add a string. The picture uses 2 and 3,
            and the return is a list, <C>[5]</C>, while <C>PredictionOutput.prediction</C> is a float.
          </p>
        </Box>
        <Hint>Switch. The mock never lights the model. The dummy does, and the number is 2 + 3.</Hint>
      </div>
    ),
  },
  {
    id: 'scenarios',
    title: 'Structuring Prediction Tests',
    subtitle: 'Happy path, 422, an edge, and the keys you promised',
    Visual: ScenarioVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Regardless of the strategy (mocking or dummy model), structure your tests to cover various scenarios:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Happy Path:</strong> Test with valid input data and assert the expected successful response
            (status code 200) and correct output structure/values based on your mock or dummy model.
          </li>
          <li>
            <strong className="text-white">Validation Errors:</strong> Test with invalid input data (missing fields, incorrect types)
            and assert the expected error response (status code 422). Pydantic handles this, but testing confirms your schemas are
            applied.
          </li>
          <li>
            <strong className="text-white">Edge Cases (if feasible):</strong> If your mock or dummy model allows, test inputs that
            might represent edge cases (e.g., zero values, specific categories) to ensure the surrounding API logic handles them.
          </li>
          <li>
            <strong className="text-white">Response Schema Adherence:</strong> Explicitly check that the keys and data types in the
            JSON response match your Pydantic <C>response_model</C>.
          </li>
        </ul>
        <Hint>Four requests. The assert is the only thing that changes.</Hint>
      </div>
    ),
  },
];

export default function StructuringAndTestingFastAPIApplicationsPartTwo() {
  return <ChapterDeck slides={slidesData} />;
}
