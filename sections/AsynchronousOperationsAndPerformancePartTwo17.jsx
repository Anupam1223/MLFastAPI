import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  PostOfficeVisualizer,
  BackgroundLifecycleVisualizer,
  PredictLogVisualizer,
  BackgroundUsesVisualizer,
  BackgroundLimitsVisualizer,
  SyncAsyncWorkerVisualizer,
  FourBenefitsVisualizer,
  ModelLoadVisualizer,
  BatchHardwareVisualizer,
  ScalingPayloadVisualizer,
  LatencyStackVisualizer,
} from '../components/AsyncPerfPartTwoVisualizers';

export const meta = {
  title: 'Asynchronous Operations and Performance (Part 2)',
  subtitle: 'background tasks, async I/O, and where the time goes',
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
    id: 'post-office',
    title: 'Using Background Tasks',
    subtitle: 'Return the receipt first. Do the paperwork after.',
    Visual: PostOfficeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Sometimes, your API endpoint needs to perform an action that doesn’t directly contribute to the response sent back to
          the client. For example, after successfully returning a prediction, you might want to log detailed information about
          the request and response to a separate file or database, send a notification, or trigger a cleanup process. Performing
          these actions before sending the response adds unnecessary latency for the client.
        </p>
        <p>
          FastAPI provides a convenient mechanism called <span className="text-white font-semibold">Background Tasks</span> to
          handle exactly these situations. Background tasks are functions that are executed <span className="text-white">after</span>{' '}
          the response has been sent to the client. This ensures that the client receives their response as quickly as possible,
          while the server handles these follow-up actions independently.
        </p>
        <p>
          Think of it like mailing a package at the post office. Your primary goal is to get the receipt confirming the package
          is sent (the API response). Printing a detailed internal report about the package contents (the background task) can
          happen after you’ve left with your receipt.
        </p>
        <Hint>Press Play, or drag the slider. The top lane makes the client wait on the log. The bottom lane hands over the receipt first.</Hint>
      </div>
    ),
  },
  {
    id: 'lifecycle',
    title: 'How Background Tasks Work',
    subtitle: 'Queue the function. Send the response. Run the function after.',
    Visual: BackgroundLifecycleVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI manages background tasks by running them within the same event loop (or a threadpool for blocking functions
          passed to background tasks), but critically, it doesn’t <C>await</C> their completion before sending the HTTP response.
        </p>
        <p>To use background tasks, you need to:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Import the <C>BackgroundTasks</C> class from <C>fastapi</C>.</li>
          <li>
            Define a parameter in your path operation function with a type hint of <C>BackgroundTasks</C>. FastAPI’s dependency
            injection system will automatically provide an instance of this class.
          </li>
          <li>
            Within your endpoint logic, call the <C>add_task()</C> method on the <C>BackgroundTasks</C> instance. This method
            takes the function to be executed as the first argument, followed by any arguments and keyword arguments that the
            function requires.
          </li>
        </ol>
        <Hint>Click 1 through 4. Step 3 is the response leaving. Step 4 is the task.</Hint>
      </div>
    ),
  },
  {
    id: 'predict-log',
    title: 'Prediction and Deferred Logging',
    subtitle: 'POST /predict_log_later returns before prediction_log.json is written',
    Visual: PredictLogVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Let’s look at an example. Imagine we have a prediction endpoint, and we want to log the input features and the
          prediction result to a file after returning the prediction.
        </p>
        <Pre>{`from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import time
import json

# Assume predict_model function exists and returns a prediction
# def predict_model(features):
#     # Simulate model inference
#     time.sleep(0.1)
#     prediction = sum(features) * 0.5 # Dummy prediction logic
#     return {"prediction": prediction}

# Assume load_model is called elsewhere to get 'model' object if needed

app = FastAPI()

class FeaturesInput(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

class PredictionOutput(BaseModel):
    prediction: float

def log_prediction_details(input_data: dict, output_data: dict):
    """A simple function to log prediction details to a file."""
    log_entry = {"input": input_data, "output": output_data, "timestamp": time.time()}
    try:
        with open("prediction_log.json", "a") as f:
            f.write(json.dumps(log_entry) + "\\n")
        print("Background task: Logged prediction details.")
    except Exception as e:
        # Important: log errors within the background task itself
        print(f"Background task error: Failed to log prediction details: {e}")

@app.post("/predict_log_later", response_model=PredictionOutput)
async def predict_and_log(
    features: FeaturesInput,
    background_tasks: BackgroundTasks # Dependency Injection
):
    """
    Endpoint to make a prediction and log details in the background.
    """
    input_dict = features.dict()
    # Replace with your actual model prediction logic
    # For example: result = model.predict([list(input_dict.values())])[0]
    # Using dummy prediction for demonstration
    prediction_result = {"prediction": (input_dict["sepal_length"] + input_dict["petal_length"]) * 0.8}

    # Add the logging function to background tasks
    background_tasks.add_task(
        log_prediction_details, # The function to run
        input_dict,             # Arguments for the function
        prediction_result       # More arguments
    )

    # The response is sent here, before log_prediction_details completes
    return prediction_result`}</Pre>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            We define <C>log_prediction_details</C> which takes the input and output data and writes it to a file{' '}
            <C>prediction_log.json</C>.
          </li>
          <li>The <C>predict_and_log</C> endpoint depends on <C>BackgroundTasks</C>.</li>
          <li>
            Inside the endpoint, after getting the <C>prediction_result</C>, we call <C>background_tasks.add_task()</C>, passing
            our logging function and the necessary data (<C>input_dict</C>, <C>prediction_result</C>).
          </li>
          <li>The endpoint immediately returns the <C>prediction_result</C>.</li>
          <li>
            FastAPI ensures that <C>log_prediction_details(input_dict, prediction_result)</C> runs soon after, without blocking
            the response.
          </li>
        </ol>
        <Box title="Current versions" tone="amber">
          <p>
            The lesson calls <C>features.dict()</C>. In Pydantic v2 that method is <C>model_dump()</C>. <C>BackgroundTasks</C>{' '}
            is still the in-process hook, and it still runs after the response is sent.
          </p>
        </Box>
        <Hint>Send prediction request, then use Prev step and Next step. The JSON leaves at step 3. The log line appears at step 4.</Hint>
      </div>
    ),
  },
  {
    id: 'uses',
    title: 'Use Cases for Background Tasks',
    subtitle: 'Logging, notices, metrics, cache, and a queue message',
    Visual: BackgroundUsesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Use Cases for Background Tasks in ML APIs</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-semibold">Detailed Logging:</span> As shown above, logging extensive information
            without delaying the client.
          </li>
          <li>
            <span className="text-white font-semibold">Notifications:</span> Sending emails or Slack messages about specific
            prediction outcomes (e.g., high-risk prediction detected).
          </li>
          <li>
            <span className="text-white font-semibold">Updating Monitoring Systems:</span> Pushing metrics about prediction
            latency, input data distribution, or model performance to a monitoring dashboard.
          </li>
          <li>
            <span className="text-white font-semibold">Simple Cache Updates:</span> Invalidating or updating related cache
            entries.
          </li>
          <li>
            <span className="text-white font-semibold">Triggering Asynchronous Workflows:</span> Sending a message to a queue
            (like RabbitMQ or Kafka) to initiate a more complex, downstream process (e.g., starting a batch analysis based on a
            real-time prediction).
          </li>
        </ul>
        <Hint>Click each use case. The 200 is already gone. The card is the work that follows.</Hint>
      </div>
    ),
  },
  {
    id: 'limits',
    title: 'Important Notes',
    subtitle: 'Same process, silent errors, and a CPU that is still shared',
    Visual: BackgroundLimitsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>While background tasks are useful, they have limitations:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-white font-semibold">No Guaranteed Execution:</span> They run within the same process as your
            FastAPI application. If the server process crashes or restarts before the task completes, the task might be lost.
            They are not suitable for critical operations that must complete. For guaranteed execution, use dedicated job queue
            systems like Celery or Redis Queue (RQ).
          </li>
          <li>
            <span className="text-white font-semibold">Error Handling:</span> Since the response is already sent, errors within
            background tasks won’t automatically inform the client. You must implement error handling (e.g., <C>try...except</C>{' '}
            blocks) and logging within the background task function itself to detect and diagnose failures.
          </li>
          <li>
            <span className="text-white font-semibold">Resource Consumption:</span> Background tasks still consume server
            resources (CPU, memory, I/O). Running too many computationally intensive tasks in the background can still degrade
            the overall performance and responsiveness of your API server for subsequent requests. If your background task
            involves heavy computation (like model retraining), it’s usually better to offload it to a separate worker process
            or system.
          </li>
        </ul>
        <p>
          Background tasks provide a simple and effective way to improve the perceived performance of your API endpoints by
          deferring non-essential actions until after the response has been delivered. They are particularly useful for logging,
          notifications, and triggering other non-critical asynchronous operations in the context of ML model serving. Remember
          their limitations regarding reliability and resource usage, and choose them when the task doesn’t absolutely need to
          complete successfully for the core operation to be finished.
        </p>
        <Hint>Open each caveat. The rose card is the failure. The green card is the way through it.</Hint>
      </div>
    ),
  },
  {
    id: 'sync-async',
    title: 'Benefits of Asynchronous Requests for ML I/O',
    subtitle: 'The sync worker waits in line. The async worker overlaps the waits.',
    Visual: SyncAsyncWorkerVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While the core machine learning inference step is often CPU-bound, many ML API workflows involve significant
          Input/Output (I/O) operations. These operations might include fetching feature data from a remote database, retrieving
          user profiles from another microservice, loading configuration files, or saving prediction logs to storage. When
          performed synchronously, these I/O tasks can become major performance bottlenecks.
        </p>
        <p>For example, a typical API request that requires fetching data before running a prediction:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Receive request.</li>
          <li>Query a database for required features (Network I/O wait).</li>
          <li>Preprocess the fetched data (CPU work).</li>
          <li>Run model inference (CPU work, potentially intensive).</li>
          <li>Postprocess the results (CPU work).</li>
          <li>Save results or logs to storage (Disk/Network I/O wait).</li>
          <li>Send response.</li>
        </ol>
        <p>
          In a traditional synchronous framework, if Step 2 involves waiting 100 milliseconds for the database, the worker
          process handling that request is completely blocked. It cannot handle any other incoming requests during that wait
          time. Similarly, during Step 6, the worker is again blocked, waiting for the storage operation to complete. If your
          API receives many concurrent requests, most workers might spend their time simply waiting for I/O, leading to high
          latency and low throughput.
        </p>
        <p>
          This is where asynchronous programming shines. By defining your route handlers with <C>async def</C> and using{' '}
          <C>await</C> when calling I/O-bound functions (provided by async-compatible libraries like <C>httpx</C> for HTTP
          requests, <C>asyncpg</C> or <C>databases</C> for database access, <C>aiofiles</C> for file system operations), you
          allow FastAPI’s event loop to manage these waiting periods effectively.
        </p>
        <p>
          When an <C>await</C> is encountered for an I/O operation (like <C>await database.fetch_one(...)</C> or{' '}
          <C>await http_client.get(...)</C>), the function pauses its execution at that point. However, crucially, the worker
          process is not blocked. The event loop can switch context and use the worker to handle other ready tasks, such as
          processing different incoming requests or continuing other async functions that have completed their I/O wait. Once
          the original I/O operation finishes (e.g., the database returns data), the event loop resumes the paused function
          from where it left off.
        </p>
        <p>
          Comparison of synchronous and asynchronous I/O handling. The synchronous worker processes requests sequentially,
          blocking on each I/O wait. The asynchronous worker can initiate multiple I/O operations and switch between processing
          tasks as I/O completes, improving overall throughput.
        </p>
        <Hint>Press Play, or drag the slider. Amber cells are waits. On the async worker those waits overlap.</Hint>
      </div>
    ),
  },
  {
    id: 'four-benefits',
    title: 'The Four Benefits Under Load',
    subtitle: 'Concurrency, throughput, latency, and a busier CPU',
    Visual: FourBenefitsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The primary benefits of using asynchronous operations for I/O-bound tasks within your ML API include:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <span className="text-white font-semibold">Increased Concurrency:</span> The application can handle significantly
            more simultaneous requests because workers don’t get stuck waiting for slow I/O. They are freed up to start or
            continue processing other requests.
          </li>
          <li>
            <span className="text-white font-semibold">Improved Throughput:</span> By efficiently utilizing worker processes
            instead of letting them idle during I/O waits, the API can serve more requests per unit of time.
          </li>
          <li>
            <span className="text-white font-semibold">Lower Latency (under load):</span> While the latency of a single request
            might not dramatically decrease (it still has to wait for its I/O), the average latency experienced by users under
            load is often lower because requests don’t get queued up behind others that are blocked on I/O.
          </li>
          <li>
            <span className="text-white font-semibold">Better Resource Utilization:</span> CPU resources are used more
            effectively for computation rather than sitting idle while waiting for external systems.
          </li>
        </ol>
        <p>
          It’s important to remember that <C>async</C>/<C>await</C> primarily benefits I/O-bound operations. For CPU-bound tasks
          like the actual model inference, using asynchronous definitions alone doesn’t prevent blocking the event loop. As
          discussed previously, techniques like <C>run_in_threadpool</C> are necessary to offload those intensive computations,
          often in conjunction with asynchronous wrappers for the surrounding I/O operations. By combining asynchronous I/O
          handling with appropriate strategies for CPU-bound work, you can build highly responsive and scalable FastAPI
          applications for your machine learning models.
        </p>
        <Hint>Drag the concurrent-request slider. The four numbers move with the load.</Hint>
      </div>
    ),
  },
  {
    id: 'model-load',
    title: 'Model Loading Time',
    subtitle: 'Pay at startup, or pay on the first request',
    Visual: ModelLoadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Performance Considerations for API Endpoints</p>
        <p>
          Building responsive and efficient machine learning APIs requires careful attention to performance. While FastAPI’s
          asynchronous capabilities help manage concurrent connections effectively, especially for I/O-bound tasks, the unique
          demands of ML workloads introduce specific bottlenecks. Understanding these factors is significant for optimizing your
          prediction endpoints.
        </p>
        <p>
          Before your API can make predictions, the machine learning model must be loaded into memory. This can be a
          time-consuming step, particularly for large or complex models.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-semibold">Startup Loading:</span> Loading the model when the FastAPI application
            starts (e.g., in a global variable or using a dependency with <C>yield</C>) adds to the initial startup time but
            ensures the model is ready for the first request. This is generally preferred for production environments to avoid
            latency on initial user interactions.
          </li>
          <li>
            <span className="text-white font-semibold">On-Demand Loading:</span> Loading the model only when the first prediction
            request arrives can reduce startup time but introduces significant latency for that first request. This might be
            acceptable in development or low-traffic scenarios.
          </li>
          <li>
            <span className="text-white font-semibold">Memory Consumption:</span> Larger models consume more memory. Ensure your
            deployment environment has sufficient RAM to hold the model(s) without impacting other processes or requiring
            excessive swapping.
          </li>
        </ul>
        <p>
          Examine the trade-offs between startup time, memory usage, and first-request latency based on your specific model and
          application requirements.
        </p>
        <Box title="Current versions" tone="amber">
          <p>
            The lesson’s startup path is a dependency with <C>yield</C>. Current FastAPI apps usually load the model in the{' '}
            <C>lifespan</C> hook. The tradeoff is the same: pay at startup so the first request does not.
          </p>
        </Box>
        <Hint>Switch Startup load and On demand. Watch boot time and request 1 trade places.</Hint>
      </div>
    ),
  },
  {
    id: 'inference',
    title: 'Inference, Batching, and Hardware',
    subtitle: 'One forward pass for four samples, and a GPU that shortens it',
    Visual: BatchHardwareVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Inference Latency</p>
        <p>
          The time it takes for the loaded model to process input data and generate a prediction is the inference latency. This
          is often the most significant performance bottleneck in ML APIs.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-semibold">CPU-Bound Nature:</span> Most traditional ML model inference operations
            (like matrix multiplications in deep learning or tree traversals in ensemble methods) are computationally intensive
            and CPU-bound. As discussed previously, running these directly in an <C>async</C> function will block the event loop.
            Using <C>run_in_threadpool</C> is essential to offload these tasks, but the inference itself still takes time.
          </li>
          <li>
            <span className="text-white font-semibold">Model Complexity:</span> More complex models (e.g., deeper neural
            networks, larger ensemble models) generally have higher inference latency.
          </li>
          <li>
            <span className="text-white font-semibold">Input Data Size:</span> Processing larger input data payloads (e.g.,
            high-resolution images, long text sequences) naturally takes longer.
          </li>
          <li>
            <span className="text-white font-semibold">Batching:</span> Some models and ML frameworks allow for batch processing,
            where multiple input samples are processed simultaneously. If your API anticipates receiving multiple prediction
            requests concurrently, batching inputs before sending them to the model (often handled within the thread pool) can
            significantly improve throughput, although it might slightly increase latency for individual requests within the
            batch.
          </li>
          <li>
            <span className="text-white font-semibold">Hardware Acceleration:</span> While the scope of FastAPI configuration
            itself, the underlying hardware (CPU speed, availability of GPUs/TPUs) drastically impacts inference speed. Your
            deployment strategy should account for the hardware requirements for acceptable performance.
          </li>
        </ul>
        <Hint>Switch one-by-one and a batch of 4, then CPU and GPU. The total is the time for four requests.</Hint>
      </div>
    ),
  },
  {
    id: 'scaling',
    title: 'Prep, Payloads, and Workers',
    subtitle: 'Await I/O, keep JSON small, and give each core its own loop',
    Visual: ScalingPayloadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="text-white font-semibold">Data Preprocessing and Postprocessing</p>
        <p>
          Raw input data often needs transformation before being fed to the model, and model outputs might need formatting before
          being returned to the client.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-semibold">I/O-Bound Steps:</span> If preprocessing involves fetching data from
            external sources (databases, other APIs) or postprocessing involves saving results, these are I/O-bound operations.
            Using <C>async</C> and <C>await</C> for these steps is highly beneficial for performance, allowing the server to
            handle other requests while waiting.
          </li>
          <li>
            <span className="text-white font-semibold">CPU-Bound Steps:</span> Complex feature engineering, image transformations,
            or text tokenization can be CPU-intensive. Similar to inference, heavy computational steps here should be handled
            carefully, potentially using <C>run_in_threadpool</C> if they risk blocking the event loop for too long.
          </li>
          <li>
            <span className="text-white font-semibold">Pydantic Validation:</span> While Pydantic provides invaluable data
            validation, parsing and validating complex input/output models adds a small overhead to each request. For extremely
            high-throughput scenarios, the structure and complexity of your Pydantic models can become a minor performance
            factor.
          </li>
        </ul>
        <p className="text-white font-semibold">Network Latency and Payload Size</p>
        <p>
          The time it takes for data to travel between the client and your API server, and the time spent
          serializing/deserializing data, contributes to the overall perceived performance.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-semibold">Payload Size:</span> Sending large input features (e.g., base64 encoded
            images) or receiving large prediction outputs increases network transfer time. Use efficient data representations
            and evaluate whether the client truly needs all the data returned.
          </li>
          <li>
            <span className="text-white font-semibold">Serialization/Deserialization:</span> FastAPI and Pydantic handle JSON
            serialization/deserialization efficiently. However, for very large or complex nested objects, this process still
            consumes CPU cycles and adds to the request/response time.
          </li>
          <li>
            <span className="text-white font-semibold">Geographic Location:</span> Deploying your API geographically closer to
            your users reduces network latency. Content Delivery Networks (CDNs) can also help for caching static assets if
            applicable, though usually less relevant for dynamic prediction endpoints.
          </li>
        </ul>
        <p className="text-white font-semibold">Concurrency and Server Resources</p>
        <p>
          FastAPI’s asynchronous nature allows it to handle many concurrent connections efficiently, but performance under load
          depends on how blocking tasks are managed and the available server resources.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-semibold">Event Loop Blocking:</span> Blocking the event loop with long-running
            synchronous code (like CPU-bound inference without <C>run_in_threadpool</C>) prevents the server from handling other
            incoming requests.
          </li>
          <li>
            <span className="text-white font-semibold">Thread Pool Size:</span> When using <C>run_in_threadpool</C>, a pool that’s
            too small will cause requests to queue up waiting for a free thread. The default size might need tuning based on
            expected load and the duration of blocking tasks. This is often managed by the ASGI server (like Uvicorn).
          </li>
          <li>
            <span className="text-white font-semibold">Server Workers:</span> For production deployments, you typically run
            FastAPI using an ASGI server like Uvicorn, often managed by a process manager like Gunicorn. Running multiple worker
            processes (typically related to the number of CPU cores) allows true parallel processing of requests, multiplying
            your capacity more than what a single event loop (even with a thread pool) can handle.
          </li>
        </ul>
        <Hint>Set the worker count, then switch a large base64 body and compact JSON. Each online worker is its own loop.</Hint>
      </div>
    ),
  },
  {
    id: 'latency',
    title: 'Latency Breakdown',
    subtitle: 'Inference is the tall band. The checkboxes shrink the others.',
    Visual: LatencyStackVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The following diagram illustrates a breakdown of latency for a single ML API request, highlighting potential
          bottlenecks.
        </p>
        <p>
          Breakdown of time spent during different phases of an ML API request. Model inference often dominates, but
          preprocessing, network, and serialization also contribute significantly.
        </p>
        <p>
          Optimizing an ML API involves identifying the largest contributors to latency in your specific use case and applying
          appropriate strategies, whether it’s using <C>async</C> for I/O, <C>run_in_threadpool</C> for CPU-bound tasks,
          optimizing the model itself, managing data size, or scaling server resources. Continuous monitoring and profiling are
          indispensable for pinpointing bottlenecks in production environments.
        </p>
        <Hint>Click a band. The checkboxes apply async I/O, a faster model, and a log that waits until after the response.</Hint>
      </div>
    ),
  },
];

export default function AsynchronousOperationsAndPerformancePartTwo() {
  return <ChapterDeck slides={slidesData} />;
}
