import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  AsyncDefVisualizer,
  RoutePauseVisualizer,
  EventLoopVisualizer,
  TenStepVisualizer,
  AsyncRaceVisualizer,
  IOBoundVisualizer,
  SyncThreadpoolVisualizer,
  GilVisualizer,
  MLLifecycleVisualizer,
  ParallelIOVisualizer,
  BlockingPredictVisualizer,
  ThreadpoolStepsVisualizer,
  WhenThreadpoolVisualizer,
} from '../components/AsyncPerfVisualizers';

export const meta = {
  title: 'Asynchronous Operations and Performance (Part 1)',
  subtitle: 'async def, the event loop, and run_in_threadpool',
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
    id: 'async-def',
    title: 'Understanding async and await',
    subtitle: 'Waiting in line, or waiting together',
    Visual: AsyncDefVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI uses Python’s <C>asyncio</C> library to achieve high performance, especially when dealing with operations that
          involve waiting, such as network requests or reading files. This capability is exposed directly through how you define
          your API route functions.
        </p>
        <Hint>Watch the three requests. The blocking lane finishes one by one. The async lane fills together.</Hint>
      </div>
    ),
  },
  {
    id: 'route-pause',
    title: 'Defining Asynchronous Routes',
    subtitle: 'async def can pause. The process keeps going.',
    Visual: RoutePauseVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Defining Asynchronous Routes</p>
        <p>
          To create an asynchronous route handler in FastAPI, you define your function using the <C>async def</C> syntax instead of
          the standard <C>def</C>. This signals to FastAPI that the function might perform operations that can be paused (
          <C>await</C>ed) without blocking the entire server process.
        </p>
        <Pre>{`from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.get("/async-data")
async def get_async_data():
    # Simulate an I/O-bound operation, like fetching data from a database
    # or calling another API. asyncio.sleep is often used as a placeholder.
    await asyncio.sleep(1) # Pause execution here for 1 second
    return {"message": "Data fetched asynchronously!"}

@app.get("/sync-data")
def get_sync_data():
    # Simulate a synchronous operation or a quick task.
    # If this involved significant I/O without being async,
    # it could block the server.
    return {"message": "Data fetched synchronously!"}`}</Pre>
        <p>
          In the example above, the <C>get_async_data</C> function is an asynchronous route handler. The{' '}
          <C>await asyncio.sleep(1)</C> line is important. When the execution reaches this point, instead of halting everything,
          the function signals to the underlying event loop, “I need to wait for something here; you can go do other work in the
          meantime.”
        </p>
        <Hint>Let it play. At await, request 1 parks and the loop serves the others.</Hint>
      </div>
    ),
  },
  {
    id: 'event-loop',
    title: 'await and the Event Loop',
    subtitle: 'A yields. time.sleep holds the only worker.',
    Visual: EventLoopVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Python’s <C>async</C>/<C>await</C> syntax works on top of an <strong className="text-white">event loop</strong>. Think of
          the event loop as a manager that keeps track of multiple tasks. When an <C>async</C> function encounters an <C>await</C>{' '}
          expression (which must be used on another awaitable object, like the result of another <C>async</C> function or certain
          I/O operations), it effectively tells the event loop, “Pause me here until this <C>await</C>ed operation completes. You
          can run other pending tasks.”
        </p>
        <p>
          This cooperative multitasking allows a single Python process (running the event loop) to handle many concurrent
          connections efficiently. While one handler is <C>await</C>ing a database response, the event loop can switch to handle an
          incoming request, process another route handler that just finished its <C>await</C>, or manage other background
          activities.
        </p>
        <Hint>Use Prev step and Next step. Green is running. Amber is paused on await. Play only if you want it to move.</Hint>
      </div>
    ),
  },
  {
    id: 'ten-steps',
    title: 'The /async-data Lifecycle',
    subtitle: 'From the request, through the yield, back to the client',
    Visual: TenStepVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Here’s the sequence for the <C>/async-data</C> endpoint:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>A request arrives at <C>/async-data</C>.</li>
          <li>FastAPI calls the <C>get_async_data</C> function.</li>
          <li>Execution proceeds until <C>await asyncio.sleep(1)</C>.</li>
          <li>The <C>get_async_data</C> function yields control back to the event loop.</li>
          <li>The event loop can now handle other incoming requests or continue other tasks that are ready to run.</li>
          <li>After 1 second, the <C>asyncio.sleep(1)</C> operation completes.</li>
          <li>The event loop schedules the rest of the <C>get_async_data</C> function to run.</li>
          <li>Execution resumes after the <C>await</C> line.</li>
          <li>The function prepares the response <C>{`{"message": "Data fetched asynchronously!"}`}</C>.</li>
          <li>The response is sent back to the client.</li>
        </ol>
        <Hint>Step through the ten beats, or jump to a number.</Hint>
      </div>
    ),
  },
  {
    id: 'race',
    title: 'await versus time.sleep',
    subtitle: 'One yields. The other holds the thread.',
    Visual: AsyncRaceVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          During the 1-second <C>await</C>, the server was not idle; it was free to process other work. This is fundamentally
          different from a traditional synchronous function using <C>time.sleep(1)</C>, which would block the entire execution
          thread for that duration, preventing it from handling any other requests.
        </p>
        <Hint>Use Prev step and Next step. The top track yields. The bottom track is blocked.</Hint>
      </div>
    ),
  },
  {
    id: 'io',
    title: 'Benefits for I/O-Bound Tasks',
    subtitle: 'The loop spends the wait on other requests',
    Visual: IOBoundVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The primary advantage of using <C>async def</C> for your route handlers shines when the handler needs to perform
          I/O-bound operations. These are tasks where the program spends most of its time waiting for external resources, such as:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Network calls (fetching data from other APIs, databases).</li>
          <li>Reading from or writing to disk or object storage.</li>
          <li>Waiting for responses from external message queues.</li>
        </ul>
        <p>
          By using <C>await</C> for these operations, your FastAPI application can handle a significantly larger number of
          concurrent requests with fewer server resources compared to a purely synchronous framework, because it doesn’t waste time
          actively waiting.
        </p>
        <Hint>Pick network, disk, or a queue. Almost all of the bar is the wait.</Hint>
      </div>
    ),
  },
  {
    id: 'sync-routes',
    title: 'What About Synchronous Routes?',
    subtitle: 'def runs in a thread pool so the loop stays up',
    Visual: SyncThreadpoolVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI is clever. If you define a standard route handler using <C>def</C> instead of <C>async def</C>, like{' '}
          <C>get_sync_data</C> in our first example, FastAPI understands that this function might contain blocking code. To prevent
          such code from blocking the main event loop, FastAPI runs it in a separate <strong className="text-white">thread
          pool</strong>. This allows the event loop to remain responsive while the synchronous function executes in its own thread.
        </p>
        <p>
          While this provides compatibility and prevents simple synchronous code from halting your entire application, it’s
          important to understand the trade-offs. Managing thread pools introduces its own overhead, and it’s generally more
          efficient to use <C>async def</C> with <C>await</C> for genuine I/O-bound work. CPU-bound tasks, like complex
          computations or model inference (which we’ll discuss next), present a different challenge even for the thread pool
          approach.
        </p>
        <p>
          Understanding how <C>async</C> and <C>await</C> allow your route handlers to pause and resume is fundamental to building
          high-performance APIs with FastAPI, especially when integrating tasks like data fetching or preprocessing steps that
          involve waiting for external systems.
        </p>
        <Hint>Switch def and async def. def lights a worker. async def stays on the loop.</Hint>
      </div>
    ),
  },
  {
    id: 'ml-when',
    title: 'When to Use Async for ML Inference',
    subtitle: 'async def does not make model.predict parallel',
    Visual: GilVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI’s asynchronous capabilities are a significant advantage for building responsive web services. By using{' '}
          <C>async def</C> for your route handlers, FastAPI can efficiently manage multiple incoming requests concurrently,
          especially when those requests involve waiting for external operations like database queries or API calls (I/O-bound
          tasks). The question naturally arises: how does this apply to machine learning inference, which is often a
          computationally intensive (CPU-bound) task?
        </p>
        <p>
          The short answer is that using <C>async def</C> for your route handler doesn’t automatically make the ML model’s
          prediction function run faster or in parallel with other requests if the inference itself is purely CPU-bound Python
          code. Python’s Global Interpreter Lock (GIL) generally prevents multiple threads from executing Python bytecode
          simultaneously on different CPU cores. Standard <C>async</C>/<C>await</C> is designed for cooperative multitasking,
          primarily yielding control during I/O waits, not during heavy computation.
        </p>
        <Hint>Switch I/O and CPU. Only the wait lets the next request in.</Hint>
      </div>
    ),
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle of a Prediction Request',
    subtitle: 'I/O before and after the model. The predict line is CPU.',
    Visual: MLLifecycleVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          So when is <C>async def</C> actually beneficial in the context of an ML inference endpoint? The benefits appear when
          your request handling involves more than just the raw model prediction. Here’s the typical lifecycle of a prediction
          request:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Receive Request:</strong> Data arrives at the endpoint.
          </li>
          <li>
            <strong className="text-white">Preprocessing:</strong> Input data might need cleaning, transformation, or enrichment.
            This step could involve:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Fetching additional features from a database (<C>await db.fetch_features(...)</C>).</li>
              <li>Calling another internal or external API (<C>await external_service.get_user_data(...)</C>).</li>
              <li>Reading auxiliary files from storage (<C>await storage.read_config(...)</C>).</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Model Inference:</strong> The preprocessed data is fed to the loaded model (
            <C>model.predict(processed_data)</C>). This is often the CPU-bound part.
          </li>
          <li>
            <strong className="text-white">Postprocessing:</strong> The model’s output might need formatting, interpretation, or
            further actions based on the prediction. This could involve:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Saving the prediction result and input features to a log database (<C>await db.log_prediction(...)</C>).</li>
              <li>Sending a notification based on the result (<C>await notifications.send_alert(...)</C>).</li>
              <li>Calling another API to trigger subsequent workflows (<C>await workflow_service.trigger_action(...)</C>).</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Return Response:</strong> The final result is sent back to the client.
          </li>
        </ol>
        <p>
          If your endpoint performs any I/O-bound operations during the preprocessing (Step 2) or postprocessing (Step 4) stages,
          using <C>async def</C> for the route handler is highly advantageous. While the I/O operations are waiting (e.g., waiting
          for a database response), the FastAPI event loop can switch to handle other incoming requests, improving the overall
          throughput and responsiveness of your application.
        </p>
        <Hint>Click the five stages. Preprocess and postprocess can await. Infer is CPU.</Hint>
      </div>
    ),
  },
  {
    id: 'io-around',
    title: 'I/O Around the Prediction',
    subtitle: 'Two awaits can run together. The predict line still blocks.',
    Visual: ParallelIOVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Pre>{`# Example illustrating async usage for I/O around inference
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio # For simulating I/O

# Assume 'model' is loaded elsewhere
# Assume 'db' and 'external_service' are async clients

app = FastAPI()

class InputData(BaseModel):
    raw_feature: str
    user_id: int

class OutputData(BaseModel):
    prediction: float
    info: str

async def fetch_extra_data_from_db(user_id: int):
    # Simulate async database call
    await asyncio.sleep(0.05) # Simulate I/O wait
    return {"db_feature": user_id * 10}

async def call_external_service(raw_feature: str):
    # Simulate async external API call
    await asyncio.sleep(0.1) # Simulate I/O wait
    return {"service_info": f"Info for {raw_feature}"}

def run_model_inference(processed_data: dict):
    # Simulate CPU-bound inference
    # NOTE: In a real async route, this blocking call
    # should be handled carefully (see next section)
    import time
    time.sleep(0.2) # Simulate computation
    return processed_data.get("db_feature", 0) / 100.0

@app.post("/predict", response_model=OutputData)
async def predict_endpoint(data: InputData):
    # --- Async I/O-bound Preprocessing ---
    # Perform I/O operations concurrently
    db_data_task = asyncio.create_task(fetch_extra_data_from_db(data.user_id))
    service_data_task = asyncio.create_task(call_external_service(data.raw_feature))

    db_data = await db_data_task
    service_data = await service_data_task
    # ------------------------------------

    processed_input = {**db_data} # Combine features

    # --- CPU-bound Inference ---
    # !!! WARNING: Potential blocking point if not handled properly
    prediction_value = run_model_inference(processed_input)
    # (We'll address how to handle this blocking call in the next section)
    # ---------------------------

    # --- Potentially Async Postprocessing ---
    # Example: could await db.log_prediction(...) here
    # ----------------------------------------

    return OutputData(
        prediction=prediction_value,
        info=service_data.get("service_info", "N/A")
    )`}</Pre>
        <p>
          In the example above, <C>fetch_extra_data_from_db</C> and <C>call_external_service</C> represent I/O-bound operations.
          Using <C>async def</C> allows the endpoint to <C>await</C> these operations efficiently. While waiting, FastAPI can serve
          other requests.
        </p>
        <p>
          However, notice the <C>run_model_inference</C> function. If this function performs significant CPU work (as simulated by{' '}
          <C>time.sleep</C>), calling it directly within the <C>async def</C> route handler can still cause problems. Because it’s
          synchronous and CPU-bound, it will block the single event loop thread while it executes, preventing FastAPI from handling
          any other requests during that time. This negates the benefits of async for concurrency during the inference phase
          itself.
        </p>
        <p>
          In summary: use <C>async def</C> for your ML inference endpoints primarily when the request handling involves
          asynchronous I/O operations before or after the core model prediction step. If your endpoint only performs synchronous,
          CPU-bound inference on data already present in the request, <C>async def</C> alone won’t improve the performance of the
          inference itself and might require additional techniques to avoid blocking the server, which we will cover next.
        </p>
        <Hint>Use Prev step and Next step. The two I/O calls run together. Step 3 blocks the loop.</Hint>
      </div>
    ),
  },
  {
    id: 'blocking',
    title: 'Running Blocking ML Operations',
    subtitle: 'model.predict on the loop freezes every other request',
    Visual: BlockingPredictVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While asynchronous route handlers (<C>async def</C>) are powerful for I/O-bound tasks, directly running CPU-intensive
          operations like machine learning model inference within them poses a significant problem. Python’s <C>asyncio</C> relies
          on a single-threaded event loop to manage concurrent tasks. If a function within an <C>async def</C> route performs a
          long-running computation without yielding control (i.e., without <C>await</C> on an operation that allows the event loop
          to switch tasks), it effectively freezes the event loop. During this time, the server cannot respond to any other
          incoming requests, defeating the purpose of using an asynchronous framework for high concurrency.
        </p>
        <p>For example, a typical ML prediction endpoint:</p>
        <Pre>{`# Assume 'model' is a loaded ML model (e.g., scikit-learn)
# Assume 'preprocess_input' and 'format_output' exist

# Problematic Approach: Blocking the event loop
@app.post("/predict_blocking")
async def predict_blocking(data: InputData): # InputData is a Pydantic model
    processed_data = preprocess_input(data)
    # This line BLOCKS the event loop if model.predict is CPU-bound
    prediction = model.predict(processed_data)
    results = format_output(prediction)
    return {"prediction": results}`}</Pre>
        <p>
          In this example, if <C>model.predict()</C> takes several hundred milliseconds or even seconds to run (common for complex
          models or large inputs), the entire FastAPI application will be unresponsive during that time.
        </p>
        <Hint>Leave model.predict on the loop, then switch to run_in_threadpool. The loop only stays free on the right.</Hint>
      </div>
    ),
  },
  {
    id: 'threadpool',
    title: 'Offloading to a Thread Pool',
    subtitle: 'await run_in_threadpool hands the CPU work to a worker',
    Visual: ThreadpoolStepsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI provides a clean way to handle this situation by running blocking, CPU-bound code in a separate thread pool.
          This allows the main event loop to remain unblocked and continue handling other requests while the heavy computation
          occurs in another thread.
        </p>
        <p>
          The utility here is <C>run_in_threadpool</C>, a function provided by Starlette (the underlying ASGI toolkit FastAPI uses)
          and readily available in FastAPI. You <C>await</C> this function, passing it the blocking function you want to execute
          along with its arguments.
        </p>
        <p>Here’s how to refactor the previous example correctly:</p>
        <Pre>{`from fastapi.concurrency import run_in_threadpool
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Assume 'model' is loaded and 'preprocess_input', 'format_output' exist
# Example placeholder for the blocking function
def run_model_inference(processed_data):
    # Simulate a CPU-bound task
    import time
    time.sleep(0.5) # Represents model.predict() time
    # In reality: prediction = model.predict(processed_data)
    prediction = [1] # Placeholder result
    return prediction

# Define input data model
class InputData(BaseModel):
    feature1: float
    feature2: float

# Correct Approach: Using run_in_threadpool
@app.post("/predict_non_blocking")
async def predict_non_blocking(data: InputData):
    # Preprocessing can often be async if it involves I/O,
    # but here we assume it's synchronous or quick.
    processed_data = preprocess_input(data) # Assume this returns needed format

    # Offload the blocking call to the thread pool
    # Pass the function and its arguments
    prediction = await run_in_threadpool(run_model_inference, processed_data)

    # Postprocessing
    results = format_output(prediction)
    return {"prediction": results}

# Dummy implementations for completeness
def preprocess_input(data: InputData): return [[data.feature1, data.feature2]]
def format_output(prediction): return prediction[0]`}</Pre>
        <p>
          In <C>predict_non_blocking</C>, the call <C>await run_in_threadpool(run_model_inference, processed_data)</C> does the
          following:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            It schedules the <C>run_model_inference</C> function (which contains the blocking <C>model.predict()</C> call) to be
            executed in a thread pool managed by FastAPI.
          </li>
          <li>It immediately yields control back to the event loop, allowing FastAPI to process other requests.</li>
          <li>
            Once the <C>run_model_inference</C> function completes in its thread, <C>run_in_threadpool</C> retrieves the result.
          </li>
          <li>
            The <C>await</C> completes, and the execution of the <C>predict_non_blocking</C> function resumes with the{' '}
            <C>prediction</C> result.
          </li>
        </ol>
        <Hint>Use Prev step and Next step. Green yields to the loop and offloads predict. Red holds the loop until the response.</Hint>
      </div>
    ),
  },
  {
    id: 'when-pool',
    title: 'When to Use run_in_threadpool',
    subtitle: 'CPU work goes to a worker. I/O stays on await.',
    Visual: WhenThreadpoolVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The primary use case for <C>run_in_threadpool</C> within an <C>async def</C> route is for CPU-bound synchronous code that
          you cannot easily make asynchronous (like most standard ML library inference calls).
        </p>
        <p>Use it for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <C>model.predict()</C>, <C>model.transform()</C> from libraries like scikit-learn, TensorFlow (in session run mode),
            PyTorch (without specific async support).
          </li>
          <li>Complex data transformations using libraries like Pandas or NumPy that are CPU-intensive.</li>
          <li>Any synchronous library call that might take significant time to compute.</li>
        </ul>
        <p>Do not use it for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            I/O-bound operations (network requests, database calls, file reads/writes). For these, use native <C>async</C>{' '}
            libraries (like <C>httpx</C> for HTTP requests, <C>asyncpg</C> or <C>databases</C> for databases) and <C>await</C> them
            directly. Wrapping I/O operations in <C>run_in_threadpool</C> adds unnecessary thread overhead and doesn’t leverage
            the efficiency of the event loop for I/O.
          </li>
          <li>
            Functions that are already <C>async def</C>. Awaiting an <C>async def</C> function directly is the standard way to run
            it.
          </li>
        </ul>
        <p>
          By correctly identifying and offloading blocking CPU-bound operations using <C>run_in_threadpool</C>, you ensure that
          your FastAPI application remains responsive and can effectively handle concurrent requests, even when performing
          computationally intensive machine learning inference. This is a standard pattern for integrating synchronous ML
          workflows into modern asynchronous web frameworks.
        </p>
        <Box title="Where the helper lives" tone="amber">
          <p>
            Import <C>run_in_threadpool</C> from <C>fastapi.concurrency</C>. It still comes from Starlette. A <C>def</C> route
            already runs in that pool, so you do not wrap it again. The GIL still limits two Python threads on one core; the win
            here is that the event loop stays free.
          </p>
        </Box>
        <Hint>Open each workload. predict and pandas go to a worker. HTTP and async def are awaited.</Hint>
      </div>
    ),
  },
];

export default function AsynchronousOperationsAndPerformancePartOne() {
  return <ChapterDeck slides={slidesData} />;
}
