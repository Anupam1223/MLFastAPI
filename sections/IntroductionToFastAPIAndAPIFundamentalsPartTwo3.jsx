import React from 'react';
import ChapterDeck from '../components/ChapterDeck';
import {
  ChefVisualizer,
  WaitingServerVisualizer,
  CoroutineVisualizer,
  AwaitVisualizer,
  EventLoopVisualizer,
  FastAPIAsyncioVisualizer,
} from '../components/FastAPIPart2AsyncVisualizers';
import {
  PythonVersionVisualizer,
  VenvWhyVisualizer,
  CreateVenvVisualizer,
  ActivateVenvVisualizer,
  InstallVisualizer,
  VerifyToolsVisualizer,
  FirstAppVisualizer,
  RunUvicornVisualizer,
  BrowserReloadVisualizer,
  AutoDocsVisualizer,
} from '../components/FastAPIPart2SetupVisualizers';

export const meta = {
  title: 'Introduction to FastAPI and API Fundamentals (Part 2)',
  subtitle: 'Async Python, the event loop, environment setup, and your first app',
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
    violet: 'border-l-violet-400',
    cyan: 'border-l-cyan-400',
    rose: 'border-l-rose-400',
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
    id: 'sync-async',
    title: 'Synchronous vs Asynchronous',
    subtitle: 'Waiting idly vs switching while you wait',
    Visual: ChefVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Many standard Python programs run <strong className="text-white">synchronously</strong>:
          when the program reaches an operation, it waits for that operation to finish before moving
          to the next line.
        </p>
        <Box title="The synchronous chef" tone="amber">
          <p>
            Prepares one dish from start to finish before even looking at the next order. Simple to
            reason about, but inefficient whenever the work involves waiting.
          </p>
        </Box>
        <Box title="The asynchronous chef" tone="teal">
          <p>
            Starts the water boiling for pasta, then switches to chopping vegetables while the water
            heats up, and returns to the pasta only when the water is boiling.
          </p>
        </Box>
        <p>
          Instead of waiting idly, an <strong className="text-white">asynchronous</strong> program
          switches to other tasks while one task waits, then resumes the original task where it left
          off once the wait is over.
        </p>
        <p>
          The result is much higher <strong className="text-white">concurrency</strong>: handling many
          operations seemingly at the same time, with fewer resources.
        </p>
        <Hint>
          On the right, step through both chefs minute by minute, then switch to server terms — the
          boiling water becomes a database query.
        </Hint>
      </div>
    ),
  },
  {
    id: 'io-bound',
    title: 'Why Waiting Hurts a Web Server',
    subtitle: 'I/O-bound work under load',
    Visual: WaitingServerVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Web applications — including APIs that serve ML models — spend a lot of time on{' '}
          <strong className="text-white">I/O-bound</strong> operations: waiting for something outside
          the program, like network requests or disk reads.
        </p>
        <p>A single request might need to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>fetch user data from a database,</li>
          <li>call another microservice,</li>
          <li>load model features from storage.</li>
        </ul>
        <Box title="In a synchronous server" tone="rose">
          <p>
            While the server waits for the database to respond, it{' '}
            <strong className="text-white">cannot process any other incoming requests</strong>. Under
            load, requests queue up behind each other’s waits: poor performance and poor resource
            utilization.
          </p>
        </Box>
        <Box title="In an asynchronous server" tone="teal">
          <p>
            While one request waits, the server starts the next. The waits overlap, so many requests
            are served in roughly the time of one wait.
          </p>
        </Box>
        <p>
          Python supports this natively with the <C>async</C> and <C>await</C> syntax, built on{' '}
          <strong className="text-white">coroutines</strong> — the next two slides.
        </p>
        <Hint>
          Drag the sliders on the right: more requests and longer waits make the gap between the two
          servers grow.
        </Hint>
      </div>
    ),
  },
  {
    id: 'coroutines',
    title: 'Coroutines with async def',
    subtitle: 'Calling it gives you a coroutine object',
    Visual: CoroutineVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          You define an asynchronous function — a <strong className="text-white">coroutine</strong> —
          with <C>async def</C> instead of just <C>def</C>:
        </p>
        <Pre>{`async def get_data_from_network():
    # Code to fetch data...
    print("Fetching data...")
    # Simulate waiting for a network response
    await asyncio.sleep(1)  # This is where the magic happens
    print("Data received!")
    return {"data": "some result"}`}</Pre>
        <Box title="The surprise" tone="amber">
          <p>
            A function defined with <C>async def</C> does not run like a regular function when called.
            Calling it returns a <strong className="text-white">coroutine object</strong>: it
            represents the work in the function, but does not execute it immediately.
          </p>
        </Box>
        <p>
          The body only runs when the coroutine is awaited (or handed to the event loop, for example
          with <C>asyncio.run</C>).
        </p>
        <Hint>
          On the right, step through the async version and notice nothing prints on the call. Then
          compare the regular <C>def</C> version.
        </Hint>
      </div>
    ),
  },
  {
    id: 'await',
    title: 'Pausing Execution with await',
    subtitle: 'Suspend, let others run, resume',
    Visual: AwaitVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The <C>await</C> keyword is used <em>inside</em> an <C>async def</C> function. It tells
          Python that the operation being called might take some time.
        </p>
        <Box title="What await does" tone="teal">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Suspends the current coroutine at that line.</li>
            <li>Lets the application perform other tasks meanwhile.</li>
            <li>When the awaited operation completes, resumes the coroutine from exactly that point.</li>
          </ol>
        </Box>
        <Box title="Two rules" tone="amber">
          <p>
            The thing you await must be <strong className="text-white">awaitable</strong> — typically
            another coroutine, or an object designed for async operations.
          </p>
          <p>
            Crucially, <C>await</C> can only be used inside functions defined with <C>async def</C>.
          </p>
        </Box>
        <Hint>
          On the right, two coroutines share one event loop: their waits overlap, so the total is 2
          seconds instead of 3. The second tab tests both rules.
        </Hint>
      </div>
    ),
  },
  {
    id: 'event-loop',
    title: 'The Event Loop',
    subtitle: 'Who decides when a paused coroutine resumes',
    Visual: EventLoopVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          How does the application know when to resume a suspended coroutine? That is the job of the{' '}
          <strong className="text-white">event loop</strong> — the core of any asynchronous
          application.
        </p>
        <Box title="What the event loop does" tone="teal">
          <ul className="list-disc pl-5 space-y-1">
            <li>Keeps track of all running and suspended tasks.</li>
            <li>
              When a task uses <C>await</C> to pause for an I/O operation, the task yields control back
              to the loop.
            </li>
            <li>The loop then runs other ready tasks.</li>
            <li>When the I/O completes, the loop schedules the original task to resume.</li>
          </ul>
        </Box>
        <p>
          Python’s built-in <C>asyncio</C> library provides the event loop and the tools for managing
          asynchronous tasks.
        </p>
        <Hint>
          The flow on the right follows the course diagram: request arrives → enter async function →
          await → yield control → event loop → run other tasks → I/O complete → resume → return
          response.
        </Hint>
      </div>
    ),
  },
  {
    id: 'fastapi-async',
    title: 'FastAPI on the Event Loop',
    subtitle: 'ASGI, Starlette, asyncio — and why it is fast',
    Visual: FastAPIAsyncioVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          FastAPI is built directly on these asynchronous capabilities — specifically the{' '}
          <strong className="text-white">ASGI</strong> standard and the{' '}
          <strong className="text-white">Starlette</strong> toolkit, which relies on <C>asyncio</C>.
          So you write ordinary Python with <C>async</C> and <C>await</C> in your route handlers.
        </p>
        <Box title="What happens on a request" tone="teal">
          <ul className="list-disc pl-5 space-y-1">
            <li>FastAPI runs the matching route handler within the event loop.</li>
            <li>
              If the handler awaits an I/O-bound operation (an async database call, an external API),
              FastAPI handles the pausing and resuming automatically.
            </li>
            <li>That lets the server handle many concurrent requests efficiently.</li>
          </ul>
        </Box>
        <p>
          This built-in async support is a primary reason for FastAPI’s high performance — especially
          useful for ML APIs that fetch data or preprocess inputs before inference.
        </p>
        <Box title="The caveat" tone="amber">
          <p>
            The core inference step of many models is <strong className="text-white">CPU-bound</strong>{' '}
            and needs special handling in async code (Chapter 5). The surrounding tasks — validation
            lookups, logging, fetching features, saving results — often involve I/O and benefit greatly
            from the async model.
          </p>
        </Box>
        <Hint>Next up: simple synchronous and asynchronous endpoints — after setting up the environment.</Hint>
      </div>
    ),
  },
  {
    id: 'python-version',
    title: 'Setting Up Your Development Environment',
    subtitle: 'Start with the right Python',
    Visual: PythonVersionVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Setting up your development environment is a fundamental step. It means having:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>the correct Python version,</li>
          <li>FastAPI itself,</li>
          <li>an ASGI server such as Uvicorn to run your applications,</li>
          <li>and, as a best practice, a virtual environment to manage dependencies cleanly.</li>
        </ul>
        <Box title="Python 3.7 or later" tone="teal">
          <p>
            FastAPI uses modern Python features — type hints and asynchronous programming — that
            require recent versions. Check yours in a terminal:
          </p>
          <Pre>{`python --version
# or sometimes python3 --version`}</Pre>
        </Box>
        <p>
          If you need to install or update Python, visit{' '}
          <a href="https://www.python.org/" target="_blank" rel="noreferrer" className="text-teal-300 underline">
            python.org
          </a>{' '}
          and follow the instructions for your operating system.
        </p>
        <Hint>On the right, try both commands on different machines and read the verdict.</Hint>
      </div>
    ),
  },
  {
    id: 'venv-why',
    title: 'Using Virtual Environments',
    subtitle: 'One isolated space per project',
    Visual: VenvWhyVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          It is highly recommended to use a <strong className="text-white">virtual environment</strong>{' '}
          for each Python project.
        </p>
        <Box title="What a virtual environment is" tone="teal">
          <p>
            An isolated space where you can install specific versions of packages without affecting
            your global Python installation or any other project.
          </p>
        </Box>
        <Box title="Why it matters" tone="amber">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-white">Prevents dependency conflicts</strong> — two projects can
              need two different versions of the same library.
            </li>
            <li>
              <strong className="text-white">Makes your project reproducible</strong> — its exact
              package versions belong to it and can be recreated elsewhere.
            </li>
          </ul>
        </Box>
        <p>
          Python ships with the <C>venv</C> module for creating virtual environments — no extra
          install needed.
        </p>
        <Hint>
          On the right, install a newer scikit-learn for Project B with and without virtual
          environments, and watch Project A.
        </Hint>
      </div>
    ),
  },
  {
    id: 'venv-create',
    title: 'Create a Virtual Environment',
    subtitle: 'Steps 1 and 2: project folder, then venv',
    Visual: CreateVenvVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="1. Navigate to your project directory" tone="teal">
          <p>Open a terminal and move to where you want the FastAPI project to live:</p>
          <Pre>{`mkdir fastapi-ml-intro
cd fastapi-ml-intro`}</Pre>
        </Box>
        <Box title="2. Create a virtual environment" tone="teal">
          <p>
            Run the <C>venv</C> module and give the environment a name. <C>.venv</C> or <C>venv</C> are
            common conventions:
          </p>
          <Pre>{`python -m venv .venv
# or python3 -m venv .venv`}</Pre>
          <p>
            This creates a <C>.venv</C> directory containing a copy of the Python interpreter and a
            place to install project-specific packages.
          </p>
        </Box>
        <Hint>
          Step through on the right and watch the file tree grow. At the end, click the entries inside{' '}
          <C>.venv</C> to see what each one is for.
        </Hint>
      </div>
    ),
  },
  {
    id: 'venv-activate',
    title: 'Activate the Virtual Environment',
    subtitle: 'Step 3: make the project’s Python the default',
    Visual: ActivateVenvVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Activation modifies your shell’s <strong className="text-white">PATH</strong> so the
          environment’s Python interpreter and packages take priority.
        </p>
        <Box title="On macOS and Linux" tone="teal">
          <Pre>source .venv/bin/activate</Pre>
        </Box>
        <Box title="On Windows (Command Prompt)" tone="cyan">
          <Pre>{`.venv\\Scripts\\activate.bat`}</Pre>
        </Box>
        <Box title="On Windows (PowerShell)" tone="violet">
          <Pre>{`.venv\\Scripts\\Activate.ps1`}</Pre>
          <p className="text-xs">
            You might need to adjust the execution policy first:{' '}
            <C>Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process</C>
          </p>
        </Box>
        <p>
          Once activated, your prompt usually shows the environment name, e.g.{' '}
          <C>(.venv) your-user@your-machine:...$</C>. Every <C>pip</C> install from then on happens
          inside this isolated environment. To switch back, type <C>deactivate</C>.
        </p>
        <Hint>
          On the right, pick your OS and step through: the prompt, the PATH order, and which python
          answers all change.
        </Hint>
      </div>
    ),
  },
  {
    id: 'install',
    title: 'Installing FastAPI and Uvicorn',
    subtitle: 'The framework and the server that runs it',
    Visual: InstallVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          With the environment activated, install with <C>pip</C>, Python’s package installer.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-white">FastAPI</strong> — the core web framework.
          </li>
          <li>
            <strong className="text-white">Uvicorn</strong> — an ASGI (Asynchronous Server Gateway
            Interface) server. FastAPI is built on the ASGI standard, and Uvicorn is the fast server
            recommended by FastAPI’s creators for development and production.
          </li>
        </ul>
        <Box title="Install both with one command" tone="teal">
          <Pre>pip install "fastapi[all]"</Pre>
          <p>
            <C>[all]</C> is a convenience: it installs <C>fastapi</C>, <C>uvicorn</C> for serving,{' '}
            <C>pydantic</C> for data validation (which FastAPI relies on heavily), and useful optional
            extras like <C>python-multipart</C> (form data) and <C>jinja2</C> (templating). A
            comprehensive starting point.
          </p>
        </Box>
        <Box title="Or a minimal install" tone="amber">
          <Pre>pip install fastapi uvicorn pydantic</Pre>
          <p>For starting out, <C>fastapi[all]</C> is generally recommended.</p>
        </Box>
        <Hint>Run each install on the right and watch the packages land in the environment.</Hint>
      </div>
    ),
  },
  {
    id: 'verify',
    title: 'Verify, and Pick Your Tools',
    subtitle: 'pip show, then a good editor',
    Visual: VerifyToolsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <Box title="Verifying the installation" tone="teal">
          <p>Ask pip to show details for both packages:</p>
          <Pre>pip show fastapi uvicorn</Pre>
          <p>It lists information about each installed package, including its version. Make sure no errors are reported.</p>
        </Box>
        <Box title="Development tools" tone="violet">
          <p>
            Not strictly required, but a good code editor or IDE (Integrated Development Environment)
            improves your experience a lot. VS Code, PyCharm, Sublime Text and others offer:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>syntax highlighting,</li>
            <li>code completion,</li>
            <li>debugging,</li>
            <li>terminal integration.</li>
          </ul>
        </Box>
        <p>
          Your development environment is now ready: Python, FastAPI, Uvicorn, and an isolated virtual
          environment.
        </p>
        <Hint>On the right: read the pip output field by field, then try the editor features.</Hint>
      </div>
    ),
  },
  {
    id: 'first-app',
    title: 'Your First FastAPI Application',
    subtitle: 'Six lines that matter in main.py',
    Visual: FirstAppVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Create a file named <C>main.py</C> in your project directory. The code on the right is the
          whole application. Here is what each part does:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            <C>from fastapi import FastAPI</C> — import the class that provides the core functionality.
          </li>
          <li>
            <C>app = FastAPI()</C> — create an instance; <C>app</C> is the main point of interaction for
            creating routes.
          </li>
          <li>
            <C>@app.get("/")</C> — a decorator. It tells FastAPI that the function below handles{' '}
            <strong className="text-white">GET</strong> requests to the root path <C>/</C>. A path plus
            a method is an <strong className="text-white">operation</strong>; the function is the{' '}
            <strong className="text-white">path operation function</strong>.
          </li>
          <li>
            <C>async def read_root():</C> — an asynchronous function. FastAPI is built around asyncio,
            so async endpoints handle many requests concurrently. Even without an explicit{' '}
            <C>await</C>, <C>async def</C> lets FastAPI run it correctly within its event loop.
          </li>
          <li>
            <C>{'return {"message": ...}'}</C> — return a Python dictionary; FastAPI converts it to a
            JSON response automatically (serialization).
          </li>
          <li>
            <C>@app.get("/status")</C> with <C>get_status()</C> — a second endpoint at <C>/status</C>,
            also answering GET with a JSON status message.
          </li>
        </ol>
        <Hint>Step through the code on the right. The route table fills in as each line runs.</Hint>
      </div>
    ),
  },
  {
    id: 'run',
    title: 'Run It with Uvicorn',
    subtitle: 'uvicorn main:app --reload',
    Visual: RunUvicornVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>From your project directory (the one containing <C>main.py</C>), run:</p>
        <Pre>uvicorn main:app --reload</Pre>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <C>uvicorn</C> — runs the Uvicorn ASGI server, which actually serves your FastAPI app over
            HTTP.
          </li>
          <li>
            <C>main:app</C> — where to find your application: <C>main</C> is the file <C>main.py</C>,{' '}
            <C>app</C> is the object <C>app = FastAPI()</C> inside it.
          </li>
          <li>
            <C>--reload</C> — restart the server automatically whenever code files change. Very useful
            in development: no manual stop and start after every edit.
          </li>
        </ul>
        <p>If everything is set up correctly, you will see output like:</p>
        <Pre>{`INFO:     Will watch for changes in directory '…'
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [...] using StatReload
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.`}</Pre>
        <Hint>On the right, click each part of the command, then watch the startup log line by line.</Hint>
      </div>
    ),
  },
  {
    id: 'browser',
    title: 'Talk to Your Running App',
    subtitle: 'http://127.0.0.1:8000 in the browser',
    Visual: BrowserReloadVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The log line <C>Uvicorn running on http://127.0.0.1:8000</C> means your application is
          running and reachable at that address.
        </p>
        <Box title="Open http://127.0.0.1:8000" tone="teal">
          <p>You see the JSON returned by <C>read_root</C>:</p>
          <Pre>{`{"message":"Hello from the FastAPI ML Service!"}`}</Pre>
        </Box>
        <Box title="Open http://127.0.0.1:8000/status" tone="cyan">
          <Pre>{`{"status":"API is running"}`}</Pre>
        </Box>
        <p>
          Because the server was started with <C>--reload</C>, saving a change to <C>main.py</C>{' '}
          restarts it automatically — refresh the browser and the new response is there.
        </p>
        <Hint>
          On the right, visit each address and watch the server log. Then edit main.py and visit /
          again.
        </Hint>
      </div>
    ),
  },
  {
    id: 'docs',
    title: 'Automatic Interactive API Documentation',
    subtitle: '/docs and /redoc, generated from your code',
    Visual: AutoDocsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          One of FastAPI’s standout features is built-in, automatic, interactive documentation. It uses
          the standards <strong className="text-white">OpenAPI</strong> (formerly Swagger) and{' '}
          <strong className="text-white">JSON Schema</strong> to generate docs directly from your code:
          path operations, parameters, and data models.
        </p>
        <p>While the app is running, open:</p>
        <Box title="http://127.0.0.1:8000/docs" tone="teal">
          <p>
            <strong className="text-white">Swagger UI</strong> — an interactive environment listing
            every endpoint, its expected parameters and responses, and letting you try them directly
            from the browser.
          </p>
        </Box>
        <Box title="http://127.0.0.1:8000/redoc" tone="violet">
          <p>
            <strong className="text-white">ReDoc</strong> — an alternative interface with a clean,
            hierarchical view of your API specification.
          </p>
        </Box>
        <p>
          You will see your <C>/</C> and <C>/status</C> endpoints listed. This is a big productivity
          booster, making the API easier for you and others to understand and use as it grows.
        </p>
        <p>
          You have now created, run, and interacted with your first FastAPI application — the
          foundation for services that validate data and serve ML predictions.
        </p>
        <Hint>
          On the right, step through how the docs are generated, then use the mock /docs and /redoc.
          Tick the checkbox to add an endpoint and watch both update.
        </Hint>
      </div>
    ),
  },
];

export default function IntroductionToFastAPIAndAPIFundamentalsPartTwo() {
  return <ChapterDeck slides={slidesData} />;
}
