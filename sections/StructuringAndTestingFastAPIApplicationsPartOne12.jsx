import React from 'react';
import CodeBlock from '../components/CodeBlock';
import ChapterDeck from '../components/ChapterDeck';
import {
  TangledMainVisualizer,
  RouterDefineVisualizer,
  IncludeRouterVisualizer,
  PrefixTagVisualizer,
  RouterBenefitsVisualizer,
  ThreeLayersVisualizer,
  LayerFlowVisualizer,
  SocTreeVisualizer,
  WhoCallsVisualizer,
  SocBenefitsVisualizer,
} from '../components/StructuringRouterVisualizers';
import {
  WhyPinVisualizer,
  RequirementsVisualizer,
  VersionSpecVisualizer,
  PoetryVisualizer,
  TestingIntroVisualizer,
  TestKindsVisualizer,
} from '../components/StructuringDepsVisualizers';

export const meta = {
  title: 'Structuring and Testing FastAPI Applications (Part 1)',
  subtitle: 'Routers, layers, pinned dependencies, and why we test',
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
    id: 'why-routers',
    title: 'Organizing Your Project with Routers',
    subtitle: 'main.py should not hold every URL',
    Visual: TangledMainVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          As your FastAPI application for serving machine learning models grows, managing all your API endpoints within a single
          Python file (like <C>main.py</C>) quickly becomes difficult. Code becomes harder to navigate, maintain, and debug.
          Different logical parts of your API, such as prediction endpoints, status checks, or model management routes, get tangled
          together.
        </p>
        <p>
          FastAPI provides a clean solution for this: <C>APIRouter</C>. Think of an <C>APIRouter</C> as a mini FastAPI application.
          It allows you to group related path operations (endpoints) together, typically in separate Python modules, and then connect
          them back to your main FastAPI application instance. This modular approach is fundamental for building larger,
          well-structured services.
        </p>
        <Hint>Watch prediction, health, and reload leave main.py. The URLs the client calls stay the same.</Hint>
      </div>
    ),
  },
  {
    id: 'define-router',
    title: 'Introducing APIRouter',
    subtitle: '@router.post, the same function you would hang on app',
    Visual: RouterDefineVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          An <C>APIRouter</C> works much like the main FastAPI application object. You can define path operations (using decorators
          like <C>@router.get</C>, <C>@router.post</C>, etc.) on an <C>APIRouter</C> instance just as you would on an <C>app</C>{' '}
          instance.
        </p>
        <p>
          Let’s see how to use it. Imagine you want to separate your model prediction endpoints into their own module.
        </p>
        <p>
          First, create a new file, for example, <C>routers/predictions.py</C>. Inside this file, you import <C>APIRouter</C> and
          create an instance:
        </p>
        <Pre>{`# routers/predictions.py
from fastapi import APIRouter
from pydantic import BaseModel

# Define your input/output Pydantic models if needed
class PredictionInput(BaseModel):
    feature1: float
    feature2: str
    # ... other features

class PredictionOutput(BaseModel):
    prediction: float
    probability: float | None = None

# Create the router instance
router = APIRouter()

# Define path operations on the router instance
@router.post("/make", response_model=PredictionOutput)
async def make_prediction(data: PredictionInput):
    """
    Accepts input data and returns a model prediction.
    (Actual model loading and inference logic would go here)
    """
    # Placeholder for model inference logic
    prediction_value = 1.0 # Replace with actual model.predict(...)
    probability_value = 0.85 # Replace if your model provides probabilities

    # Here you would typically:
    # 1. Preprocess input data (data.dict())
    # 2. Get prediction from your loaded ML model
    # 3. Postprocess the result if necessary
    # 4. Return the structured output

    return PredictionOutput(prediction=prediction_value, probability=probability_value)

@router.get("/info")
async def get_model_info():
    """
    Returns basic information about the prediction model.
    """
    return {"model_name": "ExamplePredictor", "version": "1.0"}

# You can add more prediction-related endpoints here...`}</Pre>
        <p>
          Notice that we use <C>@router.post</C> and <C>@router.get</C> instead of <C>@app.post</C> and <C>@app.get</C>. The function
          signatures and Pydantic model usage remain exactly the same.
        </p>
        <Box title="Current versions" tone="amber">
          <p>
            <C>float | None</C> needs Python 3.10+, or <C>Optional[float]</C> on earlier versions. The comment <C>data.dict()</C> is
            Pydantic v1; v2 uses <C>data.model_dump()</C>. These routes are not live until the next slide includes the router.
          </p>
        </Box>
        <Hint>Step from an empty APIRouter to POST /make and GET /info. A request still 404s until include_router runs.</Hint>
      </div>
    ),
  },
  {
    id: 'include',
    title: 'Including the Router in Your Main Application',
    subtitle: 'app.include_router copies the routes onto the app',
    Visual: IncludeRouterVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Now, you need to tell your main FastAPI application about this router. In your <C>main.py</C> (or wherever your main FastAPI
          instance is defined), you import the router object and use the <C>app.include_router()</C> method.
        </p>
        <Pre>{`# main.py
from fastapi import FastAPI
from routers import predictions # Import the module containing your router

# Create the main FastAPI application instance
app = FastAPI(
    title="ML Model Prediction Service",
    description="API for serving predictions from an ML model.",
    version="0.1.0"
)

# Include the predictions router
app.include_router(predictions.router)

@app.get("/")
async def read_root():
    return {"message": "Prediction API!"}`}</Pre>
        <Box title="The course screenshot" tone="amber">
          <p>
            The published snippet shows a stray <C>```python</C> inside <C>read_root</C>. That would be a syntax error. The function
            should return the dict, as above. <C>from routers import predictions</C> also needs <C>routers/</C> to be a package, so
            add <C>routers/__init__.py</C>.
          </p>
        </Box>
        <Hint>Plug the router in, then send POST /make. The function on the router is what runs.</Hint>
      </div>
    ),
  },
  {
    id: 'prefix',
    title: 'Prefixes and Tags',
    subtitle: '/make stays /make on the router. The client may call /api/v1/make.',
    Visual: PrefixTagVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The lesson’s first <C>include_router</C> has no prefix, so <C>POST /make</C> is exactly that URL. You can also pass{' '}
          <C>prefix</C> and <C>tags</C> when you include the router. That is how the later bullet gets <C>/api/v1/predict/…</C>{' '}
          without rewriting every decorator.
        </p>
        <Pre>{`app.include_router(
    predictions.router,
    prefix="/api/v1",
    tags=["predictions"],
)`}</Pre>
        <p>
          <C>prefix</C> is prepended to every path on that router. <C>tags</C> only change the grouping in the generated docs.
        </p>
        <Hint>Toggle the prefix and the tag. The function still says /make.</Hint>
      </div>
    ),
  },
  {
    id: 'router-benefits',
    title: 'What Routers Buy You',
    subtitle: 'Smaller files, fewer merge fights, structured URLs, grouped docs',
    Visual: RouterBenefitsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Using <C>APIRouter</C> is a significant step towards building maintainable and scalable FastAPI applications. It allows you to:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Separate Concerns:</strong> Keep code related to specific features (like predictions, user
            management, data preprocessing) in distinct modules.
          </li>
          <li>
            <strong className="text-white">Improve Readability:</strong> Smaller files are easier to understand and navigate.
          </li>
          <li>
            <strong className="text-white">Facilitate Collaboration:</strong> Different team members can work on different routers
            simultaneously with fewer merge conflicts.
          </li>
          <li>
            <strong className="text-white">Organize URLs:</strong> Use prefixes to create logical URL structures (e.g.,{' '}
            <C>/api/v1/predict/…</C>).
          </li>
          <li>
            <strong className="text-white">Enhance Documentation:</strong> Use tags to group related endpoints in the automatically
            generated API docs.
          </li>
        </ol>
        <p>
          As your ML API grows, adopting routers early will save considerable effort in the long run, forming the backbone of a
          well-organized project structure.
        </p>
        <Hint>Step through the five. The merge example is two people editing two router files while main.py stays still.</Hint>
      </div>
    ),
  },
  {
    id: 'layers',
    title: 'Separating Concerns',
    subtitle: 'HTTP, predict, and Pydantic are three different jobs',
    Visual: ThreeLayersVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Grouping related endpoints, a common practice often achieved with tools like <C>APIRouter</C>, is one step in application
          organization. However, for truly maintainable and testable code, developers must also examine how to structure the logic{' '}
          <em>within</em> and <em>supporting</em> those endpoints. This is where the principle of Separation of Concerns (SoC)
          becomes essential. SoC advocates for breaking down an application into distinct parts, each addressing a specific
          responsibility.
        </p>
        <p>
          In the context of a FastAPI application serving machine learning models, applying SoC typically involves dividing the
          codebase into logical layers:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">API Layer (Presentation/Routing):</strong> This layer is responsible for handling HTTP
            requests and responses. Its concerns include:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Defining path operations (<C>@router.post</C>, <C>@router.get</C>, etc.).</li>
              <li>Receiving incoming requests and parsing path parameters, query parameters, and request bodies.</li>
              <li>Using Pydantic models (from the Data Layer) for automatic data validation and serialization.</li>
              <li>Calling the appropriate functions or methods in the Business Logic Layer to perform the actual work.</li>
              <li>Formatting the results from the Business Logic Layer into HTTP responses, potentially using response models.</li>
              <li>Handling HTTP-specific errors and returning appropriate status codes.</li>
              <li>This logic typically resides in files within your <C>routers/</C> directory (as discussed in the previous section).</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Business Logic Layer (Service/Domain Layer):</strong> This layer encapsulates the core
            functionality of your application, independent of how it’s exposed via an API. For an ML API, this involves:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Implementing the logic for data preprocessing required by the model.</li>
              <li>Loading the machine learning model (often managed during application startup or via dependency injection).</li>
              <li>Executing model inference (<C>model.predict()</C>).</li>
              <li>Performing any necessary post-processing on the model’s output.</li>
              <li>Containing any other application-specific rules or workflows.</li>
              <li>
                This logic should reside in separate Python modules, often placed in a dedicated directory like <C>services/</C> or{' '}
                <C>core_logic/</C>. These modules should ideally have no knowledge of FastAPI or HTTP specifics.
              </li>
            </ul>
          </li>
          <li>
            <strong className="text-white">Data Layer (Models/Schemas):</strong> This layer defines the structure and validation
            rules for the data your application handles.
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Contains Pydantic models used for validating request bodies and formatting responses in the API Layer.</li>
              <li>May also include internal data structures used by the Business Logic Layer.</li>
              <li>
                These models are typically grouped in files like <C>schemas.py</C> or within a <C>models/</C> directory (distinct from
                the directory containing serialized ML model files).
              </li>
            </ul>
          </li>
        </ol>
        <Hint>Select each layer. The joblib file is not the Data Layer.</Hint>
      </div>
    ),
  },
  {
    id: 'flow',
    title: 'A Request Through the Layers',
    subtitle: 'The client talks only to the API layer',
    Visual: LayerFlowVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="italic text-gray-400">
          Diagram illustrating the flow of a request through separated layers in a FastAPI ML application. The client interacts only
          with the API layer, which orchestrates calls to the business logic and data layers.
        </p>
        <p>
          HTTP in, validate against a schema, call the service, run <C>model.predict</C>, then format the HTTP response. The loaded
          model never sees a FastAPI request object.
        </p>
        <Hint>Step the arrows: request, validate, call service, infer, respond.</Hint>
      </div>
    ),
  },
  {
    id: 'tree',
    title: 'Practical Structure Example',
    subtitle: 'routers, services, schemas, and ml_models are siblings under app/',
    Visual: SocTreeVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>For example, a typical project layout adhering to SoC:</p>
        <Pre>{`your_ml_api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app creation, include routers
│   ├── routers/
│   │   ├── __init__.py
│   │   └── inference.py     # API Layer: Routes for model inference
│   ├── services/
│   │   ├── __init__.py
│   │   └── prediction.py    # Business Logic Layer: Prediction service
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── prediction.py    # Data Layer: Pydantic input/output models
│   ├── core/                # Optional: Shared components
│   │   ├── __init__.py
│   │   └── model_loader.py  # Logic for loading the ML model
│   └── ml_models/           # Directory for serialized model files
│       └── sentiment_model.joblib
├── tests/
│   └── ...                  # Application tests
└── requirements.txt`}</Pre>
        <Hint>Click through the tree. schemas/ is Pydantic. ml_models/ is the joblib file.</Hint>
      </div>
    ),
  },
  {
    id: 'who-calls',
    title: 'Who Calls Whom',
    subtitle: 'inference.py validates, then predict_sentiment runs',
    Visual: WhoCallsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>In this structure:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <C>app/routers/inference.py</C> handles the HTTP POST request for predictions. It validates the input using a Pydantic
            model from <C>app/schemas/prediction.py</C> and calls a function or method in <C>app/services/prediction.py</C>.
          </li>
          <li>
            <C>app/services/prediction.py</C> contains the <C>predict_sentiment</C> function (or class). It takes the validated data,
            potentially performs preprocessing, uses the loaded model (perhaps obtained from <C>app/core/model_loader.py</C>) to make
            a prediction, performs post-processing, and returns the result. It knows nothing about HTTP requests or FastAPI
            decorators.
          </li>
          <li>
            <C>app/schemas/prediction.py</C> defines <C>PredictionInput</C> and <C>PredictionOutput</C> Pydantic models.
          </li>
        </ul>
        <Hint>Follow one POST down the chain. The last hop is the joblib file. FastAPI is not imported there.</Hint>
      </div>
    ),
  },
  {
    id: 'soc-benefits',
    title: 'Benefits of Separation',
    subtitle: 'Change the URL, or the preprocessing, not both files',
    Visual: SocBenefitsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>Adhering to this separation offers significant advantages:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Improved Maintainability:</strong> Changes to the API (e.g., changing an endpoint path)
            don’t require modifying the core prediction logic. Conversely, updating the prediction logic (e.g., adding a preprocessing
            step) doesn’t necessitate changes in the HTTP handling code, as long as the service function’s signature remains
            compatible.
          </li>
          <li>
            <strong className="text-white">Enhanced Testability:</strong> You can test the Business Logic Layer (
            <C>services/prediction.py</C>) independently of the API layer. You can write unit tests that directly call the prediction
            functions with various inputs without needing to simulate HTTP requests using <C>TestClient</C>. Similarly, the API layer
            can be tested by mocking the Business Logic layer it calls.
          </li>
          <li>
            <strong className="text-white">Increased Reusability:</strong> The Business Logic Layer can potentially be reused in other
            contexts, such as a command-line tool or a different type of application interface, because it’s decoupled from the web
            framework.
          </li>
          <li>
            <strong className="text-white">Clearer Codebase:</strong> Developers can easily understand where to find specific types of
            logic, making navigation and debugging simpler.
          </li>
        </ul>
        <p>
          FastAPI’s Dependency Injection system, which we’ll touch upon later, further facilitates this separation by allowing you to
          cleanly provide instances of your service classes or other dependencies (like a loaded model) to your API route functions
          without tightly coupling them.
        </p>
        <Hint>Rename the URL, add a scale step, test without HTTP, or reuse the service in a CLI.</Hint>
      </div>
    ),
  },
  {
    id: 'why-pin',
    title: 'Managing Dependencies',
    subtitle: 'A different scikit-learn can change the number you return',
    Visual: WhyPinVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          As your FastAPI applications, particularly those serving machine learning models, evolve, they inevitably rely on a growing
          number of external Python packages. These include FastAPI itself, Uvicorn, Pydantic, your chosen ML libraries (like
          scikit-learn, TensorFlow, or PyTorch), data manipulation tools (like Pandas or NumPy), and potentially many others.
          Managing these dependencies effectively is fundamental to creating reproducible, stable, and maintainable applications.
          Without explicit management, you risk encountering version conflicts, unexpected behavior changes, and difficulties
          collaborating or deploying your service.
        </p>
        <p className="text-white font-semibold">Why Dependency Management Matters</p>
        <p>
          Imagine developing your ML API using the latest version of <C>scikit-learn</C> on your machine. Everything works perfectly.
          A colleague tries to set up the project but installs an older version, leading to errors because a function you used isn’t
          available. Or worse, the application runs but produces different prediction results due to subtle changes in the library’s
          algorithms. When deploying to production, the server might install yet another version, causing failures or
          inconsistencies.
        </p>
        <p>Proper dependency management addresses these issues by:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <strong className="text-white">Reproducibility:</strong> Ensuring that anyone working on the project, or any environment
            where the application is deployed, uses the exact same versions of all required packages. This guarantees consistent
            behavior.
          </li>
          <li>
            <strong className="text-white">Avoiding Conflicts:</strong> Different libraries might depend on different versions of the
            same sub-dependency. Explicit management helps identify and resolve these potential conflicts early.
          </li>
          <li>
            <strong className="text-white">Simplifying Setup:</strong> Providing a clear, automated way for developers or deployment
            systems to install all necessary packages.
          </li>
          <li>
            <strong className="text-white">Tracking Requirements:</strong> Maintaining a record of exactly what your application needs
            to run.
          </li>
        </ol>
        <Hint>Same code, three sklearn versions. One ImportError, one quiet score change, then a pin that matches training.</Hint>
      </div>
    ),
  },
  {
    id: 'requirements',
    title: 'Using requirements.txt',
    subtitle: 'pip freeze writes the file. pip install -r reads it.',
    Visual: RequirementsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The most common and straightforward method for managing dependencies in Python projects is using a <C>requirements.txt</C>{' '}
          file. This plain text file lists the required packages, typically one per line, often with specific version constraints.
        </p>
        <p className="text-white font-semibold">Creating requirements.txt</p>
        <p>
          While you can create this file manually, it’s often generated based on the packages currently installed in your project’s
          virtual environment. After installing the necessary packages (<C>fastapi</C>, <C>uvicorn</C>, <C>scikit-learn</C>,{' '}
          <C>joblib</C>, etc.) using <C>pip</C>, you can freeze the current state:
        </p>
        <Pre>{`pip freeze > requirements.txt`}</Pre>
        <p>
          This command captures all installed packages, including dependencies of your direct dependencies, and pins them to their
          exact versions. The resulting <C>requirements.txt</C> might look something like this:
        </p>
        <Pre>{`fastapi==0.104.1
uvicorn[standard]==0.23.2
pydantic==2.4.2
scikit-learn==1.3.2
joblib==1.3.2
numpy==1.26.1
# ... other dependencies`}</Pre>
        <p className="text-white font-semibold">Installing from requirements.txt</p>
        <p>To set up the project environment on a new machine or in a deployment pipeline, you use <C>pip</C> to install the packages listed in the file:</p>
        <Pre>{`pip install -r requirements.txt`}</Pre>
        <p>This ensures that the exact versions specified in the file are installed, recreating the intended environment.</p>
        <Hint>Install, freeze, then recreate. sklearn comes back as 1.3.2.</Hint>
      </div>
    ),
  },
  {
    id: 'specifiers',
    title: 'Version Specifiers',
    subtitle: '== is the production pin for an ML API',
    Visual: VersionSpecVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          The <C>pip freeze</C> command uses exact version pinning (<C>==</C>). This is generally recommended for application
          deployments to ensure maximum stability and reproducibility. However, other specifiers exist:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <C>package_name&gt;=1.0</C>: Installs version 1.0 or higher. Use with caution, as major version updates can introduce
            breaking changes.
          </li>
          <li>
            <C>package_name&lt;2.0</C>: Installs any version less than 2.0.
          </li>
          <li>
            <C>package_name~=1.1</C>: Compatible release. Installs version 1.1 or any later patch version (e.g., 1.1.1, 1.1.2) but
            not 1.2 or 2.0. This allows for bug fixes while minimizing the risk of breaking changes. Useful for library development
            but often too loose for application deployment.
          </li>
        </ul>
        <p>
          For ML applications, where subtle changes in underlying libraries can impact model predictions, pinning exact versions (
          <C>==</C>) in your <C>requirements.txt</C> for production environments is usually the safest approach.
        </p>
        <Box title="PEP 440 and the course example" tone="amber">
          <p>
            <C>~=1.3.2</C> (three numbers) means 1.3.2 or later 1.3.x, not 1.4. The course writes <C>~=1.1</C> and says it blocks 1.2.
            Under PEP 440, two-part <C>~=1.1</C> is <C>&gt;=1.1, ==1.*</C>, which does allow 1.2. For a served model, prefer{' '}
            <C>==</C> and ignore the range operators.
          </p>
        </Box>
        <Hint>Switch ==, &gt;=, &lt;, and ~=. == is the only operator that keeps 1.3.2 and rejects 1.3.3.</Hint>
      </div>
    ),
  },
  {
    id: 'poetry',
    title: 'Modern Dependency Management with Poetry',
    subtitle: 'pyproject.toml asks. poetry.lock answers.',
    Visual: PoetryVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          While <C>pip</C> and <C>requirements.txt</C> are functional, more modern tools like Poetry offer a more integrated approach
          to dependency and project management.
        </p>
        <p>
          Poetry uses a <C>pyproject.toml</C> file to define project metadata, dependencies, development dependencies, and build
          system information.
        </p>
        <p className="text-white font-semibold">Features of Poetry:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-white">Dependency Resolution:</strong> Poetry employs an advanced dependency resolver that is
            generally better at finding compatible versions of all required packages and their sub-dependencies, minimizing
            conflicts.
          </li>
          <li>
            <strong className="text-white">Lock File (<C>poetry.lock</C>):</strong> When you add dependencies (
            <C>poetry add package_name</C>) or install them (<C>poetry install</C>), Poetry generates a <C>poetry.lock</C> file. This
            file records the exact versions of <em>all</em> installed packages (including sub-dependencies), ensuring truly
            reproducible builds across different environments. This is more reliable than <C>pip freeze</C> as it reflects the
            resolved dependency tree, not just the top-level packages installed.
          </li>
          <li>
            <strong className="text-white">Virtual Environment Management:</strong> Poetry automatically creates and manages virtual
            environments for your project, simplifying setup.
          </li>
          <li>
            <strong className="text-white">Project Building and Publishing:</strong> It includes tools for building Python packages
            and publishing them to repositories like PyPI.
          </li>
        </ol>
        <p>Example <C>pyproject.toml</C> Snippet:</p>
        <Pre>{`[tool.poetry]
name = "ml-api"
version = "0.1.0"
description = "FastAPI service for ML model predictions"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.9"
fastapi = "^0.104.1"
uvicorn = {extras = ["standard"], version = "^0.23.2"}
scikit-learn = "^1.3.2"
joblib = "^1.3.2"
pydantic = "^2.4.2"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
httpx = "^0.25.1" # For TestClient

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"`}</Pre>
        <p>To install dependencies defined here, you would run:</p>
        <Pre>{`poetry install`}</Pre>
        <Box title="Caret versus lock" tone="amber">
          <p>
            <C>^0.104.1</C> in <C>pyproject.toml</C> is a range. Production reproducibility still comes from committing{' '}
            <C>poetry.lock</C>. The course’s freeze example pins <C>pydantic==2.4.2</C>, which is v2 — earlier chapters often showed
            v1 method names.
          </p>
        </Box>
        <Hint>pyproject.toml is the request. poetry.lock is the exact tree, including starlette.</Hint>
      </div>
    ),
  },
  {
    id: 'testing',
    title: 'Introduction to API Testing',
    subtitle: 'The API around the model, not the model’s holdout score',
    Visual: TestingIntroVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Ensuring a FastAPI application behaves as expected is a primary step, especially when integrating machine learning models.
          Writing code is only part of the process; verifying its correctness through testing is essential for building dependable
          applications. Unexpected inputs or behavior can lead to incorrect predictions or service failures when serving ML models.
          Testing provides the confidence needed for maintenance and future development of applications.
        </p>
        <p>
          Automated tests act as a safety net. They allow you to make changes to your codebase, such as refactoring endpoint logic,
          updating dependencies, or even swapping out ML models, with confidence that you haven’t inadvertently broken existing
          functionality. For ML APIs, testing confirms several important aspects:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Contract Adherence:</strong> Verifies that your API correctly handles inputs according to
            the defined Pydantic schemas and returns outputs in the expected format. This ensures clients interacting with your API
            receive predictable responses. Testing confirms that the data structures you defined in Chapter 2 are correctly enforced
            at the API boundary.
          </li>
          <li>
            <strong className="text-white">Input Validation Logic:</strong> Confirms that the validation rules you set up (e.g., data
            types, value ranges, string formats) are enforced, preventing malformed or nonsensical data from reaching your model
            inference logic. This is critical for ML models, which often expect inputs in a very specific format or range.
          </li>
          <li>
            <strong className="text-white">Integration Correctness:</strong> Ensures that the API endpoint correctly preprocesses
            input, invokes the loaded ML model (as discussed in Chapter 3), and post-processes the output. While API tests don’t
            typically evaluate the <em>statistical accuracy</em> of the model itself (that’s model validation, a separate process
            usually performed during model development), they verify the pipeline surrounding the model works correctly within the
            API context. Does the API call the model’s <C>predict</C> method? Is the result transformed correctly before being sent
            back?
          </li>
          <li>
            <strong className="text-white">Error Handling:</strong> Checks that your API responds appropriately to invalid requests
            (like those failing Pydantic validation) or internal issues (like failing to load a model file), providing informative
            error messages and correct HTTP status codes instead of crashing or returning cryptic errors.
          </li>
          <li>
            <strong className="text-white">Regression Prevention:</strong> Catches unintended side effects of code changes, ensuring
            features that previously worked continue to work after modifications. This is invaluable as your application evolves.
          </li>
        </ul>
        <Hint>Pick a kind of test, then flip it to failing. Integration correctness is “did predict run,” not “is 97% accurate.”</Hint>
      </div>
    ),
  },
  {
    id: 'test-kinds',
    title: 'Unit Tests and TestClient',
    subtitle: 'Call the service, or send HTTP without starting uvicorn',
    Visual: TestKindsVisualizer,
    content: (
      <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
        <p>
          In the context of FastAPI applications, we primarily focus on automated tests that simulate HTTP requests to your API
          endpoints and assert conditions on the responses. These tests can range from simple <em>unit tests</em>, which might check a
          specific helper function or Pydantic model in isolation, to <em>integration tests</em>, which verify the entire
          request-response flow through your application, including interactions with the potentially loaded ML model.
        </p>
        <p>
          FastAPI is designed with testability in mind. Its use of standard Python type hints and Pydantic facilitates clear
          definitions of data structures, making it easier to write tests against these definitions. Furthermore, FastAPI provides a{' '}
          <C>TestClient</C> based on the <C>httpx</C> library, allowing you to send requests directly to your application within your
          test suite without needing a running server. This makes writing fast, reliable tests straightforward.
        </p>
        <p>
          The following sections will guide you through using <C>TestClient</C> to write effective unit and integration tests for your
          ML API endpoints, focusing on validating inputs, testing prediction logic, and ensuring your application structure
          supports testability. This practice solidifies the application structure introduced earlier in this chapter, making your ML
          deployment service more resilient and easier to manage.
        </p>
        <Hint>Unit tests call predict_sentiment. Integration tests POST through TestClient. Later pages in this slider will write those tests.</Hint>
      </div>
    ),
  },
];

export default function StructuringAndTestingFastAPIApplicationsPartOne() {
  return <ChapterDeck slides={slidesData} />;
}
