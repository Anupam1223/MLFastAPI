import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  SyncEndpointVisualizer,
  AsyncIoTrapVisualizer,
  ThreadpoolPredictVisualizer,
  CombinedPipelineVisualizer,
} from '../components/AsyncPerfPartThreeVisualizers';

export const meta = {
  title: 'Asynchronous Operations and Performance (Part 3)',
  subtitle: 'refactor one endpoint: blocking, await, a thread pool, then a background log',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;
const Pre = CodeBlock;

const Box = ({ title, tone = 'amber', children }) => (
  <div className={`rounded-lg border border-gray-700 bg-gray-800/30 p-3 border-l-4 ${tone === 'amber' ? 'border-l-amber-400' : 'border-l-teal-400'} space-y-1.5`}>
    {title && <p className="text-white font-semibold">{title}</p>}
    {children}
  </div>
);

const Hint = ({ children }) => <p className="text-xs text-gray-400">{children}</p>;

const slidesData = [
  {
    id: 'sync-endpoint',
    title: 'Initial Synchronous Endpoint',
    subtitle: 'The fetch and the predict both call time.sleep on the worker',
    Visual: SyncEndpointVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Practice: Implementing Async Operations</p>
        <p>
          This hands-on practice applies asynchronous operation techniques. Refactor synchronous code and implement new features
          using <C>async</C>/<C>await</C>, <C>run_in_threadpool</C> for blocking tasks, and background tasks. This exercise
          demonstrates how to improve the responsiveness and efficiency of your FastAPI ML application.
        </p>
        <p>
          We’ll start with a basic, synchronous endpoint that simulates both a potentially slow I/O operation (like fetching
          feature definitions from an external source) and a CPU-intensive model prediction step.
        </p>
        <p>
          Imagine you have an endpoint that first needs to fetch some configuration or metadata related to the request
          (simulated I/O) and then runs a model prediction (simulated CPU work).
        </p>
        <Pre>{`import time
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Simulate a blocking function (e.g., CPU-bound ML inference)
def run_model_prediction(data_point: float) -> float:
    print("Starting model prediction...")
    # Simulate computation time
    time.sleep(1)
    result = data_point * 2 # Simple dummy operation
    print("Finished model prediction.")
    return result

# Simulate a blocking I/O call (e.g., database query, external API call)
def fetch_external_data(item_id: int) -> dict:
    print(f"Fetching external data for item {item_id}.")
    # Simulate I/O delay
    time.sleep(0.5)
    print("Finished fetching external data.")
    # Return some dummy data
    return {"item_id": item_id, "metadata": "some_fetched_value"}

class PredictionRequest(BaseModel):
    item_id: int
    feature_value: float

class PredictionResponse(BaseModel):
    item_id: int
    metadata: str
    prediction: float

@app.post("/predict_sync", response_model=PredictionResponse)
def predict_synchronously(request: PredictionRequest):
    print("Received prediction request.")
    # Step 1: Fetch external data (Blocking I/O)
    external_data = fetch_external_data(request.item_id)

    # Step 2: Run model prediction (Blocking CPU)
    prediction_result = run_model_prediction(request.feature_value)

    print("Sending response.")
    return PredictionResponse(
        item_id=external_data["item_id"],
        metadata=external_data["metadata"],
        prediction=prediction_result
    )

# To run this: uvicorn your_module_name:app --reload
# Send a POST request to http://127.0.0.1:8000/predict_sync
# Body: {"item_id": 123, "feature_value": 5.0}`}</Pre>
        <p>
          If you run this application and send multiple requests concurrently (e.g., using tools like <C>ab</C> or by opening
          multiple browser tabs quickly), you’ll notice that the server processes them one after another. The <C>time.sleep</C>{' '}
          calls block the entire worker process, preventing it from handling other requests until the current one is fully
          completed.
        </p>
        <Hint>Use Prev step and Next step. Request B stays in line until A’s fetch and predict both finish.</Hint>
      </div>
    ),
  },
  {
    id: 'async-io',
    title: 'Converting to Async for I/O',
    subtitle: 'The fetch yields. The predict still stops the loop.',
    Visual: AsyncIoTrapVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI shines when dealing with I/O-bound operations because <C>async</C>/<C>await</C> allows the server to switch
          contexts while waiting for I/O, handling other requests in the meantime. Let’s modify the <C>fetch_external_data</C>{' '}
          function and the endpoint to be asynchronous. We’ll use <C>asyncio.sleep</C> to simulate non-blocking I/O.
        </p>
        <Pre>{`import asyncio # Import asyncio
import time
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI() # Assume FastAPI instance exists

# Simulate a non-blocking I/O call
async def fetch_external_data_async(item_id: int) -> dict: # Note 'async def'
    print(f"Fetching external data async for item {item_id}...")
    # Simulate non-blocking I/O delay
    await asyncio.sleep(0.5) # Note 'await asyncio.sleep'
    print("Finished fetching external data async.")
    return {"item_id": item_id, "metadata": "some_fetched_value_async"}

# Keep the blocking model prediction function as is for now
def run_model_prediction(data_point: float) -> float:
    print("Starting model prediction...")
    time.sleep(1) # Still blocking
    result = data_point * 2
    print("Finished model prediction.")
    return result

class PredictionRequest(BaseModel): # Assume defined
    item_id: int
    feature_value: float

class PredictionResponse(BaseModel): # Assume defined
    item_id: int
    metadata: str
    prediction: float

@app.post("/predict_async_io", response_model=PredictionResponse)
async def predict_with_async_io(request: PredictionRequest): # Note 'async def'
    print("Received async I/O prediction request.")
    # Step 1: Fetch external data (Non-blocking I/O)
    external_data = await fetch_external_data_async(request.item_id) # Note 'await'

    # Step 2: Run model prediction (Still Blocking CPU - problematic!)
    # This will still block the event loop when called directly!
    prediction_result = run_model_prediction(request.feature_value)

    print("Sending response.")
    return PredictionResponse(
        item_id=external_data["item_id"],
        metadata=external_data["metadata"],
        prediction=prediction_result
    )`}</Pre>
        <p>
          In this version, the <C>fetch_external_data_async</C> call is now non-blocking. While the{' '}
          <C>await asyncio.sleep(0.5)</C> happens, the FastAPI server (running on an ASGI server like Uvicorn) can handle other
          incoming requests or tasks. However, we still have a problem: <C>run_model_prediction</C> uses <C>time.sleep(1)</C>,
          which is a blocking call. Even within an <C>async def</C> endpoint, calling a blocking function directly like this
          will halt the event loop, negating the benefits of async for concurrency during that specific phase.
        </p>
        <Hint>Two steps. On the first, B’s fetch starts too. On the second, predict sits on the loop and B stops.</Hint>
      </div>
    ),
  },
  {
    id: 'threadpool',
    title: 'run_in_threadpool for the Predict',
    subtitle: 'The fetch is awaited. The model runs on a worker thread.',
    Visual: ThreadpoolPredictVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Handling Blocking CPU Operations with run_in_threadpool</p>
        <p>
          To properly handle the CPU-bound <C>run_model_prediction</C> within our asynchronous endpoint, we need to delegate it
          to a separate thread pool managed by FastAPI/Starlette. This prevents the main event loop from being blocked.
        </p>
        <Pre>{`import asyncio
import time
from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool # Import run_in_threadpool
from pydantic import BaseModel

app = FastAPI() # Assume FastAPI instance exists

# Non-blocking I/O simulation
async def fetch_external_data_async(item_id: int) -> dict:
    print(f"Fetching external data async for item {item_id}...")
    await asyncio.sleep(0.5)
    print("Finished fetching external data async.")
    return {"item_id": item_id, "metadata": "some_fetched_value_async"}

# Blocking CPU-bound simulation - unchanged
def run_model_prediction(data_point: float) -> float:
    print("Starting model prediction (in thread pool)...")
    time.sleep(1)
    result = data_point * 2
    print("Finished model prediction (in thread pool).")
    return result

class PredictionRequest(BaseModel): # Assume defined
    item_id: int
    feature_value: float

class PredictionResponse(BaseModel): # Assume defined
    item_id: int
    metadata: str
    prediction: float

@app.post("/predict_full_async", response_model=PredictionResponse)
async def predict_fully_asynchronous(request: PredictionRequest): # async def
    print("Received full async prediction request.")
    # Step 1: Fetch external data (Non-blocking I/O)
    external_data = await fetch_external_data_async(request.item_id) # await

    # Step 2: Run model prediction (Blocking CPU, run in thread pool)
    # Use run_in_threadpool to avoid blocking the event loop
    prediction_result = await run_in_threadpool(run_model_prediction, request.feature_value) # await + run_in_threadpool

    print("Sending response.")
    return PredictionResponse(
        item_id=external_data["item_id"],
        metadata=external_data["metadata"],
        prediction=prediction_result
    )`}</Pre>
        <p>Now, when <C>predict_fully_asynchronous</C> is called:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            It <C>await</C>s the non-blocking I/O (<C>fetch_external_data_async</C>). The event loop is free during this time.
          </li>
          <li>
            It then <C>await</C>s <C>run_in_threadpool(run_model_prediction, ...)</C>. This submits the{' '}
            <C>run_model_prediction</C> function to execute in a separate thread from the thread pool. The event loop is again
            free to handle other tasks while the model prediction runs in the background thread.
          </li>
          <li>
            Once the thread pool finishes executing <C>run_model_prediction</C>, the result is returned, and the execution of{' '}
            <C>predict_fully_asynchronous</C> resumes.
          </li>
        </ol>
        <p>
          This approach correctly uses asynchronous programming for I/O and safely integrates blocking CPU-bound code without
          stalling the server.
        </p>
        <Hint>Three steps. The loop stays free during the fetch and during the predict. B keeps moving.</Hint>
      </div>
    ),
  },
  {
    id: 'background',
    title: 'Implementing Background Tasks',
    subtitle: 'The log prints after “Sending response”',
    Visual: CombinedPipelineVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Suppose after returning the prediction, we want to log the request and result to a file or database without making the
          client wait. This is a perfect use case for background tasks.
        </p>
        <Pre>{`import asyncio
import time
from fastapi import FastAPI, BackgroundTasks # Import BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

app = FastAPI() # Assume FastAPI instance exists

# Functions from previous example (async I/O, blocking CPU)
async def fetch_external_data_async(item_id: int) -> dict: # ... (as before)
    print(f"Fetching external data async for item {item_id}...")
    await asyncio.sleep(0.5)
    print("Finished fetching external data async.")
    return {"item_id": item_id, "metadata": "some_fetched_value_async"}

def run_model_prediction(data_point: float) -> float: # ... (as before)
    print("Starting model prediction (in thread pool)...")
    time.sleep(1)
    result = data_point * 2
    print("Finished model prediction (in thread pool).")
    return result

# Function to be run in the background
def log_prediction_details(request_data: dict, response_data: dict):
    # Simulate writing to a log file or database
    print("--- Background Task Started ---")
    print(f"Logging Request: {request_data}")
    print(f"Logging Response: {response_data}")
    # Simulate some work for the background task
    time.sleep(0.2)
    print("--- Background Task Finished ---")
    # In a real app, you'd write to a file, DB, or send to a logging service.

class PredictionRequest(BaseModel): # Assume defined
    item_id: int
    feature_value: float

class PredictionResponse(BaseModel): # Assume defined
    item_id: int
    metadata: str
    prediction: float

@app.post("/predict_with_background", response_model=PredictionResponse)
async def predict_with_background_task(
    request: PredictionRequest,
    background_tasks: BackgroundTasks # Inject BackgroundTasks
):
    print("Received prediction request with background task.")
    # Step 1: Fetch external data (Non-blocking I/O)
    external_data = await fetch_external_data_async(request.item_id)

    # Step 2: Run model prediction (Blocking CPU, run in thread pool)
    prediction_result = await run_in_threadpool(run_model_prediction, request.feature_value)

    response = PredictionResponse(
        item_id=external_data["item_id"],
        metadata=external_data["metadata"],
        prediction=prediction_result
    )

    # Add the logging task to run AFTER the response is sent
    background_tasks.add_task(
        log_prediction_details,
        request.dict(), # Pass data to the task
        response.dict() # Pass data to the task
    )

    print("Sending response (background task pending).")
    return response # Response is sent here`}</Pre>
        <p>In this final example:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>We import <C>BackgroundTasks</C> from FastAPI.</li>
          <li>
            We add <C>background_tasks: BackgroundTasks</C> as a parameter to our endpoint function. FastAPI automatically
            injects an instance.
          </li>
          <li>
            We define a standard Python function <C>log_prediction_details</C> which contains the logic we want to run in the
            background. Note that this function itself can be blocking or async, but if it’s blocking and long-running, it might
            still consume resources. For significant background work, dedicated task queues (like Celery) are often preferred.
          </li>
          <li>
            Before returning the response, we call <C>background_tasks.add_task()</C>, passing the function to run and its
            arguments.
          </li>
          <li>The endpoint immediately returns the <C>response</C> to the client.</li>
          <li>
            FastAPI ensures that <C>log_prediction_details</C> is executed after the response has been successfully sent. You
            will see its print statements appear in the server console after the “Sending response” message.
          </li>
        </ol>
        <p>
          This practice demonstrates how to combine <C>async</C>/<C>await</C> for I/O, <C>run_in_threadpool</C> for CPU-bound
          tasks, and <C>BackgroundTasks</C> for post-response processing, creating more performant and responsive FastAPI
          applications for serving machine learning models. Experiment with these patterns by running the server and sending
          requests to observe the timing and flow of execution.
        </p>
        <Box title="Current versions">
          <p>
            The lesson passes <C>request.dict()</C> and <C>response.dict()</C>. In Pydantic v2 those calls are{' '}
            <C>model_dump()</C>. The order is unchanged: the response returns, then the log runs.
          </p>
        </Box>
        <Hint>Six steps. The client card fills at step 4. The background prints show up on steps 5 and 6.</Hint>
      </div>
    ),
  },
];

export default function AsynchronousOperationsAndPerformancePartThree() {
  return <ChapterDeck slides={slidesData} />;
}
