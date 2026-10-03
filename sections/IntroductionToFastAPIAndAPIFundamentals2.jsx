import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  StackFlowVisualizer,
  AsyncVsSyncVisualizer,
  AttributesVisualizer,
  WhyFastAPIVisualizer,
  RestaurantVisualizer,
  ClientServerVisualizer,
  RequestAnatomyVisualizer,
  ResponseAnatomyVisualizer,
  RestPrinciplesVisualizer,
  HttpMethodsVisualizer,
  PydanticGateVisualizer,
  InferenceLoopVisualizer,
  DocsSyncVisualizer,
  EcosystemVisualizer,
} from '../components/FastAPIFundamentalsPart1Visualizers';

export const meta = {
  title: 'Introduction to FastAPI and API Fundamentals (Part 1)',
  subtitle: 'What FastAPI is, HTTP, REST, and why it fits model serving',
};

const slidesData = [
  {
    id: 'what',
    title: 'What is FastAPI?',
    subtitle: 'A Python API framework built from two engines',
    Visual: StackFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI is a modern Python framework for building APIs, especially REST APIs. It is a
          strong fit for serving machine learning models because the framework is fast and the
          code stays close to ordinary Python.
        </p>
        <p>It inherits two libraries rather than reinventing them:</p>
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 border-l-4 border-l-brand-teal">
          <h4 className="text-white font-bold mb-1">1. Starlette</h4>
          <p>
            The ASGI layer. ASGI replaced WSGI, the interface under Flask and classic Django.
            Async I/O lets one process hold many connections, which is the usual shape of network
            work.
          </p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 border-l-4 border-l-violet-400">
          <h4 className="text-white font-bold mb-1">2. Pydantic</h4>
          <p>
            Validation, serialization, and documentation from type hints. Incoming JSON is checked
            against a model. Outgoing data is shaped by a model. The docs are generated from those
            same models.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Play the path on the right. Your <span className="font-mono text-teal-200">predict</span>{' '}
          function sits in the middle. Everything else is the framework.
        </p>
      </div>
    ),
  },
  {
    id: 'async',
    title: 'Asynchronous vs Synchronous',
    subtitle: 'Why yielding on I/O changes concurrency',
    Visual: AsyncVsSyncVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Starlette speaks ASGI, the Asynchronous Server Gateway Interface. WSGI, used by older
          frameworks, handles a request from start to finish on a worker. If that request is
          waiting on the network or disk, the worker waits with it.
        </p>
        <p>
          An async endpoint can <span className="font-mono text-amber-200">await</span> that wait
          and let the worker accept someone else. The diagram on the right is the same two
          requests under both models.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
          <li>
            <strong className="text-white">Async:</strong> request 2 starts while request 1 is
            still waiting on I/O.
          </li>
          <li>
            <strong className="text-white">Sync:</strong> request 2 sits in a queue until request
            1 has fully returned.
          </li>
        </ul>
        <p className="text-xs italic text-gray-400">
          This advantage is about I/O. A heavy <span className="font-mono">predict()</span> still
          occupies the worker — that shows up again later in this topic.
        </p>
      </div>
    ),
  },
  {
    id: 'attributes',
    title: 'Core Attributes',
    subtitle: 'What the framework was designed to fix',
    Visual: AttributesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>FastAPI’s goals line up with complaints about older Python web stacks:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-white">High performance</strong> on I/O-bound work, often
            compared with Node and Go.
          </li>
          <li>
            <strong className="text-white">Fast to code</strong> — validation and docs are not
            handwritten.
          </li>
          <li>
            <strong className="text-white">Fewer bugs</strong> — editors and Pydantic see the
            types before runtime does.
          </li>
          <li>
            <strong className="text-white">Intuitive</strong> — the published API and the code are
            the same source.
          </li>
          <li>
            <strong className="text-white">Easy</strong> to learn, with a short path from function
            to endpoint.
          </li>
          <li>
            <strong className="text-white">Standards-based</strong> — OpenAPI (formerly Swagger)
            and JSON Schema.
          </li>
        </ul>
        <p className="text-xs text-gray-400">Select each goal on the right to see the mechanism, not the slogan.</p>
      </div>
    ),
  },
  {
    id: 'why',
    title: 'Why FastAPI for ML Deployment?',
    subtitle: 'Four properties that match serving predictions',
    Visual: WhyFastAPIVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          A trained model is not yet a service. Callers need a contract for inputs, a fast path
          for concurrent requests, a way to discover the API, and a runtime that already speaks
          Python.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Data validation.</strong> Models expect specific
            features and types. Pydantic rejects a bad request before prediction code runs, and
            can describe the prediction output the same way.
          </li>
          <li>
            <strong className="text-white">Performance.</strong> Inference itself may be
            CPU-bound. Receiving the request, reading features, and writing logs are not. ASGI
            overlaps that surrounding work.
          </li>
          <li>
            <strong className="text-white">Automatic docs</strong> at{' '}
            <span className="font-mono text-teal-200">/docs</span> and{' '}
            <span className="font-mono text-teal-200">/redoc</span>. Another team can try the
            endpoint from the browser.
          </li>
          <li>
            <strong className="text-white">Python ecosystem.</strong> scikit-learn, TensorFlow,
            PyTorch, pandas, and NumPy import like any other library.
          </li>
        </ul>
        <p className="text-xs text-gray-400">
          The rest of this topic is those ideas, unpacked: HTTP, REST, the validation gate, and
          the libraries.
        </p>
      </div>
    ),
  },
  {
    id: 'api',
    title: 'What is an API?',
    subtitle: 'A menu, not the recipe',
    Visual: RestaurantVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          An API, Application Programming Interface, is the agreed way for two programs to talk.
          The restaurant version: the menu lists dishes and how to order them. You do not walk
          into the kitchen, and you do not need the recipe.
        </p>
        <p>
          For model deployment the menu is a <strong className="text-white">web API</strong>. It
          uses HTTP between a <strong className="text-white">client</strong> (browser, app, or
          another service) and a <strong className="text-white">server</strong> (this FastAPI app
          and the model).
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Menu item → endpoint, such as “predict species”</li>
          <li>Order → the feature payload</li>
          <li>Kitchen → validation plus the model</li>
          <li>Dish → the JSON prediction</li>
        </ul>
        <p className="text-xs text-gray-400">
          Place an order on the right, then use Prev step and Next step. The recipe stays
          blurred because a client never receives the weights.
        </p>
      </div>
    ),
  },
  {
    id: 'client-server',
    title: 'The Client–Server Model',
    subtitle: 'Three beats: request, work, response',
    Visual: ClientServerVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Every call in this course is the same three beats:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Client request.</strong> The client sends a message to
            a URL. The message names the action and, when needed, carries data.
          </li>
          <li>
            <strong className="text-white">Server processing.</strong> The server validates the
            message, runs the work (a lookup, or model inference), and decides the outcome.
          </li>
          <li>
            <strong className="text-white">Server response.</strong> The server sends a status
            code plus the result, or an explanation of why there is no result.
          </li>
        </ol>
        <p>
          FastAPI’s job is to turn a Python function into that middle beat, and to parse and
          format the messages around it.
        </p>
        <p className="text-xs text-gray-400">
          Step through the exchange on the right, then open the message itself on the next two slides.
        </p>
      </div>
    ),
  },
  {
    id: 'request',
    title: 'Anatomy of a Request',
    subtitle: 'Method, URL, headers, body',
    Visual: RequestAnatomyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>An HTTP request is four parts. FastAPI maps the first two onto your function, and parses the last one into a Pydantic model.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Method</strong> — the verb: GET, POST, PUT, DELETE, and
            others.
          </li>
          <li>
            <strong className="text-white">URL</strong> — which resource. Inference is often{' '}
            <span className="font-mono text-teal-200">/predict</span>.
          </li>
          <li>
            <strong className="text-white">Headers</strong> — metadata.{' '}
            <span className="font-mono text-rose-200">Content-Type: application/json</span> names
            the body format. <span className="font-mono text-rose-200">Authorization</span> carries
            credentials.
          </li>
          <li>
            <strong className="text-white">Body</strong> — optional. This is where input features
            travel on POST and PUT.
          </li>
        </ol>
        <p className="text-xs text-gray-400">
          Switch the verb on the right. GET drops the body; a prediction call usually cannot.
        </p>
      </div>
    ),
  },
  {
    id: 'response',
    title: 'Anatomy of a Response',
    subtitle: 'Status, headers, body',
    Visual: ResponseAnatomyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>The response tells the client both whether the call worked and what to parse.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Status code</strong> — three digits.{' '}
            <span className="text-emerald-300">200</span> OK,{' '}
            <span className="text-emerald-300">201</span> Created,{' '}
            <span className="text-rose-300">400</span> Bad Request,{' '}
            <span className="text-amber-300">404</span> Not Found,{' '}
            <span className="text-rose-300">500</span> Internal Server Error.
          </li>
          <li>
            <strong className="text-white">Headers</strong> —{' '}
            <span className="font-mono text-rose-200">Content-Type</span>,{' '}
            <span className="font-mono text-rose-200">Content-Length</span>, and others.
          </li>
          <li>
            <strong className="text-white">Body</strong> — the prediction, or a structured error.
          </li>
        </ol>
        <p>
          FastAPI adds <span className="font-mono text-rose-200">422</span> for data that is valid
          JSON but does not match your Pydantic model. That distinction matters: 400 means “I
          could not read this,” 422 means “I read it, and it is the wrong shape.”
        </p>
      </div>
    ),
  },
  {
    id: 'rest',
    title: 'REST, in Practice',
    subtitle: 'Four rules: resources, representations, statelessness, standard methods',
    Visual: RestPrinciplesVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Many web APIs, including those built with FastAPI, follow{' '}
          <strong className="text-white">REST</strong> (Representational State Transfer). REST is
          not a strict protocol or a library. It is an <em>architectural style</em>: a short list
          of rules (constraints) that make web services scalable, stateless, and maintainable.
          FastAPI does not force these rules on you, but ML APIs usually follow them.
        </p>
        <p className="text-xs text-gray-400">
          Think of them as four house rules. Each card gives the text’s definition, then the same
          idea in plain words.
        </p>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-teal-400 space-y-1">
          <p>
            <strong className="text-teal-300">1. Resources</strong> — information is represented as
            resources (a specific user, a product, a prediction result). Each resource has a unique
            URL, like <span className="font-mono text-xs text-teal-200">/models/iris-classifier</span>{' '}
            or <span className="font-mono text-xs text-teal-200">/predict</span>.
          </p>
          <p className="text-xs text-gray-400">
            Plain words: every <em>thing</em> gets its own address, and the address is a noun.{' '}
            <span className="font-mono">/predictions/123</span> always means result 123.
          </p>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-violet-400 space-y-1">
          <p>
            <strong className="text-violet-300">2. Representations</strong> — clients work with
            representations of resources, typically JSON (JavaScript Object Notation) or XML. When
            you request a resource, the server sends back a representation of its current state.
          </p>
          <p className="text-xs text-gray-400">
            Plain words: you get a <em>description</em> of the thing, not the thing. Ask for the
            model and you receive JSON about it (name, version, accuracy), never its weights.
          </p>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-amber-400 space-y-1">
          <p>
            <strong className="text-amber-300">3. Statelessness</strong> — each request must contain
            all the information needed to understand and complete it. The server stores no client
            context between requests. This improves reliability and scalability.
          </p>
          <p className="text-xs text-gray-400">
            Plain words: every request is a complete letter. The server has no memory of your
            previous letters, so any server can answer, and a restart loses nothing.
          </p>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-cyan-400 space-y-1">
          <p>
            <strong className="text-cyan-300">4. Standard methods</strong> — REST uses the standard
            HTTP methods to act on resources.
          </p>
          <p className="text-xs text-gray-400">
            Plain words: the URL names the thing and the verb says what to do:{' '}
            <span className="font-mono">DELETE /predictions/123</span>, not{' '}
            <span className="font-mono">/removeResult?id=123</span>.
          </p>
        </div>

        <p>
          Put together, an everyday call like{' '}
          <span className="font-mono text-xs text-teal-200">POST /predict</span> with a JSON body
          holding every feature already follows all four rules.
        </p>

        <p className="text-xs text-gray-400">
          On the right, use Next rule to go through one demo per rule. The last tab lights up
          where each rule appears in a real request.
        </p>
      </div>
    ),
  },
  {
    id: 'methods',
    title: 'HTTP Methods for ML',
    subtitle: 'Safe, idempotent, and the verbs you will actually ship',
    Visual: HttpMethodsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          HTTP defines request methods, often called <em>verbs</em>. The verb says what action to
          perform on the resource named by the URL. FastAPI uses the verb plus the path to pick
          which Python function runs:{' '}
          <span className="font-mono text-xs text-teal-200">@app.get</span>,{' '}
          <span className="font-mono text-xs text-teal-200">@app.post</span>,{' '}
          <span className="font-mono text-xs text-teal-200">@app.put</span>, and so on.
        </p>

        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Two words to learn first
          </p>
          <p>
            <strong className="text-emerald-300">Safe</strong> — read-only. The call does not
            change anything on the server.
          </p>
          <p>
            <strong className="text-teal-200">Idempotent</strong> — calling it once has the same
            effect on the server as calling it many times. Think of an elevator button: press it
            five times, you still get one elevator.{' '}
            <strong className="text-rose-300">Not idempotent</strong> is a vending machine: five
            presses, five sodas.
          </p>
          <p className="text-xs text-gray-400">
            Why it matters: networks time out and clients retry. Retrying an idempotent call is
            harmless. Retrying a POST can create a duplicate.
          </p>
        </div>

        <div className="space-y-2 text-[13px]">
          <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-emerald-400">
            <p>
              <strong className="text-white">GET</strong> — retrieve a representation of a
              resource. <span className="text-emerald-300">Safe</span> and{' '}
              <span className="text-emerald-300">idempotent</span>.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ML: model metadata{' '}
              <span className="font-mono text-teal-200">GET /models/info/resnet50</span>; a past
              prediction <span className="font-mono text-teal-200">GET /predictions/123</span>.
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-rose-400">
            <p>
              <strong className="text-white">POST</strong> — submit data to a resource, often
              creating something new or triggering processing. It changes server state, so it is{' '}
              <span className="text-rose-300">not safe</span> and{' '}
              <span className="text-rose-300">not necessarily idempotent</span>.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ML: send features (image, text) for a prediction{' '}
              <span className="font-mono text-teal-200">POST /predict/image</span>; submit data to
              train or fine-tune a model (usually done offline).
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-cyan-400">
            <p>
              <strong className="text-white">PUT</strong> — <em>replace</em> the resource with the
              request body. If it exists it is overwritten; if not, it may be created. Not safe, but{' '}
              <span className="text-emerald-300">idempotent</span>: the same PUT twice leaves the
              same result.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ML: update a model’s configuration{' '}
              <span className="font-mono text-teal-200">PUT /models/config/iris-classifier</span>;
              replace a model file entirely (less common through an API).
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-2.5 border-l-4 border-l-violet-400">
            <p>
              <strong className="text-white">DELETE</strong> — remove the resource. Not safe, but{' '}
              <span className="text-emerald-300">idempotent</span>: once it is gone, deleting again
              leaves it gone.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ML: remove a model version{' '}
              <span className="font-mono text-teal-200">DELETE /models/version/spam-filter-v1</span>;
              a stored result{' '}
              <span className="font-mono text-teal-200">DELETE /predictions/456</span>.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
            POST vs PUT vs PATCH
          </p>
          <p>
            <strong className="text-white">POST</strong> — “here is data, make something new.” The
            server picks the new id. Repeat it and you get another one.
          </p>
          <p>
            <strong className="text-white">PUT</strong> — “make the thing at <em>this</em> URL look
            exactly like this.” Fields you leave out are gone. Repeat it and nothing more happens.
          </p>
          <p>
            <strong className="text-white">PATCH</strong> — “change only these fields.” Everything
            else stays. Idempotent only if the body sets values (threshold = 0.8), not if it adds
            to them (threshold + 0.1).
          </p>
        </div>

        <p>
          Other methods exist but show up less often than GET and POST in basic ML APIs:{' '}
          <span className="font-mono text-xs text-rose-200">PATCH</span> for partial updates,{' '}
          <span className="font-mono text-xs text-rose-200">HEAD</span> (like GET without the
          response body), and <span className="font-mono text-xs text-rose-200">OPTIONS</span> (ask
          which methods a resource supports).
        </p>

        <p className="text-xs text-gray-400">
          On the right, pick a verb and press Next step twice to send the same request two times.
          Compare the server before, after the first call, and after the second.
        </p>
      </div>
    ),
  },
  {
    id: 'pydantic',
    title: 'The Pydantic Gate',
    subtitle: 'Parse, validate, then — only then — predict',
    Visual: PydanticGateVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Models expect a rigid input: types, ranges, feature names. Checking that at the boundary
          keeps garbage out of inference.
        </p>
        <p>You declare the contract as a normal Python class:</p>
        <CodeBlock>{`from pydantic import BaseModel

class ModelInput(BaseModel):
    age: int
    signup_month: str`}</CodeBlock>
        <p>FastAPI then does three things with it:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Parse the JSON body.</li>
          <li>Validate types and constraints. Failure returns a JSON error and stops.</li>
          <li>Serialize the response so it matches the declared output model.</li>
        </ol>
        <p className="text-xs text-gray-400">
          Valid:{' '}
          <span className="font-mono text-emerald-200">{`{"age": 30, "signup_month": "June"}`}</span>
          . Rejected before predict:{' '}
          <span className="font-mono text-rose-200">{`{"age": "thirty", "signup_month": 6}`}</span>.
        </p>
      </div>
    ),
  },
  {
    id: 'around',
    title: 'Asynchronous Task Support',
    subtitle: 'The model is CPU-bound. The work around it usually is not.',
    Visual: InferenceLoopVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          As slide 2 showed, FastAPI’s foundation in ASGI allows{' '}
          <strong className="text-white">asynchronous</strong> operations: while one request waits,
          the server can work on another. Whether that helps depends on what kind of work a step
          is.
        </p>

        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Two kinds of work
          </p>
          <p>
            <strong className="text-amber-300">CPU-bound</strong> — the processor is busy computing
            the whole time. Only more or faster CPUs make it quicker. Model inference (matrix math)
            is usually CPU-bound.
          </p>
          <p>
            <strong className="text-teal-300">I/O-bound</strong> — the program is mostly{' '}
            <em>waiting</em> on something outside itself: a database, another API, the network,
            a disk. The CPU sits idle during that wait.
          </p>
          <p className="text-xs text-gray-400">
            Kitchen version: chopping needs the chef’s hands (CPU). Waiting for the oven doesn’t
            (I/O), so the chef can start another order meanwhile.
          </p>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-3 border-l-4 border-l-amber-400 space-y-1.5">
          <p className="text-white font-semibold">The model itself: CPU-bound</p>
          <p>
            Core inference may not directly benefit from{' '}
            <span className="font-mono text-xs text-amber-200">async</span> unless it runs in a
            separate <strong className="text-white">thread pool</strong>, which FastAPI makes easy:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>
              Inside an <span className="font-mono text-xs">async def</span> route, call{' '}
              <span className="font-mono text-xs text-teal-200">
                await run_in_threadpool(model.predict, x)
              </span>
              .
            </li>
            <li>
              A plain <span className="font-mono text-xs">def</span> route is run in the thread pool
              automatically.
            </li>
            <li>
              Pitfall: calling <span className="font-mono text-xs">model.predict(x)</span> directly
              inside <span className="font-mono text-xs">async def</span> freezes the event loop
              while it computes. No other request can move.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-3 border-l-4 border-l-teal-400 space-y-1.5">
          <p className="text-white font-semibold">The work around it: often I/O-bound</p>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Fetching feature data from a database or an external API before prediction.</li>
            <li>Logging prediction results to a remote service.</li>
            <li>
              Simple pre- or post-processing that waits on external resources, such as downloading
              an image from cloud storage.
            </li>
          </ul>
          <p>
            Writing these endpoints with{' '}
            <span className="font-mono text-xs text-teal-200">async def</span> (and{' '}
            <span className="font-mono text-xs text-teal-200">await</span> on each wait) lets that
            I/O happen <strong className="text-white">without blocking the entire server
            process</strong>. The result:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>
              <strong className="text-white">Better responsiveness</strong> — other requests, even
              a quick health check, are answered while one request waits.
            </li>
            <li>
              <strong className="text-white">Better resource use</strong> — the CPU does useful work
              instead of sitting idle during waits.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-3 border-l-4 border-l-violet-400 space-y-1.5">
          <p className="text-white font-semibold">Background tasks</p>
          <p>
            FastAPI can return the response to the client quickly, then run non-critical follow-up
            work in the background, such as sending an email or updating a monitoring dashboard.
          </p>
          <CodeBlock className="p-2">{`background_tasks.add_task(update_dashboard, label)
return {"label": label}   # client gets this now`}</CodeBlock>
        </div>

        <p className="text-xs text-gray-400">
          On the right, tab 1 breaks one request into waiting (teal) and computing (amber). Tab 2
          sends three predictions and a health check to one server under three setups. Step time
          forward and compare the numbers.
        </p>
      </div>
    ),
  },
  {
    id: 'docs',
    title: 'Docs that Match the Code',
    subtitle: 'Type hints drive the editor, Swagger, and ReDoc',
    Visual: DocsSyncVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The type hints introduced in Python 3.5 are not only for Pydantic. FastAPI reads them
          for three tools at once:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-white">Editor support</strong> — autocomplete and type
            checking in VS Code catch mistakes while you type.
          </li>
          <li>
            <strong className="text-white">Interactive docs</strong> — OpenAPI rendered as Swagger
            UI at <span className="font-mono text-teal-200">/docs</span> and ReDoc at{' '}
            <span className="font-mono text-teal-200">/redoc</span>.
          </li>
        </ul>
        <p>
          You spend less time on hand-written validation, format debugging, and a wiki that drifts
          from the route. Anyone consuming the model can try a request from the running app.
        </p>
        <p className="text-xs text-gray-400">
          Toggle fields on the right. The class and both doc views are one list.
        </p>
      </div>
    ),
  },
  {
    id: 'ecosystem',
    title: 'The Python ML Ecosystem',
    subtitle: 'Same process as training, one HTTP wrapper',
    Visual: EcosystemVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI is ordinary Python. Serialized models load with the library that trained them:
          pickle, joblib, a PyTorch state dict, a TensorFlow SavedModel, ONNX, or XGBoost’s own
          format. spaCy pipelines load the same way.
        </p>
        <p>
          pandas and NumPy usually sit just in front of the model, turning the JSON body into the
          array <span className="font-mono text-teal-200">predict</span> expects. None of that
          requires a second runtime.
        </p>
        <p>
          Together: low-latency I/O from Starlette, a strict gate from Pydantic, docs that cannot
          drift, and the scientific stack you already use. That is the path from a trained file
          to a web service.
        </p>
        <p className="text-xs text-gray-400">
          Load a library on the right. The route stays{' '}
          <span className="font-mono text-teal-200">POST /predict</span>; only the call inside
          changes. Further slides in this topic can be appended in this file.
        </p>
      </div>
    ),
  },
];

export default function IntroductionToFastAPIAndAPIFundamentals() {
  return <ChapterDeck slides={slidesData} />;
}
