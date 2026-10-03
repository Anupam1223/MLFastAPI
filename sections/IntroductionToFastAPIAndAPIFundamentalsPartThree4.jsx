import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  CycleOverviewVisualizer,
  RequestAnatomyVisualizer,
  AsgiScopeVisualizer,
  RoutingVisualizer,
  ParamParsingVisualizer,
  ExecutionVisualizer,
  ResponseVisualizer,
  FullCycleVisualizer,
} from '../components/FastAPIPart3CycleVisualizers';
import {
  BasicGetVisualizer,
  PathParamVisualizer,
  QueryParamVisualizer,
  OptionalQueryVisualizer,
  PostEndpointVisualizer,
  TestPostVisualizer,
  CompleteAppVisualizer,
  RecapQuizVisualizer,
} from '../components/FastAPIPart3PracticeVisualizers';

export const meta = {
  title: 'Introduction to FastAPI and API Fundamentals (Part 3)',
  subtitle: 'The request/response cycle, and practice creating simple endpoints',
};

const C = ({ children }) => <span className="font-mono text-xs text-teal-200">{children}</span>;

const Pre = CodeBlock;

const Box = ({ title, tone = 'teal', children }) => {
  const border = {
    teal: 'border-l-teal-400',
    amber: 'border-l-amber-400',
    violet: 'border-l-violet-400',
    cyan: 'border-l-cyan-400',
    rose: 'border-l-rose-400',
    emerald: 'border-l-emerald-400',
    sky: 'border-l-sky-400',
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
    id: 'cycle-overview',
    title: 'Anatomy of a FastAPI Request/Response Cycle',
    subtitle: 'What happens between “request arrives” and “response sent”',
    Visual: CycleOverviewVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Running a FastAPI application with an ASGI server like Uvicorn starts a process that{' '}
          <strong className="text-white">listens for incoming HTTP requests</strong>. What happens when a
          request arrives and a response is sent back? Understanding this request/response cycle is the
          foundation for building effective web APIs.
        </p>
        <Box title="Four actors" tone="teal">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-sky-300">Client</strong> (browser, app, etc.) sends the HTTP request.</li>
            <li><strong className="text-emerald-300">ASGI Server</strong> (e.g. Uvicorn) turns HTTP into a Python request (the ASGI scope).</li>
            <li><strong className="text-amber-300">FastAPI Application</strong> calls your function with params and body.</li>
            <li><strong className="text-violet-300">Path Operation Function</strong> (your code) returns a value: dict, list, or model.</li>
          </ul>
          <p>The return value travels back the same way: FastAPI → HTTP response → ASGI server → client.</p>
        </Box>
        <p>
          The next slides break this into the 13 typical steps. This cycle repeats for every incoming
          request.
        </p>
        <Hint>On the right, follow one request in and its response out. Watch the data change shape at every hop.</Hint>
      </div>
    ),
  },
  {
    id: 'request-arrival',
    title: '1. Request Arrival',
    subtitle: 'What an HTTP request carries',
    Visual: RequestAnatomyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          A client — a web browser, a mobile app, or another service using <C>curl</C> or Python’s{' '}
          <C>requests</C> library — sends an HTTP request to the server’s address and port where your
          FastAPI application is running, e.g.:
        </p>
        <Pre>http://127.0.0.1:8000/items/5?query_param=abc</Pre>
        <p>This request includes:</p>
        <ul className="space-y-1.5">
          <li><span className="px-1.5 rounded bg-rose-500/25 text-rose-100 text-xs font-semibold">HTTP Method</span> e.g. <C>GET</C>, <C>POST</C>, <C>PUT</C>, <C>DELETE</C>.</li>
          <li><span className="px-1.5 rounded bg-amber-500/25 text-amber-100 text-xs font-semibold">Path</span> e.g. <C>/items/5</C>.</li>
          <li><span className="px-1.5 rounded bg-violet-500/25 text-violet-100 text-xs font-semibold">Headers</span> metadata like <C>Content-Type</C>, <C>Authorization</C>, etc.</li>
          <li><span className="px-1.5 rounded bg-cyan-500/25 text-cyan-100 text-xs font-semibold">Query Parameters</span> optional, e.g. <C>?query_param=abc</C>.</li>
          <li><span className="px-1.5 rounded bg-emerald-500/25 text-emerald-100 text-xs font-semibold">Request Body</span> optional; common with <C>POST</C> and <C>PUT</C>, containing data, often JSON.</li>
        </ul>
        <Hint>Build a request on the right and click each coloured part of the raw HTTP message.</Hint>
      </div>
    ),
  },
  {
    id: 'asgi-handling',
    title: '2–3. ASGI Server Handling → FastAPI Takes Over',
    subtitle: 'Raw HTTP becomes a Python dictionary',
    Visual: AsgiScopeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="2. ASGI Server Handling" tone="emerald">
          <p>
            The ASGI server (like Uvicorn) receives the raw HTTP request. It parses the request and
            translates it into a standardized format known as the <strong className="text-white">ASGI scope</strong>,
            which is essentially a Python dictionary containing all the request details.
          </p>
        </Box>
        <Box title="3. FastAPI Takes Over" tone="amber">
          <p>
            The ASGI server passes the ASGI scope — and related event messages for receiving the body —
            to the FastAPI application instance.
          </p>
        </Box>
        <p>
          This is why FastAPI and Uvicorn are separate packages: Uvicorn speaks HTTP on the network;
          FastAPI only ever sees clean Python data through the ASGI standard.
        </p>
        <Hint>Step through on the right: raw lines are parsed into scope keys; the body arrives separately as receive() events.</Hint>
      </div>
    ),
  },
  {
    id: 'routing',
    title: '4. Routing',
    subtitle: 'Path + method → the first matching path operation',
    Visual: RoutingVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI examines the request’s <strong className="text-white">path</strong> (<C>/items/5</C>) and{' '}
          <strong className="text-white">HTTP method</strong> (<C>GET</C>). It compares them against the{' '}
          <em>path operations</em> you defined in your application using decorators like{' '}
          <C>@app.get("/items/{'{item_id}'}")</C>.
        </p>
        <p>
          It finds the <strong className="text-white">first matching</strong> path operation function.
        </p>
        <Box title="What if nothing matches?" tone="amber">
          <ul className="list-disc pl-5 space-y-1">
            <li>No path matches → <strong className="text-white">404 Not Found</strong>.</li>
            <li>The path matches but not the method → <strong className="text-white">405 Method Not Allowed</strong>.</li>
          </ul>
          <p>Either way, your function never runs.</p>
        </Box>
        <Box title="Why “first” matters" tone="violet">
          <p>
            A pattern like <C>/items/{'{item_id}'}</C> also matches <C>/items/latest</C>. If a fixed path
            such as <C>/items/latest</C> is declared after it, it is never reached.
          </p>
        </Box>
        <Hint>Pick a request and watch FastAPI scan the route table. Then try declaring /items/latest before and after {'{item_id}'}.</Hint>
      </div>
    ),
  },
  {
    id: 'parsing',
    title: '5. Parameter Parsing and Validation',
    subtitle: 'Your function signature is the contract',
    Visual: ParamParsingVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>FastAPI automatically parses parameters from the request based on your function’s signature:</p>
        <Box title="Path Parameters" tone="amber">
          <p>
            If the matched route contains path parameters (like <C>{'{item_id}'}</C> in{' '}
            <C>/items/{'{item_id}'}</C>), FastAPI extracts the corresponding value from the path (<C>5</C>{' '}
            in our example) and converts it to the type declared in your function signature (e.g.{' '}
            <C>item_id: int</C>).
          </p>
        </Box>
        <Box title="Query Parameters" tone="cyan">
          <p>
            It extracts query parameters (like <C>query_param=abc</C>) and matches them to function
            arguments that are <em>not</em> part of the path. Type hints are used for conversion and basic
            validation.
          </p>
        </Box>
        <Box title="Request Body" tone="emerald">
          <p>
            For methods like <C>POST</C> or <C>PUT</C>, if your function expects a body (typically defined
            using a Pydantic model), FastAPI reads the request body, parses it (usually assuming JSON), and
            validates it against the Pydantic model. Pydantic is covered in detail in the next chapter.
          </p>
        </Box>
        <p>If anything is invalid, FastAPI responds with <strong className="text-white">422</strong> and a JSON error, and your function is never called.</p>
        <Hint>Try each tab on the right with a valid and an invalid request.</Hint>
      </div>
    ),
  },
  {
    id: 'execution',
    title: '6–8. Dependencies, Execution, Processing',
    subtitle: 'Where your code finally runs',
    Visual: ExecutionVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="6. Dependency Injection" tone="violet">
          <p>
            FastAPI’s dependency injection system resolves any dependencies declared for the path operation
            function (more on this in later chapters).
          </p>
        </Box>
        <Box title="7. Path Operation Function Execution" tone="teal">
          <p>
            FastAPI calls your path operation function (decorated with <C>@app.get</C>, <C>@app.post</C>,
            etc.), passing the extracted and validated parameters as arguments.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Defined with <C>async def</C>: FastAPI <strong className="text-white">awaits</strong> it, so other
              requests can be handled concurrently while it performs I/O.
            </li>
            <li>
              A regular <C>def</C>: FastAPI runs it in an <strong className="text-white">external threadpool</strong>{' '}
              to avoid blocking the main event loop — important for CPU-bound tasks like ML inference.
            </li>
          </ul>
        </Box>
        <Box title="8. Processing Logic" tone="amber">
          <p>
            Your function code executes. This is where you implement the endpoint’s logic: retrieving data
            from a database, processing input, or — in this course — loading an ML model and performing
            inference.
          </p>
        </Box>
        <Hint>Tab 1 walks through steps 6–8 on real code. Tab 2 races three requests with async def, def, and the classic mistake.</Hint>
      </div>
    ),
  },
  {
    id: 'response',
    title: '9–11. Response Generation, Conversion, Validation',
    subtitle: 'Return Python data; FastAPI makes it HTTP',
    Visual: ResponseVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="9. Response Generation" tone="violet">
          <p>
            Your function returns a result: a dictionary, a list, a Pydantic model instance, a string, or a{' '}
            <C>Response</C> object.
          </p>
        </Box>
        <Box title="10. Data Conversion" tone="amber">
          <p>FastAPI takes the return value and converts it into an appropriate HTTP response.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Python objects like dictionaries, lists, or Pydantic models are automatically converted to{' '}
              <strong className="text-white">JSON</strong>, and the <C>Content-Type</C> header is set to{' '}
              <C>application/json</C>.
            </li>
            <li>
              You can also explicitly return <C>fastapi.responses.Response</C> (or subclasses like{' '}
              <C>JSONResponse</C>, <C>HTMLResponse</C>) for finer control over the status code, headers, and
              body.
            </li>
          </ul>
        </Box>
        <Box title="11. Response Model Validation (optional)" tone="teal">
          <p>
            If you declared a <C>response_model</C> in the path operation decorator, FastAPI validates the
            outgoing data against it and filters it, so the response structure matches the defined schema.
          </p>
        </Box>
        <Hint>Try every return type on the right, then the response_model tab: filtering, a missing field, and no model at all.</Hint>
      </div>
    ),
  },
  {
    id: 'full-cycle',
    title: '12–13. Transmission, Delivery — the Full Cycle',
    subtitle: 'All 13 steps, and why knowing them helps',
    Visual: FullCycleVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="12. Response Transmission" tone="emerald">
          <p>FastAPI sends the finalized HTTP response (status code, headers, body) back to the ASGI server.</p>
        </Box>
        <Box title="13. Final Delivery" tone="sky">
          <p>The ASGI server transmits the HTTP response back over the network to the original client.</p>
        </Box>
        <p>
          This cycle repeats for every incoming request. FastAPI’s use of{' '}
          <strong className="text-white">type hints, Pydantic, and asynchronous capabilities</strong> makes
          steps like parameter parsing, data validation, and concurrent handling efficient and
          developer-friendly.
        </p>
        <p>
          Understanding this flow helps you <strong className="text-white">debug issues</strong>, structure your
          application logic, and see how FastAPI’s components work together to serve your APIs — including
          ML prediction APIs. Later chapters look at each stage in more detail, especially data validation
          with Pydantic and running ML models inside path operation functions.
        </p>
        <Hint>Tab 1: all 13 steps. Tab 2: turn common errors into a location in the cycle.</Hint>
      </div>
    ),
  },
  {
    id: 'basic-get',
    title: 'Practice: Creating a Basic GET Endpoint',
    subtitle: 'The most common HTTP method',
    Visual: BasicGetVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Building several basic endpoints gives practical experience with path operations, HTTP methods,
          and how FastAPI handles requests. Keep working in <C>main.py</C> and run the app with{' '}
          <C>uvicorn main:app --reload</C>. The <C>--reload</C> flag restarts the server automatically when
          you save changes.
        </p>
        <p>
          <strong className="text-white">GET</strong> retrieves data from a specified resource. In FastAPI you
          define a GET endpoint with the <C>@app.get()</C> decorator above an <C>async</C> function:
        </p>
        <Pre>{`# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    """
    This endpoint returns a message.
    It serves as the root or index of the API.
    """
    return {"message": "To the ML Model API"}`}</Pre>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li><C>@app.get("/")</C>: <C>read_root</C> handles GET requests made to the path <C>/</C> (the root path).</li>
          <li>
            <C>async def read_root():</C> an asynchronous function. FastAPI supports both <C>def</C> and{' '}
            <C>async def</C> route handlers; <C>async def</C> lets you use <C>asyncio</C> for concurrent
            operations (Chapter 5). For now, it is the standard way to define path operation functions.
          </li>
          <li><C>{'return {"message": ...}'}</C>: FastAPI automatically converts this dictionary into a JSON response.</li>
        </ol>
        <p>
          Save the file; with <C>--reload</C> the server restarts. Open <C>http://127.0.0.1:8000/</C> to see
          the JSON response <C>{'{"message":"To the ML Model API"}'}</C>.
        </p>
        <p>
          You can also open <C>http://127.0.0.1:8000/docs</C>: Swagger UI lets you explore and test endpoints
          from the browser. Find <C>/</C>, expand it, click “Try it out”, then “Execute”.
        </p>
      </div>
    ),
  },
  {
    id: 'path-params',
    title: 'Adding Path Parameters',
    subtitle: 'An identifier inside the URL path',
    Visual: PathParamVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Often you need a specific item, identified by a value in the URL path. These are{' '}
          <strong className="text-white">path parameters</strong>.
        </p>
        <Pre>{`@app.get("/items/{item_id}")
async def read_item(item_id: int):
    """
    Retrieves an item based on its ID provided in the path.
    """
    # In a real application, you would fetch data based on item_id
    return {"item_id": item_id, "description": f"Details for item {item_id}"}`}</Pre>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li><C>@app.get("/items/{'{item_id}'}")</C>: the path now contains a path parameter named <C>{'{item_id}'}</C>.</li>
          <li>
            <C>async def read_item(item_id: int):</C> the function accepts an argument named <C>item_id</C>
            with the type hint <C>: int</C>. FastAPI uses this hint to:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li><strong className="text-white">validate</strong> that the value can be converted to an integer,</li>
              <li><strong className="text-white">convert</strong> it (it arrives as a string from the URL) into an integer,</li>
              <li>provide <strong className="text-white">editor support</strong> (autocompletion and type checking).</li>
            </ul>
          </li>
        </ol>
        <p>
          <C>http://127.0.0.1:8000/items/42</C> returns{' '}
          <C>{'{"item_id":42,"description":"Details for item 42"}'}</C>.
        </p>
        <Box title="Try /items/abc" tone="rose">
          <p>
            FastAPI intercepts the request <em>before</em> it reaches your function, because "abc" cannot be
            converted to an integer, and returns a helpful JSON validation error (<C>loc: ["path", "item_id"]</C>).
            This automatic validation is a major benefit of FastAPI and type hints.
          </p>
        </Box>
      </div>
    ),
  },
  {
    id: 'query-params',
    title: 'Adding Query Parameters',
    subtitle: 'Optional key=value pairs after the ?',
    Visual: QueryParamVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Query parameters are optional key-value pairs appended to the URL after a question mark (<C>?</C>),
          often used for <strong className="text-white">filtering, sorting, or pagination</strong>. Unlike path
          parameters, they are not part of the path structure itself.
        </p>
        <Pre>{`from typing import Optional  # Import Optional

@app.get("/users/")
async def read_users(skip: int = 0, limit: int = 10):
    """
    Retrieves a list of users, with optional pagination.
    Uses query parameters 'skip' and 'limit'.
    """
    # Simulate fetching users from a data source
    all_users = [{"user_id": i, "name": f"User {i}"} for i in range(100)]
    return all_users[skip : skip + limit]`}</Pre>
        <Box title="read_users(skip: int = 0, limit: int = 10)" tone="cyan">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <C>skip</C> and <C>limit</C> are function arguments <em>without</em> being in the path string (
              <C>/users/</C>). FastAPI recognizes them as query parameters.
            </li>
            <li>Type hints (<C>: int</C>) provide validation and conversion.</li>
            <li>
              Default values (<C>= 0</C>, <C>= 10</C>) make them optional. If the client doesn’t provide them in
              the URL, the defaults are used.
            </li>
          </ul>
        </Box>
        <Hint>Slide skip and limit on the right and watch which of the 100 users come back.</Hint>
      </div>
    ),
  },
  {
    id: 'optional-q',
    title: 'Optional Query Parameters — Test These',
    subtitle: 'q: Optional[str] = None',
    Visual: OptionalQueryVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The item endpoint gains an optional query parameter too:</p>
        <Pre>{`@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Optional[str] = None):
    """
    Retrieves an item by ID, with an optional query parameter 'q'.
    """
    response = {"item_id": item_id, "description": f"Details for item {item_id}"}
    if q:
        response.update({"query_param": q})
    return response`}</Pre>
        <Box title="read_item(item_id: int, q: Optional[str] = None)" tone="teal">
          <ul className="list-disc pl-5 space-y-1">
            <li>A new parameter <C>q</C> was added.</li>
            <li><C>Optional[str]</C> indicates that <C>q</C> can be a string or <C>None</C>.</li>
            <li><C>= None</C> sets its default value to <C>None</C>, making it optional.</li>
          </ul>
        </Box>
        <Box title="Test these" tone="sky">
          <ul className="list-disc pl-5 space-y-1">
            <li><C>/users/</C>: uses defaults (<C>skip=0</C>, <C>limit=10</C>).</li>
            <li><C>/users/?skip=10&limit=5</C>: uses provided values.</li>
            <li><C>/items/5</C>: no query parameter <C>q</C>.</li>
            <li><C>/items/5?q=somequery</C>: includes the query parameter <C>q</C>.</li>
          </ul>
          <p>Again, try invalid types like <C>skip=abc</C> to see the automatic validation errors.</p>
        </Box>
      </div>
    ),
  },
  {
    id: 'post',
    title: 'Creating a Basic POST Endpoint',
    subtitle: 'Sending data to the server',
    Visual: PostEndpointVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The <strong className="text-white">POST</strong> method sends data to the server to create or update a
          resource. Defining a POST endpoint is similar to GET, using the <C>@app.post()</C> decorator.
        </p>
        <p>
          Handling the <em>body</em> of a POST request (the data being sent) typically involves Pydantic
          models, covered in Chapter 2. For this practice, the endpoint just acknowledges the request
          without processing input data yet:
        </p>
        <Pre>{`# main.py (add this function)
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# ... (all previous endpoints) ...

@app.post("/items/")
async def create_item():
    """
    Placeholder endpoint for creating a new item.
    Currently just returns a confirmation message.
    Data reception will be handled in Chapter 2.
    """
    # In Chapter 2, we'll learn how to receive data here
    return {"message": "Item received (but not processed yet)"}`}</Pre>
        <Box title="Why can’t I just open it in the browser?" tone="amber">
          <p>
            Browsers typically only make <strong className="text-white">GET</strong> requests from the address
            bar, so you need a different tool to test a POST endpoint easily.
          </p>
        </Box>
      </div>
    ),
  },
  {
    id: 'test-post',
    title: 'Testing the POST Endpoint',
    subtitle: 'The interactive docs, or curl',
    Visual: TestPostVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="1. FastAPI Docs" tone="teal">
          <p>
            Navigate to <C>http://127.0.0.1:8000/docs</C>, find the <C>POST /items/</C> endpoint, expand it,
            click “Try it out”, then “Execute”. You should see the success response.
          </p>
        </Box>
        <Box title="2. curl (command line)" tone="violet">
          <p>Open your terminal and run:</p>
          <Pre>curl -X POST http://127.0.0.1:8000/items/ -H "accept: application/json"</Pre>
          <p>
            The <C>-X POST</C> flag specifies the HTTP method. The <C>-H</C> flag adds a header saying we
            accept JSON responses. You should receive:
          </p>
          <Pre>{'{"message":"Item received (but not processed yet)"}'}</Pre>
        </Box>
        <Hint>On the right, test from Swagger UI step by step, then take the curl command apart — and see what happens without -X POST.</Hint>
      </div>
    ),
  },
  {
    id: 'complete',
    title: 'Complete Code Example',
    subtitle: 'All the endpoints in one main.py',
    Visual: CompleteAppVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Here is the complete <C>main.py</C> with all the endpoints created in this practice:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><C>app = FastAPI(title="Simple API Practice", version="0.1.0")</C> names and versions the API in the docs.</li>
          <li><C>GET /</C> → <C>read_root</C>: a message.</li>
          <li><C>GET /users/</C> → <C>read_users</C>: pagination with <C>skip</C> and <C>limit</C> query parameters.</li>
          <li><C>GET /items/{'{item_id}'}</C> → <C>read_item</C>: a path parameter plus the optional query parameter <C>q</C>.</li>
          <li><C>POST /items/</C> → <C>create_item</C>: a placeholder for receiving data.</li>
        </ul>
        <Pre>{`# To run: uvicorn main:app --reload`}</Pre>
        <p>
          The docs page is generated straight from this file: paths, methods, parameter names, types, and
          defaults all come from your decorators and function signatures.
        </p>
        <Hint>Click endpoints on the right to jump to their code; click the app = FastAPI(...) line to toggle the title.</Hint>
      </div>
    ),
  },
  {
    id: 'recap',
    title: 'What You Built',
    subtitle: 'GET, POST, path and query parameters, automatic validation',
    Visual: RecapQuizVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          You have now created endpoints using different HTTP methods (<strong className="text-white">GET</strong>,{' '}
          <strong className="text-white">POST</strong>) and learned how to handle{' '}
          <strong className="text-white">path and query parameters</strong> with automatic validation provided by
          FastAPI’s type hinting system.
        </p>
        <p>You also saw the usefulness of the interactive API documentation.</p>
        <Box title="How it maps to the cycle" tone="teal">
          <ul className="list-disc pl-5 space-y-1">
            <li>404 / 405 → decided at <strong className="text-white">routing</strong>.</li>
            <li>422 → decided at <strong className="text-white">parameter parsing and validation</strong>.</li>
            <li>200 with your data → your <strong className="text-white">function</strong> ran and FastAPI converted the result.</li>
          </ul>
        </Box>
        <p>
          In the next chapter, you will greatly improve how you handle data — especially complex request
          bodies for POST requests — using <strong className="text-white">Pydantic models</strong>.
        </p>
        <Hint>Test yourself on the right: predict the response for each request before revealing it.</Hint>
      </div>
    ),
  },
];

export default function IntroductionToFastAPIAndAPIFundamentalsPartThree() {
  return <ChapterDeck slides={slidesData} />;
}
